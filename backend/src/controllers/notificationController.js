// backend/src/controllers/notificationController.js
const Notification = require('../models/Notification');

const toSafeNotification = (notification) => {
  if (!notification) return null;

  const safeNotification =
    typeof notification.toObject === 'function' ? notification.toObject() : { ...notification };

  delete safeNotification.user;
  delete safeNotification.__v;
  delete safeNotification.pushSent;
  delete safeNotification.pushSentAt;

  return safeNotification;
};

/**
 * GET /api/notifications
 * Lista notificações do usuário
 */
exports.getNotifications = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Autenticação necessária' });
    }

    const { page = 1, limit = 20, unreadOnly = false, type } = req.query;

    const query = { user: req.user._id };

    if (unreadOnly === 'true') {
      query.read = false;
    }

    if (type) {
      query.type = type;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [notifications, total] = await Promise.all([
      Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      Notification.countDocuments(query),
    ]);

    const unreadCount = await Notification.getUnreadCount(req.user._id);

    res.json({
      notifications: notifications.map(toSafeNotification),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
      unreadCount,
    });
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    res.status(500).json({ message: 'Erro ao buscar notificações' });
  }
};

/**
 * GET /api/notifications/unread-count
 * Retorna contagem de notificações não lidas
 */
exports.getUnreadCount = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Autenticação necessária' });
    }

    const count = await Notification.getUnreadCount(req.user._id);
    res.json({ count });
  } catch (error) {
    console.error('Erro ao contar notificações não lidas:', error);
    res.status(500).json({ message: 'Erro ao contar notificações' });
  }
};

/**
 * PUT /api/notifications/:id/read
 * Marca notificação como lida
 */
exports.markAsRead = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Autenticação necessária' });
    }

    const { id } = req.params;

    const notification = await Notification.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notificação não encontrada' });
    }

    if (notification.read) {
      return res.json({
        message: 'Notificação já estava marcada como lida',
        notification: toSafeNotification(notification),
      });
    }

    await notification.markAsRead();

    res.json({
      message: 'Notificação marcada como lida',
      notification: toSafeNotification(notification),
    });
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    res.status(500).json({ message: 'Erro ao atualizar notificação' });
  }
};

/**
 * PUT /api/notifications/read-all
 * Marca todas as notificações como lidas
 */
exports.markAllAsRead = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Autenticação necessária' });
    }

    const result = await Notification.updateMany(
      { user: req.user._id, read: false },
      { read: true, readAt: new Date() }
    );

    res.json({
      message: 'Todas as notificações marcadas como lidas',
      count: result.modifiedCount,
    });
  } catch (error) {
    console.error('Erro ao marcar todas as notificações como lidas:', error);
    res.status(500).json({ message: 'Erro ao atualizar notificações' });
  }
};

/**
 * DELETE /api/notifications/:id
 * Deleta uma notificação
 */
exports.deleteNotification = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Autenticação necessária' });
    }

    const { id } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notificação não encontrada' });
    }

    res.json({ message: 'Notificação deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar notificação:', error);
    res.status(500).json({ message: 'Erro ao deletar notificação' });
  }
};

/**
 * DELETE /api/notifications
 * Deleta todas as notificações lidas
 */
exports.deleteAllRead = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Autenticação necessária' });
    }

    const result = await Notification.deleteMany({
      user: req.user._id,
      read: true,
    });

    res.json({
      message: 'Notificações lidas deletadas com sucesso',
      count: result.deletedCount,
    });
  } catch (error) {
    console.error('Erro ao deletar notificações:', error);
    res.status(500).json({ message: 'Erro ao deletar notificações' });
  }
};

/**
 * POST /api/notifications (uso interno/admin)
 * Cria uma notificação
 */
exports.createNotification = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Autenticação necessária' });
    }

    const { userId, type, title, message, data, actionUrl, priority, expiresAt } = req.body;

    // Validações
    if (!userId || !type || !title || !message) {
      return res.status(400).json({
        message: 'userId, type, title e message são obrigatórios',
      });
    }

    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      data: data || {},
      actionUrl,
      priority: priority || 'medium',
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    });

    res.status(201).json({
      message: 'Notificação criada com sucesso',
      notification: toSafeNotification(notification),
    });
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    res.status(500).json({ message: 'Erro ao criar notificação' });
  }
};

/**
 * Helper: Criar notificação (para uso interno no backend)
 */
exports.createNotificationHelper = async (
  userId,
  type,
  title,
  message,
  data = {},
  options = {}
) => {
  try {
    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      data,
      actionUrl: options.actionUrl || null,
      priority: options.priority || 'medium',
      expiresAt: options.expiresAt ? new Date(options.expiresAt) : null,
    });

    return notification;
  } catch (error) {
    console.error('Erro ao criar notificação (helper):', error);
    return null;
  }
};
