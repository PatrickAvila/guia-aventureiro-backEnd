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
  hasCompletedOnboarding: {
    type: Boolean,
    default: false,
  },
  tooltipsShown: {
    createItinerary: { type: Boolean, default: false },
    useAI: { type: Boolean, default: false },
    budget: { type: Boolean, default: false },
    explore: { type: Boolean, default: false },
    achievements: { type: Boolean, default: false },
  },
  savedItineraries: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Itinerary',
  }],
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'premium'],
      default: 'free',
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'past_due', 'trialing'],
      default: 'active',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: null,
    },
    cancelAt: {
      type: Date,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    trialEndsAt: {
      type: Date,
      default: null,
    },
    currentPeriodStart: {
      type: Date,
      default: null,
    },
    currentPeriodEnd: {
      type: Date,
      default: null,
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'annual'],
      default: null,
    },
    stripeCustomerId: {
      type: String,
      default: null,
    },
    stripeSubscriptionId: {
      type: String,
      default: null,
    },
    usage: {
      itineraries: {
        current: { type: Number, default: 0 },
        limit: { type: Number, default: 3 },
        unlimited: { type: Boolean, default: false },
      },
      aiGenerations: {
        current: { type: Number, default: 0 },
        limit: { type: Number, default: 2 },
        unlimited: { type: Boolean, default: false },
        resetDate: { type: Date, default: null },
      },
      photos: {
        current: { type: Number, default: 0 },
        limit: { type: Number, default: 10 },
        unlimited: { type: Boolean, default: false },
      },
      collaborators: {
        current: { type: Number, default: 0 },
        limit: { type: Number, default: 0 },
        unlimited: { type: Boolean, default: false },
      },
    },
  },
}, {
  timestamps: true,
});

// DESABILITADO: Cascade delete pode causar loop
// Cascade delete: remover dados relacionados quando usuário for deletado
// Para document.deleteOne()
// userSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
//   try {
//     console.log(`🗑️ Deletando dados relacionados ao usuário ${this.email}...`);
// 
//     // Deletar todos os roteiros do usuário
//     try {
//       const Itinerary = mongoose.model('Itinerary');
//       const itinerariesResult = await Itinerary.deleteMany({ owner: this._id });
//       console.log(`   - ${itinerariesResult.deletedCount} roteiros deletados`);
//     } catch (err) {
//       if (err.name !== 'MissingSchemaError') throw err;
//     }
//     
//     // Deletar todas as conquistas do usuário
//     try {
//       const Achievement = mongoose.model('Achievement');
//       const achievementsResult = await Achievement.deleteMany({ user: this._id });
//       console.log(`   - ${achievementsResult.deletedCount} conquistas deletadas`);
//     } catch (err) {
//       if (err.name !== 'MissingSchemaError') throw err;
//     }
//     
//     // Deletar assinatura do usuário
//     try {
//       const Subscription = mongoose.model('Subscription');
//       const subscriptionResult = await Subscription.deleteOne({ user: this._id });
//       console.log(`   - ${subscriptionResult.deletedCount} assinatura deletada`);
//     } catch (err) {
//       if (err.name !== 'MissingSchemaError') throw err;
//     }
// 
//     console.log(`✅ Dados relacionados ao usuário ${this.email} foram removidos`);
//     next();
//   } catch (error) {
//     console.error('Erro ao deletar dados relacionados:', error);
//     next(error);
//   }
// });

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