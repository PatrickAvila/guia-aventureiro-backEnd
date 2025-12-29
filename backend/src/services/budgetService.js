// backend/src/services/budgetService.js
const calculateEstimatedBudget = (days, budgetLevel, destination) => {
  // Valores base por dia em BRL
  const baseCosts = {
    economico: {
      hospedagem: 100,
      alimentacao: 80,
      transporte: 50,
      atracoes: 70,
    },
    medio: {
      hospedagem: 250,
      alimentacao: 150,
      transporte: 100,
      atracoes: 150,
    },
    luxo: {
      hospedagem: 600,
      alimentacao: 350,
      transporte: 200,
      atracoes: 300,
    },
  };

  const dailyCost = Object.values(baseCosts[budgetLevel]).reduce((a, b) => a + b, 0);
  const totalCost = dailyCost * days.length;

  return {
    estimatedTotal: totalCost,
    dailyAverage: dailyCost,
    breakdown: baseCosts[budgetLevel],
  };
};

module.exports = {
  calculateEstimatedBudget,
};