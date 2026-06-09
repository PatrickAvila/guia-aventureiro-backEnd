// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const sendAuthError = (res, statusCode, message, error) => {
  const response = { message };

  if (error && process.env.NODE_ENV !== 'production') {
    response.debug = error.message;
  }

  return res.status(statusCode).json(response);
};

const auth = async (req, res, next) => {
  try {
    // Pegar token do header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return sendAuthError(res, 401, 'Acesso negado. Token não fornecido.');
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar usuário
    const user = await User.findById(decoded.userId);

    if (!user) {
      return sendAuthError(res, 401, 'Usuário não encontrado.');
    }

    // Adicionar user ao request
    req.user = user;
    req.userId = user._id;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return sendAuthError(res, 401, 'Token inválido.');
    }
    if (error.name === 'TokenExpiredError') {
      return sendAuthError(res, 401, 'Token expirado.');
    }
    return sendAuthError(res, 500, 'Erro ao autenticar.', error);
  }
};

/**
 * Middleware de autenticação opcional
 * Tenta autenticar, mas não retorna erro se falhar
 * Útil para rotas que podem funcionar com ou sem autenticação
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (user) {
        req.user = user;
        req.userId = user._id;
      }
    }
  } catch (error) {
    // Ignorar erros de autenticação - continuar sem autenticação
  }

  next();
};

module.exports = auth;
module.exports.optionalAuth = optionalAuth;
