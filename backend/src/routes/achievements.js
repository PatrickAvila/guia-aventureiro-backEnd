// backend/src/routes/achievements.js
const express = require('express');
const router = express.Router();
const achievementController = require('../controllers/achievementController');
const auth = require('../middleware/auth');

/**
 * GET /api/achievements/my-achievements
 * Retorna todas as conquistas do usuário (desbloqueadas e bloqueadas)
 */
router.get('/my-achievements', auth, achievementController.getMyAchievements);

/**
 * GET /api/achievements/stats
 * Retorna estatísticas do usuário
 */
router.get('/stats', auth, achievementController.getMyStats);

/**
 * GET /api/achievements/leaderboard
 * Retorna ranking de usuários por pontos
 */
router.get('/leaderboard', achievementController.getLeaderboard);

/**
 * POST /api/achievements/check
 * Verifica e desbloqueia novas conquistas
 */
router.post('/check', auth, achievementController.checkAchievements);

module.exports = router;
