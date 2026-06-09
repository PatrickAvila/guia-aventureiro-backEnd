// backend/src/middleware/ipBlocker.js

/**
 * Middleware de bloqueio de IP por tentativas falhas
 * Previne ataques de brute force bloqueando temporariamente IPs
 * que fazem múltiplas tentativas de login sem sucesso
 */

const logger = require('../utils/logger');

// Armazenar tentativas falhas em memória (fallback)
const failedAttempts = new Map();

let redisClient = null;
let useRedis = false;
let initPromise = null;
let initialized = false;

const REDIS_KEY_PREFIX = 'ipblock:';
const isRedisRequired = () => process.env.REDIS_REQUIRED === 'true';

const initRedisClient = async () => {
  if (process.env.TEST_MODE === 'true') return;

  if (!process.env.REDIS_URL) {
    if (isRedisRequired()) {
      throw new Error('REDIS_REQUIRED=true, mas REDIS_URL não foi configurada.');
    }
    return;
  }

  try {
    // Dependência opcional: se não existir, permanece com fallback em memória.
    const { createClient } = require('redis');
    redisClient = createClient({
      url: process.env.REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 5) return false;
          return Math.min(retries * 100, 1000);
        },
      },
    });

    redisClient.on('error', (err) => {
      useRedis = false;
      logger.error('ipBlocker Redis error:', err.message);
    });

    await redisClient.connect();
    useRedis = true;
    logger.info('ipBlocker: Redis habilitado');
  } catch (error) {
    useRedis = false;
    logger.warn('ipBlocker: Redis indisponível, usando fallback em memória');

    if (isRedisRequired()) {
      throw new Error(`REDIS_REQUIRED=true, mas Redis não conectou: ${error.message}`);
    }
  }
};

const initializeIpBlocker = async () => {
  if (initialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    await initRedisClient();
    initialized = true;
  })();

  return initPromise;
};

const buildKey = (ip) => `${REDIS_KEY_PREFIX}${ip}`;

const getTtlSeconds = (attemptData) => {
  const now = Date.now();

  if (attemptData.blockedUntil && attemptData.blockedUntil > now) {
    return Math.max(1, Math.ceil((attemptData.blockedUntil - now) / 1000));
  }

  return Math.max(1, Math.ceil(ATTEMPT_WINDOW / 1000));
};

const getAttemptData = async (ip) => {
  if (useRedis && redisClient) {
    const value = await redisClient.get(buildKey(ip));
    return value ? JSON.parse(value) : null;
  }

  return failedAttempts.get(ip) || null;
};

const setAttemptData = async (ip, data) => {
  if (useRedis && redisClient) {
    await redisClient.set(buildKey(ip), JSON.stringify(data), {
      EX: getTtlSeconds(data),
    });
    return;
  }

  failedAttempts.set(ip, data);
};

const deleteAttemptData = async (ip) => {
  if (useRedis && redisClient) {
    await redisClient.del(buildKey(ip));
    return;
  }

  failedAttempts.delete(ip);
};

// Configurações
const MAX_ATTEMPTS = 5; // Número máximo de tentativas
const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutos de bloqueio
const ATTEMPT_WINDOW = 15 * 60 * 1000; // Janela de 15 minutos para contar tentativas

/**
 * Limpa tentativas antigas periodicamente
 * Só inicia o intervalo em produção (não em testes)
 */
let cleanupInterval;
if (process.env.NODE_ENV !== 'test') {
  cleanupInterval = setInterval(() => {
    if (useRedis) return;

    const now = Date.now();
    for (const [ip, data] of failedAttempts.entries()) {
      // Se passou o tempo de bloqueio, limpar
      if (data.blockedUntil && now > data.blockedUntil) {
        failedAttempts.delete(ip);
      }
      // Se passou a janela de tentativas, limpar
      else if (!data.blockedUntil && now - data.firstAttempt > ATTEMPT_WINDOW) {
        failedAttempts.delete(ip);
      }
    }
  }, 60 * 1000); // Limpar a cada 1 minuto
}

/**
 * Função para limpar o intervalo (útil para testes)
 */
const cleanup = () => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
  }
  failedAttempts.clear();

  if (redisClient) {
    redisClient.quit().catch(() => {});
    redisClient = null;
    useRedis = false;
  }

  initialized = false;
  initPromise = null;
};

/**
 * Middleware para verificar se IP está bloqueado
 */
