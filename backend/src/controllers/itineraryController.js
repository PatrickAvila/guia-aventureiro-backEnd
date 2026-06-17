// backend/src/controllers/itineraryController.js
const Itinerary = require('../models/Itinerary');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const { generateItinerary } = require('../services/aiService');
const { calculateEstimatedBudget } = require('../services/budgetService');
const { checkAndUnlockAchievements } = require('./achievementController');
const logger = require('../utils/logger');
const cloudinary = require('../config/cloudinary');

/**
 * Alinha os dias do roteiro ao intervalo startDate/endDate.
 * Preserva dados existentes por ordem e completa/fatia conforme necessário.
 */
const syncItineraryDaysWithDateRange = (itinerary) => {
  if (!itinerary?.startDate || !itinerary?.endDate) {
    return;
  }

  const startDate = new Date(itinerary.startDate);
  const endDate = new Date(itinerary.endDate);

  // Trabalhar em UTC para evitar perda de dia por timezone.
  startDate.setUTCHours(0, 0, 0, 0);
  endDate.setUTCHours(0, 0, 0, 0);

  const totalDays = Math.max(
    1,
    Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
  );

  const existingDays = Array.isArray(itinerary.days) ? itinerary.days : [];
  const syncedDays = [];

  for (let i = 0; i < totalDays; i += 1) {
    const existingDay = existingDays[i];
    const currentDate = new Date(startDate);
    currentDate.setUTCDate(startDate.getUTCDate() + i);

    syncedDays.push({
      date: currentDate,
      dayNumber: i + 1,
      title: existingDay?.title || `Dia ${i + 1}`,
      activities: Array.isArray(existingDay?.activities) ? existingDay.activities : [],
      dailyBudget: existingDay?.dailyBudget || 0,
      notes: existingDay?.notes || '',
    });
  }

  itinerary.days = syncedDays;
};

const normalizeActivity = (activity, fallbackActivity = {}) => {
  const source = activity && typeof activity === 'object' ? activity : {};
  const fallback = fallbackActivity && typeof fallbackActivity === 'object' ? fallbackActivity : {};

  return {
    time: source.time || fallback.time || '',
    title: source.title || fallback.title || 'Atividade',
    description: source.description ?? fallback.description ?? '',
    location: source.location || fallback.location,
    estimatedCost:
      source.estimatedCost ?? source.cost ?? fallback.estimatedCost ?? fallback.cost ?? 0,
    duration: Number.isFinite(source.duration)
      ? source.duration
      : Number.isFinite(fallback.duration)
        ? fallback.duration
        : 60,
    category: source.category || fallback.category || 'outro',
    bookingLinks: Array.isArray(source.bookingLinks)
      ? source.bookingLinks
      : Array.isArray(fallback.bookingLinks)
        ? fallback.bookingLinks
        : [],
    completed: source.completed ?? source.isCompleted ?? fallback.completed ?? false,
  };
};

const normalizeIncomingDays = (incomingDays, existingDays, totalDays, startDate) => {
  const safeIncomingDays = Array.isArray(incomingDays) ? incomingDays : [];
  const safeExistingDays = Array.isArray(existingDays) ? existingDays : [];

  const mergedDays = Array.from({ length: totalDays }, (_, index) => {
    const existingDay = safeExistingDays[index] || {};
    const incomingDay = safeIncomingDays[index] || {};
    const currentDate = new Date(startDate);
    currentDate.setUTCDate(startDate.getUTCDate() + index);

    const incomingActivities = Array.isArray(incomingDay.activities)
      ? incomingDay.activities
      : null;
    const existingActivities = Array.isArray(existingDay.activities) ? existingDay.activities : [];

    // Evita perda de conteúdo quando payload chega parcial (ex: só dia 1 e 2 com dados).
    const shouldPreserveExistingActivities =
      incomingActivities !== null && incomingActivities.length === 0;
    const activitiesSource =
      incomingActivities === null || shouldPreserveExistingActivities
        ? existingActivities
        : incomingActivities;

    const normalizedActivities = activitiesSource
      .filter((activity) => activity && typeof activity === 'object')
      .map((activity, actIndex) => normalizeActivity(activity, existingActivities[actIndex]));

    return {
      date: incomingDay.date || existingDay.date || currentDate,
      dayNumber: index + 1,
      title: incomingDay.title || existingDay.title || `Dia ${index + 1}`,
      activities: normalizedActivities,
      dailyBudget: incomingDay.dailyBudget ?? existingDay.dailyBudget ?? 0,
      notes: incomingDay.notes ?? existingDay.notes ?? '',
    };
  });

  return mergedDays;
};

