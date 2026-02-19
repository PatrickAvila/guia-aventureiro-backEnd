// backend/src/models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    itinerary: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Itinerary',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    type: {
      type: String,
      enum: ['text', 'system', 'activity_update', 'budget_update', 'location_share'],
      default: 'text',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed, // Para dados adicionais (coordenadas, IDs, etc)
    },
    readBy: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        readAt: { type: Date, default: Date.now },
      },
    ],
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Índices compostos para performance
messageSchema.index({ itinerary: 1, createdAt: -1 });
messageSchema.index({ itinerary: 1, deleted: 1 });

// Métodos estáticos
messageSchema.statics.getRecentMessages = function (itineraryId, limit = 50) {
  return this.find({ itinerary: itineraryId, deleted: false })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('sender', 'name email profilePicture')
    .exec();
};

messageSchema.statics.getUnreadCount = function (itineraryId, userId) {
  return this.countDocuments({
    itinerary: itineraryId,
    deleted: false,
    'readBy.user': { $ne: userId },
  }).exec();
};

messageSchema.methods.markAsRead = function (userId) {
  const alreadyRead = this.readBy.some((r) => r.user.toString() === userId.toString());
  if (!alreadyRead) {
    this.readBy.push({ user: userId, readAt: new Date() });
  }
  return this.save();
};

module.exports = mongoose.model('Message', messageSchema);
