// backend/src/services/socketService.js
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const Itinerary = require('../models/Itinerary');
const logger = require('../utils/logger');

let io;

// Armazenar usuários conectados por roteiro
const activeConnections = new Map(); // itineraryId -> Set<socketId>

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL
        : '*',
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Middleware de autenticação
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;

      if (!token) {
        return next(new Error('Token não fornecido'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.userEmail = decoded.email;

      logger.log(`Socket conectado: ${socket.id} (User: ${socket.userEmail})`);
      next();
    } catch (error) {
      logger.error('Erro na autenticação do socket:', error.message);
      next(new Error('Token inválido'));
    }
  });

  io.on('connection', (socket) => {
    logger.log(`✅ Cliente conectado: ${socket.id}`);

    // Entrar em uma sala de roteiro
    socket.on('join_itinerary', async (itineraryId) => {
      try {
        // Verificar se usuário tem acesso ao roteiro
        const itinerary = await Itinerary.findById(itineraryId);

        if (!itinerary) {
          socket.emit('error', { message: 'Roteiro não encontrado' });
          return;
        }

        const hasAccess =
          itinerary.owner.toString() === socket.userId.toString() ||
          (itinerary.collaborators || []).some(
            (c) => c.user.toString() === socket.userId.toString()
          );

        if (!hasAccess) {
          socket.emit('error', { message: 'Sem permissão para acessar este roteiro' });
          return;
        }

        // Entrar na sala
        socket.join(`itinerary_${itineraryId}`);
        socket.currentItinerary = itineraryId;

        // Registrar conexão ativa
        if (!activeConnections.has(itineraryId)) {
          activeConnections.set(itineraryId, new Set());
        }
        activeConnections.get(itineraryId).add(socket.id);

        logger.log(`User ${socket.userEmail} entrou no roteiro ${itineraryId}`);

        // Notificar outros usuários
        socket.to(`itinerary_${itineraryId}`).emit('user_joined', {
          userId: socket.userId,
          email: socket.userEmail,
        });

        // Enviar mensagens recentes
        const recentMessages = await Message.getRecentMessages(itineraryId, 50);
        socket.emit('recent_messages', recentMessages);

        // Enviar lista de usuários online
        const onlineCount = activeConnections.get(itineraryId).size;
        io.to(`itinerary_${itineraryId}`).emit('online_count', { count: onlineCount });
      } catch (error) {
        logger.error('Erro ao entrar no roteiro:', error);
        socket.emit('error', { message: 'Erro ao entrar no roteiro' });
      }
    });

    // Enviar mensagem
    socket.on('send_message', async (data) => {
      try {
        const { itineraryId, content, type = 'text', metadata } = data;

        if (!content || !itineraryId) {
          socket.emit('error', { message: 'Conteúdo e itineraryId são obrigatórios' });
          return;
        }

        // Criar mensagem
        const message = new Message({
          itinerary: itineraryId,
          sender: socket.userId,
          content,
          type,
          metadata,
        });

        await message.save();
        await message.populate('sender', 'name email profilePicture');

        // Broadcast para todos na sala
        io.to(`itinerary_${itineraryId}`).emit('new_message', message);

        logger.log(`Mensagem enviada no roteiro ${itineraryId} por ${socket.userEmail}`);
      } catch (error) {
        logger.error('Erro ao enviar mensagem:', error);
        socket.emit('error', { message: 'Erro ao enviar mensagem' });
      }
    });

    // Marcar mensagem como lida
    socket.on('mark_as_read', async (data) => {
      try {
        const { messageId } = data;

        const message = await Message.findById(messageId);
        if (message) {
          await message.markAsRead(socket.userId);
          logger.log(`Mensagem ${messageId} marcada como lida por ${socket.userEmail}`);
        }
      } catch (error) {
        logger.error('Erro ao marcar mensagem como lida:', error);
      }
    });

    // Notificar que está digitando
    socket.on('typing', (data) => {
      const { itineraryId } = data;
      socket.to(`itinerary_${itineraryId}`).emit('user_typing', {
        userId: socket.userId,
        email: socket.userEmail,
      });
    });

    // Parou de digitar
    socket.on('stop_typing', (data) => {
      const { itineraryId } = data;
      socket.to(`itinerary_${itineraryId}`).emit('user_stop_typing', {
        userId: socket.userId,
      });
    });

    // Atualização de atividade em tempo real
    socket.on('activity_updated', (data) => {
      const { itineraryId, activityId, changes } = data;
      socket.to(`itinerary_${itineraryId}`).emit('activity_sync', {
        activityId,
        changes,
        updatedBy: socket.userId,
      });
    });

    // Desconexão
    socket.on('disconnect', () => {
      logger.log(`Cliente desconectado: ${socket.id}`);

      // Remover das conexões ativas
      if (socket.currentItinerary) {
        const connections = activeConnections.get(socket.currentItinerary);
        if (connections) {
          connections.delete(socket.id);

          if (connections.size === 0) {
            activeConnections.delete(socket.currentItinerary);
          } else {
            // Atualizar contagem online
            io.to(`itinerary_${socket.currentItinerary}`).emit('online_count', {
              count: connections.size,
            });
          }
        }

        // Notificar outros usuários
        socket.to(`itinerary_${socket.currentItinerary}`).emit('user_left', {
          userId: socket.userId,
          email: socket.userEmail,
        });
      }
    });

    // Sair do roteiro
    socket.on('leave_itinerary', (itineraryId) => {
      socket.leave(`itinerary_${itineraryId}`);
      
      const connections = activeConnections.get(itineraryId);
      if (connections) {
        connections.delete(socket.id);
      }

      socket.to(`itinerary_${itineraryId}`).emit('user_left', {
        userId: socket.userId,
        email: socket.userEmail,
      });

      logger.log(`User ${socket.userEmail} saiu do roteiro ${itineraryId}`);
    });
  });

  return io;
};

// Função para enviar notificação para usuários específicos
const notifyUsers = (itineraryId, event, data) => {
  if (io) {
    io.to(`itinerary_${itineraryId}`).emit(event, data);
  }
};

module.exports = {
  initializeSocket,
  notifyUsers,
  getIO: () => io,
};