/**
 * Helper: Deletar fotos do Cloudinary
 */
const deletePhotosFromCloudinary = async (photos) => {
  if (!photos || photos.length === 0) return;

  logger.debug(`Deletando ${photos.length} fotos do Cloudinary`);

  for (const photoUrl of photos) {
    try {
      // Extrair public_id da URL do Cloudinary
      // Exemplo: https://res.cloudinary.com/devbhqkyu/image/upload/v1771535866/guia-aventureiro/vpzvqlywn43buo0y4me0.jpg
      const matches = photoUrl.match(/\/guia-aventureiro\/([^/.]+)/);
      if (matches && matches[1]) {
        const publicId = `guia-aventureiro/${matches[1]}`;
        await cloudinary.uploader.destroy(publicId);
        logger.debug(`Foto deletada do Cloudinary: ${publicId}`);
      }
    } catch (error) {
      logger.error(`Erro ao deletar foto do Cloudinary (${photoUrl}):`, error.message);
      // Continua deletando outras fotos mesmo se uma falhar
    }
  }
};

// Listar roteiros do usuário com paginação
exports.getUserItineraries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50; // Aumentado de 10 para 50 para mostrar todos os roteiros Premium
    const sortBy = req.query.sortBy || 'updatedAt';
    const order = req.query.order === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;

    const query = {
      $or: [{ owner: req.userId }, { 'collaborators.user': req.userId }],
    };

    const total = await Itinerary.countDocuments(query);
    const itineraries = await Itinerary.find(query)
      .populate('owner', 'name avatar')
      .populate('collaborators.user', 'name avatar')
      .sort({ [sortBy]: order })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    res.json({
      itineraries,
      pagination: {
        total,
        page,
        limit,
        pages: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });

    logger.log(`Roteiros listados: ${itineraries.length} de ${total}`);
  } catch (error) {
    logger.error('Erro ao buscar roteiros:', error);
    res.status(500).json({ message: 'Erro ao buscar roteiros.', error: error.message });
  }
};

// Buscar roteiro por ID
exports.getItineraryById = async (req, res) => {
  try {
    const { id } = req.params;

    // Em desenvolvimento, retornar 404 para IDs mockados (cliente usa dados locais)
    if (process.env.NODE_ENV !== 'production' && id.startsWith('mock-')) {
      return res.status(404).json({
        message: 'Roteiro mockado - use dados locais no cliente.',
        isMock: true,
      });
    }

    const itinerary = await Itinerary.findById(id)
      .populate('owner', 'name avatar email')
      .populate('collaborators.user', 'name avatar email');

    if (!itinerary) {
      return res.status(404).json({ message: 'Roteiro não encontrado.' });
    }

    // Verificar permissão
    const isOwner = itinerary.owner && itinerary.owner._id.toString() === req.userId.toString();
    const isCollaborator =
      itinerary.collaborators &&
      itinerary.collaborators.some(
        (collab) => collab.user && collab.user._id.toString() === req.userId.toString()
      );

    if (!isOwner && !isCollaborator && !itinerary.isPublic) {
      return res.status(403).json({ message: 'Você não tem permissão para acessar este roteiro.' });
    }

    res.json(itinerary);
  } catch (error) {
    logger.error('Erro ao buscar roteiro:', error);
    res.status(500).json({ message: 'Erro ao buscar roteiro.', error: error.message });
  }
};

