// backend/src/models/Subscription.js
const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  plan: {
    type: String,
    enum: ['free', 'premium'],
    default: 'free',
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'expired', 'trial'],
    default: 'active',
  },
  stripeCustomerId: {
    type: String,
  },
  stripeSubscriptionId: {
    type: String,
  },
  stripePriceId: {
    type: String,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'active', 'canceled', 'past_due', 'incomplete'],
    default: 'pending',
  },
  renewsAt: {
    type: Date,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
  },
  trialEndsAt: {
    type: Date,
  },
  cancelledAt: {
    type: Date,
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    default: 'monthly',
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal', 'pix', 'none'],
    default: 'none',
  },
  lastPaymentDate: {
    type: Date,
  },
  nextBillingDate: {
    type: Date,
  },
  // Limites de uso
  usage: {
    itineraries: {
      current: { type: Number, default: 0 }, // roteiros ativos (slots)
      limit: { type: Number, default: 5 }, // Free: 5, Premium: 50
    },
    aiGenerations: {
      current: { type: Number, default: 0 },
      limit: { type: Number, default: 15 }, // Free: 15/mês, Premium: ilimitado
      lastReset: { type: Date, default: Date.now },
    },
    photos: {
      current: { type: Number, default: 0 },
      limit: { type: Number, default: 0 }, // Free: 0 (sem upload), Premium: 20/roteiro
    },
    collaborators: {
      current: { type: Number, default: 0 },
      limit: { type: Number, default: 0 }, // Free: 0, Premium: 0 (futuro)
    },
  },
  // Recursos desbloqueados
  features: {
    offlineMode: { type: Boolean, default: false },
    prioritySupport: { type: Boolean, default: false },
    advancedAnalytics: { type: Boolean, default: false },
    customBranding: { type: Boolean, default: false },
    exportPDF: { type: Boolean, default: false },
    apiAccess: { type: Boolean, default: false },
  },
  // Histórico de mudanças
  history: [{
    plan: String,
    action: String, // 'upgrade', 'downgrade', 'cancelled', 'renewed'
    date: { type: Date, default: Date.now },
    reason: String,
  }],
  metadata: {
    couponCode: String,
    referralSource: String,
    cancelReason: String,
  },
}, {
  timestamps: true,
});

// Índices
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ plan: 1 });
subscriptionSchema.index({ stripeCustomerId: 1 }, { sparse: true });
subscriptionSchema.index({ endDate: 1 });

// Virtual: isActive
subscriptionSchema.virtual('isActive').get(function() {
  if (this.status !== 'active') return false;
  if (this.endDate && this.endDate < new Date()) return false;
  return true;
});

// Virtual: isTrial
subscriptionSchema.virtual('isTrial').get(function() {
  return this.status === 'trial' && this.trialEndsAt && this.trialEndsAt > new Date();
});

// Virtual: daysUntilExpiry
subscriptionSchema.virtual('daysUntilExpiry').get(function() {
  if (!this.endDate) return null;
  const diff = this.endDate - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Métodos
subscriptionSchema.methods.hasFeature = function(featureName) {
  return this.features[featureName] === true;
};

subscriptionSchema.methods.canCreateItinerary = function() {
  // Verifica se há slots disponíveis (ativos)
  if (this.usage.itineraries.current >= this.usage.itineraries.limit) {
    return false;
  }
  
  // Verifica limite de criações mensais
  if (!this.canCreateThisMonth()) {
    return false;
  }
  
  return true;
};

subscriptionSchema.methods.canUseAI = function() {
  // Resetar contador mensal se necessário
  const now = new Date();
  const lastReset = new Date(this.usage.aiGenerations.lastReset);
  const monthsDiff = (now.getFullYear() - lastReset.getFullYear()) * 12 + 
                     (now.getMonth() - lastReset.getMonth());
  
  if (monthsDiff > 0) {
    this.usage.aiGenerations.current = 0;
    this.usage.aiGenerations.lastReset = now;
  }
  
  return this.usage.aiGenerations.current < this.usage.aiGenerations.limit;
};

subscriptionSchema.methods.canUploadPhoto = function() {
  if (this.plan === 'premium') return true;
  return this.usage.photos.current < this.usage.photos.limit;
};

subscriptionSchema.methods.incrementUsage = function(type) {
  console.log(`🔼 incrementUsage chamado para tipo: ${type}`);
  if (this.usage[type]) {
    const oldValue = this.usage[type].current;
    this.usage[type].current += 1;
    this.markModified(`usage.${type}`);
    console.log(`   ${type}.current: ${oldValue} → ${this.usage[type].current}`);
  }
};

subscriptionSchema.methods.decrementUsage = function(type, amount = 1) {
  if (this.usage[type] && this.usage[type].current > 0) {
    this.usage[type].current -= amount;
  }
};

subscriptionSchema.methods.upgrade = function(newPlan) {
  const oldPlan = this.plan;
  this.plan = newPlan;
  this.status = 'active';
  
  // Atualizar limites baseado no novo plano
  this.updateLimitsForPlan(newPlan);
  
  this.history.push({
    plan: oldPlan,
    action: 'upgrade',
    reason: `Upgraded from ${oldPlan} to ${newPlan}`,
  });
};

subscriptionSchema.methods.updateLimitsForPlan = function(plan) {
  const limits = {
    free: {
      itineraries: 5, // 5 roteiros ativos (slots)
      aiGenerations: 15, // 15 criações mensais (manual, duplicação, IA)
      photos: 0, // SEM upload de fotos no plano free
      collaborators: 0,
      features: {
        offlineMode: false,
        prioritySupport: false,
        advancedAnalytics: false,
        customBranding: false,
        exportPDF: false,
        apiAccess: false,
      }
    },
    premium: {
      itineraries: 50, // 50 roteiros ativos (slots)
      aiGenerations: 999999, // Criações ilimitadas
      photos: 20, // 20 fotos por roteiro
      collaborators: 0,
      features: {
        offlineMode: true,
        prioritySupport: true,
        advancedAnalytics: true,
        customBranding: false,
        exportPDF: true,
        apiAccess: false,
      }
    }
  };

  const planLimits = limits[plan];
  if (planLimits) {
    this.usage.itineraries.limit = planLimits.itineraries;
    this.usage.aiGenerations.limit = planLimits.aiGenerations;
    this.usage.photos.limit = planLimits.photos;
    this.usage.collaborators.limit = planLimits.collaborators;
    this.features = planLimits.features;
  }
};

// Middleware: Criar subscription Free ao criar usuário
subscriptionSchema.statics.createFreeSubscription = async function(userId) {
  const subscription = new this({
    user: userId,
    plan: 'free',
    status: 'active',
  });
  
  subscription.updateLimitsForPlan('free');
  await subscription.save();
  return subscription;
};

// Middleware: Expirar assinaturas
subscriptionSchema.statics.expireSubscriptions = async function() {
  const now = new Date();
  
  const expired = await this.updateMany(
    {
      status: 'active',
      endDate: { $lt: now }
    },
    {
      status: 'expired'
    }
  );

  return expired.modifiedCount;
};

subscriptionSchema.set('toJSON', { virtuals: true });
subscriptionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
