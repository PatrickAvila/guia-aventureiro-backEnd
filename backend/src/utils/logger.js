// backend/src/utils/logger.js
const winston = require('winston');
const path = require('path');

const isDev = process.env.NODE_ENV !== 'production';
const logLevel = process.env.LOG_LEVEL || (isDev ? 'debug' : 'warn');

// Formato customizado
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return stack 
      ? `${timestamp} [${level.toUpperCase()}]: ${message}\n${stack}`
      : `${timestamp} [${level.toUpperCase()}]: ${message}`;
  })
);

// Configuração de transports
const transports = [
  // Console (sempre ativo)
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      customFormat
    ),
  }),
];

// Arquivos apenas em produção
if (!isDev) {
  transports.push(
    // Arquivo de erros
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Arquivo combinado (warn e error)
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Criar logger Winston
const winstonLogger = winston.createLogger({
  level: logLevel,
  format: customFormat,
  transports,
  exitOnError: false,
});

// Interface compatível com código existente
const logger = {
  log: (...args) => winstonLogger.info(args.join(' ')),
  error: (...args) => winstonLogger.error(args.join(' ')),
  warn: (...args) => winstonLogger.warn(args.join(' ')),
  info: (...args) => winstonLogger.info(args.join(' ')),
  debug: (...args) => winstonLogger.debug(args.join(' ')),
  http: (...args) => winstonLogger.http(args.join(' ')),
};

module.exports = logger;
