// backend/src/models/Achievement.js
const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: [
      'first_itinerary',        // Primeiro roteiro criado
      'itinerary_master',       // 5 roteiros criados
      'world_traveler',         // 10 roteiros criados
      'first_trip_complete',    // Primeira viagem concluída
      'seasoned_traveler',      // 5 viagens concluídas
      'globe_trotter',          // 10 viagens concluídas
      'budget_conscious',       // Completou viagem dentro do orçamento
      'luxury_traveler',        // Viagem de luxo concluída
      'social_butterfly',       // Compartilhou 5 roteiros
      'collaborator',           // Adicionou primeiro colaborador
      'team_player',            // 5 roteiros com colaboradores
      'photographer',           // Adicionou 50 fotos
      'reviewer',               // Avaliou 5 viagens
      'early_bird',             // Planejou viagem com 3+ meses de antecedência
      'spontaneous',            // Criou roteiro para viagem em menos de 1 semana
      'weekend_warrior',        // 5 viagens de fim de semana (2-3 dias)
      'long_hauler',            // Viagem de 14+ dias
      'multi_destination',      // Roteiro com 3+ destinos
      'budget_keeper',          // 3 viagens dentro do orçamento
      'influencer',             // 100+ visualizações em roteiros públicos
    ],
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  points: {
    type: Number,
    required: true,
    default: 10,
  },
  unlockedAt: {
    type: Date,
    default: Date.now,
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: true,
});

// Index composto para buscar conquistas por usuário
achievementSchema.index({ user: 1, type: 1 }, { unique: true });
achievementSchema.index({ user: 1, unlockedAt: -1 });

// Definição de todas as conquistas possíveis
achievementSchema.statics.ACHIEVEMENTS = {
  first_itinerary: {
    title: 'Primeiro Passo',
    description: 'Criou seu primeiro roteiro de viagem',
    icon: '🎯',
    points: 10,
  },
  itinerary_master: {
    title: 'Planejador Experiente',
    description: 'Criou 5 roteiros de viagem',
    icon: '📋',
    points: 25,
  },
  world_traveler: {
    title: 'Viajante do Mundo',
    description: 'Criou 10 roteiros de viagem',
    icon: '🌍',
    points: 50,
  },
  first_trip_complete: {
    title: 'Primeira Aventura',
    description: 'Completou sua primeira viagem',
    icon: '✈️',
    points: 20,
  },
  seasoned_traveler: {
    title: 'Viajante Experiente',
    description: 'Completou 5 viagens',
    icon: '🎒',
    points: 40,
  },
  globe_trotter: {
    title: 'Desbravador Global',
    description: 'Completou 10 viagens',
    icon: '🏆',
    points: 100,
  },
  budget_conscious: {
    title: 'Economista',
    description: 'Completou uma viagem dentro do orçamento',
    icon: '💰',
    points: 15,
  },
  luxury_traveler: {
    title: 'Viajante de Luxo',
    description: 'Completou uma viagem de luxo',
    icon: '💎',
    points: 30,
  },
  social_butterfly: {
    title: 'Influenciador',
    description: 'Compartilhou 5 roteiros',
    icon: '🦋',
    points: 20,
  },
  collaborator: {
    title: 'Trabalho em Equipe',
    description: 'Adicionou seu primeiro colaborador',
    icon: '🤝',
    points: 15,
  },
  team_player: {
    title: 'Líder de Grupo',
    description: 'Criou 5 roteiros com colaboradores',
    icon: '👥',
    points: 35,
  },
  photographer: {
    title: 'Fotógrafo Viajante',
    description: 'Adicionou 50 fotos aos seus roteiros',
    icon: '📸',
    points: 25,
  },
  reviewer: {
    title: 'Crítico de Viagens',
    description: 'Avaliou 5 viagens',
    icon: '⭐',
    points: 30,
  },
  early_bird: {
    title: 'Planejador Antecipado',
    description: 'Planejou viagem com 3+ meses de antecedência',
    icon: '🐦',
    points: 20,
  },
  spontaneous: {
    title: 'Aventureiro Espontâneo',
    description: 'Criou roteiro para viagem em menos de 1 semana',
    icon: '⚡',
    points: 15,
  },
  weekend_warrior: {
    title: 'Mestre dos Finais de Semana',
    description: 'Completou 5 viagens de fim de semana',
    icon: '🌅',
    points: 25,
  },
  long_hauler: {
    title: 'Viajante de Longa Distância',
    description: 'Completou viagem de 14+ dias',
    icon: '🛫',
    points: 40,
  },
  multi_destination: {
    title: 'Explorador Multi-Destinos',
    description: 'Criou roteiro visitando 3+ cidades',
    icon: '🗺️',
    points: 25,
  },
  budget_keeper: {
    title: 'Guardião do Orçamento',
    description: 'Completou 3 viagens dentro do orçamento',
    icon: '🎯',
    points: 50,
  },
  influencer: {
    title: 'Influenciador de Viagens',
    description: '100+ visualizações em roteiros públicos',
    icon: '🌟',
    points: 75,
  },
};

module.exports = mongoose.model('Achievement', achievementSchema);
