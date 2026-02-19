// backend/src/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { validateSignup, validateLogin, validateUpdatePassword } = require('../middleware/validators');
const { checkBlocked } = require('../middleware/ipBlocker');

// Públicas
router.post('/signup', validateSignup, authController.signup);
router.post('/login', validateLogin, authController.login);
router.post('/refresh', authController.refreshToken);

// Protegidas
router.post('/logout', auth, authController.logout);
router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, authController.updateProfile);
router.put('/password', auth, validateUpdatePassword, authController.updatePassword);
router.delete('/account', auth, authController.deleteAccount);

// Públicas (perfil público)
router.get('/public/:userId', authController.getPublicProfile);

module.exports = router;