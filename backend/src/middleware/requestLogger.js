// backend/src/middleware/requestLogger.js

/**
 * Middleware de auditoria seguro
 * Loga informações de requisições para rastreamento e análise de segurança
 * NUNCA loga dados sensíveis (passwords, tokens, API keys)
 */

const fs = require('fs');
const path = require('path');

// Criar diretório de logs se não existir
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Rotas que contém dados sensíveis - não logar o body
const sensitiveRoutes = ['/auth/signup', '/auth/login', '/auth/refresh', '/auth/password'];

// Campos sensíveis que nunca devem ser logados
const sensitiveFields = [
  'password',
  'token',
  'refreshToken',
  'accessToken',
  'secret',
  'apiKey',
  'authorization',
];

// Função para sanitizar objeto removendo campos sensíveis
const sanitizeData = (data, depth = 0) => {
  if (data === null || data === undefined) return data;
  if (typeof data !== 'object') return data;

  // Evita recursão excessiva em payloads aninhados.
  if (depth > 6) return '[REDACTED_NESTED_OBJECT]';

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item, depth + 1));
  }

  const sanitized = {};
  const sensitiveSet = new Set(sensitiveFields.map((field) => field.toLowerCase()));

  for (const [key, value] of Object.entries(data)) {
    if (sensitiveSet.has(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
      continue;
    }

    sanitized[key] = sanitizeData(value, depth + 1);
  }

  return sanitized;
};

// Middleware de logging
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Capturar o método original de envio da resposta
  const originalSend = res.send;

  res.send = function (data) {
    const duration = Date.now() - startTime;

    // Informações da requisição
    const logEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      userId: req.userId || null,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    };

    // Adicionar query params se existirem (sanitizados)
    if (Object.keys(req.query).length > 0) {
      logEntry.query = sanitizeData(req.query);
    }

    // Adicionar body apenas se NÃO for rota sensível
    const isSensitiveRoute = sensitiveRoutes.some((route) => req.originalUrl.includes(route));

    if (!isSensitiveRoute && req.body && Object.keys(req.body).length > 0) {
      logEntry.body = sanitizeData(req.body);
    } else if (isSensitiveRoute) {
      logEntry.body = '[SENSITIVE ROUTE - DATA REDACTED]';
    }

    // Log em arquivo (apenas em produção ou se configurado)
    if (process.env.ENABLE_FILE_LOGGING === 'true') {
      const logFile = path.join(logsDir, `requests-${new Date().toISOString().split('T')[0]}.log`);
      const logLine = JSON.stringify(logEntry) + '\n';

      fs.appendFile(logFile, logLine, (err) => {
        if (err) console.error('Erro ao escrever log:', err);
      });
    }

    // Log no console (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      const color =
        res.statusCode >= 500
          ? '\x1b[31m' // vermelho
          : res.statusCode >= 400
            ? '\x1b[33m' // amarelo
            : res.statusCode >= 300
              ? '\x1b[36m' // ciano
              : '\x1b[32m'; // verde

      console.log(
        `${color}${logEntry.method}\x1b[0m ${logEntry.url} - ` +
          `${color}${logEntry.statusCode}\x1b[0m - ${logEntry.duration} - ` +
          `${logEntry.ip}`
      );
    }

    // Chamar o método original
    originalSend.call(this, data);
  };

  next();
};

module.exports = requestLogger;
