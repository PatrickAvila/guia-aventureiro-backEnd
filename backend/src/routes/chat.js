// backend/src/routes/chat.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const chatController = require('../controllers/chatController');

/**
 * GET /api/chat/:itineraryId/messages
 * Obter histórico de mensagens (paginado)
 */
router.get('/:itineraryId/messages', auth, chatController.getMessages);

/**
 * POST /api/chat/:itineraryId/messages
 * Enviar mensagem (fallback HTTP se WebSocket falhar)
 */
router.post('/:itineraryId/messages', auth, chatController.sendMessage);

/**
 * DELETE /api/chat/messages/:messageId
 * Deletar mensagem (soft delete)
 */
router.delete('/messages/:messageId', auth, chatController.deleteMessage);

/**
 * GET /api/chat/:itineraryId/unread-count
 * Obter contagem de mensagens não lidas
 */
router.get('/:itineraryId/unread-count', auth, chatController.getUnreadCount);

/**
 * PUT /api/chat/:itineraryId/mark-all-read
 * Marcar todas as mensagens como lidas
 */
router.put('/:itineraryId/mark-all-read', auth, chatController.markAllAsRead);

module.exports = router;
