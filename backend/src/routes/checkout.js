// backend/src/routes/checkout.js
const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');
const paymentPagesController = require('../controllers/paymentPagesController');
const authMiddleware = require('../middleware/auth');

/**
 * @route   POST /api/checkout/create-session
 * @desc    Criar Stripe Checkout Session para upgrade Premium
 * @access  Private
 */
router.post('/create-session', authMiddleware, checkoutController.createCheckoutSession);

/**
 * @route   GET /api/checkout/verify/:sessionId
 * @desc    Verificar status de uma Checkout Session
 * @access  Private
 */
router.get('/verify/:sessionId', authMiddleware, checkoutController.verifyCheckoutSession);

/**
 * @route   GET /api/checkout/success
 * @desc    Página de sucesso do pagamento (pública)
 * @access  Public
 */
router.get('/success', paymentPagesController.paymentSuccess);

/**
 * @route   GET /api/checkout/cancel
 * @desc    Página de cancelamento do pagamento (pública)
 * @access  Public
 */
router.get('/cancel', paymentPagesController.paymentCancel);

module.exports = router;
