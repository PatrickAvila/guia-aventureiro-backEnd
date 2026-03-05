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

    // Resetar subscription embutida no User (manter sincronia com modelo Subscription)
    user.subscription = user.subscription || {};
    user.subscription.plan = 'free';
    user.subscription.status = 'active';
    user.subscription.startDate = new Date();
    user.subscription.endDate = null;
    user.subscription.cancelAt = null;
    user.subscription.cancelledAt = null;
    user.subscription.trialEndsAt = null;
    user.subscription.currentPeriodStart = null;
    user.subscription.currentPeriodEnd = null;
    user.subscription.billingCycle = null;
    user.subscription.stripeCustomerId = null;
    user.subscription.stripeSubscriptionId = null;

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

// GET /api/test/db-status - Verificar estado do banco de dados
router.get('/db-status', testOnly, async (req, res) => {
  try {
    const User = require('../models/User');
    const Itinerary = require('../models/Itinerary');
    const Subscription = require('../models/Subscription');
    const Achievement = require('../models/Achievement');

    const totalUsers = await User.countDocuments();
    const totalItineraries = await Itinerary.countDocuments();
    const totalSubscriptions = await Subscription.countDocuments();
    const totalAchievements = await Achievement.countDocuments();

    // Buscar todos os usuários (apenas info básica)
    const users = await User.find().select('email name subscription.plan');

    // Buscar todas as subscriptions
    const subscriptions = await Subscription.find().select('user plan status usage');

    // Verificar se há dados órfãos (subscriptions sem usuário correspondente)
    const userIds = users.map(u => u._id.toString());
    const orphanSubscriptions = await Subscription.find({
      user: { $nin: users.map(u => u._id) }
    }).countDocuments();

    // Verificar se há itinerários órfãos (sem owner)
    const orphanItineraries = await Itinerary.find({
      owner: { $nin: users.map(u => u._id) }
    }).countDocuments();

    // Verificar se há achievements órfãos
    const orphanAchievements = await Achievement.find({
      user: { $nin: users.map(u => u._id) }
    }).countDocuments();

    res.json({
      summary: {
        totalUsers,
        totalItineraries,
        totalSubscriptions,
        totalAchievements
      },
      orphans: {
        subscriptions: orphanSubscriptions,
        itineraries: orphanItineraries,
        achievements: orphanAchievements,
        hasOrphans: orphanSubscriptions > 0 || orphanItineraries > 0 || orphanAchievements > 0
      },
      users: users.map(u => ({
        email: u.email,
        name: u.name,
        plan: u.subscription?.plan || 'N/A'
      })),
      subscriptions: subscriptions.map(s => ({
        userId: s.user,
        plan: s.plan,
        status: s.status,
        itinerariesUsed: s.usage?.itineraries?.current || 0,
        itinerariesLimit: s.usage?.itineraries?.limit || 0
      }))
    });
  } catch (error) {
    console.error('Erro ao verificar status do banco:', error);
    res.status(500).json({ 
      message: 'Erro ao verificar status do banco',
      error: error.message 
    });
  }
});

module.exports = router;
