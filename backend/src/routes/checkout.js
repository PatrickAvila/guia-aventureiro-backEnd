// backend/src/routes/checkout.js
const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/checkout/create-session
 * @desc    Criar Stripe Checkout Session para upgrade Premium
 * @access  Private
 */
router.post('/create-session', protect, checkoutController.createCheckoutSession);

/**
 * @route   GET /api/checkout/verify/:sessionId
 * @desc    Verificar status de uma Checkout Session
 * @access  Private
 */
router.get('/verify/:sessionId', protect, checkoutController.verifyCheckoutSession);

module.exports = router;
