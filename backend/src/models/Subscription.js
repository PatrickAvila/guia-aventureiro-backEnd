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
    enum: ['free', 'premium', 'pro'],
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
      limit: { type: Number, default: 3 }, // Free: 3, Premium: 50, Pro: ilimitado
    },
    monthlyCreations: {
      count: { type: Number, default: 0 }, // criações neste mês
      limit: { type: Number, default: 10 }, // Free: 10/mês, Premium: ilimitado
      lastReset: { type: Date, default: Date.now },
    },
    aiGenerations: {
      current: { type: Number, default: 0 },
      limit: { type: Number, default: 3 }, // Free: 3/mês, Premium: 50/mês, Pro: ilimitado
      lastReset: { type: Date, default: Date.now },
    },
    photos: {
      current: { type: Number, default: 0 },
      limit: { type: Number, default: 10 }, // Free: 10 total, Premium: 100, Pro: 500
    },
    collaborators: {
      current: { type: Number, default: 0 },
      limit: { type: Number, default: 0 }, // Free: 0, Premium: 5/roteiro, Pro: ilimitado
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
  if (this.plan === 'pro') return true;
  
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
  if (this.plan === 'pro') return true;
  return this.usage.photos.current < this.usage.photos.limit;
};

subscriptionSchema.methods.canCreateThisMonth = function() {
  // Pro e Premium têm criações ilimitadas
  if (this.plan !== 'free') return true;
  
  // Resetar contador mensal se necessário
  const now = new Date();
  const lastReset = new Date(this.usage.monthlyCreations.lastReset);
  const monthsDiff = (now.getFullYear() - lastReset.getFullYear()) * 12 + 
                     (now.getMonth() - lastReset.getMonth());
  
  if (monthsDiff > 0) {
    this.usage.monthlyCreations.count = 0;
    this.usage.monthlyCreations.lastReset = now;
    this.usage.aiGenerations.current = 0;
    this.usage.aiGenerations.lastReset = now;
  }
  
  return this.usage.monthlyCreations.count < this.usage.monthlyCreations.limit;
};

subscriptionSchema.methods.incrementUsage = function(type) {
  if (type === 'monthlyCreations') {
    this.usage.monthlyCreations.count += 1;
  } else if (this.usage[type]) {
    this.usage[type].current += 1;
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
      itineraries: 3,
      aiGenerations: 2,
      photos: 10,
      collaborators: 0,
      monthlyCreations: 10, // Limite de criações mensais
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
      itineraries: 50,
      aiGenerations: 20,
      photos: 100,
      collaborators: 5,
      monthlyCreations: 999999, // Criações ilimitadas
      features: {
        offlineMode: true,
        prioritySupport: true,
        advancedAnalytics: true,
        customBranding: false,
        exportPDF: true,
        apiAccess: false,
      }
    },
    pro: {
      itineraries: 999999,
      aiGenerations: 999999,
      photos: 500,
      collaborators: 999999,
      monthlyCreations: 999999, // Criações ilimitadas
      features: {
        offlineMode: true,
        prioritySupport: true,
        advancedAnalytics: true,
        customBranding: true,
        exportPDF: true,
        apiAccess: true,
      }
    }
  };

  const planLimits = limits[plan];
  if (planLimits) {
    this.usage.itineraries.limit = planLimits.itineraries;
    this.usage.aiGenerations.limit = planLimits.aiGenerations;
    this.usage.photos.limit = planLimits.photos;
    this.usage.collaborators.limit = planLimits.collaborators;
    this.usage.monthlyCreations.limit = planLimits.monthlyCreations;
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
