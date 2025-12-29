// backend/src/controllers/budgetController.js
const Itinerary = require('../models/Itinerary');
const logger = require('../utils/logger');

// Adicionar gasto
exports.addExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date, category, description, amount, currency, receipt } = req.body;
    const userId = req.userId;

    const itinerary = await Itinerary.findById(id);

    if (!itinerary) {
      return res.status(404).json({ message: 'Roteiro não encontrado' });
    }

    // Verificar se é dono ou colaborador com permissão de edição
    const isOwner = itinerary.owner.toString() === userId.toString();
    const canEdit = itinerary.collaborators && itinerary.collaborators.some(
      collab => collab.user.toString() === userId.toString() && collab.permission === 'edit'
    );

    if (!isOwner && !canEdit) {
      return res.status(403).json({ message: 'Você não tem permissão para adicionar gastos' });
    }

    // Adicionar gasto
    itinerary.expenses.push({
      date: date || new Date(),
      category,
      description,
      amount,
      currency: currency || itinerary.budget.currency,
      receipt,
    });

    // Recalcular total gasto
    const totalSpent = (itinerary.expenses || []).reduce((sum, expense) => {
      // TODO: Converter moedas diferentes para a moeda do orçamento
      return sum + expense.amount;
    }, 0);

    itinerary.budget.spent = totalSpent;
    itinerary.budget.lastUpdated = new Date();
    itinerary.lastEditedBy = userId;
    itinerary.lastEditedAt = new Date();

    await itinerary.save();

    logger.log(`Gasto adicionado ao roteiro ${id}: ${amount} ${currency || itinerary.budget.currency}`);

    res.status(201).json({
      message: 'Gasto adicionado com sucesso',
      expense: itinerary.expenses && itinerary.expenses.length > 0 
        ? itinerary.expenses[itinerary.expenses.length - 1] 
        : null,
      budgetSummary: {
        estimated: itinerary.budget.estimatedTotal,
        spent: itinerary.budget.spent,
        remaining: itinerary.budget.estimatedTotal - itinerary.budget.spent,
        currency: itinerary.budget.currency,
      },
    });
  } catch (error) {
    logger.error('Erro ao adicionar gasto:', error);
    next(error);
  }
};

// Atualizar gasto
exports.updateExpense = async (req, res, next) => {
  try {
    const { id, expenseId } = req.params;
    const { date, category, description, amount, currency, receipt } = req.body;
    const userId = req.userId;

    const itinerary = await Itinerary.findById(id);

    if (!itinerary) {
      return res.status(404).json({ message: 'Roteiro não encontrado' });
    }

    // Verificar permissão
    const isOwner = itinerary.owner.toString() === userId.toString();
    const canEdit = itinerary.collaborators && itinerary.collaborators.some(
      collab => collab.user.toString() === userId.toString() && collab.permission === 'edit'
    );

    if (!isOwner && !canEdit) {
      return res.status(403).json({ message: 'Você não tem permissão para editar gastos' });
    }

    // Encontrar e atualizar gasto
    const expense = itinerary.expenses.id(expenseId);

    if (!expense) {
      return res.status(404).json({ message: 'Gasto não encontrado' });
    }

    if (date) expense.date = date;
    if (category) expense.category = category;
    if (description) expense.description = description;
    if (amount !== undefined) expense.amount = amount;
    if (currency) expense.currency = currency;
    if (receipt !== undefined) expense.receipt = receipt;

    // Recalcular total
    const totalSpent = (itinerary.expenses || []).reduce((sum, exp) => sum + exp.amount, 0);
    itinerary.budget.spent = totalSpent;
    itinerary.budget.lastUpdated = new Date();
    itinerary.lastEditedBy = userId;
    itinerary.lastEditedAt = new Date();

    await itinerary.save();

    logger.log(`Gasto atualizado no roteiro ${id}`);

    res.json({
      message: 'Gasto atualizado com sucesso',
      expense,
      budgetSummary: {
        estimated: itinerary.budget.estimatedTotal,
        spent: itinerary.budget.spent,
        remaining: itinerary.budget.estimatedTotal - itinerary.budget.spent,
        currency: itinerary.budget.currency,
      },
    });
  } catch (error) {
    logger.error('Erro ao atualizar gasto:', error);
    next(error);
  }
};

