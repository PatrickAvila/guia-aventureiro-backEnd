// backend/src/controllers/shareController.js
const Itinerary = require('../models/Itinerary');
const crypto = require('crypto');
const { checkAndUnlockAchievements } = require('./achievementController');
const logger = require('../utils/logger');

/**
 * @route   POST /api/roteiros/:id/share
 * @desc    Gerar link compartilhável para um roteiro
 * @access  Private (apenas o dono)
 */
exports.generateShareLink = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Buscar roteiro
    const itinerary = await Itinerary.findById(id);

    if (!itinerary) {
      return res.status(404).json({ message: 'Roteiro não encontrado' });
    }

    // Verificar se é o dono
    if (itinerary.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Apenas o dono pode gerar link de compartilhamento' });
    }

    // Gerar UUID se não existir
    if (!itinerary.publicLink) {
      itinerary.publicLink = crypto.randomUUID();
      itinerary.isPublic = true;
      await itinerary.save();

      // Verificar conquistas (em background)
      checkAndUnlockAchievements(userId).catch((err) =>
        logger.error('Erro ao verificar conquistas:', err)
      );
    }

    logger.log('Link de compartilhamento gerado:', itinerary.publicLink);

    res.status(200).json({
      shareLink: itinerary.publicLink,
      fullUrl: `https://landing-page-patrickavilas-projects.vercel.app/r/${itinerary.publicLink}`,
    });
  } catch (error) {
    logger.error('Erro ao gerar link:', error);
    res.status(500).json({ message: 'Erro ao gerar link de compartilhamento' });
  }
};

// Copiar roteiro público para a conta do usuário
exports.copySharedItinerary = async (req, res, next) => {
  try {
    const { shareId } = req.params;
    const userId = req.userId;

    const originalItinerary = await Itinerary.findOne({ publicLink: shareId, isPublic: true });

    if (!originalItinerary) {
      return res.status(404).json({ message: 'Roteiro não encontrado ou não está público' });
    }

    // Não permitir copiar próprio roteiro
    if (originalItinerary.owner.toString() === userId.toString()) {
      return res.status(400).json({ message: 'Você não pode copiar seu próprio roteiro' });
    }

    // Criar cópia do roteiro
    const copiedItinerary = new Itinerary({
      owner: userId,
      title: `${originalItinerary.title} (Cópia)`,
      destination: originalItinerary.destination,
      startDate: originalItinerary.startDate,
      endDate: originalItinerary.endDate,
      duration: originalItinerary.duration,
      budget: {
        total: originalItinerary.budget?.total || 0,
        spent: 0,
        remaining: originalItinerary.budget?.total || 0,
        expenses: [], // Lista vazia
      },
      preferences: originalItinerary.preferences,
      days: originalItinerary.days.map((day) => ({
        ...day,
        activities:
          day.activities?.map((activity) => ({
            ...activity,
            completed: false, // Resetar status
          })) || [],
      })),
      status: 'rascunho',
      isPublic: false,
      generatedByAI: false,
    });

    await copiedItinerary.save();

    // Incrementar contadores de uso (conta como criação)
    const Subscription = require('../models/Subscription');
    const subscription = await Subscription.findOne({ userId });

    if (subscription) {
      await subscription.incrementUsage('itineraries');
      await subscription.incrementUsage('aiGenerations');
    }

    logger.log('Roteiro copiado:', copiedItinerary._id);

    res.status(201).json({
      message: 'Roteiro copiado com sucesso',
      itinerary: copiedItinerary,
    });
  } catch (error) {
    logger.error('Erro ao copiar roteiro');
    next(error);
  }
};

/**
 * @route   DELETE /api/roteiros/:id/share
 * @desc    Remover link compartilhável (tornar privado)
 * @access  Private (apenas o dono)
 */
exports.revokeShareLink = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Buscar roteiro
    const itinerary = await Itinerary.findById(id);

    if (!itinerary) {
      return res.status(404).json({ message: 'Roteiro não encontrado' });
    }

    // Verificar se é o dono
    if (itinerary.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Apenas o dono pode revogar o link' });
    }

    // Remover link e tornar privado
    itinerary.publicLink = null;
    itinerary.isPublic = false;
    await itinerary.save();

    res.status(200).json({ message: 'Link removido. Roteiro agora é privado' });
  } catch (error) {
    logger.error('Erro ao revogar link');
    res.status(500).json({ message: 'Erro ao revogar link' });
  }
};

/**
 * @route   GET /api/shared/:shareId
 * @desc    Obter roteiro por link público (sem autenticação)
 * @access  Public
 */
exports.getSharedItinerary = async (req, res) => {
  try {
    const { shareId } = req.params;

    const itinerary = await Itinerary.findOne({ publicLink: shareId, isPublic: true })
      .populate('owner', 'name avatar')
      .lean();

    if (!itinerary) {
      return res.status(404).json({ message: 'Roteiro não encontrado ou não está público' });
    }

    // Remover informações sensíveis para visualização pública
    delete itinerary.collaborators;
    delete itinerary.lastEditedBy;
    delete itinerary.aiPrompt;

    res.status(200).json(itinerary);
  } catch (error) {
    logger.error('Erro ao buscar roteiro compartilhado');
    res.status(500).json({ message: 'Erro ao buscar roteiro' });
  }
};
