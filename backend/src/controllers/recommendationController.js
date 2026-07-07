// backend/src/controllers/recommendationController.js
const Itinerary = require('../models/Itinerary');
const User = require('../models/User');
const Rating = require('../models/Rating');
const logger = require('../utils/logger');

/**
 * GET /api/recommendations/destinations
 * Recomenda destinos baseado no histórico do usuário
 */
exports.recommendDestinations = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Autenticação necessária' });
    }

    const limit = Math.min(parseInt(req.query.limit) || 10, 50);

    // Buscar roteiros do usuário
    const userItineraries = await Itinerary.find({ owner: req.user._id })
      .select('destination preferences budget')
      .lean();

    if (userItineraries.length === 0) {
      // Usuário novo: retornar destinos populares
      const popularDestinations = await Itinerary.aggregate([
        { $match: { isPublic: true } },
        {
          $group: {
            _id: {
              city: '$destination.city',
              country: '$destination.country',
              coverImage: '$destination.coverImage',
            },
            count: { $sum: 1 },
            avgRating: { $avg: '$rating.score' },
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
            popularity: '$count',
            avgRating: { $round: ['$avgRating', 1] },
            reason: 'Popular entre viajantes',
          },
        },
      ]);

      return res.json(popularDestinations);
    }

    // Extrair preferências do usuário
    const visitedCities = new Set(userItineraries.map((i) => i.destination?.city).filter(Boolean));
    const visitedCountries = new Set(
      userItineraries.map((i) => i.destination?.country).filter(Boolean)
    );

    // Interesses do usuário (pegar do último roteiro ou mais frequente)
    const userInterests = userItineraries
      .flatMap((i) => i.preferences?.interests || [])
      .filter(Boolean);

    const travelStyle = userItineraries[userItineraries.length - 1]?.preferences?.travelStyle;
    const avgBudgetLevel = userItineraries[0]?.budget?.level; // último ou primeiro

    // Buscar destinos similares
    const recommendations = await Itinerary.aggregate([
      {
        $match: {
          isPublic: true,
          'destination.city': { $nin: Array.from(visitedCities) }, // Não visitar novamente
          $or: [
            { 'preferences.interests': { $in: userInterests } },
            { 'preferences.travelStyle': travelStyle },
            { 'budget.level': avgBudgetLevel },
          ],
        },
      },
      {
        $group: {
          _id: {
            city: '$destination.city',
            country: '$destination.country',
            coverImage: '$destination.coverImage',
          },
          count: { $sum: 1 },
          avgRating: { $avg: '$rating.score' },
          matchingInterests: {
            $push: '$preferences.interests',
          },
        },
      },
      { $sort: { avgRating: -1, count: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          city: '$_id.city',
          country: '$_id.country',
          coverImage: '$_id.coverImage',
          popularity: '$count',
          avgRating: { $round: ['$avgRating', 1] },
          reason: 'Baseado nos seus interesses',
        },
      },
    ]);

    res.json(recommendations);
  } catch (error) {
    logger.error('Erro ao recomendar destinos');
    res.status(500).json({ message: 'Erro ao buscar recomendações' });
  }
};

/**
 * GET /api/recommendations/itineraries
 * Recomenda roteiros similares aos que o usuário gostou
 */
exports.recommendItineraries = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Autenticação necessária' });
    }

    const limit = Math.min(parseInt(req.query.limit) || 10, 50);

    // Buscar roteiros que o usuário curtiu
    const likedItineraries = await Itinerary.find({
      likes: req.user._id,
      isPublic: true,
    })
      .select('destination preferences budget duration')
      .lean();

    // Buscar roteiros altamente avaliados pelo usuário
    const highRatings = await Rating.find({
      user: req.user._id,
      score: { $gte: 4 },
    })
      .populate('itinerary', 'destination preferences budget duration')
      .lean();

    const ratedItineraries = highRatings.map((r) => r.itinerary).filter(Boolean);

    const referenceItineraries = [...likedItineraries, ...ratedItineraries];

    if (referenceItineraries.length === 0) {
      // Retornar roteiros em alta
      const trending = await Itinerary.find({ isPublic: true })
        .sort({ views: -1, 'rating.score': -1 })
        .limit(limit)
        .populate('owner', 'name avatar')
        .select('-days.activities.bookingLinks -collaborators')
        .lean();

      return res.json(trending);
    }

    // Extrair características
    const preferredCountries = referenceItineraries
      .map((i) => i.destination?.country)
      .filter(Boolean);
    const preferredDurations = referenceItineraries.map((i) => i.duration).filter(Boolean);
    const avgDuration = preferredDurations.reduce((a, b) => a + b, 0) / preferredDurations.length;

    const interests = referenceItineraries
      .flatMap((i) => i.preferences?.interests || [])
      .filter(Boolean);

    // Buscar roteiros similares
    const recommendations = await Itinerary.find({
      isPublic: true,
      _id: { $nin: referenceItineraries.map((i) => i._id) },
      $or: [
        { 'destination.country': { $in: preferredCountries } },
        { 'preferences.interests': { $in: interests } },
        { duration: { $gte: avgDuration - 2, $lte: avgDuration + 2 } },
      ],
    })
      .sort({ 'rating.score': -1, views: -1 })
      .limit(limit)
      .populate('owner', 'name avatar')
      .select('-days.activities.bookingLinks -collaborators')
      .lean();

    res.json(recommendations);
  } catch (error) {
    logger.error('Erro ao recomendar roteiros');
    res.status(500).json({ message: 'Erro ao buscar recomendações' });
  }
};

