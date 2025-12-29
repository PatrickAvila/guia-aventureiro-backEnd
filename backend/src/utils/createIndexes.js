// backend/src/utils/createIndexes.js
const mongoose = require('mongoose');
const User = require('../models/User');
const Itinerary = require('../models/Itinerary');
const Rating = require('../models/Rating');
const Achievement = require('../models/Achievement');
const logger = require('./logger');

/**
 * Cria índices otimizados para melhorar performance de queries
 * Executar uma vez após deploy inicial ou quando adicionar novos índices
 */
const createIndexes = async () => {
  try {
    logger.log('🔧 Criando índices no MongoDB...');

    // ========================================
    // USER INDEXES
    // ========================================
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ 'stats.level': -1 }); // Leaderboard
    await User.collection.createIndex({ 'stats.xp': -1 }); // Ranking
    await User.collection.createIndex({ createdAt: -1 }); // Usuários recentes
    logger.log('✅ Índices de User criados');

    // ========================================
    // ITINERARY INDEXES
    // ========================================
    await Itinerary.collection.createIndex({ owner: 1, createdAt: -1 }); // Roteiros do usuário
    await Itinerary.collection.createIndex({ isPublic: 1, createdAt: -1 }); // Feed público
    await Itinerary.collection.createIndex({ 'destination.city': 1 }); // Busca por cidade
    await Itinerary.collection.createIndex({ 'destination.country': 1 }); // Busca por país
    await Itinerary.collection.createIndex({ status: 1 }); // Filtro por status
    await Itinerary.collection.createIndex({ 
      isPublic: 1, 
      'stats.likes': -1 
    }); // Roteiros em alta
    await Itinerary.collection.createIndex({ 
      isPublic: 1, 
      'stats.rating': -1 
    }); // Melhores avaliados
    await Itinerary.collection.createIndex({ 
      'destination.city': 'text', 
      'destination.country': 'text',
      title: 'text'
    }); // Busca por texto
    logger.log('✅ Índices de Itinerary criados');

    // ========================================
    // RATING INDEXES
    // ========================================
    await Rating.collection.createIndex({ itinerary: 1, createdAt: -1 }); // Ratings de um roteiro
    await Rating.collection.createIndex({ user: 1, createdAt: -1 }); // Ratings do usuário
    await Rating.collection.createIndex({ rating: -1 }); // Melhores ratings
    await Rating.collection.createIndex({ likes: -1 }); // Ratings mais curtidos
    logger.log('✅ Índices de Rating criados');

    // ========================================
    // ACHIEVEMENT INDEXES
    // ========================================
    await Achievement.collection.createIndex({ user: 1, type: 1 }, { unique: true }); // Previne duplicatas
    await Achievement.collection.createIndex({ user: 1, unlockedAt: -1 }); // Conquistas do usuário
    await Achievement.collection.createIndex({ type: 1 }); // Por tipo de conquista
    logger.log('✅ Índices de Achievement criados');

    logger.log('🎉 Todos os índices criados com sucesso!');
    
    // Listar índices criados
    const userIndexes = await User.collection.getIndexes();
    const itineraryIndexes = await Itinerary.collection.getIndexes();
    const ratingIndexes = await Rating.collection.getIndexes();
    const achievementIndexes = await Achievement.collection.getIndexes();

    logger.log('\n📊 Resumo de índices:');
    logger.log(`   User: ${Object.keys(userIndexes).length} índices`);
    logger.log(`   Itinerary: ${Object.keys(itineraryIndexes).length} índices`);
    logger.log(`   Rating: ${Object.keys(ratingIndexes).length} índices`);
    logger.log(`   Achievement: ${Object.keys(achievementIndexes).length} índices`);

  } catch (error) {
    logger.error('❌ Erro ao criar índices:', error);
    throw error;
  }
};

/**
 * Executar este script standalone
 * node src/utils/createIndexes.js
 */
if (require.main === module) {
  require('dotenv').config();
  const connectDB = require('../config/database');
  
  connectDB()
    .then(() => createIndexes())
    .then(() => {
      logger.log('✅ Script finalizado');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('❌ Erro:', error);
      process.exit(1);
    });
}

module.exports = createIndexes;
