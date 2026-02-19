// backend/src/config/plans.js

/**
 * Definição dos Planos de Assinatura
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
      itineraries: 3,
      aiGenerations: 3, // por mês (igualado com roteiros)
      photos: 0, // sem upload de fotos
      collaborators: 0,
      storageGB: 0,
    },
    features: {
      createItineraries: true,
      aiGeneration: true, // limitado a 3/mês
      publicSharing: false, // apenas perfil público, roteiros privados
      photoUpload: false,
      offlineMode: false,
      exportPDF: false,
      prioritySupport: false,
      removeAds: false, // terá anúncios quando lançar
      earlyAccess: false,
    },
    description: 'Perfeito para começar a planejar suas viagens',
    highlights: [
      'Até 3 roteiros por mês',
      'Geração com IA',
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
      itineraries: 50,
      aiGenerations: 50, // igualado com roteiros
      photos: 20, // por roteiro
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
    description: 'Ideal para viajantes frequentes',
    highlights: [
      'Até 50 roteiros por mês',
      'Compartilhar roteiros',
      'Upload de fotos (20 por roteiro)',
      'Modo offline',
      'Exportar PDF',
      'Sem anúncios',
    ],
    cta: 'Assinar Premium',
    popular: true, // Badge de "Mais Popular"
  },
  
  pro: {
    id: 'pro',
    name: 'Pro',
    price: {
      monthly: 49.90,
      yearly: 499.00, // ~41.58/mês (economia de 17%)
      currency: 'BRL'
    },
    stripePriceIds: {
      monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
      yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID,
    },
    limits: {
      itineraries: 999999, // ilimitado
      aiGenerations: 999999, // ilimitado
      photos: 50, // por roteiro
      collaborators: 0,
      storageGB: 0,
    },
    features: {
      createItineraries: true,
      aiGeneration: true,
      publicSharing: true,
      photoUpload: true,
      offlineMode: true,
      exportPDF: true,
      prioritySupport: true, // exclusivo Pro
      removeAds: true,
      earlyAccess: true, // novidades antes de todos
    },
    description: 'Para viajantes profissionais',
    highlights: [
      'Roteiros ilimitados',
      'Compartilhar roteiros',
      'Upload de fotos (50 por roteiro)',
      'Modo offline',
      'Exportar PDF',
      'Suporte prioritário',
      'Acesso antecipado a novidades',
      'Sem anúncios',
    ],
    cta: 'Assinar Pro',
    enterprise: true,
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
  const hierarchy = { free: 0, premium: 1, pro: 2 };
  return hierarchy[plan1] > hierarchy[plan2];
};

/**
 * Calcular economia anual
 */
const getYearlySavings = (planId) => {
  const plan = PLANS[planId];
  if (!plan || plan.id === 'free') return null; // Retorna null ao invés de 0
  
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
