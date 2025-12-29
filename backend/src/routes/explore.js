// backend/src/routes/explore.js
const express = require('express');
const router = express.Router();
const exploreController = require('../controllers/exploreController');
const auth = require('../middleware/auth');
const { validatePagination, validateItineraryId } = require('../middleware/validators');

/**
 * GET /api/explore/itineraries
 * Feed de roteiros públicos de outros usuários
 * Só mostra roteiros se o perfil do dono for público
 */
router.get('/itineraries', validatePagination, exploreController.getPublicItineraries);

/**
 * GET /api/explore/featured
 * Roteiros em destaque
 */
router.get('/featured', exploreController.getFeaturedItineraries);

/**
 * GET /api/explore/popular-destinations
 * Destinos mais populares
 */
router.get('/popular-destinations', exploreController.getPopularDestinations);

/**
 * POST /api/explore/like/:id
 * Curtir/descurtir roteiro público (requer auth)
 */
router.post('/like/:id', auth, validateItineraryId, exploreController.toggleLike);

/**
 * POST /api/explore/save/:id
 * Salvar/dessalvar roteiro público (requer auth)
 */
router.post('/save/:id', auth, validateItineraryId, exploreController.toggleSave);

/**
 * GET /api/explore/saved
 * Roteiros salvos pelo usuário (requer auth)
 */
router.get('/saved', auth, validatePagination, exploreController.getSavedItineraries);

module.exports = router;
