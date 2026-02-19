// backend/src/controllers/subscriptionController.js
const Subscription = require('../models/Subscription');
const { PLANS, getPlan, isValidPlan, getYearlySavings } = require('../config/plans');
const logger = require('../utils/logger');

/**
 * GET /api/subscriptions/plans
 * Listar todos os planos disponíveis
 */
exports.getPlans = async (req, res, next) => {
  try {
    const plans = Object.values(PLANS).map(plan => ({
      ...plan,
      savings: getYearlySavings(plan.id),
    }));
    
    res.json({ plans });
  } catch (error) {
    logger.error('Erro ao buscar planos:', error);
    next(error);
  }
};

/**
 * GET /api/subscriptions/my-subscription
 * Obter subscription atual do usuário
 */
exports.getMySubscription = async (req, res, next) => {
  try {
    const userId = req.userId;
    
    let subscription = await Subscription.findOne({ user: userId });
    
    if (!subscription) {
      // Criar subscription Free se não existe
      subscription = await Subscription.createFreeSubscription(userId);
    }
    
    const plan = getPlan(subscription.plan);
    
    res.json({
      subscription: {
        ...subscription.toObject(),
        planDetails: plan,
      }
    });
  } catch (error) {
    logger.error('Erro ao buscar subscription:', error);
    next(error);
  }
};

/**
 * GET /api/subscriptions/usage
 * Obter estatísticas de uso
 */
exports.getUsage = async (req, res, next) => {
  try {
    const userId = req.userId;
    
    const subscription = await Subscription.findOne({ user: userId });
    
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription não encontrada' });
    }
    
    const plan = getPlan(subscription.plan);
    
    // Calcular percentuais de uso
    const usage = {
      itineraries: {
        current: subscription.usage.itineraries.current,
        limit: subscription.usage.itineraries.limit,
        percentage: subscription.plan === 'pro' ? 0 : 
          Math.round((subscription.usage.itineraries.current / subscription.usage.itineraries.limit) * 100),
        unlimited: subscription.plan === 'pro',
      },
      aiGenerations: {
        current: subscription.usage.aiGenerations.current,
        limit: subscription.usage.aiGenerations.limit,
        percentage: subscription.plan === 'pro' ? 0 :
          Math.round((subscription.usage.aiGenerations.current / subscription.usage.aiGenerations.limit) * 100),
        unlimited: subscription.plan === 'pro',
        resetsAt: new Date(subscription.usage.aiGenerations.lastReset.getFullYear(),
                          subscription.usage.aiGenerations.lastReset.getMonth() + 1, 1),
      },
      photos: {
        current: subscription.usage.photos.current,
        limit: subscription.usage.photos.limit,
        percentage: subscription.plan === 'pro' ? 0 :
          Math.round((subscription.usage.photos.current / subscription.usage.photos.limit) * 100),
      },
      collaborators: {
        current: subscription.usage.collaborators.current,
        limit: subscription.usage.collaborators.limit,
        unlimited: subscription.plan === 'pro',
      },
    };
    
    res.json({
      usage,
      plan: subscription.plan,
      planDetails: plan,
    });
  } catch (error) {
    logger.error('Erro ao buscar uso:', error);
    next(error);
  }
};

/**
 * POST /api/subscriptions/upgrade
 * Iniciar processo de upgrade (seria conectado com Stripe)
 */
exports.initiateUpgrade = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { targetPlan, billingCycle } = req.body;
    
    if (!isValidPlan(targetPlan)) {
      return res.status(400).json({ message: 'Plano inválido' });
    }
    
    if (targetPlan === 'free') {
      return res.status(400).json({ message: 'Não é possível fazer upgrade para plano gratuito' });
    }
    
    if (!['monthly', 'yearly'].includes(billingCycle)) {
      return res.status(400).json({ message: 'Ciclo de cobrança inválido' });
    }
    
    const subscription = await Subscription.findOne({ user: userId });
    
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription não encontrada' });
    }
    
    const plan = getPlan(targetPlan);
    
    // TODO: Integrar com Stripe para criar checkout session
    // Por enquanto, retornar informações para o frontend
    
    res.json({
      message: 'Upgrade iniciado',
      redirectUrl: '/api/subscriptions/checkout', // Seria URL do Stripe
      plan: {
        id: targetPlan,
        name: plan.name,
        price: plan.price[billingCycle],
        billingCycle,
      },
      // Temporário: fazer upgrade direto (remover quando Stripe estiver integrado)
      temporaryUpgrade: {
        message: 'Em produção, isso redirecionaria para checkout do Stripe',
        action: 'POST /api/subscriptions/confirm-upgrade',
      }
    });
  } catch (error) {
    logger.error('Erro ao iniciar upgrade:', error);
    next(error);
  }
};

