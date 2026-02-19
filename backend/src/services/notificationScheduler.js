// backend/src/services/notificationScheduler.js
const cron = require('node-cron');
const Itinerary = require('../models/Itinerary');
const pushService = require('./pushNotificationService');
const logger = require('../utils/logger');

/**
 * Verifica e envia lembretes de roteiros próximos (3 dias antes)
 */
async function checkUpcomingTrips() {
  try {
    const today = new Date();
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    // Início e fim do dia (3 dias a partir de agora)
    const startOfDay = new Date(threeDaysFromNow.setHours(0, 0, 0, 0));
    const endOfDay = new Date(threeDaysFromNow.setHours(23, 59, 59, 999));

    // Buscar roteiros que começam em 3 dias
    const upcomingItineraries = await Itinerary.find({
      startDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      // Não enviar notificação se roteiro estiver arquivado/completo
      status: { $ne: 'completed' },
    }).populate('owner', 'name email');

    logger.info(`Encontrados ${upcomingItineraries.length} roteiros começando em 3 dias`);

    // Enviar notificação para cada dono de roteiro
    for (const itinerary of upcomingItineraries) {
      try {
        await pushService.sendItineraryReminder(
          itinerary.owner._id,
          itinerary
        );
        
        logger.info(`Lembrete enviado para ${itinerary.owner.email} - Roteiro: ${itinerary.title}`);
      } catch (error) {
        logger.error(`Erro ao enviar lembrete para roteiro ${itinerary._id}:`, error);
      }
    }
  } catch (error) {
    logger.error('Erro ao verificar roteiros próximos:', error);
  }
}

/**
 * Verifica orçamentos excedidos e envia alertas
 */
async function checkBudgetAlerts() {
  try {
    // Buscar roteiros com orçamento estimado definido
    const itineraries = await Itinerary.find({
      'budget.estimatedTotal': { $gt: 0 },
      'budget.spent': { $gt: 0 },
      status: { $ne: 'completed' },
    }).populate('owner', 'name email');

    let alertsSent = 0;

    for (const itinerary of itineraries) {
      const percentage = (itinerary.budget.spent / itinerary.budget.estimatedTotal) * 100;

      // Enviar alerta se gastou 80%, 90% ou 100%+
      const thresholds = [80, 90, 100];
      const lastAlertKey = `budgetAlert_${itinerary._id}`;
      
      for (const threshold of thresholds) {
        if (percentage >= threshold) {
          // Verificar se já enviou alerta neste threshold
          // (pode usar um campo no modelo ou cache Redis para rastrear)
          // Por enquanto, vamos enviar apenas se atingiu o threshold pela primeira vez
          
          if (percentage >= threshold && percentage < (threshold + 5)) {
            try {
              await pushService.sendBudgetAlert(
                itinerary.owner._id,
                itinerary,
                Math.round(percentage)
              );
              
              alertsSent++;
              logger.info(`Alerta de orçamento enviado: ${itinerary.title} - ${percentage.toFixed(1)}%`);
            } catch (error) {
              logger.error(`Erro ao enviar alerta de orçamento para roteiro ${itinerary._id}:`, error);
            }
            break; // Enviar apenas um alerta por roteiro
          }
        }
      }
    }

    logger.info(`Alertas de orçamento enviados: ${alertsSent}`);
  } catch (error) {
    logger.error('Erro ao verificar alertas de orçamento:', error);
  }
}

/**
 * Envia dicas de viagem um dia antes da viagem
 */
async function sendTravelTips() {
  try {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const startOfDay = new Date(tomorrow.setHours(0, 0, 0, 0));
    const endOfDay = new Date(tomorrow.setHours(23, 59, 59, 999));

    const tomorrowItineraries = await Itinerary.find({
      startDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      status: { $ne: 'completed' },
    }).populate('owner', 'name');

    for (const itinerary of tomorrowItineraries) {
      const tips = generateTravelTips(itinerary);
      
      const notification = {
        title: '✈️ Sua viagem é amanhã!',
        body: tips,
        data: {
          type: 'travel_tips',
          itineraryId: itinerary._id.toString(),
          action: 'open_itinerary',
        },
        priority: 'high',
      };

      try {
        await pushService.sendPushToUser(itinerary.owner._id, notification);
        logger.info(`Dicas de viagem enviadas para ${itinerary.owner.name}`);
      } catch (error) {
        logger.error(`Erro ao enviar dicas de viagem:`, error);
      }
    }
  } catch (error) {
    logger.error('Erro ao enviar dicas de viagem:', error);
  }
}

/**
 * Gera dicas de viagem baseadas no roteiro
 */
function generateTravelTips(itinerary) {
  const tips = [
    'Não esqueça de levar documentos e passaporte!',
    `Confira o clima em ${itinerary.destination.city} antes de fazer a mala.`,
    'Baixe os mapas offline do seu destino.',
    'Confirme suas reservas de hotel e transporte.',
  ];

  return tips[Math.floor(Math.random() * tips.length)];
}

/**
 * Inicializa todos os agendamentos
 */
function initializeScheduler() {
  logger.info('🕐 Inicializando scheduler de notificações...');

  // Executar todos os dias às 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    logger.info('⏰ Executando verificação diária de notificações (9:00 AM)');
    await checkUpcomingTrips();
    await sendTravelTips();
  });

  // Executar verificação de orçamento 2x por dia (10:00 AM e 18:00 PM)
  cron.schedule('0 10,18 * * *', async () => {
    logger.info('⏰ Executando verificação de orçamentos');
    await checkBudgetAlerts();
  });

  logger.info('✅ Scheduler de notificações iniciado:');
  logger.info('  - Lembretes de viagem: Diariamente às 9:00');
  logger.info('  - Alertas de orçamento: 2x por dia (10:00 e 18:00)');
  logger.info('  - Dicas de viagem: Diariamente às 9:00');
}

module.exports = {
  initializeScheduler,
  checkUpcomingTrips,
  checkBudgetAlerts,
  sendTravelTips,
};
