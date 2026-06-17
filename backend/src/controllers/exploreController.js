// backend/src/controllers/exploreController.js
const Itinerary = require('../models/Itinerary');
const User = require('../models/User');
const logger = require('../utils/logger');

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildSafeTextRegex = (value) => {
  if (!value || typeof value !== 'string') return null;
  const normalized = value.trim().slice(0, 80);
  if (!normalized) return null;
  return new RegExp(escapeRegex(normalized), 'i');
};

const getPublicUserIds = async () => {
  const publicUsers = await User.find({ publicProfile: true }).select('_id').lean();
  return publicUsers.map((user) => user._id);
};

const addLikesCount = (itinerary) => {
  if (!itinerary) return itinerary;

  const plain = typeof itinerary.toObject === 'function' ? itinerary.toObject() : itinerary;
  const likes = Array.isArray(plain.likes) ? plain.likes : [];

  return {
    ...plain,
    likesCount: likes.length,
  };
};

/**
 * GET /api/explore/itineraries
 * Retorna feed de roteiros públicos com paginação e filtros
 */
exports.getPublicItineraries = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const skip = (page - 1) * limit;

    const publicUserIds = await getPublicUserIds();

    // Filtros - apenas roteiros públicos
    const filters = {
      isPublic: true,
      owner: { $in: publicUserIds },
    };

    // Filtro por país
    const countryRegex = buildSafeTextRegex(req.query.country);
    if (countryRegex) {
      filters['destination.country'] = countryRegex;
    }

    // Filtro por cidade
    const cityRegex = buildSafeTextRegex(req.query.city);
    if (cityRegex) {
      filters['destination.city'] = cityRegex;
    }

    // Filtro por nível de orçamento
    if (req.query.budgetLevel) {
      filters['budget.level'] = req.query.budgetLevel;
    }

    // Filtro por duração
    if (req.query.minDuration) {
      filters.duration = { $gte: parseInt(req.query.minDuration) };
    }
    if (req.query.maxDuration) {
      filters.duration = { ...filters.duration, $lte: parseInt(req.query.maxDuration) };
    }

    // Filtro por avaliação
    if (req.query.minRating) {
      filters['rating.score'] = { $gte: parseFloat(req.query.minRating) };
    }

    // Filtro por status (apenas concluídos)
    if (req.query.completed === 'true') {
      filters.status = 'concluido';
    }

    // Busca por texto (título ou destino)
    const searchRegex = buildSafeTextRegex(req.query.search);
    if (searchRegex) {
      filters.$or = [
        { title: searchRegex },
        { 'destination.city': searchRegex },
        { 'destination.country': searchRegex },
      ];
    }

    // Ordenação
    const sortBy = req.query.sortBy || 'createdAt';
    const order = req.query.order === 'asc' ? 1 : -1;
    const sort = { [sortBy]: order };

    // Buscar roteiros e popular owner
    const itineraries = await Itinerary.find(filters)
      .populate('owner', 'name avatar publicProfile')
      .select('-days.activities.bookingLinks -collaborators')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Itinerary.countDocuments(filters);

    // Incrementar visualizações
    if (itineraries.length > 0) {
      const ids = itineraries.map((i) => i._id);
      await Itinerary.updateMany({ _id: { $in: ids } }, { $inc: { views: 1 } });
    }

    const pagination = {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    };

    res.json({
      itineraries: itineraries.map(addLikesCount),
      pagination,
    });
  } catch (error) {
    logger.error('Erro ao buscar roteiros públicos:', error);
    next(error);
  }
};

/**
 * GET /api/explore/featured
 * Retorna roteiros em destaque (mais visualizados/curtidos)
 */
exports.getFeaturedItineraries = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 20);
    const publicUserIds = await getPublicUserIds();

    const itineraries = await Itinerary.find({
      isPublic: true,
      owner: { $in: publicUserIds },
      status: 'concluido',
      'rating.score': { $gte: 4 },
    })
      .populate('owner', 'name avatar publicProfile')
      .select('-days.activities.bookingLinks -collaborators')
      .sort({ views: -1, 'rating.score': -1 })
      .limit(limit);

    res.json(itineraries.map(addLikesCount));
  } catch (error) {
    logger.error('Erro ao buscar roteiros em destaque:', error);
    next(error);
  }
};

/**
 * GET /api/explore/popular-destinations
 * Retorna destinos mais populares
 */
