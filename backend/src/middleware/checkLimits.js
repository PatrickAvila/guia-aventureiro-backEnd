// backend/src/middleware/checkLimits.js
const Subscription = require('../models/Subscription');
const Itinerary = require('../models/Itinerary');
const { getPlan } = require('../config/plans');
const logger = require('../utils/logger');

/**
 * Middleware para verificar limites de uso baseado no plano
 */

/**
 * Verificar se pode criar roteiro
 */
exports.canCreateItinerary = async (req, res, next) => {
  try {
    const userId = req.userId;

    let subscription = await Subscription.findOne({ user: userId });

    // Se não tem subscription, criar uma Free
    if (!subscription) {
      subscription = await Subscription.createFreeSubscription(userId);
    }

    // Verificar limite de slots ativos
    if (subscription.usage.itineraries.current >= subscription.usage.itineraries.limit) {
      const plan = getPlan(subscription.plan);
      return res.status(403).json({
        error: 'limit_reached',
        message: `Você atingiu o limite de ${plan.limits.itineraries} roteiros ativos do plano ${plan.name}`,
        currentUsage: subscription.usage.itineraries.current,
        limit: subscription.usage.itineraries.limit,
        plan: subscription.plan,
        upgrade: {
          message: 'Faça upgrade para criar mais roteiros',
          availablePlans: subscription.plan === 'free' ? ['premium'] : [],
        },
      });
    }

    // Verificar limite de criações mensais (aplica a criar, duplicar, gerar com IA)
    if (subscription.plan === 'free' && !subscription.canUseAI()) {
      const nextReset = new Date(subscription.usage.aiGenerations.lastReset);
      nextReset.setMonth(nextReset.getMonth() + 1);

      return res.status(403).json({
        error: 'monthly_limit_reached',
        message: `Você atingiu o limite de ${subscription.usage.aiGenerations.limit} criações de roteiros neste mês`,
        currentUsage: subscription.usage.aiGenerations.current,
        limit: subscription.usage.aiGenerations.limit,
        resetsAt: nextReset,
        plan: subscription.plan,
        upgrade: {
          message: 'Faça upgrade para criar roteiros ilimitados',
          availablePlans: subscription.plan === 'free' ? ['premium'] : [],
        },
      });
    }

    // Adicionar subscription ao request para uso posterior
    req.subscription = subscription;
    console.log(
      `✅ Middleware canCreateItinerary: subscription definida (plan: ${subscription.plan}, slots: ${subscription.usage.itineraries.current}/${subscription.usage.itineraries.limit}, criações: ${subscription.usage.aiGenerations.current}/${subscription.usage.aiGenerations.limit})`
    );
    next();
  } catch (error) {
    logger.error('Erro ao verificar limite de roteiros:', error);
    next(error);
  }
};

/**
 * Verificar se pode usar IA
 */
exports.canUseAI = async (req, res, next) => {
  try {
    const userId = req.userId;

    let subscription = await Subscription.findOne({ user: userId });

    if (!subscription) {
      subscription = await Subscription.createFreeSubscription(userId);
    }

    // Verificar se tem o recurso de IA
    if (subscription.plan === 'free' && !subscription.canUseAI()) {
      return res.status(403).json({
        error: 'limit_reached',
        message: `Você atingiu o limite de ${subscription.usage.aiGenerations.limit} gerações com IA por mês do plano Gratuito`,
        currentUsage: subscription.usage.aiGenerations.current,
        limit: subscription.usage.aiGenerations.limit,
        plan: subscription.plan,
        upgrade: {
          message: 'Faça upgrade para ter criações ilimitadas',
          availablePlans: ['premium'],
        },
      });
    }

    req.subscription = subscription;
    next();
  } catch (error) {
    logger.error('Erro ao verificar limite de IA:', error);
    next(error);
  }
};

/**
 * Verificar se pode fazer upload de foto
 * Verifica limite POR ROTEIRO (não global)
 */
