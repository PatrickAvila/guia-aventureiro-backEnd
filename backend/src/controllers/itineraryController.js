// backend/src/controllers/itineraryController.js
const Itinerary = require('../models/Itinerary');
const { generateItinerary } = require('../services/aiService');
const { calculateEstimatedBudget } = require('../services/budgetService');
const { checkAndUnlockAchievements } = require('./achievementController');
const logger = require('../utils/logger');

// Listar roteiros do usuário com paginação
exports.getUserItineraries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || 'updatedAt';
    const order = req.query.order === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;

    const query = {
      $or: [
        { owner: req.userId },
        { 'collaborators.user': req.userId },
      ],
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
    const itinerary = await Itinerary.findById(req.params.id)
      .populate('owner', 'name avatar email')
      .populate('collaborators.user', 'name avatar email');

    if (!itinerary) {
      return res.status(404).json({ message: 'Roteiro não encontrado.' });
    }

    // Verificar permissão
    const isOwner = itinerary.owner._id.toString() === req.userId.toString();
    const isCollaborator = itinerary.collaborators && itinerary.collaborators.some(
      collab => collab.user._id.toString() === req.userId.toString()
    );

    if (!isOwner && !isCollaborator && !itinerary.isPublic) {
      return res.status(403).json({ message: 'Você não tem permissão para acessar este roteiro.' });
    }

    res.json(itinerary);
  } catch (error) {
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

    // Verificar conquistas (em background)
    checkAndUnlockAchievements(req.userId).catch(err => 
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
    console.log('🎨 Gerando novo roteiro com IA...');
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
      days: aiResult.days.map(day => {
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

    console.log('✅ Roteiro salvo com ID:', itinerary._id);

    res.status(201).json({
      message: 'Roteiro gerado com sucesso!',
      itinerary,
    });
  } catch (error) {
    console.error('❌ Erro ao gerar roteiro:', error);
    res.status(500).json({ message: 'Erro ao gerar roteiro.', error: error.message });
  }
};

// Atualizar roteiro
exports.updateItinerary = async (req, res) => {
  try {
    console.log('📝 Atualizando roteiro:', req.params.id);
    console.log('📦 Dados recebidos:', JSON.stringify(req.body, null, 2));

    const itinerary = await Itinerary.findById(req.params.id);

    if (!itinerary) {
      return res.status(404).json({ message: 'Roteiro não encontrado.' });
    }

    // Verificar permissão
    const isOwner = itinerary.owner.toString() === req.userId.toString();
    const collaborator = itinerary.collaborators && itinerary.collaborators.find(
      collab => collab.user.toString() === req.userId.toString()
    );

    if (!isOwner && (!collaborator || collaborator.permission !== 'edit')) {
      return res.status(403).json({ message: 'Você não tem permissão para editar este roteiro.' });
    }

    // Atualizar campos permitidos
    const allowedUpdates = [
      'title', 'destination', 'startDate', 'endDate', 'budget',
      'preferences', 'days', 'status', 'isPublic'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        itinerary[field] = req.body[field];
      }
    });

    itinerary.lastEditedBy = req.userId;
    itinerary.lastEditedAt = new Date();

    await itinerary.save();

    // Verificar conquistas se status mudou para concluído
    if (req.body.status === 'concluido') {
      checkAndUnlockAchievements(itinerary.owner).catch(err => 
        logger.error('Erro ao verificar conquistas:', err)
      );
    }

    console.log('✅ Roteiro atualizado:', itinerary._id);
    console.log('📊 Status novo:', itinerary.status);

    res.json({
      message: 'Roteiro atualizado com sucesso.',
      itinerary,
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar roteiro:', error);
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

    // Apenas o dono pode deletar
    if (itinerary.owner.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Apenas o dono pode deletar este roteiro.' });
    }

    await itinerary.deleteOne();

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

    // Verificar se já é colaborador
    const isAlreadyCollaborator = itinerary.collaborators && itinerary.collaborators.some(
      collab => collab.user.toString() === user._id.toString()
    );

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

    // Apenas o dono pode remover colaboradores
    if (itinerary.owner.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Apenas o dono pode remover colaboradores.' });
    }

    itinerary.collaborators = (itinerary.collaborators || []).filter(
      collab => collab.user.toString() !== collaboratorId
    );

    await itinerary.save();

    res.json({
      message: 'Colaborador removido com sucesso.',
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

    const duplicate = new Itinerary({
      ...original.toObject(),
      _id: undefined,
      owner: req.userId,
      title: `${original.title} (cópia)`,
      collaborators: [],
      status: 'rascunho',
      lastEditedBy: req.userId,
      createdAt: undefined,
      updatedAt: undefined,
    });

    await duplicate.save();

    res.status(201).json({
      message: 'Roteiro duplicado com sucesso.',
      itinerary: duplicate,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao duplicar roteiro.', error: error.message });
  }
};