const checkBlocked = async (req, res, next) => {
  try {
    await initializeIpBlocker();

    const ip = req.ip || req.connection.remoteAddress;

    // Ignorar completamente em modo de teste
    if (process.env.TEST_MODE === 'true') {
      return next();
    }

    const attemptData = await getAttemptData(ip);

    if (attemptData && attemptData.blockedUntil) {
      const now = Date.now();

      if (now < attemptData.blockedUntil) {
        const remainingMinutes = Math.ceil((attemptData.blockedUntil - now) / 60000);

        return res.status(429).json({
          message: `IP bloqueado temporariamente por múltiplas tentativas falhas. Tente novamente em ${remainingMinutes} minuto(s).`,
          blockedUntil: new Date(attemptData.blockedUntil).toISOString(),
        });
      }

      // Bloqueio expirou, limpar
      await deleteAttemptData(ip);
    }

    next();
  } catch (error) {
    if (isRedisRequired()) {
      logger.error('ipBlocker checkBlocked falhou em modo estrito Redis:', error.message);
      return res.status(503).json({
        message: 'Serviço temporariamente indisponível. Tente novamente em instantes.',
      });
    }

    logger.warn('ipBlocker checkBlocked falhou, seguindo sem bloqueio');
    next();
  }
};

/**
 * Registrar tentativa falha de login
 */
const recordFailedAttempt = async (req) => {
  try {
    await initializeIpBlocker();

    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    let attemptData = await getAttemptData(ip);

    if (!attemptData) {
      // Primeira tentativa falha
      attemptData = {
        count: 1,
        firstAttempt: now,
        lastAttempt: now,
      };
    } else if (now - attemptData.firstAttempt > ATTEMPT_WINDOW) {
      // Janela de tempo expirou, resetar contagem
      attemptData = {
        count: 1,
        firstAttempt: now,
        lastAttempt: now,
      };
    } else {
      // Incrementar tentativas
      attemptData.count++;
      attemptData.lastAttempt = now;

      // Se atingiu o limite, bloquear
      if (attemptData.count >= MAX_ATTEMPTS) {
        attemptData.blockedUntil = now + BLOCK_DURATION;

        logger.warn(`⚠️ IP bloqueado por ${MAX_ATTEMPTS} tentativas falhas: ${ip}`);
      }
    }

    await setAttemptData(ip, attemptData);
  } catch (error) {
    logger.warn('ipBlocker recordFailedAttempt falhou');
  }
};

/**
 * Limpar tentativas falhas ao fazer login com sucesso
 */
const clearFailedAttempts = async (req) => {
  try {
    await initializeIpBlocker();

    const ip = req.ip || req.connection.remoteAddress;
    await deleteAttemptData(ip);
  } catch (error) {
    logger.warn('ipBlocker clearFailedAttempts falhou');
  }
};

/**
 * Obter estatísticas (útil para admin dashboard)
 */
const getBlockedIPs = async () => {
  await initializeIpBlocker();

  if (useRedis && redisClient) {
    const keys = await redisClient.keys(`${REDIS_KEY_PREFIX}*`);
    const now = Date.now();
    const blocked = [];

    for (const key of keys) {
      const value = await redisClient.get(key);
      if (!value) continue;

      const data = JSON.parse(value);
      if (data.blockedUntil && now < data.blockedUntil) {
        blocked.push({
          ip: key.replace(REDIS_KEY_PREFIX, ''),
          attempts: data.count,
          blockedUntil: new Date(data.blockedUntil).toISOString(),
          remainingMinutes: Math.ceil((data.blockedUntil - now) / 60000),
        });
      }
    }

    return blocked;
  }

  const now = Date.now();
  const blocked = [];

  for (const [ip, data] of failedAttempts.entries()) {
    if (data.blockedUntil && now < data.blockedUntil) {
      blocked.push({
        ip,
        attempts: data.count,
        blockedUntil: new Date(data.blockedUntil).toISOString(),
        remainingMinutes: Math.ceil((data.blockedUntil - now) / 60000),
      });
    }
  }

  return blocked;
};

/**
 * Limpar bloqueios (apenas para testes)
 */
const clearBlocks = async () => {
  await initializeIpBlocker();

  if (useRedis && redisClient) {
    const keys = await redisClient.keys(`${REDIS_KEY_PREFIX}*`);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
    return;
  }

  failedAttempts.clear();
};

module.exports = {
  initializeIpBlocker,
  checkBlocked,
  recordFailedAttempt,
  clearFailedAttempts,
  getBlockedIPs,
  clearBlocks,
  cleanup,
};
