// backend/src/controllers/pushNotificationController.js
const DeviceToken = require('../models/DeviceToken');
const logger = require('../utils/logger');
const pushService = require('../services/pushNotificationService');

// Registrar ou atualizar token de dispositivo
exports.registerToken = async (req, res, next) => {
  try {
    const { token, platform, deviceId, deviceName } = req.body;
    const userId = req.userId;

    // Validar campos obrigatórios
    if (!token || !platform) {
      return res.status(400).json({
        message: 'Token e platform são obrigatórios',
      });
    }

    // Validar platform
    if (!['ios', 'android', 'web'].includes(platform)) {
      return res.status(400).json({
        message: 'Platform inválido. Use: ios, android ou web',
      });
    }

    // Criar ou atualizar token
    const deviceToken = await DeviceToken.updateOrCreateToken(userId, {
      token,
      platform,
      deviceId,
      deviceName,
    });

    logger.info(`Token registrado para usuário ${userId}: ${platform}`);

    res.status(200).json({
      message: 'Token registrado com sucesso',
      deviceToken: {
        id: deviceToken._id,
        platform: deviceToken.platform,
        active: deviceToken.active,
      },
    });
  } catch (error) {
    logger.error('Erro ao registrar token:', error);
    next(error);
  }
};

// Desativar token de dispositivo
exports.unregisterToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    const userId = req.userId;

    if (!token) {
      return res.status(400).json({
        message: 'Token é obrigatório',
      });
    }

    // Desativar token
    const result = await DeviceToken.updateOne(
      { user: userId, token },
      { $set: { active: false } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({
        message: 'Token não encontrado ou já estava inativo',
      });
    }

    logger.info(`Token desativado para usuário ${userId}`);

    res.json({
      message: 'Token desativado com sucesso',
    });
  } catch (error) {
    logger.error('Erro ao desativar token:', error);
    next(error);
  }
};

// Listar tokens ativos do usuário
exports.getDeviceTokens = async (req, res, next) => {
  try {
    const userId = req.userId;

    const tokens = await DeviceToken.find({
      user: userId,
      active: true,
    }).select('platform deviceName lastUsed createdAt');

    res.json({
      tokens: tokens.map(t => ({
        id: t._id,
        platform: t.platform,
        deviceName: t.deviceName,
        lastUsed: t.lastUsed,
        registeredAt: t.createdAt,
      })),
      total: tokens.length,
    });
  } catch (error) {
    logger.error('Erro ao listar tokens:', error);
    next(error);
  }
};

// Enviar notificação de teste
exports.sendTestNotification = async (req, res, next) => {
  try {
    const userId = req.userId;

    const notification = {
      title: '🧪 Notificação de Teste',
      body: 'Suas notificações push estão funcionando perfeitamente!',
      data: {
        type: 'test',
        timestamp: new Date().toISOString(),
      },
    };

    const result = await pushService.sendPushToUser(userId, notification);

    if (result.success) {
      logger.info(`Notificação de teste enviada para usuário ${userId}`);
      res.json({
        message: 'Notificação de teste enviada com sucesso',
        sent: result.sent,
      });
    } else {
      res.status(400).json({
        message: 'Falha ao enviar notificação de teste',
        reason: result.reason || 'unknown',
      });
    }
  } catch (error) {
    logger.error('Erro ao enviar notificação de teste:', error);
    next(error);
  }
};

module.exports = exports;
