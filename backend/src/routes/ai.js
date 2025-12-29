// backend/src/routes/ai.js
const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const auth = require('../middleware/auth');

// Rate limit específico para IA (mais restritivo)
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // 10 requests por hora
  message: 'Limite de gerações de IA atingido. Tente novamente em 1 hora.',
});

router.post('/generate', auth, aiLimiter, async (req, res) => {
  res.status(501).json({
    message: 'Use o endpoint /api/roteiros/generate para gerar roteiros com IA.'
  });
});

module.exports = router;