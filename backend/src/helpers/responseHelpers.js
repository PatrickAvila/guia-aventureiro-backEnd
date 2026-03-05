/**
 * Response Helpers - Padroniza respostas da API
 * Facilita manutenção e consistência
 */

module.exports = {
  /**
   * Resposta de sucesso
   * @param {object} res - Response object do Express
   * @param {any} data - Dados a retornar
   * @param {string} message - Mensagem de sucesso (opcional)
   * @param {number} statusCode - Código HTTP (default: 200)
   */
  success: (res, data = null, message = null, statusCode = 200) => {
    const response = {
      success: true,
      ...(message && { message }),
      ...(data !== null && { data }),
    };
    return res.status(statusCode).json(response);
  },

  /**
   * Resposta de erro
   * @param {object} res - Response object
   * @param {string} message - Mensagem de erro
   * @param {number} statusCode - Código HTTP (default: 500)
   * @param {string} errorCode - Código de erro customizado (opcional)
   */
  error: (res, message, statusCode = 500, errorCode = null) => {
    const response = {
      success: false,
      message,
      ...(errorCode && { errorCode }),
    };
    return res.status(statusCode).json(response);
  },

  /**
   * Resposta paginada
   * @param {object} res - Response object
   * @param {array} data - Dados da página atual
   * @param {number} page - Página atual
   * @param {number} pageSize - Tamanho da página
   * @param {number} total - Total de itens
   */
  paginated: (res, data, page, pageSize, total) => {
    return res.status(200).json({
      success: true,
      data,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total,
        totalPages: Math.ceil(total / pageSize),
        hasNextPage: page < Math.ceil(total / pageSize),
        hasPrevPage: page > 1,
      },
    });
  },

  /**
   * Respost de Created (201)
   * @param {object} res - Response object
   * @param {any} data - Recurso criado
   * @param {string} message - Mensagem (opcional)
   */
  created: (res, data, message = 'Recurso criado com sucesso') => {
    return res.status(201).json({
      success: true,
      message,
      data,
    });
  },

  /**
   * Resposta No Content (204)
   * @param {object} res - Response object
   */
  noContent: (res) => {
    return res.status(204).send();
  },

  /**
   * Resposta Bad Request (400)
   * @param {object} res - Response object
   * @param {string} message - Mensagem de erro
   * @param {array} errors - Array de erros de validação (opcional)
   */
  badRequest: (res, message = 'Dados inválidos', errors = null) => {
    const response = {
      success: false,
      message,
      ...(errors && { errors }),
    };
    return res.status(400).json(response);
  },

  /**
   * Resposta Unauthorized (401)
   * @param {object} res - Response object
   * @param {string} message - Mensagem
   */
  unauthorized: (res, message = 'Acesso não autorizado') => {
    return res.status(401).json({
      success: false,
      message,
    });
  },

  /**
   * Resposta Forbidden (403)
   * @param {object} res - Response object
   * @param {string} message - Mensagem
   */
  forbidden: (res, message = 'Você não tem permissão para esta ação') => {
    return res.status(403).json({
      success: false,
      message,
    });
  },

  /**
   * Resposta Not Found (404)
   * @param {object} res - Response object
   * @param {string} message - Mensagem
   */
  notFound: (res, message = 'Recurso não encontrado') => {
    return res.status(404).json({
      success: false,
      message,
    });
  },

  /**
   * Resposta Conflict (409)
   * @param {object} res - Response object
   * @param {string} message - Mensagem
   */
  conflict: (res, message = 'Conflito com recurso existente') => {
    return res.status(409).json({
      success: false,
      message,
    });
  },

  /**
   * Resposta Too Many Requests (429)
   * @param {object} res - Response object
   * @param {string} message - Mensagem
   */
  tooManyRequests: (res, message = 'Muitas requisições. Aguarde alguns minutos') => {
    return res.status(429).json({
      success: false,
      message,
    });
  },

  /**
   * Resposta Internal Server Error (500)
   * @param {object} res - Response object
   * @param {string} message - Mensagem
   */
  serverError: (res, message = 'Erro interno do servidor') => {
    return res.status(500).json({
      success: false,
      message,
    });
  },

  /**
   * Resposta Service Unavailable (503)
   * @param {object} res - Response object
   * @param {string} message - Mensagem
   */
  serviceUnavailable: (res, message = 'Serviço temporariamente indisponível') => {
    return res.status(503).json({
      success: false,
      message,
    });
  },
};
