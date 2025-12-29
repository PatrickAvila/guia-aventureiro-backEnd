// backend/src/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

/**
 * Rate limiter para rotas de autenticação
 * Protege contra ataques de força bruta
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas por janela
  message: {
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Usar IP real quando atrás de proxy (ex: nginx, cloudflare)
  skipSuccessfulRequests: false,
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
});

module.exports = {
  authLimiter,
  apiLimiter,
  aiGenerationLimiter,
};
