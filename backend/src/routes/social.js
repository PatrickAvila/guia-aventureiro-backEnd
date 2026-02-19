// backend/src/routes/social.js
const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');
const socialShareController = require('../controllers/socialShareController');

/**
 * GET /api/social/share-stats/:id
 * Estatísticas de compartilhamento de um roteiro
 */
router.get('/share-stats/:id', optionalAuth, socialShareController.getShareStats);

/**
 * POST /api/social/track-share/:id
 * Registrar compartilhamento em rede social
 */
router.post('/track-share/:id', optionalAuth, socialShareController.trackShare);

/**
 * POST /api/social/generate-social-links/:id
 * Gerar links diretos para redes sociais
 */
router.post('/generate-social-links/:id', optionalAuth, socialShareController.generateSocialLinks);

/**
 * GET /api/social/meta-tags/:shareId
 * Meta tags para preview em redes sociais (público)
 */
router.get('/meta-tags/:shareId', socialShareController.getMetaTags);

/**
 * GET /api/social/top-shared
 * Roteiros mais compartilhados (público)
 */
router.get('/top-shared', socialShareController.getTopShared);

/**
 * POST /api/social/increment-view/:shareId
 * Incrementar contador de visualizações (público)
 */
router.post('/increment-view/:shareId', socialShareController.incrementView);

module.exports = router;
