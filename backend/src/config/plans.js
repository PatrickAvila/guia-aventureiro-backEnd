// backend/src/config/plans.js

/**
 * Definição dos Planos de Assinatura
 * Estratégia de lançamento: 2 planos para simplificar decisão de compra
 */

const PLANS = {
  free: {
    id: 'free',
    name: 'Gratuito',
    price: {
      monthly: 0,
      yearly: 0,
      currency: 'BRL'
    },
    limits: {
      itineraries: 5, // 5 roteiros ativos (↑ de 3)
      aiGenerations: 15, // 15 criações/mês: manual + duplicação + IA (↑ de 10)
      photos: 0, // sem upload de fotos
      collaborators: 0,
      storageGB: 0,
    },
    features: {
      createItineraries: true,
      aiGeneration: true,
      publicSharing: false, // apenas perfil público, roteiros privados
      photoUpload: false,
      offlineMode: false,
      exportPDF: false,
      prioritySupport: false,
      removeAds: false,
      earlyAccess: false,
    },
    description: 'Perfeito para começar a planejar suas viagens',
    highlights: [
      'Até 5 roteiros ativos',
      '15 criações de roteiros por mês',
      'Roteiros privados',
    ],
    cta: 'Comece Grátis',
  },
  
  premium: {
    id: 'premium',
    name: 'Premium',
    price: {
      monthly: 19.90,
      yearly: 199.00, // ~16.58/mês (economia de 17%)
      currency: 'BRL'
    },
    stripePriceIds: {
      monthly: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID,
      yearly: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID,
    },
    limits: {
      itineraries: 50, // 50 roteiros ativos
      aiGenerations: 999999, // criações ilimitadas
      photos: 20, // 20 fotos por roteiro (suficiente para 95% dos casos)
      collaborators: 0,
      storageGB: 0,
    },
    features: {
      createItineraries: true,
      aiGeneration: true,
      publicSharing: true, // compartilhar roteiros individuais
      photoUpload: true,
      offlineMode: true,
      exportPDF: true,
      prioritySupport: false,
      removeAds: true,
      earlyAccess: false,
    },
    description: 'Tudo que você precisa para planejar viagens incríveis',
    highlights: [
      'Até 50 roteiros ativos',
      'Criações ilimitadas de roteiros',
      'Upload de fotos (20 por roteiro)',
      'Modo offline',
      'Exportar PDF',
      'Sem anúncios',
    ],
    cta: 'Assinar Premium',
    popular: true, // Badge de "Mais Popular"
  },
};

/**
 * Obter informações de um plano
 */
const getPlan = (planId) => {
  return PLANS[planId] || PLANS.free;
};

/**
 * Verificar se um plano existe
 */
const isValidPlan = (planId) => {
  return Object.keys(PLANS).includes(planId);
};

/**
 * Comparar planos (retorna true se plan1 é superior a plan2)
 */
const isPlanSuperior = (plan1, plan2) => {
  const hierarchy = { free: 0, premium: 1 };
  return hierarchy[plan1] > hierarchy[plan2];
};

/**
 * Calcular economia anual
 */
const getYearlySavings = (planId) => {
  const plan = PLANS[planId];
  if (!plan || plan.id === 'free') return null;
  
  const monthlyTotal = plan.price.monthly * 12;
  const yearlyTotal = plan.price.yearly;
  
  return {
    absolute: monthlyTotal - yearlyTotal,
    percentage: Math.round(((monthlyTotal - yearlyTotal) / monthlyTotal) * 100),
  };
};

module.exports = {
  PLANS,
  getPlan,
  isValidPlan,
  isPlanSuperior,
  getYearlySavings,
};
