// backend/src/controllers/socialShareController.js
const Itinerary = require('../models/Itinerary');
const logger = require('../utils/logger');

/**
 * GET /api/social/share-stats/:id
 * Retorna estatísticas de compartilhamento
 */
exports.getShareStats = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Autenticação necessária' });
    }

    const { id } = req.params;

    const itinerary = await Itinerary.findById(id);

    if (!itinerary) {
      return res.status(404).json({ message: 'Roteiro não encontrado' });
    }

    // Verificar permissão (owner ou colaborador)
    const isOwner = itinerary.owner.toString() === req.user._id.toString();
    const isCollaborator = itinerary.collaborators.some(
      (c) => c.user.toString() === req.user._id.toString()
    );

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ message: 'Sem permissão para ver estatísticas' });
    }

    res.json({
      itineraryId: itinerary._id,
      stats: {
        views: itinerary.views || 0,
        likes: itinerary.likes?.length || 0,
        shares: itinerary.shareCount || 0,
        copies: itinerary.copyCount || 0,
      },
    });
  } catch (error) {
    logger.error('Erro ao buscar estatísticas');
    res.status(500).json({ message: 'Erro ao buscar estatísticas' });
  }
};

/**
 * POST /api/social/track-share/:id
 * Registra um compartilhamento em rede social
 */
exports.trackShare = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Autenticação necessária' });
    }

    const { id } = req.params;
    const { platform } = req.body; // facebook, twitter, instagram, whatsapp, etc

    if (!platform) {
      return res.status(400).json({ message: 'Platform é obrigatório' });
    }

    const itinerary = await Itinerary.findById(id);

    if (!itinerary) {
      return res.status(404).json({ message: 'Roteiro não encontrado' });
    }

    // Verificar se é owner
    if (itinerary.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Apenas o dono pode compartilhar' });
    }

    // Incrementar contador de shares
    itinerary.shareCount = (itinerary.shareCount || 0) + 1;

    // Adicionar ao histórico de shares (se existir o campo)
    if (!itinerary.shareHistory) {
      itinerary.shareHistory = [];
    }

    itinerary.shareHistory.push({
      platform,
      sharedAt: new Date(),
      sharedBy: req.user._id,
    });

    await itinerary.save();

    res.json({
      message: 'Compartilhamento registrado',
      shareCount: itinerary.shareCount,
    });
  } catch (error) {
    logger.error('Erro ao registrar compartilhamento');
    res.status(500).json({ message: 'Erro ao registrar compartilhamento' });
  }
};

/**
 * GET /api/social/meta-tags/:shareId
 * Retorna meta tags para redes sociais (Open Graph, Twitter Cards)
 */
exports.getMetaTags = async (req, res) => {
  try {
    const { shareId } = req.params;

    const itinerary = await Itinerary.findOne({ publicLink: shareId, isPublic: true })
      .populate('owner', 'name avatar')
      .lean();

    if (!itinerary) {
      return res.status(404).json({ message: 'Roteiro não encontrado ou não está público' });
    }

    const fullUrl = `${req.protocol}://${req.get('host')}/shared/${shareId}`;
    const imageUrl = itinerary.destination?.coverImage || itinerary.coverImage || '';

    const metaTags = {
      // Open Graph (Facebook, LinkedIn)
      ogTitle: itinerary.title,
      ogDescription: `Roteiro de ${itinerary.duration} dias em ${itinerary.destination?.city || 'destino incrível'}. Criado por ${itinerary.owner?.name || 'viajante'}`,
      ogImage: imageUrl,
      ogUrl: fullUrl,
      ogType: 'article',
      ogSiteName: 'Guia do Aventureiro',

      // Twitter Cards
      twitterCard: 'summary_large_image',
      twitterTitle: itinerary.title,
      twitterDescription: `Roteiro de ${itinerary.duration} dias em ${itinerary.destination?.city || 'destino incrível'}`,
      twitterImage: imageUrl,

      // WhatsApp preview
      whatsappPreview: {
        title: itinerary.title,
        description: `${itinerary.duration} dias em ${itinerary.destination?.city || 'um destino incrível'}`,
        image: imageUrl,
      },
    };

    res.json(metaTags);
  } catch (error) {
    logger.error('Erro ao buscar meta tags');
    res.status(500).json({ message: 'Erro ao buscar meta tags' });
  }
};

/**
 * POST /api/social/generate-social-links/:id
 * Gera links diretos para compartilhar em redes sociais específicas
 */
exports.generateSocialLinks = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Autenticação necessária' });
    }

    const { id } = req.params;

    const itinerary = await Itinerary.findById(id);

    if (!itinerary) {
      return res.status(404).json({ message: 'Roteiro não encontrado' });
    }

    // Verificar se roteiro está público
    if (!itinerary.isPublic || !itinerary.publicLink) {
      return res.status(400).json({
        message: 'Roteiro precisa estar público para gerar links sociais',
      });
    }

    const shareUrl = `${req.protocol}://${req.get('host')}/shared/${itinerary.publicLink}`;
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(itinerary.title);
    const encodedText = encodeURIComponent(`Confira este roteiro de viagem: ${itinerary.title}`);

    const socialLinks = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      pinterest: itinerary.destination?.coverImage
        ? `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodeURIComponent(itinerary.destination.coverImage)}&description=${encodedTitle}`
        : null,
      email: `mailto:?subject=${encodedTitle}&body=${encodedText}%20${encodedUrl}`,
    };

    res.json({
      shareUrl,
      socialLinks,
    });
  } catch (error) {
    logger.error('Erro ao gerar links sociais');
    res.status(500).json({ message: 'Erro ao gerar links sociais' });
  }
};

/**
 * GET /api/social/top-shared
 * Retorna roteiros mais compartilhados (públicos)
 */
exports.getTopShared = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);

    const topShared = await Itinerary.find({
      isPublic: true,
      shareCount: { $gt: 0 },
    })
      .populate('owner', 'name avatar')
      .select('title destination duration coverImage shareCount views likes')
      .sort({ shareCount: -1, views: -1 })
      .limit(limit)
      .lean();

    res.json(topShared);
  } catch (error) {
    logger.error('Erro ao buscar mais compartilhados');
    res.status(500).json({ message: 'Erro ao buscar roteiros' });
  }
};

/**
 * POST /api/social/increment-view/:shareId
 * Incrementa contador de visualizações (público, sem auth)
 */
exports.incrementView = async (req, res) => {
  try {
    const { shareId } = req.params;

    const itinerary = await Itinerary.findOneAndUpdate(
      { publicLink: shareId, isPublic: true },
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!itinerary) {
      return res.status(404).json({ message: 'Roteiro não encontrado' });
    }

    res.json({ views: itinerary.views || 0 });
  } catch (error) {
    logger.error('Erro ao incrementar visualização');
    res.status(500).json({ message: 'Erro ao atualizar visualização' });
  }
};
