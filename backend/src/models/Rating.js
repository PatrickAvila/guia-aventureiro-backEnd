// backend/src/models/Rating.js
const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  itinerary: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Itinerary',
    required: true,
    index: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  score: {
    type: Number,
    required: [true, 'Pontuação é obrigatória'],
    min: [1, 'Pontuação mínima é 1'],
    max: [5, 'Pontuação máxima é 5'],
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [1000, 'Comentário não pode ter mais de 1000 caracteres'],
  },
  photos: [{
    type: String, // URLs das fotos da viagem
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'URL da foto inválida',
    },
  }],
  highlights: [{
    type: String,
    enum: ['acomodacao', 'gastronomia', 'atracao', 'transporte', 'custo_beneficio', 'organizacao'],
  }],
  wouldRecommend: {
    type: Boolean,
    default: true,
  },
  travelDate: {
    type: Date,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true,
});

// Índices compostos
ratingSchema.index({ itinerary: 1, user: 1 }, { unique: true }); // Um usuário só pode avaliar um roteiro uma vez
ratingSchema.index({ user: 1, createdAt: -1 });
ratingSchema.index({ score: -1 });

// Virtual para contar likes
ratingSchema.virtual('likesCount').get(function() {
  return this.likes.length;
});

// Garantir que virtuals sejam incluídos ao converter para JSON
ratingSchema.set('toJSON', { virtuals: true });
ratingSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Rating', ratingSchema);
