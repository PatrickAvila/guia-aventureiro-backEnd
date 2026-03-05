/**
 * Constants - Barrel export
 * Exporta todos os constants de um só lugar
 */

module.exports = {
  errorCodes: require('./errorCodes'),
  limits: require('./limits'),
  messages: require('./messages'),
};
  // Mensagens de sucesso
  SUCCESS: {
    CREATED: 'Recurso criado com sucesso',
    UPDATED: 'Recurso atualizado com sucesso',
    DELETED: 'Recurso removido com sucesso',

    // Auth
    SIGNUP_SUCCESS: 'Conta criada com sucesso',
    LOGIN_SUCCESS: 'Login realizado com sucesso',
    LOGOUT_SUCCESS: 'Logout realizado com sucesso',
    PASSWORD_RESET_SENT: 'Email de recuperação enviado',
    PASSWORD_RESET_SUCCESS: 'Senha atualizada com sucesso',

    // Itinerary
    ITINERARY_CREATED: 'Roteiro criado com sucesso',
    ITINERARY_UPDATED: 'Roteiro atualizado com sucesso',
    ITINERARY_DELETED: 'Roteiro removido com sucesso',

    // Collaboration
    COLLABORATOR_ADDED: 'Colaborador adicionado com sucesso',
    COLLABORATOR_REMOVED: 'Colaborador removido com sucesso',

    // Subscription
    SUBSCRIPTION_UPDATED: 'Assinatura atualizada com sucesso',
    PAYMENT_SUCCESS: 'Pagamento processado com sucesso',
  },

  // Mensagens de erro
  ERRORS: {
    // Genérico
    NOT_FOUND: 'Recurso não encontrado',
    UNAUTHORIZED: 'Acesso não autorizado',
    FORBIDDEN: 'Você não tem permissão para esta ação',
    VALIDATION_FAILED: 'Dados inválidos',
    INTERNAL_ERROR: 'Erro interno do servidor',
    SERVICE_UNAVAILABLE: 'Serviço temporariamente indisponível',

    // Auth
    INVALID_CREDENTIALS: 'Email ou senha incorretos',
    EMAIL_ALREADY_EXISTS: 'Este email já está em uso',
    EMAIL_NOT_CONFIRMED: 'Email não confirmado',
    TOKEN_EXPIRED: 'Sessão expirada. Faça login novamente',
    TOKEN_INVALID: 'Token inválido',
    ACCOUNT_LOCKED: 'Conta bloqueada. Contate o suporte',

    // Validation
    INVALID_EMAIL: 'Email inválido',
    WEAK_PASSWORD: 'Senha muito fraca. Use letras, números e caracteres especiais',
    MISSING_FIELD: 'Campo obrigatório não preenchido',
    INVALID_DATE_RANGE: 'Data de término deve ser após data de início',

    // Subscription
    LIMIT_REACHED: 'Limite de recursos atingido. Faça upgrade para continuar',
    SUBSCRIPTION_EXPIRED: 'Assinatura expirada',
    PAYMENT_FAILED: 'Pagamento não processado. Verifique seus dados',

    // File upload
    FILE_TOO_LARGE: 'Arquivo muito grande',
    INVALID_FILE_TYPE: 'Tipo de arquivo não suportado',
    UPLOAD_FAILED: 'Falha no upload. Tente novamente',

    // Rate limiting
    TOO_MANY_REQUESTS: 'Muitas requisições. Aguarde alguns minutos',
    IP_BLOCKED: 'IP bloqueado devido a múltiplas tentativas',

    // External services
    AI_SERVICE_ERROR: 'Serviço de IA temporariamente indisponível',
    MAPS_SERVICE_ERROR: 'Serviço de mapas indisponível',
    CLOUDINARY_ERROR: 'Erro ao processar imagem',
  },

  // Mensagens de aviso
  WARNINGS: {
    APPROACHING_LIMIT: 'Você está próximo do limite do seu plano',
    BETA_FEATURE: 'Esta funcionalidade está em beta',
    DEPRECATED: 'Este endpoint será descontinuado em breve',
  },

  // Mensagens de validação específicas
  VALIDATION: {
    MIN_LENGTH: (field, min) => `${field} deve ter no mínimo ${min} caracteres`,
    MAX_LENGTH: (field, max) => `${field} deve ter no máximo ${max} caracteres`,
    REQUIRED: (field) => `${field} é obrigatório`,
    INVALID_FORMAT: (field) => `Formato inválido para ${field}`,
    OUT_OF_RANGE: (field, min, max) => `${field} deve estar entre ${min} e ${max}`,
  },
};
