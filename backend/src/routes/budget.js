// backend/src/routes/budget.js
const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const auth = require('../middleware/auth');

// Todas as rotas requerem autenticação

// Adicionar gasto
router.post('/:id/expenses', auth, budgetController.addExpense);

// Atualizar gasto
router.put('/:id/expenses/:expenseId', auth, budgetController.updateExpense);

// Deletar gasto
router.delete('/:id/expenses/:expenseId', auth, budgetController.deleteExpense);

// Obter resumo do orçamento
router.get('/:id/budget-summary', auth, budgetController.getBudgetSummary);

module.exports = router;
