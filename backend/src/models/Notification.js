// backend/src/models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: [
      'trip_reminder',          // Lembrete de viagem próxima
      'collaboration_invite',   // Convite para colaborar
      'collaboration_accepted', // Colaboração aceita
      'itinerary_shared',       // Roteiro compartilhado com você
      'achievement_unlocked',   // Conquista desbloqueada
      'budget_alert',           // Alerta de orçamento
      'trip_start',             // Viagem começou
      'trip_end',               // Viagem terminou
      'activity_reminder',      // Lembrete de atividade
      'rating_request',         // Pedido para avaliar viagem
      'system',                 // Notificação do sistema
    ],
  },
  title: {
    type: String,
    required: true,
    maxlength: 100,
  },
  message: {
    type: String,
    required: true,
    maxlength: 500,
  },
  data: {
    type: mongoose.Schema.Types.Mixed, // Dados adicionais específicos do tipo
    default: {},
  },
  read: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
    default: null,
  },
  actionUrl: {
    type: String, // Deep link para ação (ex: guiaaventureiro://itinerary/123)
    default: null,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  expiresAt: {
    type: Date, // Notificações podem expirar (ex: lembrete de viagem passada)
    default: null,
  },
  pushSent: {
    type: Boolean,
    default: false, // Controla se push notification foi enviado
  },
  pushSentAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// Índices compostos para queries otimizadas
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });
notificationSchema.index({ user: 1, type: 1 });
notificationSchema.index({ expiresAt: 1 }, { sparse: true });

// Método para marcar como lida
notificationSchema.methods.markAsRead = function() {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

// Query helper para notificações não lidas
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ user: userId, read: false });
};

// Query helper para notificações recentes
notificationSchema.statics.getRecent = function(userId, limit = 20) {
  return this.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

// Remover notificações expiradas (pode ser executado por cron job)
notificationSchema.statics.removeExpired = function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() },
  });
};

module.exports = mongoose.model('Notification', notificationSchema);
