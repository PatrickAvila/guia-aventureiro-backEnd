// backend/src/routes/subscriptions.js
const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const auth = require('../middleware/auth');

/**
 * Rotas de Assinatura
 */

// Públicas
router.get('/plans', subscriptionController.getPlans);

// Protegidas (requerem autenticação)
router.get('/my-subscription', auth, subscriptionController.getMySubscription);
router.get('/usage', auth, subscriptionController.getUsage);
router.post('/upgrade', auth, subscriptionController.initiateUpgrade);
router.post('/confirm-upgrade', auth, subscriptionController.confirmUpgrade);
router.post('/cancel', auth, subscriptionController.cancelSubscription);
router.post('/reactivate', auth, subscriptionController.reactivateSubscription);

module.exports = router;
