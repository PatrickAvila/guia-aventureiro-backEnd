// backend/src/services/stripeService.js
const stripe = require('../config/stripe');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Cria sessão de checkout Stripe
 * @param {string} userId - ID do usuário
 * @param {string} priceId - ID do preço/produto no Stripe
 * @param {string} successUrl - URL de redirecionamento após sucesso
 * @param {string} cancelUrl - URL de redirecionamento após cancelamento
 * @returns {Promise<{sessionId: string, url: string}>}
 */
const createCheckoutSession = async (userId, priceId, successUrl, cancelUrl) => {
  try {
    // Buscar usuário e assinatura
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const subscription = await Subscription.findOne({ user: userId });
    if (!subscription) {
      throw new Error('Assinatura não encontrada');
    }

    // Validar se já é Premium
    if (subscription.plan === 'premium' && subscription.paymentStatus === 'active') {
      throw new Error('Usuário já possui plano Premium ativo');
    }

    // Criar ou recuperar Customer no Stripe
    let stripeCustomerId = subscription.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: userId.toString(),
        },
      });
      stripeCustomerId = customer.id;

      // Salvar Customer ID na subscription
      subscription.stripeCustomerId = stripeCustomerId;
      await subscription.save();
      logger.info(`✅ Stripe Customer criado: ${stripeCustomerId} para user ${userId}`);
    }

    // Criar sessão de checkout
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      client_reference_id: userId.toString(),
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: userId.toString(),
      },
      subscription_data: {
        metadata: {
          userId: userId.toString(),
        },
      },
      // Configurações adicionais para billing
      billing_address_collection: 'auto',
      // Permitir códigos promocionais (futuro)
      allow_promotion_codes: true,
      // Configurar modo de cobrança
      payment_method_collection: 'if_required',
    });

    logger.info(`✅ Checkout session criado: ${session.id} para user ${userId}`);

    return {
      sessionId: session.id,
      url: session.url,
    };
  } catch (error) {
    logger.error('Erro ao criar checkout session');
    throw error;
  }
};

/**
 * Cria sessão do Customer Portal
 * @param {string} customerId - Stripe Customer ID
 * @param {string} returnUrl - URL de retorno
 * @returns {Promise<{url: string}>}
 */
const createCustomerPortal = async (customerId, returnUrl) => {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    logger.info(`✅ Customer Portal criado para: ${customerId}`);

    return { url: session.url };
  } catch (error) {
    logger.error('Erro ao criar customer portal');
    throw error;
  }
};

/**
 * Faz upgrade do usuário para Premium após pagamento confirmado
 * @param {string} userId - ID do usuário
 * @param {object} subscriptionData - Dados da assinatura Stripe
 * @returns {Promise<Subscription>}
 */
const upgradeUserToPremium = async (userId, subscriptionData) => {
  try {
    const subscription = await Subscription.findOne({ user: userId });
    if (!subscription) {
      throw new Error('Assinatura não encontrada');
    }

    const oldPlan = subscription.plan;

    // Atualizar dados da subscription
    subscription.plan = 'premium';
    subscription.status = 'active';
    subscription.paymentStatus = 'active';
    subscription.stripeSubscriptionId = subscriptionData.id;
    subscription.stripePriceId = subscriptionData.items.data[0]?.price?.id;
    subscription.paymentMethod = 'stripe';
    subscription.lastPaymentDate = new Date();
    subscription.nextBillingDate = new Date(subscriptionData.current_period_end * 1000);
    subscription.renewsAt = new Date(subscriptionData.current_period_end * 1000);

    // Atualizar limites para Premium
    subscription.updateLimitsForPlan('premium');

    // Adicionar ao histórico
    subscription.history.push({
      plan: oldPlan,
      action: 'upgrade',
      date: new Date(),
      reason: 'Upgrade via Stripe Checkout',
    });

    await subscription.save();

    logger.info(`✅ Usuário ${userId} upgradado para Premium (${subscriptionData.id})`);

    return subscription;
  } catch (error) {
    logger.error('Erro ao fazer upgrade para Premium');
    throw error;
  }
};

