// backend/src/controllers/chatController.js
const Message = require('../models/Message');
const Itinerary = require('../models/Itinerary');
const logger = require('../utils/logger');

// Obter histórico de mensagens
exports.getMessages = async (req, res, next) => {
  try {
    const { itineraryId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.userId;

    // Verificar acesso ao roteiro
    const itinerary = await Itinerary.findById(itineraryId);

    if (!itinerary) {
      return res.status(404).json({ message: 'Roteiro não encontrado' });
    }

    const hasAccess =
      itinerary.owner.toString() === userId.toString() ||
      (itinerary.collaborators || []).some(
        (c) => c.user.toString() === userId.toString()
      );

    if (!hasAccess) {
      return res.status(403).json({ message: 'Sem permissão para acessar este roteiro' });
    }

    const skip = (page - 1) * limit;

    const messages = await Message.find({ itinerary: itineraryId, deleted: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('sender', 'name email profilePicture')
      .exec();

    const total = await Message.countDocuments({ itinerary: itineraryId, deleted: false });

    res.json({
      messages: messages.reverse(), // Inverter para ordem cronológica
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Erro ao obter mensagens:', error);
    next(error);
  }
};

// Enviar mensagem via HTTP (fallback se WebSocket falhar)
exports.sendMessage = async (req, res, next) => {
  try {
    const { itineraryId } = req.params;
    const { content, type = 'text', metadata } = req.body;
    const userId = req.userId;

    if (!content) {
      return res.status(400).json({ message: 'Conteúdo é obrigatório' });
    }

    // Verificar acesso
    const itinerary = await Itinerary.findById(itineraryId);

    if (!itinerary) {
      return res.status(404).json({ message: 'Roteiro não encontrado' });
    }

    const hasAccess =
      itinerary.owner.toString() === userId.toString() ||
      (itinerary.collaborators || []).some(
        (c) => c.user.toString() === userId.toString()
      );

    if (!hasAccess) {
      return res.status(403).json({ message: 'Sem permissão para enviar mensagens' });
    }

    // Criar mensagem
    const message = new Message({
      itinerary: itineraryId,
      sender: userId,
      content,
      type,
      metadata,
    });

    await message.save();
    await message.populate('sender', 'name email profilePicture');

    // Notificar via Socket.IO se disponível
    const { notifyUsers } = require('../services/socketService');
    notifyUsers(itineraryId, 'new_message', message);

    res.status(201).json({ message: 'Mensagem enviada', data: message });
  } catch (error) {
    logger.error('Erro ao enviar mensagem:', error);
    next(error);
  }
};

// Deletar mensagem (soft delete)
exports.deleteMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const userId = req.userId;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: 'Mensagem não encontrada' });
    }

    // Apenas o remetente pode deletar
    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Apenas o remetente pode deletar a mensagem' });
    }

    message.deleted = true;
    await message.save();

    // Notificar via Socket.IO
    const { notifyUsers } = require('../services/socketService');
    notifyUsers(message.itinerary, 'message_deleted', { messageId });

    res.json({ message: 'Mensagem deletada' });
  } catch (error) {
    logger.error('Erro ao deletar mensagem:', error);
    next(error);
  }
};

// Obter contagem de mensagens não lidas
exports.getUnreadCount = async (req, res, next) => {
  try {
    const { itineraryId } = req.params;
    const userId = req.userId;

    const count = await Message.getUnreadCount(itineraryId, userId);

    res.json({ count });
  } catch (error) {
    logger.error('Erro ao obter contagem de não lidas:', error);
    next(error);
  }
};

// Marcar todas como lidas
exports.markAllAsRead = async (req, res, next) => {
  try {
    const { itineraryId } = req.params;
    const userId = req.userId;

    // Buscar todas as mensagens não lidas
    const unreadMessages = await Message.find({
      itinerary: itineraryId,
      deleted: false,
      'readBy.user': { $ne: userId },
    });

    // Marcar todas como lidas
    const promises = unreadMessages.map((msg) => msg.markAsRead(userId));
    await Promise.all(promises);

    res.json({ message: 'Todas mensagens marcadas como lidas', count: unreadMessages.length });
  } catch (error) {
    logger.error('Erro ao marcar todas como lidas:', error);
    next(error);
  }
};
