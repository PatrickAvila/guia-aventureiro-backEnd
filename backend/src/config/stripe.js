// backend/src/config/stripe.js
const Stripe = require('stripe');
const logger = require('../utils/logger');

if (!process.env.STRIPE_SECRET_KEY) {
  logger.warn('⚠️  STRIPE_SECRET_KEY não configurada. Funcionalidades de pagamento desabilitadas.');
}

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia', // Versão mais recente da API Stripe
      typescript: false,
    })
  : null;

// Validar configuração em produção
if (process.env.NODE_ENV === 'production' && !stripe) {
  logger.error('❌ Stripe não configurado em produção!');
  throw new Error('STRIPE_SECRET_KEY é obrigatória em produção');
}

// Log do modo (test ou live)
if (stripe) {
  const mode = process.env.STRIPE_SECRET_KEY.startsWith('sk_test_') ? 'TEST' : 'LIVE';
  logger.info(`✅ Stripe inicializado no modo ${mode}`);
}

module.exports = stripe;
