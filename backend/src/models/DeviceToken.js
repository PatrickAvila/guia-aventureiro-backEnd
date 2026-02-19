// backend/src/models/DeviceToken.js
const mongoose = require('mongoose');

const deviceTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  platform: {
    type: String,
    required: true,
    enum: ['ios', 'android', 'web'],
  },
  deviceId: {
    type: String,
    required: false,
  },
  deviceName: {
    type: String,
    required: false,
  },
  active: {
    type: Boolean,
    default: true,
  },
  lastUsed: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Índice composto para evitar duplicatas
deviceTokenSchema.index({ user: 1, token: 1 }, { unique: true });

// Método para desativar tokens antigos do mesmo dispositivo
deviceTokenSchema.statics.updateOrCreateToken = async function(userId, tokenData) {
  const { token, platform, deviceId, deviceName } = tokenData;

  // Se há deviceId, desativar tokens antigos desse dispositivo
  if (deviceId) {
    await this.updateMany(
      { user: userId, deviceId, active: true },
      { $set: { active: false } }
    );
  }

  // Criar ou atualizar token
  const deviceToken = await this.findOneAndUpdate(
    { user: userId, token },
    {
      platform,
      deviceId,
      deviceName,
      active: true,
      lastUsed: new Date(),
    },
    { upsert: true, new: true }
  );

  return deviceToken;
};

// Método para obter tokens ativos de um usuário
deviceTokenSchema.statics.getActiveTokens = async function(userId) {
  return await this.find({
    user: userId,
    active: true,
  });
};

module.exports = mongoose.model('DeviceToken', deviceTokenSchema);
