// backend/src/routes/pushNotifications.js
const express = require('express');
const router = express.Router();
const pushController = require('../controllers/pushNotificationController');
const auth = require('../middleware/auth');

// Todas as rotas requerem autenticação

// Registrar token de dispositivo
router.post('/register', auth, pushController.registerToken);

// Desativar token de dispositivo
router.post('/unregister', auth, pushController.unregisterToken);

// Listar tokens ativos do usuário
router.get('/tokens', auth, pushController.getDeviceTokens);

// Enviar notificação de teste
router.post('/test', auth, pushController.sendTestNotification);

module.exports = router;
