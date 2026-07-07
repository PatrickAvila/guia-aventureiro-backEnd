require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const mongoose = require('mongoose');
const connectDB = require('./src/config/database');
const requestLogger = require('./src/middleware/requestLogger');
const { initializeIpBlocker } = require('./src/middleware/ipBlocker');

const app = express();
app.set('trust proxy', 1); // Confia no proxy do Render
app.disable('x-powered-by');
const PORT = process.env.PORT || 3000;

// Guardrail: nunca iniciar em produção com TEST_MODE habilitado
if (process.env.NODE_ENV === 'production' && process.env.TEST_MODE === 'true') {
  console.error('❌ Configuração inválida: TEST_MODE=true não é permitido em produção.');
  process.exit(1);
}

// Middleware: Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    // Check if request is HTTPS (X-Forwarded-Proto for reverse proxies like Render)
    const isHttps = req.secure || req.get('x-forwarded-proto') === 'https';

    if (!isHttps) {
      return res.status(403).json({
        error: 'HTTPS required',
        message: 'All requests must use HTTPS in production',
      });
    }

    next();
  });
}

// Conectar MongoDB
connectDB();

// Middlewares de segurança
// Configuração avançada do Helmet com CSP, HSTS e outras proteções
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"], // Permitir scripts inline para páginas de pagamento
        imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
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
  })
);

app.use(mongoSanitize());
app.use(xss());

// CORS com whitelist - Aceitar apenas origens autorizadas em produção
const allowedOrigins =
  process.env.NODE_ENV === 'production'
    ? (process.env.FRONTEND_URL || '')
        .split(',')
        .map((url) => url.trim())
        .filter(Boolean)
    : true; // Em desenvolvimento, permite qualquer origem

app.use(
  cors({
    origin: (origin, callback) => {
      // Permite requisições sem origin (mobile apps, Postman)
      if (!origin) return callback(null, true);

      // Em desenvolvimento, permite qualquer origem
      if (allowedOrigins === true) {
        return callback(null, true);
      }

      // Em produção: valida contra whitelist (se configurado)
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Origem não permitida pelo CORS'));
      }
    },
    credentials: true,
  })
);

// ========================================
// STRIPE WEBHOOK (ANTES DO BODY PARSER)
// ========================================
// O webhook Stripe precisa do raw body para verificar a assinatura
const verifyStripeSignature = require('./src/middleware/verifyStripeSignature');
const subscriptionController = require('./src/controllers/subscriptionController');

app.post(
  '/api/subscriptions/webhook',
  express.raw({ type: 'application/json' }),
  (req, res, next) => {
    // Armazenar raw body para verificação de assinatura
    req.rawBody = req.body;
    next();
  },
  verifyStripeSignature,
  subscriptionController.handleWebhook
);

// Body parser (DEPOIS do webhook)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger (auditoria segura)
app.use(requestLogger);

// Health check antes do rate limiter para não ser bloqueado pelo Render/UptimeRobot
app.get('/health', async (req, res) => {
  const healthcheck = {
    status: 'OK',
    service: 'Guia do Aventureiro API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  };

  if (mongoose.connection.readyState === 1) {
    healthcheck.database = 'connected';
  } else {
    healthcheck.database = 'disconnected';
    healthcheck.status = 'ERROR';
  }

  const memUsage = process.memoryUsage();
  healthcheck.memory = {
    rss: `${Math.round(memUsage.rss / 1024 / 1024)} MB`,
    heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`,
    heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`,
  };

  res.status(healthcheck.status === 'OK' ? 200 : 503).json(healthcheck);
});

// Rate limiting global (desabilitado para localhost)
if (process.env.NODE_ENV !== 'test' && process.env.TEST_MODE !== 'true') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 1000 em dev, 100 em prod
    message: 'Muitas requisições. Tente novamente em 15 minutos.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);
}

// Endpoint para limpar bloqueios de IP (apenas em modo de teste)
if (process.env.TEST_MODE === 'true') {
  const { clearBlocks } = require('./src/middleware/ipBlocker');
  app.post('/test/clear-blocks', async (req, res) => {
    await clearBlocks();
    res.json({ message: 'Bloqueios limpos com sucesso' });
  });
}

// Rotas públicas para roteiros compartilhados
const shareController = require('./src/controllers/shareController');
const authMiddleware = require('./src/middleware/auth');
const { canCreateItinerary } = require('./src/middleware/checkLimits');

// GET público (sem autenticação)
app.get('/api/shared/:shareId', shareController.getSharedItinerary);

// POST para copiar (requer autenticação + verificação de limites)
app.post(
  '/api/shared/:shareId/copy',
  authMiddleware,
  canCreateItinerary,
  shareController.copySharedItinerary
);

app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/subscriptions', require('./src/routes/subscriptions')); // Sistema de assinatura
app.use('/api/checkout', require('./src/routes/checkout')); // Stripe Checkout (Webview)
app.use('/api/roteiros', require('./src/routes/maps')); // Rotas de mapa (antes de itineraries para evitar conflito)
app.use('/api/roteiros', require('./src/routes/itineraries'));
app.use('/api/roteiros', require('./src/routes/budget')); // Rotas de orçamento
app.use('/api/ratings', require('./src/routes/ratings'));
app.use('/api/achievements', require('./src/routes/achievements'));
app.use('/api/explore', require('./src/routes/explore'));
app.use('/api/ai', require('./src/routes/ai'));
app.use('/api/notifications', require('./src/routes/notifications'));
app.use('/api/social', require('./src/routes/social'));
app.use('/api/recommendations', require('./src/routes/recommendations'));
app.use('/api/chat', require('./src/routes/chat'));
app.use('/api/push', require('./src/routes/pushNotifications'));

// Rota de teste (apenas em ambiente de teste ou TEST_MODE ativado)
if (process.env.NODE_ENV !== 'production' || process.env.TEST_MODE === 'true') {
  app.use('/api/test', require('./src/routes/test'));
}
app.use('/api/upload', require('./src/routes/upload'));

// 404
app.use((req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

// Error handler global
app.use(require('./src/middleware/errorHandler'));

// Exportar app para testes
module.exports = app;

// Iniciar servidor apenas se não for importado
if (require.main === module) {
  const http = require('http');
  const { initializeSocket } = require('./src/services/socketService');
  const { initializeScheduler } = require('./src/services/notificationScheduler');

  const startServer = async () => {
    try {
      await initializeIpBlocker();

      const server = http.createServer(app);

      // Inicializar Socket.IO
      initializeSocket(server);

      // Inicializar scheduler de notificações
      initializeScheduler();

      server.listen(PORT, () => {
        console.log(`🚀 Guia do Aventureiro API rodando na porta ${PORT}`);
        console.log(`📍 Health check: http://localhost:${PORT}/health`);
        console.log(`⚡ WebSocket habilitado para colaboração em tempo real`);
      });
    } catch (error) {
      console.error('❌ Falha ao iniciar servidor:', error.message);
      process.exit(1);
    }
  };

  startServer();
}
