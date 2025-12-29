// backend/src/middleware/ipBlocker.js

/**
 * Middleware de bloqueio de IP por tentativas falhas
 * Previne ataques de brute force bloqueando temporariamente IPs
 * que fazem múltiplas tentativas de login sem sucesso
 */

// Armazenar tentativas falhas em memória (em produção, use Redis)
const failedAttempts = new Map();

// Configurações
const MAX_ATTEMPTS = 5; // Número máximo de tentativas
const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutos de bloqueio
const ATTEMPT_WINDOW = 15 * 60 * 1000; // Janela de 15 minutos para contar tentativas

/**
 * Limpa tentativas antigas periodicamente
 */
setInterval(() => {
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

/**
 * Middleware para verificar se IP está bloqueado
 */
const checkBlocked = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const attemptData = failedAttempts.get(ip);
  
  if (attemptData && attemptData.blockedUntil) {
    const now = Date.now();
    
    if (now < attemptData.blockedUntil) {
      const remainingMinutes = Math.ceil((attemptData.blockedUntil - now) / 60000);
      
      return res.status(429).json({
        message: `IP bloqueado temporariamente por múltiplas tentativas falhas. Tente novamente em ${remainingMinutes} minuto(s).`,
        blockedUntil: new Date(attemptData.blockedUntil).toISOString(),
      });
    } else {
      // Bloqueio expirou, limpar
      failedAttempts.delete(ip);
    }
  }
  
  next();
};

/**
 * Registrar tentativa falha de login
 */
const recordFailedAttempt = (req) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  let attemptData = failedAttempts.get(ip);
  
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
      
      console.warn(`⚠️ IP bloqueado por ${MAX_ATTEMPTS} tentativas falhas:`, {
        ip,
        attempts: attemptData.count,
        blockedUntil: new Date(attemptData.blockedUntil).toISOString(),
      });
    }
  }
  
  failedAttempts.set(ip, attemptData);
};

/**
 * Limpar tentativas falhas ao fazer login com sucesso
 */
const clearFailedAttempts = (req) => {
  const ip = req.ip || req.connection.remoteAddress;
  failedAttempts.delete(ip);
};

/**
 * Obter estatísticas (útil para admin dashboard)
 */
const getBlockedIPs = () => {
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

module.exports = {
  checkBlocked,
  recordFailedAttempt,
  clearFailedAttempts,
  getBlockedIPs,
};
