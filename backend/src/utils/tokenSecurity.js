const crypto = require('crypto');

const getRefreshTokenPepper = () => {
  const pepper = process.env.REFRESH_TOKEN_PEPPER || process.env.JWT_REFRESH_SECRET;

  if (!pepper) {
    throw new Error('REFRESH_TOKEN_PEPPER ou JWT_REFRESH_SECRET precisa estar configurado');
  }

  return pepper;
};

const hashRefreshToken = (token) => {
  if (!token || typeof token !== 'string') return null;

  return crypto.createHmac('sha256', getRefreshTokenPepper()).update(token).digest('hex');
};

const timingSafeEqualString = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;

  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
};

const isHexSha256 = (value) => typeof value === 'string' && /^[a-f0-9]{64}$/i.test(value);

const compareRefreshToken = (storedToken, candidateToken) => {
  if (!storedToken || !candidateToken) return false;

  const candidateHash = hashRefreshToken(candidateToken);
  if (!candidateHash) return false;

  // Caminho principal: token armazenado em hash
  if (isHexSha256(storedToken)) {
    return timingSafeEqualString(storedToken.toLowerCase(), candidateHash.toLowerCase());
  }

  // Compatibilidade legada: token em texto puro (será rotacionado no próximo refresh)
  return timingSafeEqualString(String(storedToken), String(candidateToken));
};

module.exports = {
  hashRefreshToken,
  compareRefreshToken,
};
