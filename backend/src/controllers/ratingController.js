// backend/src/controllers/ratingController.js
const Rating = require('../models/Rating');
const Itinerary = require('../models/Itinerary');
const { checkAndUnlockAchievements } = require('./achievementController');
const logger = require('../utils/logger');

// Criar ou atualizar avaliação
exports.createOrUpdateRating = async (req, res, next) => {
  try {
    const { itineraryId } = req.params;
    const { score, comment, photos, highlights, wouldRecommend, travelDate } = req.body;
    const userId = req.userId;

    // Verificar se o roteiro existe e foi concluído pelo usuário
    const itinerary = await Itinerary.findById(itineraryId);
    if (!itinerary) {
      return res.status(404).json({ message: 'Roteiro não encontrado' });
    }

    // Verificar se o usuário é dono ou colaborador do roteiro
    const isOwner = itinerary.owner.toString() === userId;
    const isCollaborator = itinerary.collaborators && itinerary.collaborators.some(
      collab => collab.user.toString() === userId
    );

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ 
        message: 'Você precisa ter participado deste roteiro para avaliá-lo' 
      });
    }

    // Verificar se já existe uma avaliação
    let rating = await Rating.findOne({ itinerary: itineraryId, user: userId });
    let isNewRating = !rating;

    if (rating) {
      // Atualizar avaliação existente
      rating.score = score;
      rating.comment = comment || rating.comment;
      rating.photos = photos || rating.photos;
      rating.highlights = highlights || rating.highlights;
      rating.wouldRecommend = wouldRecommend !== undefined ? wouldRecommend : rating.wouldRecommend;
      rating.travelDate = travelDate || rating.travelDate;
      await rating.save();
      
      logger.log('Avaliação atualizada:', rating._id);
    } else {
      // Criar nova avaliação
      rating = new Rating({
        itinerary: itineraryId,
        user: userId,
        score,
        comment,
        photos: photos || [],
        highlights: highlights || [],
        wouldRecommend: wouldRecommend !== undefined ? wouldRecommend : true,
        travelDate: travelDate || itinerary.endDate,
      });
      await rating.save();
      
      logger.log('Nova avaliação criada:', rating._id);
    }

    // Atualizar o roteiro com a avaliação (se for o dono)
    if (isOwner) {
      itinerary.rating = {
        score: rating.score,
        comment: rating.comment,
        photos: rating.photos,
        ratedAt: new Date(),
      };
      itinerary.status = 'concluido';
      await itinerary.save();
    }

    await rating.populate('user', 'name email avatar');
    
    // Verificar conquistas (em background)
    checkAndUnlockAchievements(userId).catch(err => 
      logger.error('Erro ao verificar conquistas:', err)
    );
    
    res.status(isNewRating ? 201 : 200).json({
      message: isNewRating ? 'Avaliação criada com sucesso' : 'Avaliação atualizada com sucesso',
      rating,
    });
  } catch (error) {
    logger.error('Erro ao criar/atualizar avaliação:', error);
    next(error);
  }
};

// Obter avaliações de um roteiro
exports.getRatingsByItinerary = async (req, res, next) => {
  try {
    const { itineraryId } = req.params;

    const ratings = await Rating.find({ itinerary: itineraryId })
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 });

    // Calcular estatísticas
    const stats = {
      total: ratings.length,
      average: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      recommendationRate: 0,
    };

    if (ratings.length > 0) {
      const sum = ratings.reduce((acc, r) => acc + r.score, 0);
      stats.average = (sum / ratings.length).toFixed(1);
      
      ratings.forEach(r => {
        stats.distribution[r.score]++;
      });

      const recommendCount = ratings.filter(r => r.wouldRecommend).length;
      stats.recommendationRate = ((recommendCount / ratings.length) * 100).toFixed(0);
    }

    res.json({ ratings, stats });
  } catch (error) {
    logger.error('Erro ao buscar avaliações:', error);
    next(error);
  }
};

// Obter avaliação do usuário para um roteiro específico
exports.getUserRating = async (req, res, next) => {
  try {
    const { itineraryId } = req.params;
    const userId = req.userId;

    const rating = await Rating.findOne({ itinerary: itineraryId, user: userId })
      .populate('user', 'name email avatar');

    if (!rating) {
      return res.status(404).json({ message: 'Você ainda não avaliou este roteiro' });
    }

    res.json({ rating });
  } catch (error) {
    logger.error('Erro ao buscar avaliação do usuário:', error);
    next(error);
  }
};

// Obter todas as avaliações do usuário
exports.getMyRatings = async (req, res, next) => {
  try {
    const userId = req.userId;

    const ratings = await Rating.find({ user: userId })
      .populate('itinerary', 'title destination startDate endDate')
      .sort({ createdAt: -1 });

    res.json({ ratings, total: ratings.length });
  } catch (error) {
    logger.error('Erro ao buscar minhas avaliações:', error);
    next(error);
  }
};

// Deletar avaliação
exports.deleteRating = async (req, res, next) => {
  try {
    const { ratingId } = req.params;
    const userId = req.userId;

    const rating = await Rating.findById(ratingId);
    
    if (!rating) {
      return res.status(404).json({ message: 'Avaliação não encontrada' });
    }

    // Verificar se é o autor da avaliação
    if (rating.user.toString() !== userId) {
      return res.status(403).json({ message: 'Você não pode deletar esta avaliação' });
    }

    await rating.deleteOne();
    
    logger.log('Avaliação deletada:', ratingId);
    res.json({ message: 'Avaliação deletada com sucesso' });
  } catch (error) {
    logger.error('Erro ao deletar avaliação:', error);
    next(error);
  }
};