/**
 * POST /api/subscriptions/confirm-upgrade
 * Confirmar upgrade (temporário, até integrar Stripe)
 */
exports.confirmUpgrade = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { targetPlan, billingCycle } = req.body;
    
    if (!isValidPlan(targetPlan)) {
      return res.status(400).json({ message: 'Plano inválido' });
    }
    
    const subscription = await Subscription.findOne({ user: userId });
    
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription não encontrada' });
    }
    
    // Fazer upgrade
    subscription.upgrade(targetPlan);
    subscription.billingCycle = billingCycle || 'monthly';
    subscription.paymentMethod = 'stripe'; // Temporário
    
    // Definir próxima data de cobrança
    const nextBilling = new Date();
    if (billingCycle === 'monthly') {
      nextBilling.setMonth(nextBilling.getMonth() + 1);
    } else {
      nextBilling.setFullYear(nextBilling.getFullYear() + 1);
    }
    subscription.nextBillingDate = nextBilling;
    subscription.endDate = nextBilling;
    
    await subscription.save();
    
    logger.log(`✨ Upgrade realizado: Usuário ${userId} -> ${targetPlan}`);
    
    res.json({
      message: 'Upgrade realizado com sucesso!',
      subscription: subscription.toObject(),
    });
  } catch (error) {
    logger.error('Erro ao confirmar upgrade:', error);
    next(error);
  }
};

/**
 * POST /api/subscriptions/cancel
 * Cancelar assinatura
 */
exports.cancelSubscription = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { reason } = req.body;
    
    const subscription = await Subscription.findOne({ user: userId });
    
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription não encontrada' });
    }
    
    if (subscription.plan === 'free') {
      return res.status(400).json({ message: 'Não é possível cancelar plano gratuito' });
    }
    
    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date();
    subscription.metadata.cancelReason = reason;
    
    subscription.history.push({
      plan: subscription.plan,
      action: 'cancelled',
      reason: reason || 'Não informado',
    });
    
    await subscription.save();
    
    logger.log(`⚠️ Cancelamento: Usuário ${userId} cancelou ${subscription.plan}`);
    
    res.json({
      message: 'Assinatura cancelada. Você terá acesso até o fim do período pago.',
      subscription: subscription.toObject(),
      accessUntil: subscription.endDate,
    });
  } catch (error) {
    logger.error('Erro ao cancelar subscription:', error);
    next(error);
  }
};

/**
 * POST /api/subscriptions/reactivate
 * Reativar assinatura cancelada
 */
exports.reactivateSubscription = async (req, res, next) => {
  try {
    const userId = req.userId;
    
    const subscription = await Subscription.findOne({ user: userId });
    
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription não encontrada' });
    }
    
    if (subscription.status !== 'cancelled') {
      return res.status(400).json({ message: 'Assinatura não está cancelada' });
    }
    
    subscription.status = 'active';
    subscription.cancelledAt = null;
    
    subscription.history.push({
      plan: subscription.plan,
      action: 'renewed',
      reason: 'Reativação pelo usuário',
    });
    
    await subscription.save();
    
    logger.log(`✅ Reativação: Usuário ${userId} reativou ${subscription.plan}`);
    
    res.json({
      message: 'Assinatura reativada com sucesso!',
      subscription: subscription.toObject(),
    });
  } catch (error) {
    logger.error('Erro ao reativar subscription:', error);
    next(error);
  }
};
