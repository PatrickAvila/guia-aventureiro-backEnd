// backend/src/middleware/validators.js
const { body, param, query, validationResult } = require('express-validator');

// Middleware para verificar erros de validação
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Erro de validação',
      errors: errors.array() 
    });
  }
  next();
};

// ========== VALIDADORES DE AUTENTICAÇÃO ==========

const validateSignup = [
  body('name')
    .trim()
    .escape() // Sanitizar HTML/JS
    .notEmpty().withMessage('Nome é obrigatório')
    .isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/).withMessage('Nome deve conter apenas letras'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email é obrigatório')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail()
    .isLength({ max: 255 }).withMessage('Email muito longo'),
  
  body('password')
    .notEmpty().withMessage('Senha é obrigatória')
    .isLength({ min: 6, max: 128 }).withMessage('Senha deve ter entre 6 e 128 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número'),
  
  body('acceptedTerms')
    .isBoolean().withMessage('acceptedTerms deve ser verdadeiro ou falso')
    .equals('true').withMessage('Você deve aceitar os termos de uso'),
  
  handleValidationErrors
];

const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email é obrigatório')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail()
    .isLength({ max: 255 }).withMessage('Email muito longo'),
  
  body('password')
    .notEmpty().withMessage('Senha é obrigatória')
    .isLength({ max: 128 }).withMessage('Senha muito longa'),
  
  handleValidationErrors
];

const validateUpdatePassword = [
  body('currentPassword')
    .notEmpty().withMessage('Senha atual é obrigatória')
    .isLength({ max: 128 }).withMessage('Senha muito longa'),
  
  body('newPassword')
    .notEmpty().withMessage('Nova senha é obrigatória')
    .isLength({ min: 6, max: 128 }).withMessage('Nova senha deve ter entre 6 e 128 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Nova senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número'),
  
  handleValidationErrors
];

// ========== VALIDADORES DE ROTEIROS ==========

const validateCreateItinerary = [
  body('title')
    .trim()
    .escape() // Sanitizar HTML/JS
    .notEmpty().withMessage('Título é obrigatório')
    .isLength({ min: 3, max: 200 }).withMessage('Título deve ter entre 3 e 200 caracteres'),
  
  body('destination.city')
    .trim()
    .escape()
    .notEmpty().withMessage('Cidade de destino é obrigatória')
    .isLength({ max: 100 }).withMessage('Nome da cidade muito longo'),
  
  body('destination.country')
    .trim()
    .escape()
    .notEmpty().withMessage('País de destino é obrigatório')
    .isLength({ max: 100 }).withMessage('Nome do país muito longo'),
  
  body('startDate')
    .notEmpty().withMessage('Data de início é obrigatória')
    .isISO8601().withMessage('Data de início inválida'),
  
  body('endDate')
    .notEmpty().withMessage('Data de término é obrigatória')
    .isISO8601().withMessage('Data de término inválida')
    .custom((endDate, { req }) => {
      if (new Date(endDate) <= new Date(req.body.startDate)) {
        throw new Error('Data de término deve ser posterior à data de início');
      }
      return true;
    }),
  
  body('budget.level')
    .optional()
    .isIn(['economico', 'medio', 'luxo']).withMessage('Nível de orçamento inválido'),
  
  body('budget.estimatedTotal')
    .optional()
    .isFloat({ min: 0 }).withMessage('Orçamento deve ser um valor positivo'),
  
  body('preferences.travelStyle')
    .optional()
    .isIn(['solo', 'casal', 'familia', 'amigos', 'mochileiro']).withMessage('Estilo de viagem inválido'),
  
  handleValidationErrors
];

const validateUpdateItinerary = [
  param('id')
    .isMongoId().withMessage('ID do roteiro inválido'),
  
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Título muito longo'),
  
  body('startDate')
    .optional()
    .isISO8601().withMessage('Data de início inválida'),
  
  body('endDate')
    .optional()
    .isISO8601().withMessage('Data de término inválida'),
  
  body('status')
    .optional()
    .isIn(['rascunho', 'planejando', 'confirmado', 'em_andamento', 'concluido'])
    .withMessage('Status inválido'),
  
  handleValidationErrors
];

const validateItineraryId = [
  param('id')
    .isMongoId().withMessage('ID do roteiro inválido'),
  
  handleValidationErrors
];

// ========== VALIDADORES DE AVALIAÇÕES ==========