// Curtir/descurtir avaliação
exports.toggleLike = async (req, res, next) => {
  try {
    const { ratingId } = req.params;
    const userId = req.userId;

    const rating = await Rating.findById(ratingId);
    
    if (!rating) {
      return res.status(404).json({ message: 'Avaliação não encontrada' });
    }

    const likeIndex = rating.likes.indexOf(userId);
    
    if (likeIndex > -1) {
      // Remover like
      rating.likes.splice(likeIndex, 1);
      await rating.save();
      
      return res.json({ 
        message: 'Like removido', 
        liked: false,
        likesCount: (rating.likes && rating.likes.length) || 0
      });
    } else {
      // Adicionar like
      rating.likes.push(userId);
      await rating.save();
      
      return res.json({ 
        message: 'Avaliação curtida', 
        liked: true,
        likesCount: (rating.likes && rating.likes.length) || 0
      });
    }
  } catch (error) {
    logger.error('Erro ao curtir avaliação:', error);
    next(error);
  }
};

// ========== MÉTODOS LEGADOS (MANTER POR COMPATIBILIDADE) ==========

/**
 * @route   POST /api/roteiros/:id/rating
 * @desc    Adicionar avaliação a um roteiro concluído (MÉTODO ANTIGO)
 * @access  Private (apenas o dono)
 */
exports.addRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { score, comment, photos } = req.body;
    const userId = req.userId;

    // Validar score
    if (!score || score < 1 || score > 5) {
      return res.status(400).json({ message: 'Score deve ser entre 1 e 5' });
    }

    // Buscar roteiro
    const itinerary = await Itinerary.findById(id);

    if (!itinerary) {
      return res.status(404).json({ message: 'Roteiro não encontrado' });
    }

    // Verificar se é o dono
    if (itinerary.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Apenas o dono pode avaliar o roteiro' });
    }

    // Verificar se está concluído
    if (itinerary.status !== 'concluido') {
      return res.status(400).json({ 
        message: 'Apenas roteiros concluídos podem ser avaliados' 
      });
    }

    // Adicionar avaliação
    itinerary.rating = {
      score,
      comment: comment || '',
      photos: photos || [],
      ratedAt: new Date(),
    };

    await itinerary.save();

    res.status(200).json({
      message: 'Avaliação adicionada com sucesso',
      rating: itinerary.rating,
    });
  } catch (error) {
    console.error('Erro ao adicionar avaliação:', error);
    res.status(500).json({ message: 'Erro ao adicionar avaliação' });
  }
};

/**
 * @route   PUT /api/roteiros/:id/rating
 * @desc    Atualizar avaliação de um roteiro
 * @access  Private (apenas o dono)
 */
exports.updateRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { score, comment, photos } = req.body;
    const userId = req.userId;

    // Validar score
    if (score && (score < 1 || score > 5)) {
      return res.status(400).json({ message: 'Score deve ser entre 1 e 5' });
    }

    // Buscar roteiro
    const itinerary = await Itinerary.findById(id);

    if (!itinerary) {
      return res.status(404).json({ message: 'Roteiro não encontrado' });
    }

    // Verificar se é o dono
    if (itinerary.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Apenas o dono pode atualizar a avaliação' });
    }

    // Verificar se já tem avaliação
    if (!itinerary.rating || !itinerary.rating.score) {
      return res.status(400).json({ message: 'Roteiro ainda não foi avaliado' });
    }

    // Atualizar avaliação
    if (score) itinerary.rating.score = score;
    if (comment !== undefined) itinerary.rating.comment = comment;
    if (photos) itinerary.rating.photos = photos;
    itinerary.rating.ratedAt = new Date();

    await itinerary.save();

    res.status(200).json({
      message: 'Avaliação atualizada com sucesso',
      rating: itinerary.rating,
    });
  } catch (error) {
    console.error('Erro ao atualizar avaliação:', error);
    res.status(500).json({ message: 'Erro ao atualizar avaliação' });
  }
};

/**
 * @route   DELETE /api/roteiros/:id/rating
 * @desc    Remover avaliação de um roteiro
 * @access  Private (apenas o dono)
 */
exports.deleteRating = async (req, res) => {
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
      return res.status(403).json({ message: 'Apenas o dono pode remover a avaliação' });
    }

    // Remover avaliação
    itinerary.rating = {
      score: null,
      comment: '',
      photos: [],
      ratedAt: null,
    };

    await itinerary.save();

    res.status(200).json({ message: 'Avaliação removida com sucesso' });
  } catch (error) {
    console.error('Erro ao remover avaliação:', error);
    res.status(500).json({ message: 'Erro ao remover avaliação' });
  }
};

/**
 * @route   GET /api/roteiros/rated
 * @desc    Listar roteiros avaliados do usuário
 * @access  Private
 */
exports.getRatedItineraries = async (req, res) => {
  try {
    const userId = req.userId;

    const itineraries = await Itinerary.find({
      owner: userId,
      'rating.score': { $exists: true, $ne: null },
    })
      .select('title destination startDate endDate rating createdAt')
      .sort({ 'rating.ratedAt': -1 });

    res.status(200).json(itineraries);
  } catch (error) {
    console.error('Erro ao buscar roteiros avaliados:', error);
    res.status(500).json({ message: 'Erro ao buscar roteiros avaliados' });
  }
};
