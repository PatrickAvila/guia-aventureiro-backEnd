// backend/src/routes/itineraries.js
const express = require('express');
const router = express.Router();
const itineraryController = require('../controllers/itineraryController');
const ratingController = require('../controllers/ratingController');
const shareController = require('../controllers/shareController');
const budgetController = require('../controllers/budgetController');
const auth = require('../middleware/auth');
const { aiGenerationLimiter } = require('../middleware/rateLimiter');
const { 
  validateCreateItinerary, 
  validateUpdateItinerary, 
  validateItineraryId,
  validateAddCollaborator,
  validatePagination,
  validateAddExpense,
  validateUpdateExpense,
  validateExpenseId
} = require('../middleware/validators');

// Todas protegidas
router.use(auth);

router.get('/', validatePagination, itineraryController.getUserItineraries);
router.get('/:id', validateItineraryId, itineraryController.getItineraryById);
router.post('/', validateCreateItinerary, itineraryController.createItinerary);
router.post('/generate', aiGenerationLimiter, itineraryController.generateItineraryWithAI);
router.put('/:id', validateUpdateItinerary, itineraryController.updateItinerary);
router.delete('/:id', validateItineraryId, itineraryController.deleteItinerary);
router.post('/:id/duplicate', validateItineraryId, itineraryController.duplicateItinerary);

// Colaboradores
router.post('/:id/collaborators', validateAddCollaborator, itineraryController.addCollaborator);
router.delete('/:id/collaborators/:collaboratorId', validateItineraryId, itineraryController.removeCollaborator);

// Orçamento e Gastos
router.post('/:id/expenses', validateAddExpense, budgetController.addExpense);
router.put('/:id/expenses/:expenseId', validateUpdateExpense, budgetController.updateExpense);
router.delete('/:id/expenses/:expenseId', validateExpenseId, budgetController.deleteExpense);
router.get('/:id/budget-summary', validateItineraryId, budgetController.getBudgetSummary);

// Compartilhamento
router.post('/:id/share', shareController.generateShareLink);
router.delete('/:id/share', shareController.revokeShareLink);

module.exports = router;