/**
 * GET /api/recommendations/similar/:id
 * Roteiros similares a um roteiro específico
 */
exports.getSimilarItineraries = async (req, res) => {
  try {
    const { id } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 5, 20);

    const itinerary = await Itinerary.findById(id)
      .select('destination preferences budget duration')
      .lean();

    if (!itinerary) {
      return res.status(404).json({ message: 'Roteiro não encontrado' });
    }

    // Buscar roteiros similares
    const similar = await Itinerary.find({
      isPublic: true,
      _id: { $ne: id },
      $or: [
        {
          'destination.city': itinerary.destination?.city,
          'destination.country': itinerary.destination?.country,
        },
        { 'preferences.interests': { $in: itinerary.preferences?.interests || [] } },
        { duration: { $gte: itinerary.duration - 2, $lte: itinerary.duration + 2 } },
        { 'budget.level': itinerary.budget?.level },
      ],
    })
      .sort({ 'rating.score': -1, views: -1 })
      .limit(limit)
      .populate('owner', 'name avatar')
      .select('title destination duration budget rating views likes owner')
      .lean();

    res.json(similar);
  } catch (error) {
    logger.error('Erro ao buscar roteiros similares');
    res.status(500).json({ message: 'Erro ao buscar roteiros similares' });
  }
};

/**
 * GET /api/recommendations/for-you
 * Recomendações personalizadas (mix de destinos + roteiros)
 */
exports.getPersonalizedRecommendations = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Autenticação necessária' });
    }

    // Buscar perfil do usuário
    const user = await User.findById(req.user._id).select('preferences').lean();

    // Buscar roteiros do usuário
    const userItineraries = await Itinerary.find({ owner: req.user._id })
      .select('destination preferences budget')
      .limit(10)
      .lean();

    // Combinar preferências
    const userInterests = user?.preferences?.interests || [];
    const travelStyle = user?.preferences?.travelStyle;
    const budgetLevel = user?.preferences?.budgetLevel;

    const itineraryInterests = userItineraries
      .flatMap((i) => i.preferences?.interests || [])
      .filter(Boolean);

    const allInterests = [...new Set([...userInterests, ...itineraryInterests])];

    // Buscar recomendações mix
    const [destinations, itineraries] = await Promise.all([
      // Top 5 destinos
      Itinerary.aggregate([
        {
          $match: {
            isPublic: true,
            $or: [
              { 'preferences.interests': { $in: allInterests } },
              { 'preferences.travelStyle': travelStyle },
              { 'budget.level': budgetLevel },
            ],
          },
        },
        {
          $group: {
            _id: {
              city: '$destination.city',
              country: '$destination.country',
              coverImage: '$destination.coverImage',
            },
            count: { $sum: 1 },
            avgRating: { $avg: '$rating.score' },
          },
        },
        { $sort: { avgRating: -1, count: -1 } },
        { $limit: 5 },
        {
          $project: {
            _id: 0,
            city: '$_id.city',
            country: '$_id.country',
            coverImage: '$_id.coverImage',
            type: 'destination',
          },
        },
      ]),

      // Top 5 roteiros
      Itinerary.find({
        isPublic: true,
        $or: [
          { 'preferences.interests': { $in: allInterests } },
          { 'preferences.travelStyle': travelStyle },
          { 'budget.level': budgetLevel },
        ],
      })
        .sort({ 'rating.score': -1, views: -1 })
        .limit(5)
        .populate('owner', 'name avatar')
        .select('title destination duration budget rating views')
        .lean()
        .then((items) => items.map((i) => ({ ...i, type: 'itinerary' }))),
    ]);

    // Mesclar e embaralhar
    const recommendations = [...destinations, ...itineraries]
      .sort(() => Math.random() - 0.5)
      .slice(0, 10);

    res.json({
      recommendations,
      based_on: {
        interests: allInterests.slice(0, 3),
        travelStyle,
        budgetLevel,
        totalItineraries: userItineraries.length,
      },
    });
  } catch (error) {
    logger.error('Erro ao buscar recomendações personalizadas');
    res.status(500).json({ message: 'Erro ao buscar recomendações' });
  }
};

/**
 * GET /api/recommendations/trending
 * Roteiros em alta (últimos 7 dias)
 */
exports.getTrendingItineraries = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const trending = await Itinerary.find({
      isPublic: true,
      createdAt: { $gte: sevenDaysAgo },
    })
      .sort({ views: -1, likes: -1, 'rating.score': -1 })
      .limit(limit)
      .populate('owner', 'name avatar')
      .select('title destination duration budget rating views likes createdAt')
      .lean();

    res.json(trending);
  } catch (error) {
    logger.error('Erro ao buscar tendências');
    res.status(500).json({ message: 'Erro ao buscar tendências' });
  }
};
