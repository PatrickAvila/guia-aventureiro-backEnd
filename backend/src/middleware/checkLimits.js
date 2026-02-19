// backend/src/middleware/checkLimits.js
const Subscription = require('../models/Subscription');
const { getPlan } = require('../config/plans');
const logger = require('../utils/logger');

/**
 * Middleware para verificar limites de uso baseado no plano
 */

/**
 * Verificar se pode criar roteiro
 */
exports.canCreateItinerary = async (req, res, next) => {
  try {
    const userId = req.userId;
    
    let subscription = await Subscription.findOne({ user: userId });
    
    // Se não tem subscription, criar uma Free
    if (!subscription) {
      subscription = await Subscription.createFreeSubscription(userId);
    }
    
    // Verificar limite de slots ativos
    if (subscription.usage.itineraries.current >= subscription.usage.itineraries.limit) {
      const plan = getPlan(subscription.plan);
      return res.status(403).json({
        error: 'limit_reached',
        message: `Você atingiu o limite de ${plan.limits.itineraries} roteiros ativos do plano ${plan.name}`,
        currentUsage: subscription.usage.itineraries.current,
        limit: subscription.usage.itineraries.limit,
        plan: subscription.plan,
        upgrade: {
          message: 'Faça upgrade para criar mais roteiros',
          availablePlans: subscription.plan === 'free' ? ['premium', 'pro'] : ['pro'],
        }
      });
    }
    
    // Verificar limite de criações mensais
    if (!subscription.canCreateThisMonth()) {
      const nextReset = new Date(subscription.usage.monthlyCreations.lastReset);
      nextReset.setMonth(nextReset.getMonth() + 1);
      
      return res.status(403).json({
        error: 'monthly_limit_reached',
        message: `Você atingiu o limite de ${subscription.usage.monthlyCreations.limit} criações de roteiros este mês`,
        currentUsage: subscription.usage.monthlyCreations.count,
        limit: subscription.usage.monthlyCreations.limit,
        resetsAt: nextReset,
        plan: subscription.plan,
        upgrade: {
          message: 'Faça upgrade para criar roteiros ilimitados',
          availablePlans: subscription.plan === 'free' ? ['premium', 'pro'] : ['pro'],
        }
      });
    }
    
    // Adicionar subscription ao request para uso posterior
    req.subscription = subscription;
    next();
  } catch (error) {
    logger.error('Erro ao verificar limite de roteiros:', error);
    next(error);
  }
};

/**
 * Verificar se pode usar IA
 */
exports.canUseAI = async (req, res, next) => {
  try {
    const userId = req.userId;
    
    let subscription = await Subscription.findOne({ user: userId });
    
    if (!subscription) {
      subscription = await Subscription.createFreeSubscription(userId);
    }
    
    // Verificar se tem o recurso de IA
    if (subscription.plan === 'free' && !subscription.canUseAI()) {
      return res.status(403).json({
        error: 'limit_reached',
        message: `Você atingiu o limite de ${subscription.usage.aiGenerations.limit} gerações com IA por mês do plano Gratuito`,
        currentUsage: subscription.usage.aiGenerations.current,
        limit: subscription.usage.aiGenerations.limit,
        plan: subscription.plan,
        upgrade: {
          message: 'Faça upgrade para o Premium e tenha 20 gerações por mês',
          availablePlans: ['premium', 'pro'],
        }
      });
    }
    
    req.subscription = subscription;
    next();
  } catch (error) {
    logger.error('Erro ao verificar limite de IA:', error);
    next(error);
  }
};

/**
 * Verificar se pode fazer upload de foto
 */
exports.canUploadPhoto = async (req, res, next) => {
  try {
    const userId = req.userId;
    
    let subscription = await Subscription.findOne({ user: userId });
    
    if (!subscription) {
      subscription = await Subscription.createFreeSubscription(userId);
    }
    
    if (!subscription.canUploadPhoto()) {
      const plan = getPlan(subscription.plan);
      return res.status(403).json({
        error: 'limit_reached',
        message: `Você atingiu o limite de ${plan.limits.photos} fotos do plano ${plan.name}`,
        currentUsage: subscription.usage.photos.current,
        limit: subscription.usage.photos.limit,
        plan: subscription.plan,
        upgrade: {
          message: 'Faça upgrade para fazer upload de mais fotos',
          availablePlans: subscription.plan === 'free' ? ['premium', 'pro'] : ['pro'],
        }
      });
    }
    
    req.subscription = subscription;
    next();
  } catch (error) {
    logger.error('Erro ao verificar limite de fotos:', error);
    next(error);
  }
};

