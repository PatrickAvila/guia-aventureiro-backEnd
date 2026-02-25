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

// POST /api/test/reset-user - Resetar usuário específico
router.post('/reset-user', testOnly, async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email é obrigatório' });
    }

    const User = require('../models/User');
    const Itinerary = require('../models/Itinerary');
    const Subscription = require('../models/Subscription');
    const Achievement = require('../models/Achievement');

    // Buscar usuário
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: `Usuário ${email} não encontrado` });
    }

    // Deletar roteiros
    const deletedItineraries = await Itinerary.deleteMany({ owner: user._id });
    
    // Deletar conquistas
    const deletedAchievements = await Achievement.deleteMany({ user: user._id });
    
    // Resetar subscription
    let subscription = await Subscription.findOne({ user: user._id });
    if (subscription) {
      subscription.plan = 'free';
      subscription.status = 'active';
      subscription.usage = {
        itineraries: { current: 0, limit: 5 },
        aiGenerations: { current: 0, limit: 15, lastReset: new Date() },
        photos: { current: 0, limit: 0 },
        collaborators: { current: 0, limit: 0 }
      };
      await subscription.save();
    }
    
    // Resetar stats do usuário
    user.stats = {
      level: 1,
      xp: 0,
      achievements: [],
      unlockedBadges: []
    };
    await user.save();

    console.log(`✅ Usuário ${email} resetado: ${deletedItineraries.deletedCount} roteiros, ${deletedAchievements.deletedCount} conquistas`);

    res.json({
      message: 'Usuário resetado com sucesso',
      user: {
        email: user.email,
        name: user.name,
        level: user.stats.level,
        xp: user.stats.xp
      },
      deleted: {
        itineraries: deletedItineraries.deletedCount,
        achievements: deletedAchievements.deletedCount
      },
      subscription: {
        plan: subscription?.plan || 'free',
        usage: subscription?.usage
      }
    });
  } catch (error) {
    console.error('Erro ao resetar usuário:', error);
    res.status(500).json({ 
      message: 'Erro ao resetar usuário',
      error: error.message 
    });
  }
});

// GET /api/test/debug-stats - Ver estatísticas em tempo real (com autenticação)
router.get('/debug-stats', testOnly, async (req, res) => {
  try {
    const auth = require('../middleware/auth');
    
    // Executar middleware de autenticação manualmente
    await new Promise((resolve, reject) => {
      auth(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const userId = req.userId;
    const Subscription = require('../models/Subscription');
    const Itinerary = require('../models/Itinerary');

    // Buscar subscription
    const subscription = await Subscription.findOne({ user: userId });
    
    // Contar roteiros reais no banco
    const actualItinerariesCount = await Itinerary.countDocuments({ owner: userId });
    
    // Contadores armazenados na subscription
    const storedItinerariesCount = subscription?.usage?.itineraries?.current || 0;
    const aiGenerationsCount = subscription?.usage?.aiGenerations?.current || 0;

    res.json({
      userId,
      plan: subscription?.plan || 'free',
      counters: {
        realItineraries: actualItinerariesCount,
        storedItineraries: storedItinerariesCount,
        aiGenerations: aiGenerationsCount,
      },
      inconsistency: actualItinerariesCount !== storedItinerariesCount ? {
        detected: true,
        difference: actualItinerariesCount - storedItinerariesCount,
        message: `Real: ${actualItinerariesCount}, Armazenado: ${storedItinerariesCount}`
      } : {
        detected: false,
        message: 'Contadores consistentes'
      },
      fullUsage: subscription?.usage
    });
  } catch (error) {
    console.error('Erro ao buscar debug stats:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar estatísticas de debug',
      error: error.message 
    });
  }
});

module.exports = router;
