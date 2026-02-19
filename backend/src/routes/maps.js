// backend/src/routes/maps.js
const express = require('express');
const router = express.Router();
const mapController = require('../controllers/mapController');
const { optionalAuth } = require('../middleware/auth');

// Todas as rotas requerem autenticação
router.use(optionalAuth);

/**
 * @route   GET /api/roteiros/:id/map
 * @desc    Obter dados do mapa completo do roteiro
 * @access  Private (owner ou colaborador ou público)
 */
router.get('/:id/map', mapController.getItineraryMap);

/**
 * @route   GET /api/roteiros/:id/map/day/:dayNumber
 * @desc    Obter dados do mapa de um dia específico
 * @access  Private (owner ou colaborador ou público)
 */
router.get('/:id/map/day/:dayNumber', mapController.getDayMap);

/**
 * @route   GET /api/roteiros/:id/nearby
 * @desc    Buscar pontos de interesse próximos
 * @access  Private (owner ou colaborador ou público)
 * @query   lat, lng, radius (opcional, padrão 1km)
 */
router.get('/:id/nearby', mapController.getNearbyPoints);

module.exports = router;