const validateCreateRating = [
  param('itineraryId')
    .isMongoId().withMessage('ID do roteiro inválido'),
  
  body('score')
    .notEmpty().withMessage('Pontuação é obrigatória')
    .isInt({ min: 1, max: 5 }).withMessage('Pontuação deve ser entre 1 e 5'),
  
  body('comment')
    .optional()
    .trim()
    .escape() // Sanitizar HTML/JS
    .isLength({ max: 1000 }).withMessage('Comentário muito longo (máximo 1000 caracteres)'),
  
  body('highlights')
    .optional()
    .isArray().withMessage('Highlights deve ser um array')
    .custom((highlights) => {
      const validHighlights = ['acomodacao', 'gastronomia', 'atracao', 'transporte', 'custo_beneficio', 'organizacao'];
      return highlights.every(h => validHighlights.includes(h));
    }).withMessage('Highlight inválido'),
  
  body('wouldRecommend')
    .optional()
    .isBoolean().withMessage('wouldRecommend deve ser true ou false'),
  
  handleValidationErrors
];

const validateRatingId = [
  param('ratingId')
    .isMongoId().withMessage('ID da avaliação inválido'),
  
  handleValidationErrors
];

// ========== VALIDADORES DE PAGINAÇÃO ==========

const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Página deve ser um número inteiro positivo'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limite deve ser entre 1 e 100'),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'startDate', 'title']).withMessage('Campo de ordenação inválido'),
  
  query('order')
    .optional()
    .isIn(['asc', 'desc']).withMessage('Ordem deve ser asc ou desc'),
  
  handleValidationErrors
];

// ========== VALIDADORES DE COLABORADORES ==========

const validateAddCollaborator = [
  param('id')
    .isMongoId().withMessage('ID do roteiro inválido'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email é obrigatório')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  
  body('permission')
    .optional()
    .isIn(['view', 'edit']).withMessage('Permissão inválida'),
  
  handleValidationErrors
];

// ========== VALIDADORES DE ATIVIDADES ==========

const validateAddActivity = [
  param('id')
    .isMongoId().withMessage('ID do roteiro inválido'),
  
  body('dayNumber')
    .notEmpty().withMessage('Número do dia é obrigatório')
    .isInt({ min: 1 }).withMessage('Número do dia inválido'),
  
  body('time')
    .notEmpty().withMessage('Horário é obrigatório')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Formato de horário inválido (use HH:MM)'),
  
  body('title')
    .trim()
    .notEmpty().withMessage('Título da atividade é obrigatório'),
  
  body('category')
    .optional()
    .isIn(['transporte', 'alimentacao', 'atracao', 'hospedagem', 'compras', 'outro'])
    .withMessage('Categoria inválida'),
  
  body('estimatedCost')
    .optional()
    .isFloat({ min: 0 }).withMessage('Custo deve ser um valor positivo'),
  
  handleValidationErrors
];

// ========== VALIDADORES DE ORÇAMENTO ==========

const validateAddExpense = [
  param('id')
    .isMongoId().withMessage('ID do roteiro inválido'),
  
  body('category')
    .notEmpty().withMessage('Categoria é obrigatória')
    .isIn(['hospedagem', 'alimentacao', 'transporte', 'atracao', 'compras', 'outro'])
    .withMessage('Categoria inválida'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('Descrição é obrigatória')
    .isLength({ max: 200 }).withMessage('Descrição muito longa (máximo 200 caracteres)'),
  
  body('amount')
    .notEmpty().withMessage('Valor é obrigatório')
    .isFloat({ min: 0 }).withMessage('Valor deve ser um número positivo'),
  
  body('date')
    .optional()
    .isISO8601().withMessage('Data inválida'),
  
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 }).withMessage('Código de moeda inválido (use 3 letras: BRL, USD, EUR)'),
  
  body('receipt')
    .optional()
    .isURL().withMessage('URL do recibo inválida'),
  
  handleValidationErrors
];

const validateUpdateExpense = [
  param('id')
    .isMongoId().withMessage('ID do roteiro inválido'),
  
  param('expenseId')
    .isMongoId().withMessage('ID do gasto inválido'),
  
  body('category')
    .optional()
    .isIn(['hospedagem', 'alimentacao', 'transporte', 'atracao', 'compras', 'outro'])
    .withMessage('Categoria inválida'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Descrição muito longa'),
  
  body('amount')
    .optional()
    .isFloat({ min: 0 }).withMessage('Valor deve ser positivo'),
  
  body('date')
    .optional()
    .isISO8601().withMessage('Data inválida'),
  
  handleValidationErrors
];

const validateExpenseId = [
  param('id')
    .isMongoId().withMessage('ID do roteiro inválido'),
  
  param('expenseId')
    .isMongoId().withMessage('ID do gasto inválido'),
  
  handleValidationErrors
];

module.exports = {
  // Auth
  validateSignup,
  validateLogin,
  validateUpdatePassword,
  
  // Itinerários
  validateCreateItinerary,
  validateUpdateItinerary,
  validateItineraryId,
  validateAddCollaborator,
  validateAddActivity,
  
  // Avaliações
  validateCreateRating,
  validateRatingId,
  
  // Orçamento
  validateAddExpense,
  validateUpdateExpense,
  validateExpenseId,
  
  // Paginação
  validatePagination,
  
  // Helper
  handleValidationErrors
};