exports.canUploadPhoto = async (req, res, next) => {
  try {
    const userId = req.userId;
    const itineraryId = req.body.itineraryId;

    console.log('🔍 canUploadPhoto - userId:', userId);
    console.log('🔍 canUploadPhoto - itineraryId:', itineraryId);
    console.log('🔍 canUploadPhoto - req.body:', req.body);

    let subscription = await Subscription.findOne({ user: userId });

    if (!subscription) {
      subscription = await Subscription.createFreeSubscription(userId);
    }

    // Plano Free não permite upload de fotos
    if (subscription.plan === 'free') {
      const plan = getPlan(subscription.plan);
      return res.status(403).json({
        error: 'feature_locked',
        message: 'Upload de fotos está disponível apenas para o plano Premium',
        plan: subscription.plan,
        upgrade: {
          message: 'Faça upgrade para fazer upload de fotos',
          availablePlans: ['premium'],
        },
      });
    }

    // Se enviou itineraryId, verificar limite POR ROTEIRO
    if (itineraryId) {
      const itinerary = await Itinerary.findById(itineraryId);

      if (!itinerary) {
        return res.status(404).json({ message: 'Roteiro não encontrado' });
      }

      // Verificar se o usuário é owner do roteiro
      if (itinerary.owner.toString() !== userId.toString()) {
        return res
          .status(403)
          .json({ message: 'Você não tem permissão para adicionar fotos a este roteiro' });
      }

      const currentPhotos = itinerary.rating?.photos?.length || 0;
      const plan = getPlan(subscription.plan);
      const photoLimit = plan.limits.photos; // 20 para Premium

      if (currentPhotos >= photoLimit) {
        return res.status(403).json({
          error: 'limit_reached',
          message: `Este roteiro já atingiu o limite de ${photoLimit} fotos do plano ${plan.name}`,
          currentUsage: currentPhotos,
          limit: photoLimit,
          plan: subscription.plan,
          upgrade: {
            message:
              subscription.plan === 'premium'
                ? 'Você atingiu o limite de fotos do plano Premium'
                : 'Você atingiu o limite máximo de fotos',
            availablePlans: [],
          },
        });
      }

      console.log('✅ canUploadPhoto - req.itinerary setado:', itinerary._id);
      req.itinerary = itinerary; // Passar roteiro para o próximo middleware
    } else {
      console.log('⚠️ canUploadPhoto - Nenhum itineraryId fornecido');
    }

    req.subscription = subscription;
    console.log('✅ canUploadPhoto - Chamando next()');
    next();
  } catch (error) {
    logger.error('Erro ao verificar limite de fotos:', error);
    next(error);
  }
};

/**
 * Verificar se pode adicionar colaborador
 */
exports.canAddCollaborator = async (req, res, next) => {
  try {
    const userId = req.userId;

    let subscription = await Subscription.findOne({ user: userId });

    if (!subscription) {
      subscription = await Subscription.createFreeSubscription(userId);
    }

    // Plano Free não permite colaboradores
    if (subscription.plan === 'free') {
      return res.status(403).json({
        error: 'feature_locked',
        message: 'Colaboradores não estão disponíveis no plano Gratuito',
        plan: subscription.plan,
        upgrade: {
          message: 'Faça upgrade para o Premium para liberar os recursos avançados',
          availablePlans: ['premium'],
        },
      });
    }

    req.subscription = subscription;
    next();
  } catch (error) {
    logger.error('Erro ao verificar limite de colaboradores:', error);
    next(error);
  }
};

/**
 * Verificar se pode compartilhar roteiros publicamente
 */
exports.canShareItinerary = async (req, res, next) => {
  try {
    const userId = req.userId;

    let subscription = await Subscription.findOne({ user: userId });

    if (!subscription) {
      subscription = await Subscription.createFreeSubscription(userId);
    }

    // Plano Free não permite compartilhamento público
    const plan = getPlan(subscription.plan);
    if (!plan.features.publicSharing) {
      return res.status(403).json({
        error: 'feature_locked',
        message: 'Compartilhamento de roteiros não está disponível no plano Gratuito',
        plan: subscription.plan,
        upgrade: {
          message: 'Faça upgrade para o Premium e compartilhe seus roteiros com qualquer pessoa',
          availablePlans: ['premium'],
        },
      });
    }

    req.subscription = subscription;
    next();
  } catch (error) {
    logger.error('Erro ao verificar permissão de compartilhamento:', error);
    next(error);
  }
};

/**
 * Verificar se tem acesso a um recurso premium
 */
exports.requireFeature = (featureName) => {
  return async (req, res, next) => {
    try {
      const userId = req.userId;

      let subscription = await Subscription.findOne({ user: userId });

      if (!subscription) {
        subscription = await Subscription.createFreeSubscription(userId);
      }

      if (!subscription.hasFeature(featureName)) {
        return res.status(403).json({
          error: 'feature_locked',
          message: `O recurso "${featureName}" não está disponível no seu plano`,
          plan: subscription.plan,
          upgrade: {
            message: 'Faça upgrade para acessar este recurso',
            availablePlans: subscription.plan === 'free' ? ['premium'] : [],
          },
        });
      }

      req.subscription = subscription;
      next();
    } catch (error) {
      logger.error(`Erro ao verificar feature ${featureName}:`, error);
      next(error);
    }
  };
};

/**
 * Incrementar uso após ação bem-sucedida
 */
exports.incrementUsage = (type) => {
  return async (req, res, next) => {
    try {
      if (req.subscription) {
        req.subscription.incrementUsage(type);
        await req.subscription.save();
      }
      next();
    } catch (error) {
      logger.error(`Erro ao incrementar uso de ${type}:`, error);
      // Não bloqueia a requisição por erro de contagem
      next();
    }
  };
};

/**
 * Middleware para adicionar informações da subscription ao request
 */
exports.attachSubscription = async (req, res, next) => {
  try {
    const userId = req.userId;

    let subscription = await Subscription.findOne({ user: userId });

    if (!subscription) {
      subscription = await Subscription.createFreeSubscription(userId);
    }

    req.subscription = subscription;
    next();
  } catch (error) {
    logger.error('Erro ao anexar subscription:', error);
    next(error);
  }
};
