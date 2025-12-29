// backend/src/controllers/achievementController.js
const Achievement = require('../models/Achievement');
const Itinerary = require('../models/Itinerary');
const Rating = require('../models/Rating');
const logger = require('../utils/logger');

/**
 * Calcula e desbloqueia conquistas para um usuário
 */
const checkAndUnlockAchievements = async (userId) => {
  try {
    const itineraries = await Itinerary.find({ owner: userId });
    const completedItineraries = itineraries.filter(i => i.status === 'concluido');
    const ratings = await Rating.find({ user: userId });

    const newAchievements = [];

    // Conquistas de criação de roteiros
    if (itineraries.length >= 1) {
      await unlockAchievement(userId, 'first_itinerary', newAchievements);
    }
    if (itineraries.length >= 5) {
      await unlockAchievement(userId, 'itinerary_master', newAchievements);
    }
    if (itineraries.length >= 10) {
      await unlockAchievement(userId, 'world_traveler', newAchievements);
    }

    // Conquistas de viagens concluídas
    if (completedItineraries.length >= 1) {
      await unlockAchievement(userId, 'first_trip_complete', newAchievements);
    }
    if (completedItineraries.length >= 5) {
      await unlockAchievement(userId, 'seasoned_traveler', newAchievements);
    }
    if (completedItineraries.length >= 10) {
      await unlockAchievement(userId, 'globe_trotter', newAchievements);
    }

    // Conquistas de orçamento
    const withinBudget = completedItineraries.filter(i => {
      if (!i.budget) return false;
      const spent = i.budget.spent || 0;
      return spent <= (i.budget.estimatedTotal || 0);
    });
    if (withinBudget.length >= 1) {
      await unlockAchievement(userId, 'budget_conscious', newAchievements);
    }
    if (withinBudget.length >= 3) {
      await unlockAchievement(userId, 'budget_keeper', newAchievements);
    }

    // Conquista de luxo
    const luxuryTrips = completedItineraries.filter(i => i.budget && i.budget.level === 'luxo');
    if (luxuryTrips.length >= 1) {
      await unlockAchievement(userId, 'luxury_traveler', newAchievements);
    }

    // Conquistas de compartilhamento
    const sharedItineraries = itineraries.filter(i => i.publicLink);
    if (sharedItineraries.length >= 5) {
      await unlockAchievement(userId, 'social_butterfly', newAchievements);
    }

    // Conquistas de colaboração
    const withCollaborators = itineraries.filter(i => i.collaborators && i.collaborators.length > 0);
    if (withCollaborators.length >= 1) {
      await unlockAchievement(userId, 'collaborator', newAchievements);
    }
    if (withCollaborators.length >= 5) {
      await unlockAchievement(userId, 'team_player', newAchievements);
    }

    // Conquista de fotos
    let totalPhotos = 0;
    itineraries.forEach(i => {
      if (i.photos && Array.isArray(i.photos)) totalPhotos += i.photos.length;
    });
    if (totalPhotos >= 50) {
      await unlockAchievement(userId, 'photographer', newAchievements);
    }

    // Conquista de avaliações
    if (ratings.length >= 5) {
      await unlockAchievement(userId, 'reviewer', newAchievements);
    }

    // Conquistas de duração
    const weekendTrips = completedItineraries.filter(i => i.duration && i.duration >= 2 && i.duration <= 3);
    if (weekendTrips.length >= 5) {
      await unlockAchievement(userId, 'weekend_warrior', newAchievements);
    }

    const longTrips = completedItineraries.filter(i => i.duration && i.duration >= 14);
    if (longTrips.length >= 1) {
      await unlockAchievement(userId, 'long_hauler', newAchievements);
    }

    // Conquista de planejamento antecipado
    const earlyPlanned = itineraries.filter(i => {
      if (!i.startDate || !i.createdAt) return false;
      const startDate = new Date(i.startDate);
      const createdDate = new Date(i.createdAt);
      const diffDays = (startDate - createdDate) / (1000 * 60 * 60 * 24);
      return diffDays >= 90;
    });
    if (earlyPlanned.length >= 1) {
      await unlockAchievement(userId, 'early_bird', newAchievements);
    }

    // Conquista de planejamento de última hora
    const lastMinute = itineraries.filter(i => {
      if (!i.startDate || !i.createdAt) return false;
      const startDate = new Date(i.startDate);
      const createdDate = new Date(i.createdAt);
      const diffDays = (startDate - createdDate) / (1000 * 60 * 60 * 24);
      return diffDays <= 7;
    });
    if (lastMinute.length >= 1) {
      await unlockAchievement(userId, 'spontaneous', newAchievements);
    }

    return newAchievements;
  } catch (error) {
    logger.error('Erro ao verificar conquistas:', error);
    throw error;
  }
};

/**
 * Helper para desbloquear conquista se ainda não tiver sido desbloqueada
 */
const unlockAchievement = async (userId, type, newAchievements) => {
  const existing = await Achievement.findOne({ user: userId, type });
  if (!existing) {
    const achievementData = Achievement.ACHIEVEMENTS[type];
    const achievement = await Achievement.create({
      user: userId,
      type,
      ...achievementData,
    });
    newAchievements.push(achievement);
    logger.log(`🏆 Conquista desbloqueada: ${type} para usuário ${userId}`);
  }
};