exports.getPopularDestinations = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 20);
    const publicUserIds = await getPublicUserIds();

    const destinations = await Itinerary.aggregate([
      { $match: { isPublic: true, owner: { $in: publicUserIds } } },
      {
        $group: {
          _id: {
            city: '$destination.city',
            country: '$destination.country',
            coverImage: '$destination.coverImage',
          },
          count: { $sum: 1 },
          averageRating: { $avg: '$rating.score' },
          averageBudget: { $avg: '$budget.estimatedTotal' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          city: '$_id.city',
          country: '$_id.country',
          coverImage: '$_id.coverImage',
          itineraryCount: '$count',
          averageRating: { $round: ['$averageRating', 1] },
          averageBudget: { $round: ['$averageBudget', 2] },
        },
      },
    ]);

    res.json(destinations);
  } catch (error) {
    logger.error('Erro ao buscar destinos populares:', error);
    next(error);
  }
};

/**
 * POST /api/explore/like/:id
 * Curtir/descurtir roteiro público
 */
exports.toggleLike = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId.toString();

    const itinerary = await Itinerary.findOne({ _id: id, isPublic: true });
    if (!itinerary) {
      return res.status(404).json({ message: 'Roteiro não encontrado ou não é público' });
    }

    const normalizedLikes = Array.from(
      new Set((itinerary.likes || []).map((likeUserId) => likeUserId.toString()))
    );

    itinerary.likes = normalizedLikes;

    const likedIndex = normalizedLikes.findIndex((likeUserId) => likeUserId === userId);

    if (likedIndex > -1) {
      // Remover todas as ocorrências desse usuário por segurança.
      itinerary.likes = normalizedLikes.filter((likeUserId) => likeUserId !== userId);
    } else {
      // Adicionar like
      itinerary.likes = [...normalizedLikes, userId];
    }

    itinerary.markModified('likes');

    await itinerary.save();

    res.json({
      liked: likedIndex === -1,
      likesCount: (itinerary.likes && itinerary.likes.length) || 0,
    });
  } catch (error) {
    logger.error('Erro ao curtir roteiro:', error);
    next(error);
  }
};

/**
 * POST /api/explore/save/:id
 * Salvar/dessalvar roteiro público na lista do usuário
 */
exports.toggleSave = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const itinerary = await Itinerary.findOne({ _id: id, isPublic: true });
    if (!itinerary) {
      return res.status(404).json({ message: 'Roteiro não encontrado ou não é público' });
    }

    const user = await User.findById(userId);
    if (!user.savedItineraries) user.savedItineraries = [];

    const savedIndex = user.savedItineraries.findIndex(
      (savedItineraryId) => savedItineraryId.toString() === id
    );

    if (savedIndex > -1) {
      // Remover dos salvos
      user.savedItineraries.splice(savedIndex, 1);
    } else {
      // Adicionar aos salvos
      user.savedItineraries.push(id);
    }

    await user.save();

    res.json({
      saved: savedIndex === -1,
      savedCount: user.savedItineraries.length,
    });
  } catch (error) {
    logger.error('Erro ao salvar roteiro:', error);
    next(error);
  }
};

/**
 * GET /api/explore/saved
 * Retorna roteiros salvos pelo usuário
 */
exports.getSavedItineraries = async (req, res, next) => {
  try {
    const userId = req.userId;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const skip = (page - 1) * limit;
    const publicUserIds = await getPublicUserIds();

    const user = await User.findById(userId);
    if (!user.savedItineraries || user.savedItineraries.length === 0) {
      return res.json({
        itineraries: [],
        pagination: { total: 0, page, limit, pages: 0, hasNext: false, hasPrev: false },
      });
    }

    const visibleSavedItineraries = await Itinerary.find({
      _id: { $in: user.savedItineraries },
      isPublic: true,
      owner: { $in: publicUserIds },
    })
      .select('_id')
      .lean();

    const visibleIdSet = new Set(visibleSavedItineraries.map((item) => item._id.toString()));
    const orderedVisibleIds = user.savedItineraries.filter((savedId) =>
      visibleIdSet.has(savedId.toString())
    );

    const total = orderedVisibleIds.length;
    const savedIds = orderedVisibleIds.slice(skip, skip + limit);

    const itineraries = await Itinerary.find({
      _id: { $in: savedIds },
      isPublic: true,
      owner: { $in: publicUserIds },
    })
      .populate('owner', 'name avatar publicProfile')
      .select('-days.activities.bookingLinks -collaborators');

    const pagination = {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    };

    res.json({ itineraries: itineraries.map(addLikesCount), pagination });
  } catch (error) {
    logger.error('Erro ao buscar roteiros salvos:', error);
    next(error);
  }
};