// Criar roteiro manualmente
exports.createItinerary = async (req, res) => {
  try {
    const itinerary = new Itinerary({
      ...req.body,
      owner: req.userId,
      lastEditedBy: req.userId,
    });

    await itinerary.save();

    // Incrementar contadores (slots + criações mensais)
    if (req.subscription) {
      req.subscription.incrementUsage('itineraries');
      req.subscription.incrementUsage('aiGenerations');
      await req.subscription.save();
    }

    // Verificar conquistas (em background)
    checkAndUnlockAchievements(req.userId).catch((err) =>
      logger.error('Erro ao verificar conquistas:', err)
    );

    res.status(201).json({
      message: 'Roteiro criado com sucesso.',
      itinerary,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar roteiro.', error: error.message });
  }
};

// Gerar roteiro com IA
exports.generateItineraryWithAI = async (req, res) => {
  try {
    logger.info('Gerando novo roteiro com IA...');
    const { destination, startDate, endDate, budget, preferences } = req.body;

    // Validações
    if (!destination?.city || !destination?.country || !startDate || !endDate) {
      return res.status(400).json({ message: 'Campos obrigatórios faltando.' });
    }

    // Gerar com IA
    const aiResult = await generateItinerary({
      destination,
      startDate,
      endDate,
      budget: budget || { level: 'medio', currency: 'BRL' },
      preferences: preferences || { interests: [], travelStyle: 'solo', pace: 'moderado' },
    });

    // Calcular duração
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Calcular orçamento estimado
    const budgetEstimate = calculateEstimatedBudget(
      aiResult.days,
      budget?.level || 'medio',
      destination
    );

    // Criar roteiro
    const itinerary = new Itinerary({
      owner: req.userId,
      title: `Viagem para ${destination.city}`,
      destination,
      startDate,
      endDate,
      duration, // ← ADICIONADO
      budget: {
        level: budget?.level || 'medio',
        estimatedTotal: budgetEstimate.estimatedTotal,
        currency: budget?.currency || 'BRL',
      },
      preferences: preferences || {},
      days: aiResult.days.map((day) => {
        const dayDate = new Date(startDate);
        dayDate.setDate(dayDate.getDate() + (day.dayNumber - 1));
        return {
          ...day,
          date: dayDate,
        };
      }),
      generatedByAI: true,
      aiPrompt: JSON.stringify(req.body),
      lastEditedBy: req.userId,
    });

    await itinerary.save();

    // Incrementar contador de IA
    if (req.subscription) {
      req.subscription.incrementUsage('aiGenerations');
      req.subscription.incrementUsage('itineraries');
      await req.subscription.save();
    }

    logger.info(`Roteiro gerado e salvo com sucesso: ${itinerary._id}`);

    res.status(201).json({
      message: 'Roteiro gerado com sucesso!',
      itinerary,
    });
  } catch (error) {
    logger.error('Erro ao gerar roteiro com IA:', error);
    const errorResponse = { message: 'Erro ao gerar roteiro.' };

    if (process.env.NODE_ENV !== 'production') {
      errorResponse.error = error.message;
    }

    res.status(500).json(errorResponse);
  }
};

// Atualizar roteiro
exports.updateItinerary = async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);

    if (!itinerary) {
      return res.status(404).json({ message: 'Roteiro não encontrado.' });
    }

    // Verificar permissão
    const isOwner = itinerary.owner && itinerary.owner.toString() === req.userId.toString();
    const collaborator =
      itinerary.collaborators &&
      itinerary.collaborators.find((collab) => collab.user.toString() === req.userId.toString());

    // Permitir editar se: é owner, colaborador com permissão, OU roteiro público
    if (!isOwner && (!collaborator || collaborator.permission !== 'edit') && !itinerary.isPublic) {
      return res.status(403).json({ message: 'Você não tem permissão para editar este roteiro.' });
    }

    // Atualizar campos permitidos
    const allowedUpdates = [
      'title',
      'destination',
      'startDate',
      'endDate',
      'budget',
      'preferences',
      'status',
      'isPublic',
      'rating',
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        itinerary[field] = req.body[field];
      }
    });

    // Se as datas mudaram e dias não foram enviados explicitamente,
    // recalcula a grade de dias para refletir o novo período.
    const dateWasUpdated = req.body.startDate !== undefined || req.body.endDate !== undefined;
    const daysWereProvided = req.body.days !== undefined;
    if (daysWereProvided) {
      const startDate = new Date(itinerary.startDate);
      const endDate = new Date(itinerary.endDate);
      startDate.setUTCHours(0, 0, 0, 0);
      endDate.setUTCHours(0, 0, 0, 0);

      const totalDays = Math.max(
        1,
        Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
      );

      itinerary.days = normalizeIncomingDays(req.body.days, itinerary.days, totalDays, startDate);
    } else if (dateWasUpdated && !daysWereProvided) {
      syncItineraryDaysWithDateRange(itinerary);
    }

    itinerary.lastEditedBy = req.userId;
    itinerary.lastEditedAt = new Date();

    await itinerary.save();

    // Verificar conquistas se status mudou para concluído
    if (req.body.status === 'concluido') {
      checkAndUnlockAchievements(itinerary.owner).catch((err) =>
        logger.error('Erro ao verificar conquistas:', err)
      );
    }

    logger.debug(`Roteiro atualizado: ${itinerary._id} (${itinerary.status})`);

    res.json({
      message: 'Roteiro atualizado com sucesso.',
      itinerary,
    });
  } catch (error) {
    logger.error('Erro ao atualizar roteiro:', error);
    res.status(500).json({ message: 'Erro ao atualizar roteiro.', error: error.message });
  }
};

