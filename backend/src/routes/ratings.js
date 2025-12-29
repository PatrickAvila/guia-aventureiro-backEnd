// backend/src/routes/ratings.js
const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const auth = require('../middleware/auth');
const { validateCreateRating, validateRatingId } = require('../middleware/validators');

// Rotas de avaliações

// Criar ou atualizar avaliação de um roteiro
router.post('/:itineraryId', auth, validateCreateRating, ratingController.createOrUpdateRating);

// Obter todas as avaliações de um roteiro
router.get('/:itineraryId/all', ratingController.getRatingsByItinerary);

// Obter avaliação do usuário para um roteiro específico
router.get('/:itineraryId/my-rating', auth, ratingController.getUserRating);

// Obter todas as avaliações do usuário logado
router.get('/my-ratings', auth, ratingController.getMyRatings);

// Deletar avaliação
router.delete('/:ratingId', auth, validateRatingId, ratingController.deleteRating);

// Curtir/descurtir avaliação
router.post('/:ratingId/like', auth, validateRatingId, ratingController.toggleLike);

module.exports = router;
