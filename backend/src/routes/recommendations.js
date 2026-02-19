// backend/src/routes/recommendations.js
const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');
const recommendationController = require('../controllers/recommendationController');

/**
 * GET /api/recommendations/destinations
 * Recomendações de destinos personalizadas
 */
router.get('/destinations', optionalAuth, recommendationController.recommendDestinations);

/**
 * GET /api/recommendations/itineraries
 * Recomendações de roteiros personalizados
 */
router.get('/itineraries', optionalAuth, recommendationController.recommendItineraries);

/**
 * GET /api/recommendations/similar/:id
 * Roteiros similares a um específico
 */
router.get('/similar/:id', recommendationController.getSimilarItineraries);

/**
 * GET /api/recommendations/for-you
 * Recomendações personalizadas (mix destinos + roteiros)
 */
router.get('/for-you', optionalAuth, recommendationController.getPersonalizedRecommendations);

/**
 * GET /api/recommendations/trending
 * Roteiros em alta (últimos 7 dias)
 */
router.get('/trending', recommendationController.getTrendingItineraries);

module.exports = router;
