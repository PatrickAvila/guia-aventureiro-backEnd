// backend/src/routes/notifications.js
const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

// Todas as rotas requerem autenticação
router.use(optionalAuth);

/**
 * GET /api/notifications
 * Lista notificações do usuário
 * Query params: page, limit, unreadOnly, type
 */
router.get('/', notificationController.getNotifications);

/**
 * GET /api/notifications/unread-count
 * Retorna contagem de notificações não lidas
 */
router.get('/unread-count', notificationController.getUnreadCount);

/**
 * PUT /api/notifications/read-all
 * Marca todas as notificações como lidas
 */
router.put('/read-all', notificationController.markAllAsRead);

/**
 * PUT /api/notifications/:id/read
 * Marca notificação específica como lida
 */
router.put('/:id/read', notificationController.markAsRead);

/**
 * DELETE /api/notifications/read
 * Deleta todas as notificações lidas
 */
router.delete('/read', notificationController.deleteAllRead);

/**
 * DELETE /api/notifications/:id
 * Deleta uma notificação específica
 */
router.delete('/:id', notificationController.deleteNotification);

/**
 * POST /api/notifications
 * Cria uma notificação (uso interno/admin)
 */
router.post('/', notificationController.createNotification);

module.exports = router;
