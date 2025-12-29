require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const connectDB = require('./src/config/database');
const requestLogger = require('./src/middleware/requestLogger');

const app = express();
const PORT = process.env.PORT || 3000;

// Conectar MongoDB
connectDB();

// Middlewares de segurança
// Configuração avançada do Helmet com CSP, HSTS e outras proteções
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 ano
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

app.use(mongoSanitize());
app.use(xss());

// CORS com whitelist - Aceitar apenas origens autorizadas em produção
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? (process.env.FRONTEND_URL || '').split(',').map(url => url.trim())
  : true; // Em desenvolvimento, permite qualquer origem

app.use(cors({
  origin: (origin, callback) => {
    // Permite requisições sem origin (mobile apps, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins === true) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origem não permitida pelo CORS'));
    }
  },
  credentials: true,
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger (auditoria segura)
app.use(requestLogger);

// Rate limiting global
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 1000 em dev, 100 em prod
  message: 'Muitas requisições. Tente novamente em 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Rate limiting específico para autenticação (mais restritivo)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Apenas 5 tentativas de login/cadastro por 15min
  skipSuccessfulRequests: true, // Não contar requisições bem-sucedidas
  message: 'Muitas tentativas. Tente novamente em 15 minutos.',
});

// Rotas
app.get('/health', async (req, res) => {
  const healthcheck = {
    status: 'OK',
    service: 'Guia do Aventureiro API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  };

  // Check MongoDB connection
  if (mongoose.connection.readyState === 1) {
    healthcheck.database = 'connected';
  } else {
    healthcheck.database = 'disconnected';
    healthcheck.status = 'ERROR';
  }

  // Memory metrics
  const memUsage = process.memoryUsage();
  healthcheck.memory = {
    rss: `${Math.round(memUsage.rss / 1024 / 1024)} MB`,
    heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`,
    heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`,
  };

  res.status(healthcheck.status === 'OK' ? 200 : 503).json(healthcheck);
});

app.use('/api/auth', authLimiter, require('./src/routes/auth')); // Rate limit extra
app.use('/api/roteiros', require('./src/routes/itineraries'));
app.use('/api/ratings', require('./src/routes/ratings'));
app.use('/api/achievements', require('./src/routes/achievements'));
app.use('/api/explore', require('./src/routes/explore'));
app.use('/api/ai', require('./src/routes/ai'));
app.use('/api/upload', require('./src/routes/upload'));

// Rota pública de compartilhamento (sem auth)
const shareController = require('./src/controllers/shareController');
app.get('/api/shared/:shareId', shareController.getSharedItinerary);

// 404
app.use((req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

// Error handler global
app.use(require('./src/middleware/errorHandler'));

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Guia do Aventureiro API rodando na porta ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});