/**
 * Faz downgrade do usuário para Free após cancelamento
 * @param {string} userId - ID do usuário
 * @param {string} reason - Motivo do cancelamento
 * @returns {Promise<Subscription>}
 */
const downgradeUserToFree = async (userId, reason = 'Assinatura cancelada') => {
  try {
    const subscription = await Subscription.findOne({ user: userId });
    if (!subscription) {
      throw new Error('Assinatura não encontrada');
    }

    const oldPlan = subscription.plan;

    // Atualizar dados da subscription
    subscription.plan = 'free';
    subscription.status = 'cancelled';
    subscription.paymentStatus = 'canceled';
    subscription.cancelledAt = new Date();
    subscription.stripeSubscriptionId = null;
    subscription.stripePriceId = null;

    // Atualizar limites para Free
    subscription.updateLimitsForPlan('free');

    // Adicionar ao histórico
    subscription.history.push({
      plan: oldPlan,
      action: 'downgrade',
      date: new Date(),
      reason,
    });

    // Salvar motivo do cancelamento
    subscription.metadata.cancelReason = reason;

    await subscription.save();

    logger.info(`✅ Usuário ${userId} downgraded para Free (${reason})`);

    return subscription;
  } catch (error) {
    logger.error('Erro ao fazer downgrade para Free');
    throw error;
  }
};

/**
 * Cancela assinatura no Stripe
 * @param {string} subscriptionId - Stripe Subscription ID
 * @param {boolean} immediately - Cancelar imediatamente (default: ao fim do período)
 * @returns {Promise<object>}
 */
const cancelSubscription = async (subscriptionId, immediately = false) => {
  try {
    let canceledSubscription;

    if (immediately) {
      // Cancelar imediatamente
      canceledSubscription = await stripe.subscriptions.cancel(subscriptionId);
      logger.info(`✅ Assinatura ${subscriptionId} cancelada imediatamente`);
    } else {
      // Cancelar ao fim do período de cobrança
      canceledSubscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
      logger.info(`✅ Assinatura ${subscriptionId} será cancelada ao fim do período`);
    }

    return canceledSubscription;
  } catch (error) {
    logger.error('Erro ao cancelar assinatura Stripe');
    throw error;
  }
};

/**
 * Sincroniza status da assinatura com o Stripe
 * @param {string} userId - ID do usuário
 * @returns {Promise<Subscription>}
 */
const syncSubscriptionStatus = async (userId) => {
  try {
    const subscription = await Subscription.findOne({ user: userId });
    if (!subscription || !subscription.stripeSubscriptionId) {
      throw new Error('Assinatura Stripe não encontrada');
    }

    // Buscar status no Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId
    );

    // Atualizar status local
    const statusMap = {
      active: 'active',
      canceled: 'canceled',
      past_due: 'past_due',
      incomplete: 'incomplete',
    };

    subscription.paymentStatus = statusMap[stripeSubscription.status] || 'pending';
    subscription.renewsAt = new Date(stripeSubscription.current_period_end * 1000);

    // Se cancelado no Stripe, fazer downgrade
    if (stripeSubscription.status === 'canceled') {
      await downgradeUserToFree(userId, 'Assinatura cancelada no Stripe');
    }

    await subscription.save();

    logger.info(`✅ Status sincronizado para user ${userId}: ${subscription.paymentStatus}`);

    return subscription;
  } catch (error) {
    logger.error('Erro ao sincronizar status');
    throw error;
  }
};

module.exports = {
  createCheckoutSession,
  createCustomerPortal,
  upgradeUserToPremium,
  downgradeUserToFree,
  cancelSubscription,
  syncSubscriptionStatus,
};
