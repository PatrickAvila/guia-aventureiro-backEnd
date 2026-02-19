// backend/src/routes/test.js
// Rotas administrativas APENAS para ambiente de teste

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Itinerary = require('../models/Itinerary');

// Middleware para garantir que só funciona em teste
const testOnly = (req, res, next) => {
  // Permitir em desenvolvimento e teste (para automação de testes)
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ 
      message: 'Esta rota não está disponível em produção' 
    });
  }
  next();
};

// POST /api/test/cleanup - Limpar dados de teste
router.post('/cleanup', testOnly, async (req, res) => {
  try {
    const { emailPatterns = [], titlePatterns = [] } = req.body;

    // Construir queries de limpeza
    const userQuery = {
      $or: emailPatterns.map(pattern => ({
        email: { $regex: new RegExp(pattern.replace(/^\/|\/[gim]*$/g, ''), 'i') }
      }))
    };

    const itineraryQuery = {
      $or: titlePatterns.map(pattern => ({
        title: { $regex: new RegExp(pattern.replace(/^\/|\/[gim]*$/g, ''), 'i') }
      }))
    };

    // Executar limpeza
    const deletedUsers = userQuery.$or.length > 0 
      ? await User.deleteMany(userQuery)
      : { deletedCount: 0 };

    const deletedItineraries = itineraryQuery.$or.length > 0
      ? await Itinerary.deleteMany(itineraryQuery)
      : { deletedCount: 0 };

    console.log(`🗑️  Limpeza de teste: ${deletedUsers.deletedCount} usuários, ${deletedItineraries.deletedCount} roteiros`);

    res.json({
      message: 'Limpeza concluída',
      deletedUsers: deletedUsers.deletedCount,
      deletedItineraries: deletedItineraries.deletedCount
    });
  } catch (error) {
    console.error('Erro na limpeza de teste:', error);
    res.status(500).json({ 
      message: 'Erro ao limpar dados de teste',
      error: error.message 
    });
  }
});

module.exports = router;
