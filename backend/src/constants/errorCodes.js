/**
 * Error Codes - Códigos de erro padronizados
 * Facilita tratamento consistente de erros no frontend
 */

module.exports = {
  // Autenticação (AUTH_xxx)
  AUTH: {
    INVALID_CREDENTIALS: 'AUTH_001',
    TOKEN_EXPIRED: 'AUTH_002',
    TOKEN_INVALID: 'AUTH_003',
    UNAUTHORIZED: 'AUTH_004',
    EMAIL_NOT_CONFIRMED: 'AUTH_005',
    ACCOUNT_LOCKED: 'AUTH_006',
    SESSION_EXPIRED: 'AUTH_007',
  },

  // Validação (VAL_xxx)
  VALIDATION: {
    INVALID_INPUT: 'VAL_001',
    MISSING_FIELD: 'VAL_002',
    INVALID_FORMAT: 'VAL_003',
    INVALID_EMAIL: 'VAL_004',
    WEAK_PASSWORD: 'VAL_005',
    INVALID_DATE_RANGE: 'VAL_006',
  },

  // Subscription/Limites (SUB_xxx)
  SUBSCRIPTION: {
    LIMIT_REACHED: 'SUB_001',
    INVALID_TIER: 'SUB_002',
    PAYMENT_FAILED: 'SUB_003',
    SUBSCRIPTION_EXPIRED: 'SUB_004',
    UPGRADE_REQUIRED: 'SUB_005',
  },

  // Recursos (RES_xxx)
  RESOURCE: {
    NOT_FOUND: 'RES_001',
    ALREADY_EXISTS: 'RES_002',
    CONFLICT: 'RES_003',
    FORBIDDEN: 'RES_004',
  },

  // Upload/Arquivos (FILE_xxx)
  FILE: {
    TOO_LARGE: 'FILE_001',
    INVALID_TYPE: 'FILE_002',
    UPLOAD_FAILED: 'FILE_003',
    PROCESSING_ERROR: 'FILE_004',
  },

  // API Externa (EXT_xxx)
  EXTERNAL: {
    AI_SERVICE_ERROR: 'EXT_001',
    MAPS_SERVICE_ERROR: 'EXT_002',
    PAYMENT_SERVICE_ERROR: 'EXT_003',
    CLOUDINARY_ERROR: 'EXT_004',
  },

  // Rate Limiting (RATE_xxx)
  RATE_LIMIT: {
    TOO_MANY_REQUESTS: 'RATE_001',
    IP_BLOCKED: 'RATE_002',
  },

  // Server (SRV_xxx)
  SERVER: {
    INTERNAL_ERROR: 'SRV_001',
    DATABASE_ERROR: 'SRV_002',
    SERVICE_UNAVAILABLE: 'SRV_003',
  },
};
