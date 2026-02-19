// backend/src/services/pushNotificationService.js
const { Expo } = require('expo-server-sdk');
const DeviceToken = require('../models/DeviceToken');
const logger = require('../utils/logger');

// Criar instância do Expo SDK
const expo = new Expo();

/**
 * Envia notificações push para dispositivos específicos
 * @param {Array<String>} tokens - Array de Expo push tokens
 * @param {Object} notification - Dados da notificação
 * @returns {Promise<Object>} Resultado do envio
 */
async function sendPushNotifications(tokens, notification) {
  // Validar tokens
  const validTokens = tokens.filter(token => Expo.isExpoPushToken(token));
  
  if (validTokens.length === 0) {
    logger.warn('Nenhum token válido para enviar push notification');
    return { success: false, sent: 0, errors: [] };
  }

  // Criar mensagens
  const messages = validTokens.map(token => ({
    to: token,
    sound: notification.sound || 'default',
    title: notification.title,
    body: notification.body,
    data: notification.data || {},
    badge: notification.badge,
    priority: notification.priority || 'default', // default, normal, high
    ttl: notification.ttl || 3600, // 1 hour
  }));

  // Dividir em chunks (Expo recomenda max 100 por request)
  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];
  const errors = [];

  // Enviar cada chunk
  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
      
      // Log de erros
      ticketChunk.forEach((ticket, index) => {
        if (ticket.status === 'error') {
          const token = chunk[index].to;
          logger.error(`Erro ao enviar push para ${token}:`, ticket.message);
          errors.push({ token, message: ticket.message });
          
          // Se token inválido, desativar
          if (ticket.details && ticket.details.error === 'DeviceNotRegistered') {
            DeviceToken.updateOne({ token }, { active: false }).catch(err =>
              logger.error('Erro ao desativar token:', err)
            );
          }
        }
      });
    } catch (error) {
      logger.error('Erro ao enviar chunk de push notifications:', error);
      errors.push({ chunk: chunk.length, error: error.message });
    }
  }

  logger.info(`Push notifications enviadas: ${tickets.length} tickets, ${errors.length} erros`);

  return {
    success: tickets.length > 0,
    sent: tickets.length,
    errors,
    tickets,
  };
}

/**
 * Envia notificação push para um usuário específico
 * @param {String} userId - ID do usuário
 * @param {Object} notification - Dados da notificação
 * @returns {Promise<Object>} Resultado do envio
 */
async function sendPushToUser(userId, notification) {
  try {
    // Buscar tokens ativos do usuário
    const deviceTokens = await DeviceToken.getActiveTokens(userId);
    
    if (deviceTokens.length === 0) {
      logger.info(`Usuário ${userId} não tem tokens ativos para push notification`);
      return { success: false, sent: 0, reason: 'no_tokens' };
    }

    const tokens = deviceTokens.map(dt => dt.token);
    
    // Enviar notificações
    const result = await sendPushNotifications(tokens, notification);
    
    return result;
  } catch (error) {
    logger.error(`Erro ao enviar push para usuário ${userId}:`, error);
    throw error;
  }
}

/**
 * Envia notificação push para múltiplos usuários
 * @param {Array<String>} userIds - Array de IDs de usuários
 * @param {Object} notification - Dados da notificação
 * @returns {Promise<Object>} Resultado do envio
 */
async function sendPushToUsers(userIds, notification) {
  try {
    // Buscar todos os tokens ativos dos usuários
    const deviceTokens = await DeviceToken.find({
      user: { $in: userIds },
      active: true,
    });

    if (deviceTokens.length === 0) {
      logger.info('Nenhum token ativo encontrado para os usuários');
      return { success: false, sent: 0, reason: 'no_tokens' };
    }

    const tokens = deviceTokens.map(dt => dt.token);
    
    // Enviar notificações
    const result = await sendPushNotifications(tokens, notification);
    
    return result;
  } catch (error) {
    logger.error('Erro ao enviar push para múltiplos usuários:', error);
    throw error;
  }
}

/**
 * Envia lembrete de roteiro próximo (3 dias antes)
 * @param {String} userId - ID do usuário
 * @param {Object} itinerary - Dados do roteiro
 */
async function sendItineraryReminder(userId, itinerary) {
  const notification = {
    title: '✈️ Sua viagem está chegando!',
    body: `${itinerary.title} começa em 3 dias. Já preparou tudo?`,
    data: {
      type: 'itinerary_reminder',
      itineraryId: itinerary._id.toString(),
      action: 'open_itinerary',
    },
    badge: 1,
    priority: 'high',
  };

  return await sendPushToUser(userId, notification);
}

/**
 * Envia lembrete de checklist
 * @param {String} userId - ID do usuário
 * @param {Object} itinerary - Dados do roteiro
 * @param {Array} pendingItems - Itens pendentes do checklist
 */
async function sendChecklistReminder(userId, itinerary, pendingItems) {
  const notification = {
    title: '📋 Checklist de viagem',
    body: `Você tem ${pendingItems.length} itens pendentes para ${itinerary.title}`,
    data: {
      type: 'checklist_reminder',
      itineraryId: itinerary._id.toString(),
      action: 'open_checklist',
    },
    badge: pendingItems.length,
  };

  return await sendPushToUser(userId, notification);
}

/**
 * Envia notificação de novo colaborador adicionado
 * @param {String} userId - ID do usuário que foi adicionado
 * @param {Object} itinerary - Dados do roteiro
 * @param {Object} inviter - Usuário que convidou
 */
async function sendCollaboratorInvite(userId, itinerary, inviter) {
  const notification = {
    title: '👥 Convite para colaborar',
    body: `${inviter.name} te convidou para o roteiro "${itinerary.title}"`,
    data: {
      type: 'collaborator_invite',
      itineraryId: itinerary._id.toString(),
      action: 'open_itinerary',
    },
    priority: 'high',
  };

  return await sendPushToUser(userId, notification);
}

/**
 * Envia notificação de nova mensagem no chat
 * @param {String} userId - ID do usuário receptor
 * @param {Object} message - Dados da mensagem
 * @param {Object} sender - Usuário que enviou
 */
async function sendNewMessageNotification(userId, message, sender) {
  const notification = {
    title: `💬 ${sender.name}`,
    body: message.content,
    data: {
      type: 'new_message',
      itineraryId: message.itinerary.toString(),
      messageId: message._id.toString(),
      action: 'open_chat',
    },
  };

  return await sendPushToUser(userId, notification);
}

/**
 * Envia alerta de orçamento excedido
 * @param {String} userId - ID do usuário
 * @param {Object} itinerary - Dados do roteiro
 * @param {Number} percentage - Percentual gasto
 */
async function sendBudgetAlert(userId, itinerary, percentage) {
  const notification = {
    title: '💰 Alerta de Orçamento',
    body: `Você já gastou ${percentage}% do orçamento de ${itinerary.title}`,
    data: {
      type: 'budget_alert',
      itineraryId: itinerary._id.toString(),
      action: 'open_budget',
    },
    priority: 'high',
  };

  return await sendPushToUser(userId, notification);
}

module.exports = {
  sendPushNotifications,
  sendPushToUser,
  sendPushToUsers,
  sendItineraryReminder,
  sendChecklistReminder,
  sendCollaboratorInvite,
  sendNewMessageNotification,
  sendBudgetAlert,
};
