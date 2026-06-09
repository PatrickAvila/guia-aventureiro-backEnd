// backend/src/middleware/verifyStripeSignature.js
const stripe = require('../config/stripe');
const logger = require('../utils/logger');

/**
 * Middleware para verificar assinatura de webhooks do Stripe
 * Previne webhooks falsos/maliciosos
 */
const verifyStripeSignature = (req, res, next) => {
  // Obter assinatura do header
  const signature = req.headers['stripe-signature'];

  if (!signature) {
    logger.warn('⚠️  Webhook sem assinatura Stripe');
    return res.status(400).json({ error: 'missing_signature' });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    logger.error('❌ STRIPE_WEBHOOK_SECRET não configurado');
    return res.status(500).json({ error: 'webhook_secret_not_configured' });
  }

  try {
    // Verificar assinatura e construir evento
    // req.rawBody é definido no server.js para esta rota específica
    const event = stripe.webhooks.constructEvent(
      req.rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // Anexar evento verificado ao request
    req.stripeEvent = event;

    logger.info(`✅ Webhook Stripe verificado: ${event.type} (${event.id})`);
    next();
  } catch (err) {
    logger.error(`❌ Falha na verificação de webhook Stripe: ${err.message}`);
    const isProd = process.env.NODE_ENV === 'production';
    return res.status(400).json({
      error: 'invalid_signature',
      message: isProd ? 'Invalid signature' : err.message,
    });
  }
};

module.exports = verifyStripeSignature;