// Deletar gasto
exports.deleteExpense = async (req, res, next) => {
  try {
    const { id, expenseId } = req.params;
    const userId = req.userId;

    const itinerary = await Itinerary.findById(id);

    if (!itinerary) {
      return res.status(404).json({ message: 'Roteiro não encontrado' });
    }

    // Verificar permissão
    const isOwner = itinerary.owner.toString() === userId.toString();
    const canEdit = itinerary.collaborators && itinerary.collaborators.some(
      collab => collab.user.toString() === userId.toString() && collab.permission === 'edit'
    );

    if (!isOwner && !canEdit) {
      return res.status(403).json({ message: 'Você não tem permissão para deletar gastos' });
    }

    // Remover gasto
    const expense = itinerary.expenses.id(expenseId);
    if (!expense) {
      return res.status(404).json({ message: 'Gasto não encontrado' });
    }

    itinerary.expenses.pull(expenseId);

    // Recalcular total
    const totalSpent = (itinerary.expenses || []).reduce((sum, exp) => sum + exp.amount, 0);
    itinerary.budget.spent = totalSpent;
    itinerary.budget.lastUpdated = new Date();
    itinerary.lastEditedBy = userId;
    itinerary.lastEditedAt = new Date();

    await itinerary.save();

    logger.log(`Gasto deletado do roteiro ${id}`);

    res.json({
      message: 'Gasto deletado com sucesso',
      budgetSummary: {
        estimated: itinerary.budget.estimatedTotal,
        spent: itinerary.budget.spent,
        remaining: itinerary.budget.estimatedTotal - itinerary.budget.spent,
        currency: itinerary.budget.currency,
      },
    });
  } catch (error) {
    logger.error('Erro ao deletar gasto:', error);
    next(error);
  }
};

// Obter resumo do orçamento
exports.getBudgetSummary = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const itinerary = await Itinerary.findById(id);

    if (!itinerary) {
      return res.status(404).json({ message: 'Roteiro não encontrado' });
    }

    // Verificar se tem acesso
    const isOwner = itinerary.owner.toString() === userId.toString();
    const isCollaborator = itinerary.collaborators && itinerary.collaborators.some(
      collab => collab.user.toString() === userId.toString()
    );

    if (!isOwner && !isCollaborator && !itinerary.isPublic) {
      return res.status(403).json({ message: 'Você não tem permissão para ver este roteiro' });
    }

    // Calcular estatísticas por categoria
    const byCategory = {};
    if (itinerary.expenses && Array.isArray(itinerary.expenses)) {
      itinerary.expenses.forEach(expense => {
        if (!byCategory[expense.category]) {
          byCategory[expense.category] = {
            total: 0,
            count: 0,
            items: [],
          };
        }
      byCategory[expense.category].total += expense.amount;
      byCategory[expense.category].count++;
      byCategory[expense.category].items.push({
        id: expense._id,
        description: expense.description,
        amount: expense.amount,
        date: expense.date,
      });
    });
    }

    const summary = {
      budget: {
        estimated: itinerary.budget.estimatedTotal,
        spent: itinerary.budget.spent,
        remaining: itinerary.budget.estimatedTotal - itinerary.budget.spent,
        percentage: itinerary.budget.estimatedTotal > 0 
          ? ((itinerary.budget.spent / itinerary.budget.estimatedTotal) * 100).toFixed(1)
          : 0,
        currency: itinerary.budget.currency,
        level: itinerary.budget.level,
        lastUpdated: itinerary.budget.lastUpdated,
      },
      expenses: {
        total: (itinerary.expenses && itinerary.expenses.length) || 0,
        byCategory,
        recent: (itinerary.expenses || [])
          .sort((a, b) => b.date - a.date)
          .slice(0, 10)
          .map(exp => ({
            id: exp._id,
            date: exp.date,
            category: exp.category,
            description: exp.description,
            amount: exp.amount,
            currency: exp.currency,
            receipt: exp.receipt,
          })),
      },
      dailyAverage: itinerary.duration > 0 
        ? (itinerary.budget.spent / itinerary.duration).toFixed(2)
        : 0,
    };

    res.json(summary);
  } catch (error) {
    logger.error('Erro ao obter resumo do orçamento:', error);
    next(error);
  }
};
