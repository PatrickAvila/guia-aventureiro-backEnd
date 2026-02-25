// backend/src/models/ProcessedEvent.js
const mongoose = require('mongoose');

/**
 * Model para rastrear eventos do Stripe já processados
 * Garante idempotência - cada evento processado apenas 1 vez
 */
const processedEventSchema = new mongoose.Schema({
  stripeEventId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  eventType: {
    type: String,
    required: true,
  },
  processedAt: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: true,
});

// Índice para limpeza automática (eventos com mais de 90 dias)
processedEventSchema.index({ processedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

module.exports = mongoose.model('ProcessedEvent', processedEventSchema);
