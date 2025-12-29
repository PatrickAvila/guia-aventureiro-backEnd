// backend/src/models/Itinerary.js
const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  time: {
    type: String,
    required: true, // Ex: "09:00"
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  location: {
    name: String,
    address: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  estimatedCost: {
    type: Number,
    default: 0,
  },
  duration: {
    type: Number, // em minutos
    default: 60,
  },
  category: {
    type: String,
    enum: ['transporte', 'alimentacao', 'atracao', 'hospedagem', 'compras', 'outro'],
    default: 'atracao',
  },
  bookingLinks: [{
    platform: String, // 'getyourguide', 'civitatis', 'booking', etc
    url: String,
  }],
  completed: {
    type: Boolean,
    default: false,
  },
}, { _id: true });

const daySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  dayNumber: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    default: 'Dia sem título',
  },
  activities: [activitySchema],
  dailyBudget: {
    type: Number,
    default: 0,
  },
  notes: {
    type: String,
    default: '',
  },
}, { _id: true });

const collaboratorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  permission: {
    type: String,
    enum: ['view', 'edit'],
    default: 'view',
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const itinerarySchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Título é obrigatório'],
    trim: true,
    maxlength: [200, 'Título não pode ter mais de 200 caracteres'],
  },
  destination: {
    city: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    coverImage: {
      type: String,
      default: null,
    },
  },
  startDate: {
    type: Date,
    required: [true, 'Data de início é obrigatória'],
  },
  endDate: {
    type: Date,
    required: [true, 'Data de término é obrigatória'],
  },
  duration: {
    type: Number, // dias
    required: true,
  },
  budget: {
    level: {
      type: String,
      enum: ['economico', 'medio', 'luxo'],
      default: 'medio',
    },
    estimatedTotal: {
      type: Number,
      default: 0,
    },
    spent: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'BRL',
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  expenses: [{
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    category: {
      type: String,
      required: true,
      enum: ['hospedagem', 'alimentacao', 'transporte', 'atracao', 'compras', 'outro'],
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'BRL',
    },
    receipt: {
      type: String, // URL da foto do recibo
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  preferences: {
    interests: [{
      type: String, // 'cultura', 'gastronomia', 'aventura', 'relaxamento', etc
    }],
    travelStyle: {
      type: String,
      enum: ['solo', 'casal', 'familia', 'amigos', 'mochileiro'],
      default: 'solo',
    },
    pace: {
      type: String,
      enum: ['relaxado', 'moderado', 'intenso'],
      default: 'moderado',
    },
  },
  days: [daySchema],
  collaborators: [collaboratorSchema],
  status: {
    type: String,
    enum: ['rascunho', 'planejando', 'confirmado', 'em_andamento', 'concluido'],
    default: 'rascunho',
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  generatedByAI: {
    type: Boolean,
    default: false,
  },
  aiPrompt: {
    type: String,
    default: null,
  },
  rating: {
    score: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    photos: [{
      type: String, // URLs das fotos da viagem
    }],
    ratedAt: {
      type: Date,
    },
  },
  publicLink: {
    type: String,
    unique: true,
    sparse: true, // Permite null, mas garante unicidade quando existe
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  views: {
    type: Number,
    default: 0,
  },
  lastEditedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  lastEditedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Índices
itinerarySchema.index({ owner: 1, createdAt: -1 });
itinerarySchema.index({ isPublic: 1, 'rating.score': -1 });
itinerarySchema.index({ isPublic: 1, views: -1 });
itinerarySchema.index({ 'destination.city': 1 });
itinerarySchema.index({ status: 1 });

// Calcular duração antes de salvar
itinerarySchema.pre('save', function(next) {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    this.duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }
  next();
});

module.exports = mongoose.model('Itinerary', itinerarySchema);