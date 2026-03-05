/**
 * Itinerary Validators - Schemas Joi para validação de roteiros
 */

const Joi = require('joi');
const { limits } = require('../constants');

module.exports = {
  /**
   * Validação para criação de roteiro
   */
  createItinerarySchema: Joi.object({
    titulo: Joi.string()
      .min(3)
      .max(100)
      .required()
      .messages({
        'string.empty': 'Título é obrigatório',
        'string.min': 'Título deve ter no mínimo 3 caracteres',
        'string.max': 'Título deve ter no máximo 100 caracteres',
      }),

    descricao: Joi.string()
      .max(1000)
      .optional()
      .allow('', null)
      .messages({
        'string.max': 'Descrição deve ter no máximo 1000 caracteres',
      }),

    destinos: Joi.array()
      .items(Joi.string())
      .min(1)
      .max(20)
      .required()
      .messages({
        'array.min': 'Adicione pelo menos 1 destino',
        'array.max': 'Máximo de 20 destinos por roteiro',
      }),

    dataInicio: Joi.date()
      .iso()
      .min('now')
      .required()
      .messages({
        'date.base': 'Data de início inválida',
        'date.min': 'Data de início deve ser futura',
        'any.required': 'Data de início é obrigatória',
      }),

    dataFim: Joi.date()
      .iso()
      .greater(Joi.ref('dataInicio'))
      .required()
      .messages({
        'date.base': 'Data de fim inválida',
        'date.greater': 'Data de fim deve ser posterior à data de início',
        'any.required': 'Data de fim é obrigatória',
      }),

    orcamento: Joi.object({
      valor: Joi.number()
        .min(0)
        .required()
        .messages({
          'number.min': 'Orçamento não pode ser negativo',
          'any.required': 'Valor do orçamento é obrigatório',
        }),
      moeda: Joi.string()
        .valid('BRL', 'USD', 'EUR')
        .default('BRL')
        .messages({
          'any.only': 'Moeda deve ser BRL, USD ou EUR',
        }),
    }).optional(),

    categorias: Joi.array()
      .items(Joi.string().valid('aventura', 'cultural', 'gastronomia', 'praia', 'montanha', 'urbano', 'rural', 'eco-turismo'))
      .max(5)
      .optional()
      .messages({
        'array.max': 'Máximo de 5 categorias',
        'any.only': 'Categoria inválida',
      }),

    visibilidade: Joi.string()
      .valid('publico', 'privado', 'amigos')
      .default('privado')
      .messages({
        'any.only': 'Visibilidade deve ser: publico, privado ou amigos',
      }),
  }),

  /**
   * Validação para atualização de roteiro
   */
  updateItinerarySchema: Joi.object({
    titulo: Joi.string()
      .min(3)
      .max(100)
      .optional()
      .messages({
        'string.min': 'Título deve ter no mínimo 3 caracteres',
        'string.max': 'Título deve ter no máximo 100 caracteres',
      }),

    descricao: Joi.string()
      .max(1000)
      .optional()
      .allow('', null)
      .messages({
        'string.max': 'Descrição deve ter no máximo 1000 caracteres',
      }),

    destinos: Joi.array()
      .items(Joi.string())
      .min(1)
      .max(20)
      .optional()
      .messages({
        'array.min': 'Roteiro precisa ter pelo menos 1 destino',
        'array.max': 'Máximo de 20 destinos',
      }),

    dataInicio: Joi.date()
      .iso()
      .optional()
      .messages({
        'date.base': 'Data de início inválida',
      }),

    dataFim: Joi.date()
      .iso()
      .when('dataInicio', {
        is: Joi.exist(),
        then: Joi.date().greater(Joi.ref('dataInicio')),
        otherwise: Joi.date(),
      })
      .optional()
      .messages({
        'date.base': 'Data de fim inválida',
        'date.greater': 'Data de fim deve ser posterior à data de início',
      }),

    orcamento: Joi.object({
      valor: Joi.number().min(0),
      moeda: Joi.string().valid('BRL', 'USD', 'EUR'),
    }).optional(),

    categorias: Joi.array()
      .items(Joi.string().valid('aventura', 'cultural', 'gastronomia', 'praia', 'montanha', 'urbano', 'rural', 'eco-turismo'))
      .max(5)
      .optional(),

    visibilidade: Joi.string()
      .valid('publico', 'privado', 'amigos')
      .optional(),

    status: Joi.string()
      .valid('planejamento', 'confirmado', 'em-andamento', 'concluido', 'cancelado')
      .optional(),
  }),

  /**
   * Validação para adicionar dia ao roteiro
   */
  addDaySchema: Joi.object({
    data: Joi.date()
      .iso()
      .required()
      .messages({
        'date.base': 'Data inválida',
        'any.required': 'Data é obrigatória',
      }),

    atividades: Joi.array()
      .items(
        Joi.object({
          titulo: Joi.string().required(),
          horario: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
          local: Joi.string().optional(),
          descricao: Joi.string().max(500).optional(),
          custo: Joi.number().min(0).optional(),
        })
      )
      .max(20)
      .optional()
      .messages({
        'array.max': 'Máximo de 20 atividades por dia',
      }),
  }),

  /**
   * Validação para adicionar foto ao roteiro
   */
  addPhotoSchema: Joi.object({
    url: Joi.string()
      .uri()
      .required()
      .messages({
        'string.uri': 'URL da foto inválida',
        'any.required': 'URL é obrigatória',
      }),

    legenda: Joi.string()
      .max(200)
      .optional()
      .messages({
        'string.max': 'Legenda deve ter no máximo 200 caracteres',
      }),

    local: Joi.string()
      .max(100)
      .optional(),
  }),

  /**
   * Validação para query params de listagem
   */
  listQuerySchema: Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .default(1),

    pageSize: Joi.number()
      .integer()
      .min(1)
      .max(limits.PAGINATION.max)
      .default(limits.PAGINATION.default),

    status: Joi.string()
      .valid('planejamento', 'confirmado', 'em-andamento', 'concluido', 'cancelado')
      .optional(),

    categoria: Joi.string()
      .valid('aventura', 'cultural', 'gastronomia', 'praia', 'montanha', 'urbano', 'rural', 'eco-turismo')
      .optional(),

    search: Joi.string()
      .max(100)
      .optional(),

    sortBy: Joi.string()
      .valid('dataInicio', 'dataFim', 'titulo', 'createdAt')
      .default('createdAt'),

    order: Joi.string()
      .valid('asc', 'desc')
      .default('desc'),
  }),
};
