// backend/src/controllers/itineraryController.js
const Itinerary = require('../models/Itinerary');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
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
    const { id } = req.params;
    
    // Em desenvolvimento, retornar 404 para IDs mockados (cliente usa dados locais)
    if (process.env.NODE_ENV !== 'production' && id.startsWith('mock-')) {
      return res.status(404).json({ 
        message: 'Roteiro mockado - use dados locais no cliente.',
        isMock: true 
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
    const isCollaborator = itinerary.collaborators && itinerary.collaborators.some(
      collab => collab.user && collab.user._id.toString() === req.userId.toString()
    );

    if (!isOwner && !isCollaborator && !itinerary.isPublic) {
      return res.status(403).json({ message: 'Você não tem permissão para acessar este roteiro.' });
    }

    res.json(itinerary);
  } catch (error) {
    console.error('❌ Erro ao buscar roteiro:', error);
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

    // Incrementar contador de roteiros
    if (req.subscription) {
      req.subscription.incrementUsage('itineraries');
      req.subscription.incrementUsage('monthlyCreations');
      await req.subscription.save();
    }

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

    // Incrementar contador de IA
    if (req.subscription) {
      req.subscription.incrementUsage('aiGenerations');
      req.subscription.incrementUsage('itineraries');
      req.subscription.incrementUsage('monthlyCreations');
      await req.subscription.save();
    }

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
    const isOwner = itinerary.owner && itinerary.owner.toString() === req.userId.toString();
    const collaborator = itinerary.collaborators && itinerary.collaborators.find(
      collab => collab.user.toString() === req.userId.toString()
    );

    // Permitir editar se: é owner, colaborador com permissão, OU roteiro público
    if (!isOwner && (!collaborator || collaborator.permission !== 'edit') && !itinerary.isPublic) {
      return res.status(403).json({ message: 'Você não tem permissão para editar este roteiro.' });
    }

    // Atualizar campos permitidos
    const allowedUpdates = [
      'title', 'destination', 'startDate', 'endDate', 'budget',
      'preferences', 'days', 'status', 'isPublic', 'rating'
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

    // Apenas o dono pode deletar (ou roteiro público sem owner)
    const isOwner = itinerary.owner && itinerary.owner.toString() === req.userId.toString();
    const isPublicWithoutOwner = !itinerary.owner && itinerary.isPublic;
    
    if (!isOwner && !isPublicWithoutOwner) {
      return res.status(403).json({ message: 'Apenas o dono pode deletar este roteiro.' });
    }

    await itinerary.deleteOne();

    // Decrementar contadores de uso da subscription
    if (isOwner && req.userId) {
      const subscription = await Subscription.findOne({ user: req.userId });
      if (subscription) {
        // Sempre decrementa o contador de roteiros
        subscription.usage.itineraries.current = Math.max(0, subscription.usage.itineraries.current - 1);
        
        // Se foi gerado com IA, decrementa também o contador de IA
        if (itinerary.generatedByAI) {
          subscription.usage.aiGenerations.current = Math.max(0, subscription.usage.aiGenerations.current - 1);
        }
        
        await subscription.save();
      }
    }

    // Atualizar conquistas após exclusão
    checkAndUnlockAchievements(req.userId).catch(err => {
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
      return res.status(400).json({ message: 'Você não pode adicionar a si mesmo como colaborador.' });
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

    const isOwner = itinerary.owner.toString() === req.userId.toString();
    const isSelfRemoval = collaboratorId === req.userId.toString();

    // Apenas o dono pode remover outros, mas colaborador pode sair (remover a si mesmo)
    if (!isOwner && !isSelfRemoval) {
      return res.status(403).json({ message: 'Você não tem permissão para remover este colaborador.' });
    }

    itinerary.collaborators = (itinerary.collaborators || []).filter(
      collab => collab.user.toString() !== collaboratorId
    );

    await itinerary.save();

    res.json({
      message: isSelfRemoval ? 'Você saiu do roteiro com sucesso.' : 'Colaborador removido com sucesso.',
      itinerary,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao remover colaborador.', error: error.message });
  }
};

// Duplicar roteiro
exports.duplicateItinerary = async (req, res) => {
  try {
    console.log('📋 Duplicando roteiro:', req.params.id);
    const original = await Itinerary.findById(req.params.id);

    if (!original) {
      console.log('❌ Roteiro não encontrado');
      return res.status(404).json({ message: 'Roteiro não encontrado.' });
    }

    console.log('✅ Roteiro original encontrado:', original.title);
    
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

    console.log('💾 Salvando duplicata...');
    await duplicate.save();
    
    // Incrementar contador de roteiros
    if (req.subscription) {
      req.subscription.incrementUsage('itineraries');
      await req.subscription.save();
    }
    
    console.log('✅ Roteiro duplicado com sucesso:', duplicate._id);

    res.status(201).json({
      message: 'Roteiro duplicado com sucesso.',
      itinerary: duplicate,
    });
  } catch (error) {
    console.error('❌ Erro ao duplicar roteiro:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ message: 'Erro ao duplicar roteiro.', error: error.message });
  }
};