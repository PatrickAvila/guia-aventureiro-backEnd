// backend/src/controllers/exploreController.js
const Itinerary = require('../models/Itinerary');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * GET /api/explore/itineraries
 * Retorna feed de roteiros públicos com paginação e filtros
 */
exports.getPublicItineraries = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const skip = (page - 1) * limit;

    // Filtros - apenas roteiros públicos
    const filters = { isPublic: true };

    // Filtro por país
    if (req.query.country) {
      filters['destination.country'] = { $regex: req.query.country, $options: 'i' };
    }

    // Filtro por cidade
    if (req.query.city) {
      filters['destination.city'] = { $regex: req.query.city, $options: 'i' };
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
    if (req.query.search) {
      filters.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { 'destination.city': { $regex: req.query.search, $options: 'i' } },
        { 'destination.country': { $regex: req.query.search, $options: 'i' } },
      ];
    }

    // Ordenação
    const sortBy = req.query.sortBy || 'createdAt';
    const order = req.query.order === 'asc' ? 1 : -1;
    const sort = { [sortBy]: order };

    // Buscar roteiros e popular owner
    const allItineraries = await Itinerary.find(filters)
      .populate('owner', 'name avatar publicProfile')
      .select('-days.activities.bookingLinks -collaborators')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Filtrar apenas roteiros de usuários com perfil público
    const itineraries = allItineraries.filter(i => 
      i.owner && i.owner.publicProfile === true
    );

    const total = await Itinerary.countDocuments(filters);

    // Incrementar visualizações
    if (itineraries.length > 0) {
      const ids = itineraries.map(i => i._id);
      await Itinerary.updateMany(
        { _id: { $in: ids } },
        { $inc: { views: 1 } }
      );
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
      itineraries,
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

    const itineraries = await Itinerary.find({
      isPublic: true,
      status: 'concluido',
      'rating.score': { $gte: 4 },
    })
      .populate('owner', 'name avatar publicProfile')
      .select('-days.activities.bookingLinks -collaborators')
      .sort({ views: -1, 'rating.score': -1 })
      .limit(limit);

    res.json(itineraries);
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

    const destinations = await Itinerary.aggregate([
      { $match: { isPublic: true } },
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
    const userId = req.userId;

    const itinerary = await Itinerary.findOne({ _id: id, isPublic: true });
    if (!itinerary) {
      return res.status(404).json({ message: 'Roteiro não encontrado ou não é público' });
    }

    const likedIndex = itinerary.likes?.indexOf(userId) ?? -1;
    
    if (likedIndex > -1) {
      // Remover like
      itinerary.likes.splice(likedIndex, 1);
    } else {
      // Adicionar like
      if (!itinerary.likes) itinerary.likes = [];
      itinerary.likes.push(userId);
    }

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

    const savedIndex = user.savedItineraries.indexOf(id);
    
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

    const user = await User.findById(userId);
    if (!user.savedItineraries || user.savedItineraries.length === 0) {
      return res.json({ itineraries: [], pagination: { total: 0, page, limit, pages: 0, hasNext: false, hasPrev: false } });
    }

    const total = user.savedItineraries.length;
    const savedIds = user.savedItineraries.slice(skip, skip + limit);

    const itineraries = await Itinerary.find({
      _id: { $in: savedIds },
      isPublic: true,
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

    res.json({ itineraries, pagination });
  } catch (error) {
    logger.error('Erro ao buscar roteiros salvos:', error);
    next(error);
  }
};
