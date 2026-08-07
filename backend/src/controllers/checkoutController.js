// backend/src/controllers/checkoutController.js
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const stripeService = require('../services/stripeService');
const logger = require('../utils/logger');

// Inicializar Stripe apenas se a chave existir
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY não configurada');
  }
  return require('stripe')(process.env.STRIPE_SECRET_KEY);
};

/**
 * Criar Stripe Checkout Session para upgrade Premium
 * OTIMIZADO: Delega para stripeService em vez de reimplementar
 */
exports.createCheckoutSession = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    const subscription = await Subscription.findOne({ user: userId });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Verificar se já é premium (fonte de verdade: coleção Subscription)
    if (subscription?.plan === 'premium' && subscription?.status === 'active') {
      return res.status(400).json({
        error: 'Você já possui um plano Premium ativo',
      });
    }

    const priceId = process.env.STRIPE_PREMIUM_PRICE_ID;
    if (!priceId) {
      return res.status(500).json({
        error: 'Configuração de pagamento incompleta',
      });
    }

    // Usa base HTTPS estável para evitar erro de conexão no Safari quando tunnel expira
    const redirectBaseUrl = process.env.STRIPE_REDIRECT_BASE_URL;
    if (!redirectBaseUrl) {
      return res.status(500).json({
        error: 'Configuração de redirecionamento não definida',
      });
    }

    if (!redirectBaseUrl.startsWith('https://')) {
      return res.status(500).json({
        error: 'STRIPE_REDIRECT_BASE_URL deve começar com https://',
      });
    }

    const normalizedBaseUrl = redirectBaseUrl.endsWith('/')
      ? redirectBaseUrl.slice(0, -1)
      : redirectBaseUrl;
    const successUrl = `${normalizedBaseUrl}/api/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${normalizedBaseUrl}/api/checkout/cancel`;

    // Delegar para stripeService (evita duplicação)
    const { sessionId, url } = await stripeService.createCheckoutSession(
      userId,
      priceId,
      successUrl,
      cancelUrl
    );

    res.json({
      sessionId,
      url,
      successUrl,
      cancelUrl,
    });
  } catch (error) {
    logger.error('Erro ao criar checkout session');
    const errorResponse = {
      error: 'Erro ao criar sessão de pagamento',
    };

    res.status(500).json(errorResponse);
  }
};

/**
 * Verificar status de uma Checkout Session e atualizar usuário se pagamento foi bem-sucedido
 */
exports.verifyCheckoutSession = async (req, res) => {
  try {
    const stripe = getStripe();
    const { sessionId } = req.params;
    const authenticatedUserId = req.user?._id?.toString();

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    if (!session) {
      return res.status(404).json({ error: 'Sessão não encontrada' });
    }

    // Para subscriptions, considerar checkout completo também (nem sempre vem como "paid" imediatamente).
    const isCheckoutCompleted = session.status === 'complete';
    const hasSuccessfulPaymentState =
      session.payment_status === 'paid' || session.payment_status === 'no_payment_required';
    const shouldActivatePremium =
      !!session.customer && (isCheckoutCompleted || hasSuccessfulPaymentState);

    // Se o pagamento foi bem-sucedido, atualizar usuário no banco de dados
    if (shouldActivatePremium) {
      // Buscar usuário pela metadata da sessão ou pelo customer ID
      let user = null;

      if (session.metadata?.userId) {
        if (!authenticatedUserId || session.metadata.userId !== authenticatedUserId) {
          return res.status(403).json({
            error: 'session_user_mismatch',
            message: 'A sessão de checkout não pertence ao usuário autenticado',
          });
        }

        user = await User.findById(session.metadata.userId);
      }

      if (!user) {
        // Fallback: buscar pela associação com o customer do Stripe
        user = await User.findOne({ 'subscription.stripeCustomerId': session.customer });

        if (user && authenticatedUserId && user._id.toString() !== authenticatedUserId) {
          return res.status(403).json({
            error: 'session_user_mismatch',
            message: 'A sessão de checkout não pertence ao usuário autenticado',
          });
        }
      }

      if (user) {
        // Atualizar subscription do usuário
        user.subscription = user.subscription || {};
        user.subscription.plan = 'premium';
        user.subscription.status = 'active';
        user.subscription.stripeCustomerId = session.customer;
        user.subscription.startDate = new Date();

        // Se houver subscription ID, salvar para gerenciamento futuro
        if (session.subscription?.id) {
          user.subscription.stripeSubscriptionId = session.subscription.id;
          user.subscription.currentPeriodStart = new Date(
            session.subscription.current_period_start * 1000
          );
          user.subscription.currentPeriodEnd = new Date(
            session.subscription.current_period_end * 1000
          );
          user.subscription.billingCycle = session.subscription.billing_cycle_anchor
            ? 'monthly'
            : 'monthly';
        }

        await user.save();
        logger.info(`Usuário ${user._id} marcado como premium após pagamento (User model)`);

        // Também atualizar o modelo Subscription se existir
        let subscription = await Subscription.findOne({ user: user._id });
        if (subscription) {
          subscription.plan = 'premium';
          subscription.paymentStatus = 'active';
          subscription.status = 'active';
          subscription.stripeCustomerId = session.customer;

          // IMPORTANTE: Atualizar limites para Premium
          subscription.usage.itineraries.limit = 50;
          subscription.usage.aiGenerations.limit = 999999; // Ilimitado
          subscription.usage.photos.limit = 20; // 20 por roteiro
          subscription.usage.collaborators.limit = 5; // Futuro

          if (session.subscription?.id) {
            subscription.stripeSubscriptionId = session.subscription.id;
            subscription.startDate = new Date();
            subscription.renewsAt = new Date(session.subscription.current_period_end * 1000);
          }

          await subscription.save();
          logger.info(
            `Subscription ${subscription._id} atualizada para premium (Subscription model)`
          );
        }
      } else {
        logger.warn(`Usuário não encontrado para sessão ${sessionId}`);
      }
    }

    res.json({
      status: session.status,
      paymentStatus: session.payment_status,
      updated: shouldActivatePremium,
    });
  } catch (error) {
    logger.error('Erro ao verificar checkout session');
    const errorResponse = {
      error: 'Erro ao verificar sessão',
    };

    res.status(500).json(errorResponse);
  }
};