/**
 * GET /api/achievements/my-achievements
 * Retorna todas as conquistas do usuário logado
 */
exports.getMyAchievements = async (req, res, next) => {
  try {
    const userId = req.userId;

    // Buscar conquistas desbloqueadas
    const unlockedAchievements = await Achievement.find({ user: userId })
      .sort({ unlockedAt: -1 });

    // Calcular total de pontos
    const totalPoints = unlockedAchievements.reduce((sum, a) => sum + a.points, 0);

    // Lista de todas as conquistas possíveis
    const allAchievements = Object.keys(Achievement.ACHIEVEMENTS).map(type => {
      const unlocked = unlockedAchievements.find(a => a.type === type);
      return {
        type,
        ...Achievement.ACHIEVEMENTS[type],
        unlocked: !!unlocked,
        unlockedAt: unlocked?.unlockedAt,
      };
    });

    res.json({
      totalPoints,
      unlockedCount: unlockedAchievements.length,
      totalCount: allAchievements.length,
      achievements: allAchievements,
    });
  } catch (error) {
    logger.error('Erro ao buscar conquistas:', error);
    next(error);
  }
};

/**
 * GET /api/achievements/stats
 * Retorna estatísticas do usuário
 */
exports.getMyStats = async (req, res, next) => {
  try {
    const userId = req.userId;

    const itineraries = await Itinerary.find({ owner: userId });
    const completedItineraries = itineraries.filter(i => i.status === 'concluido');
    const ratings = await Rating.find({ user: userId });
    const achievements = await Achievement.find({ user: userId });

    // Calcular estatísticas
    const stats = {
      itineraries: {
        total: itineraries.length,
        completed: completedItineraries.length,
        inProgress: itineraries.filter(i => i.status === 'em_andamento').length,
        planned: itineraries.filter(i => ['rascunho', 'planejando', 'confirmado'].includes(i.status)).length,
      },
      destinations: {
        countries: [...new Set(itineraries.filter(i => i.destination && i.destination.country).map(i => i.destination.country))].length,
        cities: [...new Set(itineraries.filter(i => i.destination && i.destination.city && i.destination.country).map(i => `${i.destination.city}, ${i.destination.country}`))].length,
      },
      days: {
        totalTraveled: completedItineraries.reduce((sum, i) => sum + (i.duration || 0), 0),
        averageTripLength: completedItineraries.length > 0
          ? Math.round(completedItineraries.reduce((sum, i) => sum + (i.duration || 0), 0) / completedItineraries.length)
          : 0,
      },
      budget: {
        totalSpent: completedItineraries.reduce((sum, i) => sum + ((i.budget && i.budget.spent) || 0), 0),
        averagePerTrip: completedItineraries.length > 0
          ? Math.round(completedItineraries.reduce((sum, i) => sum + ((i.budget && i.budget.spent) || 0), 0) / completedItineraries.length)
          : 0,
      },
      social: {
        sharedItineraries: itineraries.filter(i => i.publicLink).length,
        collaborativeItineraries: itineraries.filter(i => i.collaborators && i.collaborators.length > 0).length,
        totalCollaborators: itineraries.reduce((sum, i) => sum + ((i.collaborators && i.collaborators.length) || 0), 0),
      },
      achievements: {
        total: achievements.length,
        points: achievements.reduce((sum, a) => sum + a.points, 0),
      },
      ratings: {
        total: ratings.length,
        averageScore: ratings.length > 0
          ? (ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length).toFixed(1)
          : 0,
      },
    };

    res.json(stats);
  } catch (error) {
    logger.error('Erro ao buscar estatísticas:', error);
    next(error);
  }
};

/**
 * GET /api/achievements/leaderboard
 * Retorna ranking de usuários por pontos
 */
exports.getLeaderboard = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);

    // Agregar pontos por usuário
    const leaderboard = await Achievement.aggregate([
      {
        $group: {
          _id: '$user',
          totalPoints: { $sum: '$points' },
          achievementsCount: { $sum: 1 },
        },
      },
      { $sort: { totalPoints: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          totalPoints: 1,
          achievementsCount: 1,
          'user.name': 1,
          'user.avatar': 1,
          'user.publicProfile': 1,
        },
      },
    ]);

    // Adicionar posição no ranking
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      position: index + 1,
      ...entry,
    }));

    res.json(rankedLeaderboard);
  } catch (error) {
    logger.error('Erro ao buscar leaderboard:', error);
    next(error);
  }
};

/**
 * POST /api/achievements/check
 * Verifica e desbloqueia novas conquistas
 */
exports.checkAchievements = async (req, res, next) => {
  try {
    const userId = req.userId;
    const newAchievements = await checkAndUnlockAchievements(userId);

    res.json({
      message: newAchievements.length > 0
        ? `${newAchievements.length} nova(s) conquista(s) desbloqueada(s)!`
        : 'Nenhuma nova conquista',
      newAchievements,
    });
  } catch (error) {
    logger.error('Erro ao verificar conquistas:', error);
    next(error);
  }
};

module.exports.checkAndUnlockAchievements = checkAndUnlockAchievements;