// Deletar roteiro
exports.deleteItinerary = async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);

    if (!itinerary) {
      return res.status(404).json({ message: 'Roteiro não encontrado.' });
    }

    // Apenas o dono pode deletar (ou roteiro público sem owner)
    const isOwner = itinerary.owner && itinerary.owner.toString() === req.userId.toString();
    const isPublicWithoutOwner = !itinerary.owner && itinerary.isPublic;

    if (!isOwner && !isPublicWithoutOwner) {
      return res.status(403).json({ message: 'Apenas o dono pode deletar este roteiro.' });
    }

    // Deletar fotos do Cloudinary antes de deletar roteiro
    if (itinerary.rating?.photos && itinerary.rating.photos.length > 0) {
      await deletePhotosFromCloudinary(itinerary.rating.photos);
    }

    await itinerary.deleteOne();

    // Decrementar contadores de uso da subscription
    if (isOwner && req.userId) {
      const subscription = await Subscription.findOne({ user: req.userId });
      if (subscription) {
        // Sempre decrementa o contador de roteiros
        subscription.usage.itineraries.current = Math.max(
          0,
          subscription.usage.itineraries.current - 1
        );

        // Se foi gerado com IA, decrementa também o contador de IA
        if (itinerary.generatedByAI) {
          subscription.usage.aiGenerations.current = Math.max(
            0,
            subscription.usage.aiGenerations.current - 1
          );
        }

        await subscription.save();
      }
    }

    // Atualizar conquistas após exclusão
    checkAndUnlockAchievements(req.userId).catch((err) => {
      if (typeof logger !== 'undefined') logger.error('Erro ao verificar conquistas:', err);
    });

    res.json({ message: 'Roteiro excluído com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao excluir roteiro.', error: error.message });
  }
};

