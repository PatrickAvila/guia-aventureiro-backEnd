// backend/src/middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  // Log do erro completo apenas no servidor (nunca enviar stack trace ao cliente)
  console.error('❌ Erro no servidor:', {
    message: err.message,
    url: req.originalUrl,
    method: req.method,
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      message: 'Erro de validação',
      errors: messages,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      message: `${field} já está em uso.`,
    });
  }

  // Mongoose cast error (ID inválido)
  if (err.name === 'CastError') {
    return res.status(400).json({
      message: 'ID inválido.',
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Token inválido.',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Token expirado.',
    });
  }

  // CORS error
  if (err.message.includes('CORS')) {
    return res.status(403).json({
      message: 'Acesso bloqueado.',
    });
  }

  // Default error - nunca expor detalhes internos ao cliente
  res.status(err.statusCode || 500).json({
    message: 'Ocorreu um erro. Tente novamente mais tarde.',
  });
};

module.exports = errorHandler;
