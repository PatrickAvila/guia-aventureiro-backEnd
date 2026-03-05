/**
 * User Validators - Schemas Joi para validação de usuários
 */

const Joi = require('joi');

module.exports = {
  /**
   * Validação para cadastro de usuário
   */
  signupSchema: Joi.object({
    nome: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.empty': 'Nome é obrigatório',
        'string.min': 'Nome deve ter no mínimo 2 caracteres',
        'string.max': 'Nome deve ter no máximo 50 caracteres',
      }),

    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.empty': 'Email é obrigatório',
        'string.email': 'Email inválido',
      }),

    senha: Joi.string()
      .min(6)
      .max(100)
      .required()
      .messages({
        'string.empty': 'Senha é obrigatória',
        'string.min': 'Senha deve ter no mínimo 6 caracteres',
        'string.max': 'Senha muito longa',
      }),

    telefone: Joi.string()
      .pattern(/^[0-9]{10,11}$/)
      .optional()
      .messages({
        'string.pattern.base': 'Telefone inválido (use apenas números)',
      }),
  }),

  /**
   * Validação para login
   */
  loginSchema: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.empty': 'Email é obrigatório',
        'string.email': 'Email inválido',
      }),

    senha: Joi.string()
      .required()
      .messages({
        'string.empty': 'Senha é obrigatória',
      }),
  }),

  /**
   * Validação para atualização de perfil
   */
  updateProfileSchema: Joi.object({
    nome: Joi.string()
      .min(2)
      .max(50)
      .optional()
      .messages({
        'string.min': 'Nome deve ter no mínimo 2 caracteres',
        'string.max': 'Nome deve ter no máximo 50 caracteres',
      }),

    telefone: Joi.string()
      .pattern(/^[0-9]{10,11}$/)
      .optional()
      .allow(null, '')
      .messages({
        'string.pattern.base': 'Telefone inválido (use apenas números)',
      }),

    bio: Joi.string()
      .max(500)
      .optional()
      .allow(null, '')
      .messages({
        'string.max': 'Bio deve ter no máximo 500 caracteres',
      }),

    avatar: Joi.string()
      .uri()
      .optional()
      .allow(null, '')
      .messages({
        'string.uri': 'URL do avatar inválida',
      }),
  }),

  /**
   * Validação para mudança de senha
   */
  changePasswordSchema: Joi.object({
    senhaAtual: Joi.string()
      .required()
      .messages({
        'string.empty': 'Senha atual é obrigatória',
      }),

    novaSenha: Joi.string()
      .min(6)
      .max(100)
      .required()
      .messages({
        'string.empty': 'Nova senha é obrigatória',
        'string.min': 'Nova senha deve ter no mínimo 6 caracteres',
      }),
  }),

  /**
   * Validação para reset de senha (request)
   */
  requestPasswordResetSchema: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.empty': 'Email é obrigatório',
        'string.email': 'Email inválido',
      }),
  }),

  /**
   * Validação para reset de senha (confirm)
   */
  resetPasswordSchema: Joi.object({
    token: Joi.string()
      .required()
      .messages({
        'string.empty': 'Token é obrigatório',
      }),

    novaSenha: Joi.string()
      .min(6)
      .max(100)
      .required()
      .messages({
        'string.empty': 'Nova senha é obrigatória',
        'string.min': 'Nova senha deve ter no mínimo 6 caracteres',
      }),
  }),
};
