// backend/src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
    maxlength: [100, 'Nome não pode ter mais de 100 caracteres'],
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email inválido'],
  },
  password: {
    type: String,
    required: function() {
      return !this.oauthProvider; // Só obrigatório se não for OAuth
    },
    minlength: [6, 'Senha deve ter no mínimo 6 caracteres'],
    select: false, // Não retornar por padrão em queries
  },
  avatar: {
    type: String,
    default: null,
  },
  oauthProvider: {
    type: String,
    enum: ['google', 'apple', null],
    default: null,
  },
  oauthId: {
    type: String,
    default: null,
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
  premiumExpiresAt: {
    type: Date,
    default: null,
  },
  refreshToken: {
    type: String,
    select: false,
  },
  lastLogin: {
    type: Date,
    default: null,
  },
  acceptedTerms: {
    type: Boolean,
    default: false,
    required: [true, 'Usuário deve aceitar os termos'],
  },
  preferences: {
    travelStyle: {
      type: String,
      enum: ['solo', 'casal', 'familia', 'amigos', 'mochileiro'],
      default: null,
    },
    interests: [{
      type: String,
    }],
    budgetLevel: {
      type: String,
      enum: ['economico', 'medio', 'luxo'],
      default: null,
    },
    pace: {
      type: String,
      enum: ['relaxado', 'moderado', 'intenso'],
      default: null,
    },
  },
  publicProfile: {
    type: Boolean,
    default: false,
  },
  savedItineraries: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Itinerary',
  }],
}, {
  timestamps: true,
});

// Hash password antes de salvar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  if (!this.password) return next(); // OAuth users
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar senha
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Método para retornar dados públicos
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.refreshToken;
  delete user.__v;
  return user;
};

module.exports = mongoose.model('User', userSchema);