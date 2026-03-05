// backend/src/routes/subscriptions.js
const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const auth = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const verifyStripeSignature = require('../middleware/verifyStripeSignature');

// Rate limiter específico para checkout (máximo 5 tentativas em 15 minutos)
const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5,
  message: 'Muitas tentativas de checkout. Tente novamente em 15 minutos.',
});

/**
 * Rotas de Assinatura
 */

// Públicas
router.get('/plans', subscriptionController.getPlans);
router.get('/stripe-config', subscriptionController.getStripeConfig);

// Protegidas (requerem autenticação)
router.get('/my-subscription', auth, subscriptionController.getMySubscription);
router.get('/usage', auth, subscriptionController.getUsage);
// Fluxo legado: permitido apenas em dev/test (controller bloqueia em produção)
router.post('/upgrade', auth, subscriptionController.initiateUpgrade);
router.post('/confirm-upgrade', auth, subscriptionController.confirmUpgrade);
router.post('/cancel', auth, subscriptionController.cancelSubscription);
router.post('/reactivate', auth, subscriptionController.reactivateSubscription);

// ========================================
// STRIPE ROUTES
// ========================================

// Criar sessão de checkout Stripe
router.post('/create-checkout', auth, checkoutLimiter, subscriptionController.createCheckoutSession);

// NOVA ABORDAGEM - Para app mobile (funciona sem conta ativada!)
router.post('/create-setup-intent', auth, subscriptionController.createSetupIntent);
router.post('/confirm-payment', auth, subscriptionController.confirmPayment);

// Customer Portal (gerenciar assinatura)
router.post('/customer-portal', auth, subscriptionController.createCustomerPortalSession);

// Cancelar assinatura Stripe
router.post('/cancel-stripe', auth, subscriptionController.cancelStripeSubscription);

// Status da assinatura Stripe
router.get('/stripe-status', auth, subscriptionController.getStripeSubscriptionStatus);

// Webhook Stripe (NOTA: Essa rota precisa ser registrada no server.js com raw body)
// router.post('/webhook', express.raw({ type: 'application/json' }), verifyStripeSignature, subscriptionController.handleWebhook);
// ⚠️ A rota webhook é registrada diretamente no server.js para usar raw body

module.exports = router;
