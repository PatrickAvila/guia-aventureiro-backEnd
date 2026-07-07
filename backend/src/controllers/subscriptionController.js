// backend/src/controllers/subscriptionController.js
const Subscription = require('../models/Subscription');
const ProcessedEvent = require('../models/ProcessedEvent');
const { PLANS, getPlan, isValidPlan, getYearlySavings } = require('../config/plans');
const stripeService = require('../services/stripeService');
const logger = require('../utils/logger');

const buildSafeErrorResponse = (errorCode, message, error) => {
  return {
    error: errorCode,
    message,
  };
};

const toSafeSubscription = (subscription) => {
  if (!subscription) return null;

  const safeSubscription =
    typeof subscription.toObject === 'function' ? subscription.toObject() : { ...subscription };

  delete safeSubscription.user;
  delete safeSubscription.stripeCustomerId;
  delete safeSubscription.stripeSubscriptionId;
  delete safeSubscription.stripePriceId;
  delete safeSubscription.metadata;
  delete safeSubscription.history;
  delete safeSubscription.__v;

  return safeSubscription;
};

/**
 * GET /api/subscriptions/plans
 * Listar todos os planos disponíveis
 */
exports.getPlans = async (req, res, next) => {
  try {
    const plans = Object.values(PLANS).map((plan) => ({
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
        ...toSafeSubscription(subscription),
        planDetails: plan,
      },
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
        percentage:
          subscription.usage.itineraries.limit > 0
            ? Math.round(
                (subscription.usage.itineraries.current / subscription.usage.itineraries.limit) *
                  100
              )
            : 0,
        unlimited: subscription.plan === 'premium' && subscription.usage.itineraries.limit >= 50,
      },
      aiGenerations: {
        current: subscription.usage.aiGenerations.current,
        limit: subscription.usage.aiGenerations.limit,
        percentage:
          subscription.plan === 'premium'
            ? 0
            : subscription.usage.aiGenerations.limit > 0
              ? Math.round(
                  (subscription.usage.aiGenerations.current /
                    subscription.usage.aiGenerations.limit) *
                    100
                )
              : 0,
        unlimited: subscription.plan === 'premium',
        resetsAt: new Date(
          subscription.usage.aiGenerations.lastReset.getFullYear(),
          subscription.usage.aiGenerations.lastReset.getMonth() + 1,
          1
        ),
      },
      photos: {
        current: subscription.usage.photos.current,
        limit: subscription.usage.photos.limit,
        percentage:
          subscription.usage.photos.limit > 0
            ? Math.round(
                (subscription.usage.photos.current / subscription.usage.photos.limit) * 100
              )
            : 0,
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
 * POST /api/subscriptions/test/force-plan
 * Endpoint exclusivo para automação em TEST_MODE.
 */
exports.forcePlanForTests = async (req, res, next) => {
  try {
    if (process.env.TEST_MODE !== 'true') {
      return res.status(404).json({ error: 'not_found' });
    }

    const userId = req.userId;
    const { targetPlan, billingCycle = 'monthly' } = req.body;

    if (!isValidPlan(targetPlan) || targetPlan === 'free') {
      return res.status(400).json({ message: 'Plano de teste inválido' });
    }

    if (!['monthly', 'yearly'].includes(billingCycle)) {
      return res.status(400).json({ message: 'Ciclo de cobrança inválido' });
    }

    let subscription = await Subscription.findOne({ user: userId });
    if (!subscription) {
      subscription = await Subscription.createFreeSubscription(userId);
    }

    subscription.upgrade(targetPlan);
    subscription.billingCycle = billingCycle;
    subscription.status = 'active';
    subscription.paymentStatus = 'active';

    const nextBilling = new Date();
    if (billingCycle === 'monthly') {
      nextBilling.setMonth(nextBilling.getMonth() + 1);
    } else {
      nextBilling.setFullYear(nextBilling.getFullYear() + 1);
    }
    subscription.nextBillingDate = nextBilling;
    subscription.endDate = nextBilling;

    await subscription.save();

    res.json({
      message: `Plano ${targetPlan} aplicado em modo de teste`,
      subscription: toSafeSubscription(subscription),
    });
  } catch (error) {
    logger.error('Erro ao forçar plano de teste:', error);
    next(error);
  }
};

/**
 * POST /api/subscriptions/cancel
 * Cancelar assinatura — agenda cancelamento no fim do período no Stripe
 * (usuário mantém acesso até renewsAt; sem cobranças futuras)
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

    if (subscription.status === 'cancelled') {
      return res.status(400).json({ message: 'Assinatura já está cancelada' });
    }

    // Se houver assinatura real no Stripe, agendar cancelamento no fim do período
    if (subscription.stripeSubscriptionId) {
      await stripeService.cancelSubscription(subscription.stripeSubscriptionId, false);
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
      subscription: toSafeSubscription(subscription),
      accessUntil: subscription.renewsAt || subscription.endDate,
    });
  } catch (error) {
    logger.error('Erro ao cancelar subscription:', error);
    next(error);
  }
};

/**
 * POST /api/subscriptions/reactivate
 * Reativa assinatura antes do período expirar (remove cancel_at_period_end no Stripe).
 * Se a assinatura Stripe já expirou, retorna checkoutRequired para o app abrir novo checkout.
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

    // Se houver assinatura Stripe, tentar reativar removendo o cancel_at_period_end
    if (subscription.stripeSubscriptionId) {
      const stripe = require('../config/stripe');

      let stripeSub;
      try {
        stripeSub = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
      } catch (_) {
        stripeSub = null;
      }

      if (!stripeSub || stripeSub.status === 'canceled') {
        // Assinatura já expirou no Stripe — precisa de novo checkout
        return res.status(200).json({
          checkoutRequired: true,
          message: 'Sua assinatura expirou. Inicie um novo checkout para assinar novamente.',
        });
      }

      // Assinatura ainda existe — apenas remove o agendamento de cancelamento
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: false,
      });
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
      subscription: toSafeSubscription(subscription),
    });
  } catch (error) {
    logger.error('Erro ao reativar subscription:', error);
    next(error);
  }
};

// ========================================
// STRIPE INTEGRATION
// ========================================

/**
 * GET /api/subscriptions/stripe-config
 * Retorna configuração pública do Stripe
 */
exports.getStripeConfig = async (req, res) => {
  try {
    res.json({
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
  } catch (error) {
    logger.error(`❌ Erro em getStripeConfig: ${error.message}`);
    res.status(500).json({ error: 'config_error' });
  }
};

/**
 * POST /api/subscription/create-checkout
 * Cria sessão de checkout Stripe
 */
exports.createCheckoutSession = async (req, res) => {
  try {
    const userId = req.user._id;

    // Verificar se já é Premium
    const subscription = await Subscription.findOne({ user: userId });
    if (!subscription) {
      return res.status(404).json({ error: 'subscription_not_found' });
    }

    if (subscription.plan === 'premium' && subscription.paymentStatus === 'active') {
      return res.status(400).json({
        error: 'already_premium',
        message: 'Você já possui o plano Premium ativo',
      });
    }

    // Price ID do Premium (configurado no .env)
    const priceId = process.env.STRIPE_PREMIUM_PRICE_ID;
    if (!priceId) {
      logger.error('❌ STRIPE_PREMIUM_PRICE_ID não configurado');
      return res.status(500).json({ error: 'stripe_not_configured' });
    }

    // URLs de redirecionamento HTTPS estáveis para Stripe Checkout
    const baseUrl = process.env.STRIPE_REDIRECT_BASE_URL;
    if (!baseUrl) {
      return res.status(500).json({
        error: 'stripe_not_configured',
        message: 'STRIPE_REDIRECT_BASE_URL não configurada',
      });
    }

    if (!baseUrl.startsWith('https://')) {
      return res.status(500).json({
        error: 'stripe_not_configured',
        message: 'STRIPE_REDIRECT_BASE_URL deve começar com https://',
      });
    }

    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const successUrl = `${normalizedBaseUrl}/api/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${normalizedBaseUrl}/api/checkout/cancel`;

    // Criar checkout session
    const { sessionId, url } = await stripeService.createCheckoutSession(
      userId,
      priceId,
      successUrl,
      cancelUrl
    );

    logger.info(`✅ Checkout criado para user ${userId}: ${sessionId}`);

    res.json({
      sessionId,
      url,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY, // Para usar Stripe.js se necessário
      successUrl,
      cancelUrl,
    });
  } catch (error) {
    logger.error(`❌ Erro em createCheckoutSession: ${error.message}`);

    if (error.message.includes('já possui')) {
      return res.status(400).json({
        error: 'already_premium',
        message: 'Você já possui um plano Premium ativo',
      });
    }

    const response = {
      error: 'checkout_creation_failed',
      message: 'Erro ao criar checkout',
    };

    res.status(500).json(response);
  }
};

/**
 * POST /api/subscription/webhook
 * Recebe e processa webhooks do Stripe
 */
exports.handleWebhook = async (req, res) => {
  try {
    const event = req.stripeEvent; // Já verificado pelo middleware

    logger.info(`📥 Processando webhook: ${event.type} (${event.id})`);

    // Verificar se evento já foi processado (idempotência)
    const existingEvent = await ProcessedEvent.findOne({ stripeEventId: event.id });
    if (existingEvent) {
      logger.info(`⏭️  Evento ${event.id} já processado anteriormente`);
      return res.json({ received: true, status: 'already_processed' });
    }

    // Processar evento baseado no tipo
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      default:
        logger.info(`ℹ️  Evento não tratado: ${event.type}`);
    }

    // Marcar evento como processado
    await ProcessedEvent.create({
      stripeEventId: event.id,
      eventType: event.type,
      processedAt: new Date(),
      metadata: {
        customerId: event.data.object.customer,
      },
    });

    logger.info(`✅ Webhook ${event.type} processado com sucesso`);

    res.json({ received: true });
  } catch (error) {
    logger.error(`❌ Erro ao processar webhook: ${error.message}`);
    res
      .status(500)
      .json(
        buildSafeErrorResponse('webhook_processing_failed', 'Falha ao processar webhook', error)
      );
  }
};

/**
 * Processa customer.subscription.created
 * Nova subscription criada (inclusive via API)
 */
const handleSubscriptionCreated = async (subscription) => {
  try {
    // Tentar buscar userId via metadata
    let userId = subscription.metadata?.userId;

    // Se não tem userId no metadata, buscar via Customer
    if (!userId) {
      logger.info(
        '⚠️  userId não encontrado no metadata da subscription, buscando via customer...'
      );

      if (!subscription.customer) {
        logger.warn('⚠️  Subscription sem customer - pulando processamento');
        return;
      }

      const stripe = require('../config/stripe');
      const customer = await stripe.customers.retrieve(subscription.customer);

      if (customer.metadata?.userId) {
        userId = customer.metadata.userId;
      } else {
        // Buscar no banco pelo stripeCustomerId
        const Subscription = require('../models/Subscription');
        const userSubscription = await Subscription.findOne({
          stripeCustomerId: subscription.customer,
        });

        if (userSubscription) {
          userId = userSubscription.user.toString();
        } else {
          logger.warn(`⚠️  User ID não encontrado para subscription ${subscription.id}`);
          return;
        }
      }
    }

    logger.info(`🎉 Nova subscription criada para user ${userId}: ${subscription.id}`);

    // Fazer upgrade para Premium
    await stripeService.upgradeUserToPremium(userId, subscription);

    logger.info(`✅ Upgrade para Premium concluído: user ${userId}`);
  } catch (error) {
    logger.error(`❌ Erro em handleSubscriptionCreated: ${error.message}`);
    throw error;
  }
};

/**
 * Processa checkout.session.completed
 * Usuário completou pagamento no Stripe Checkout
 */
const handleCheckoutCompleted = async (session) => {
  try {
    let userId = session.metadata?.userId;

    // Se não tem userId no metadata, buscar via Customer
    if (!userId) {
      logger.info('⚠️  userId não encontrado no metadata, buscando via customer...');

      // Verificar se session.customer existe
      if (!session.customer) {
        logger.warn('⚠️  Evento sintético sem customer - pulando processamento');
        return;
      }

      const stripe = require('../config/stripe');
      const customer = await stripe.customers.retrieve(session.customer);

      if (customer.metadata?.userId) {
        userId = customer.metadata.userId;
      } else {
        // Buscar no banco pelo stripeCustomerId
        const Subscription = require('../models/Subscription');
        const subscription = await Subscription.findOne({ stripeCustomerId: session.customer });

        if (subscription) {
          userId = subscription.user.toString();
        } else {
          throw new Error(
            'User ID não encontrado (nem no session.metadata, nem no customer, nem no banco)'
          );
        }
      }
    }

    logger.info(`🎉 Checkout completado para user ${userId}`);

    // Buscar subscription no Stripe
    const stripe = require('../config/stripe');
    const subscription = await stripe.subscriptions.retrieve(session.subscription);

    // Fazer upgrade para Premium
    await stripeService.upgradeUserToPremium(userId, subscription);

    logger.info(`✅ Upgrade para Premium concluído: user ${userId}`);

    // TODO: Enviar email de boas-vindas
    // TODO: Notificação push
  } catch (error) {
    logger.error(`❌ Erro em handleCheckoutCompleted: ${error.message}`);
    throw error;
  }
};

/**
 * Processa customer.subscription.updated
 * Assinatura foi atualizada (renovação, mudança de plano, etc)
 */
const handleSubscriptionUpdated = async (subscription) => {
  try {
    const userId = subscription.metadata.userId;
    if (!userId) {
      logger.warn('⚠️  User ID não encontrado no metadata da subscription');
      return;
    }

    logger.info(`🔄 Subscription atualizada para user ${userId}: ${subscription.status}`);

    // Se foi cancelada mas ainda está ativa (cancel_at_period_end)
    if (subscription.cancel_at_period_end) {
      logger.info(
        `⏰ Subscription ${subscription.id} será cancelada em ${new Date(subscription.cancel_at * 1000)}`
      );

      const userSubscription = await Subscription.findOne({ user: userId });
      if (userSubscription) {
        userSubscription.renewsAt = new Date(subscription.current_period_end * 1000);
        userSubscription.metadata.cancelReason = 'Usuário cancelou (fim do período)';
        await userSubscription.save();
      }
    }

    // Se status mudou para past_due (pagamento falhou)
    if (subscription.status === 'past_due') {
      const userSubscription = await Subscription.findOne({ user: userId });
      if (userSubscription) {
        userSubscription.paymentStatus = 'past_due';
        await userSubscription.save();
      }

      logger.warn(`⚠️  Pagamento atrasado: user ${userId}`);
      // TODO: Enviar email de cobrança
    }
  } catch (error) {
    logger.error(`❌ Erro em handleSubscriptionUpdated: ${error.message}`);
    throw error;
  }
};

/**
 * Processa customer.subscription.deleted
 * Assinatura foi cancelada
 */
const handleSubscriptionDeleted = async (subscription) => {
  try {
    const userId = subscription.metadata.userId;
    if (!userId) {
      logger.warn('⚠️  User ID não encontrado no metadata da subscription');
      return;
    }

    logger.info(`❌ Subscription deletada para user ${userId}`);

    // Fazer downgrade para Free
    await stripeService.downgradeUserToFree(userId, 'Assinatura cancelada no Stripe');

    logger.info(`✅ Downgrade para Free concluído: user ${userId}`);

    // TODO: Enviar email de feedback
    // TODO: Notificação push
  } catch (error) {
    logger.error(`❌ Erro em handleSubscriptionDeleted: ${error.message}`);
    throw error;
  }
};

/**
 * Processa invoice.payment_succeeded
 * Pagamento foi bem-sucedido (renovação, primeiro pagamento, etc)
 */
const handlePaymentSucceeded = async (invoice) => {
  try {
    const customerId = invoice.customer;
    const subscriptionId = invoice.subscription;

    logger.info(
      `✅ Pagamento bem-sucedido para customer ${customerId}, subscription ${subscriptionId}`
    );

    // Buscar usuário pelo Customer ID
    const subscription = await Subscription.findOne({ stripeCustomerId: customerId });
    if (subscription) {
      // Atualizar status para active
      subscription.paymentStatus = 'active';

      // Se ainda não tem stripeSubscriptionId, adicionar
      if (!subscription.stripeSubscriptionId && subscriptionId) {
        subscription.stripeSubscriptionId = subscriptionId;
      }

      await subscription.save();

      logger.info(`✅ Status atualizado: user ${subscription.user} -> active`);
    }
  } catch (error) {
    logger.error(`❌ Erro em handlePaymentSucceeded: ${error.message}`);
    throw error;
  }
};

/**
 * Processa invoice.payment_failed
 * Pagamento falhou (cartão recusado, etc)
 */
const handlePaymentFailed = async (invoice) => {
  try {
    const customerId = invoice.customer;

    logger.warn(`⚠️  Pagamento falhou para customer ${customerId}`);

    // Buscar usuário pelo Customer ID
    const subscription = await Subscription.findOne({ stripeCustomerId: customerId });
    if (subscription) {
      subscription.paymentStatus = 'past_due';
      await subscription.save();

      logger.info(`✅ Status atualizado: user ${subscription.user} -> past_due`);

      // TODO: Enviar email de notificação
    }
  } catch (error) {
    logger.error(`❌ Erro em handlePaymentFailed: ${error.message}`);
    throw error;
  }
};

/**
 * POST /api/subscription/cancel-stripe
 * Cancela assinatura Stripe do usuário
 */
exports.cancelStripeSubscription = async (req, res) => {
  try {
    const userId = req.user._id;
    const { immediately = false, reason } = req.body;

    const subscription = await Subscription.findOne({ user: userId });
    if (!subscription) {
      return res.status(404).json({ error: 'subscription_not_found' });
    }

    if (!subscription.stripeSubscriptionId) {
      return res.status(400).json({
        error: 'no_active_subscription',
        message: 'Nenhuma assinatura ativa encontrada',
      });
    }

    // Cancelar no Stripe
    await stripeService.cancelSubscription(subscription.stripeSubscriptionId, immediately);

    // Se cancelar imediatamente, fazer downgrade agora
    if (immediately) {
      await stripeService.downgradeUserToFree(userId, reason || 'Cancelamento imediato');
    } else {
      // Apenas marcar para cancelar ao fim do período
      subscription.metadata.cancelReason = reason || 'Usuário cancelou';
      await subscription.save();
    }

    logger.info(`✅ Assinatura cancelada: user ${userId} (immediately: ${immediately})`);

    res.json({
      success: true,
      message: immediately
        ? 'Assinatura cancelada imediatamente'
        : 'Assinatura será cancelada ao fim do período de cobrança',
      endsAt: subscription.renewsAt,
    });
  } catch (error) {
    logger.error(`❌ Erro em cancelStripeSubscription: ${error.message}`);
    res
      .status(500)
      .json(
        buildSafeErrorResponse(
          'cancellation_failed',
          'Não foi possível cancelar a assinatura no momento',
          error
        )
      );
  }
};

/**
 * POST /api/subscription/customer-portal
 * Cria sessão do Customer Portal (gerenciar assinatura)
 */
exports.createCustomerPortalSession = async (req, res) => {
  try {
    const userId = req.user._id;

    const subscription = await Subscription.findOne({ user: userId });
    if (!subscription || !subscription.stripeCustomerId) {
      return res.status(404).json({
        error: 'no_stripe_customer',
        message: 'Cliente Stripe não encontrado',
      });
    }

    // URL de retorno (mobile/web)
    const returnUrl = process.env.STRIPE_PORTAL_RETURN_URL || 'guiaaventureiro://profile';

    const { url } = await stripeService.createCustomerPortal(
      subscription.stripeCustomerId,
      returnUrl
    );

    logger.info(`✅ Customer Portal criado para user ${userId}`);

    res.json({ url });
  } catch (error) {
    logger.error(`❌ Erro em createCustomerPortalSession: ${error.message}`);
    res
      .status(500)
      .json(
        buildSafeErrorResponse(
          'portal_creation_failed',
          'Não foi possível abrir o portal do cliente no momento',
          error
        )
      );
  }
};

/**
 * GET /api/subscription/stripe-status
 * Retorna status detalhado da assinatura Stripe
 */
exports.getStripeSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.user._id;

    const subscription = await Subscription.findOne({ user: userId });
    if (!subscription) {
      return res.status(404).json({ error: 'subscription_not_found' });
    }

    res.json({
      plan: subscription.plan,
      status: subscription.status,
      paymentStatus: subscription.paymentStatus,
      renewsAt: subscription.renewsAt,
      cancelledAt: subscription.cancelledAt,
      hasStripeSubscription: !!subscription.stripeSubscriptionId,
      usage: subscription.usage,
      features: subscription.features,
    });
  } catch (error) {
    logger.error(`❌ Erro em getStripeSubscriptionStatus: ${error.message}`);
    res
      .status(500)
      .json(
        buildSafeErrorResponse(
          'status_retrieval_failed',
          'Não foi possível consultar o status da assinatura no momento',
          error
        )
      );
  }
};
