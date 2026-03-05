/**
 * Limits - Limites de recursos por tier de subscription
 * Centraliza todos os limites do sistema
 */

module.exports = {
  // Limites por tier de subscription
  SUBSCRIPTION_LIMITS: {
    free: {
      itineraries: 3,
      collaborators: 0,
      photos: 10,
      aiGenerations: 1,
      chatMessages: 50,
    },
    premium: {
      itineraries: Infinity,
      collaborators: 10,
      photos: 100,
      aiGenerations: 50,
      chatMessages: Infinity,
    },
  },

  // Paginação
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
  },

  // Tamanhos de arquivo
  FILE_SIZE: {
    MAX_PHOTO_SIZE: 5 * 1024 * 1024, // 5MB
    MAX_AVATAR_SIZE: 2 * 1024 * 1024, // 2MB
    MAX_DOCUMENT_SIZE: 10 * 1024 * 1024, // 10MB
  },

  // Rate limiting
  RATE_LIMITS: {
    LOGIN_ATTEMPTS: 5,
    LOGIN_WINDOW_MINUTES: 15,
    API_REQUESTS_PER_MINUTE: 100,
    AI_REQUESTS_PER_HOUR: 10,
  },

  // Strings
  STRING_LIMITS: {
    MIN_PASSWORD_LENGTH: 6,
    MAX_PASSWORD_LENGTH: 100,
    MIN_NAME_LENGTH: 2,
    MAX_NAME_LENGTH: 50,
    MAX_BIO_LENGTH: 500,
    MAX_TITLE_LENGTH: 100,
    MAX_DESCRIPTION_LENGTH: 5000,
    MAX_COMMENT_LENGTH: 1000,
  },

  // Datas
  DATE_LIMITS: {
    MAX_TRIP_DURATION_DAYS: 365,
    MIN_TRIP_DURATION_DAYS: 1,
    MAX_FUTURE_BOOKING_DAYS: 730, // 2 anos
  },

  // Cache TTL (em segundos)
  CACHE_TTL: {
    USER_SESSION: 3600, // 1 hora
    API_RESPONSE: 300, // 5 minutos
    STATIC_CONTENT: 86400, // 24 horas
  },

  // Timeouts (em ms)
  TIMEOUTS: {
    API_REQUEST: 30000, // 30 segundos
    DATABASE_QUERY: 10000, // 10 segundos
    AI_GENERATION: 60000, // 60 segundos
  },
};
