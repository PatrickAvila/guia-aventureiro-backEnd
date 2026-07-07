// backend/src/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

/**
 * Rate limiter para rotas de autenticação
 * Protege contra ataques de força bruta
 */
const isProd = process.env.NODE_ENV === 'production';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: isProd ? 5 : 100, // 5 em produção, 100 em desenvolvimento
  message: {
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skip: (req) => {
    // Ignorar completamente em modo de teste
    if (process.env.TEST_MODE === 'true') return true;
    // Em produção aplicar para todos; em dev ignorar localhost
    if (!isProd) {
      const ip = req.ip || req.connection?.remoteAddress || '';
      return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
    }
    return false;
  },
});

/**
 * Rate limiter mais permissivo para outras rotas da API
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 1000 em dev, 100 em prod
  message: {
    message: 'Muitas requisições. Tente novamente mais tarde.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.TEST_MODE === 'true',
});

/**
 * Rate limiter específico para geração com IA
 * Mais restritivo pois consome recursos da API do OpenAI
 */
const aiGenerationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // 10 gerações por hora por usuário
  message: {
    message: 'Limite de gerações atingido. Tente novamente em 1 hora.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.TEST_MODE === 'true',
});

module.exports = {
  authLimiter,
  apiLimiter,
  aiGenerationLimiter,
};