// Adicionar colaborador
exports.addCollaborator = async (req, res) => {
  try {
    const { email, permission } = req.body;
    const itinerary = await Itinerary.findById(req.params.id);

    if (!itinerary) {
      return res.status(404).json({ message: 'Roteiro não encontrado.' });
    }

    // Apenas o dono pode adicionar colaboradores
    if (itinerary.owner.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Apenas o dono pode adicionar colaboradores.' });
    }

    // Buscar usuário por email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // Verificar se o usuário é o próprio dono
    if (user._id.toString() === itinerary.owner.toString()) {
      return res
        .status(400)
        .json({ message: 'Você não pode adicionar a si mesmo como colaborador.' });
    }

    // Verificar se já é colaborador
    const isAlreadyCollaborator =
      itinerary.collaborators &&
      itinerary.collaborators.some((collab) => collab.user.toString() === user._id.toString());

    if (isAlreadyCollaborator) {
      return res.status(400).json({ message: 'Usuário já é colaborador deste roteiro.' });
    }

    // Adicionar colaborador
    itinerary.collaborators.push({
      user: user._id,
      permission: permission || 'view',
    });

    await itinerary.save();

    res.json({
      message: `${user.name} foi adicionado como colaborador.`,
      itinerary,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao adicionar colaborador.', error: error.message });
  }
};

// Remover colaborador
exports.removeCollaborator = async (req, res) => {
  try {
    const { collaboratorId } = req.params;
    const itinerary = await Itinerary.findById(req.params.id);

    if (!itinerary) {
      return res.status(404).json({ message: 'Roteiro não encontrado.' });
    }

    const isOwner = itinerary.owner.toString() === req.userId.toString();
    const isSelfRemoval = collaboratorId === req.userId.toString();

    // Apenas o dono pode remover outros, mas colaborador pode sair (remover a si mesmo)
    if (!isOwner && !isSelfRemoval) {
      return res
        .status(403)
        .json({ message: 'Você não tem permissão para remover este colaborador.' });
    }

    itinerary.collaborators = (itinerary.collaborators || []).filter(
      (collab) => collab.user.toString() !== collaboratorId
    );

    await itinerary.save();

    res.json({
      message: isSelfRemoval
        ? 'Você saiu do roteiro com sucesso.'
        : 'Colaborador removido com sucesso.',
      itinerary,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao remover colaborador.', error: error.message });
  }
};

// Duplicar roteiro
exports.duplicateItinerary = async (req, res) => {
  try {
    const original = await Itinerary.findById(req.params.id);

    if (!original) {
      return res.status(404).json({ message: 'Roteiro não encontrado.' });
    }

    const duplicateData = original.toObject();

    // Remover campos que não devem ser duplicados
    delete duplicateData._id;
    delete duplicateData.createdAt;
    delete duplicateData.updatedAt;
    delete duplicateData.__v;
    delete duplicateData.publicLink; // Campo único
    delete duplicateData.rating; // Não duplicar avaliação

    const duplicate = new Itinerary({
      ...duplicateData,
      owner: req.userId,
      title: `${original.title} (cópia)`,
      collaborators: [],
      status: 'rascunho',
      isPublic: false,
      lastEditedBy: req.userId,
    });

    await duplicate.save();

    // Incrementar contadores (slots ativos + criações mensais)
    if (req.subscription) {
      req.subscription.incrementUsage('itineraries');
      req.subscription.incrementUsage('aiGenerations');

      await req.subscription.save();
    } else {
      logger.warn('req.subscription não definido durante duplicação de roteiro');
    }

    logger.debug(`Roteiro duplicado com sucesso: ${duplicate._id}`);

    res.status(201).json({
      message: 'Roteiro duplicado com sucesso.',
      itinerary: duplicate,
    });
  } catch (error) {
    logger.error('Erro ao duplicar roteiro:', error);
    res.status(500).json({ message: 'Erro ao duplicar roteiro.', error: error.message });
  }
};