/**
 * Verificar se pode adicionar colaborador
 */
exports.canAddCollaborator = async (req, res, next) => {
  try {
    const userId = req.userId;
    
    let subscription = await Subscription.findOne({ user: userId });
    
    if (!subscription) {
      subscription = await Subscription.createFreeSubscription(userId);
    }
    
    // Plano Free não permite colaboradores
    if (subscription.plan === 'free') {
      return res.status(403).json({
        error: 'feature_locked',
        message: 'Colaboradores não estão disponíveis no plano Gratuito',
        plan: subscription.plan,
        upgrade: {
          message: 'Faça upgrade para o Premium e colabore com até 5 pessoas',
          availablePlans: ['premium', 'pro'],
        }
      });
    }
    
    req.subscription = subscription;
    next();
  } catch (error) {
    logger.error('Erro ao verificar limite de colaboradores:', error);
    next(error);
  }
};

/**
 * Verificar se pode compartilhar roteiros publicamente
 */
exports.canShareItinerary = async (req, res, next) => {
  try {
    const userId = req.userId;
    
    let subscription = await Subscription.findOne({ user: userId });
    
    if (!subscription) {
      subscription = await Subscription.createFreeSubscription(userId);
    }
    
    // Plano Free não permite compartilhamento público
    const plan = getPlan(subscription.plan);
    if (!plan.features.publicSharing) {
      return res.status(403).json({
        error: 'feature_locked',
        message: 'Compartilhamento de roteiros não está disponível no plano Gratuito',
        plan: subscription.plan,
        upgrade: {
          message: 'Faça upgrade para o Premium e compartilhe seus roteiros com qualquer pessoa',
          availablePlans: ['premium', 'pro'],
        }
      });
    }
    
    req.subscription = subscription;
    next();
  } catch (error) {
    logger.error('Erro ao verificar permissão de compartilhamento:', error);
    next(error);
  }
};

/**
 * Verificar se tem acesso a um recurso premium
 */
exports.requireFeature = (featureName) => {
  return async (req, res, next) => {
    try {
      const userId = req.userId;
      
      let subscription = await Subscription.findOne({ user: userId });
      
      if (!subscription) {
        subscription = await Subscription.createFreeSubscription(userId);
      }
      
      if (!subscription.hasFeature(featureName)) {
        return res.status(403).json({
          error: 'feature_locked',
          message: `O recurso "${featureName}" não está disponível no seu plano`,
          plan: subscription.plan,
          upgrade: {
            message: 'Faça upgrade para acessar este recurso',
            availablePlans: subscription.plan === 'free' ? ['premium', 'pro'] : ['pro'],
          }
        });
      }
      
      req.subscription = subscription;
      next();
    } catch (error) {
      logger.error(`Erro ao verificar feature ${featureName}:`, error);
      next(error);
    }
  };
};

/**
 * Incrementar uso após ação bem-sucedida
 */
exports.incrementUsage = (type) => {
  return async (req, res, next) => {
    try {
      if (req.subscription) {
        req.subscription.incrementUsage(type);
        await req.subscription.save();
      }
      next();
    } catch (error) {
      logger.error(`Erro ao incrementar uso de ${type}:`, error);
      // Não bloqueia a requisição por erro de contagem
      next();
    }
  };
};

/**
 * Middleware para adicionar informações da subscription ao request
 */
exports.attachSubscription = async (req, res, next) => {
  try {
    const userId = req.userId;
    
    let subscription = await Subscription.findOne({ user: userId });
    
    if (!subscription) {
      subscription = await Subscription.createFreeSubscription(userId);
    }
    
    req.subscription = subscription;
    next();
  } catch (error) {
    logger.error('Erro ao anexar subscription:', error);
    next(error);
  }
};
