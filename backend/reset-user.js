// reset-user.js - Script para resetar usuário para plano gratuito
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Itinerary = require('./src/models/Itinerary');
const Subscription = require('./src/models/Subscription');

const resetUser = async () => {
  try {
    console.log('🔌 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado ao MongoDB');

    // Buscar todos os usuários (ou especificar email)
    const users = await User.find({});
    console.log(`\n📋 Encontrados ${users.length} usuários\n`);

    // Resetar todos os usuários para free
    for (const user of users) {
      console.log(`🔄 Resetando ${user.email}...`);
      
      // Deletar todos os roteiros do usuário
      const deletedItineraries = await Itinerary.deleteMany({ user: user._id });
      console.log(`   🗑️  Deletados ${deletedItineraries.deletedCount} roteiros`);
      
      // Buscar ou criar subscription na coleção separada
      let subscription = await Subscription.findOne({ user: user._id });
      
      if (!subscription) {
        console.log('   📦 Criando nova subscription...');
        subscription = new Subscription({ user: user._id });
      }
      
      // Resetar para FREE
      subscription.plan = 'free';
      subscription.status = 'active';
      subscription.startDate = new Date();
      subscription.endDate = null;
      subscription.cancelledAt = null;
      subscription.trialEndsAt = null;
      subscription.billingCycle = 'monthly';
      subscription.stripeCustomerId = null;
      subscription.stripeSubscriptionId = null;
      
      // Resetar usage
      subscription.usage = {
        itineraries: { current: 0, limit: 3 },
        aiGenerations: { 
          current: 0, 
          limit: 2,
          lastReset: new Date()
        },
        photos: { current: 0, limit: 10 },
        collaborators: { current: 0, limit: 0 },
      };
      
      // Resetar features (Free não tem features extras)
      subscription.features = {
        offlineMode: false,
        prioritySupport: false,
        advancedAnalytics: false,
        customBranding: false,
        exportPDF: false,
        apiAccess: false,
      };
      
      await subscription.save();
      
      // Remover campos antigos de premium do User
      user.isPremium = false;
      user.premiumExpiry = undefined;
      await user.save();
      
      console.log(`✅ ${user.email} resetado para FREE`);
      console.log(`   Roteiros: 0/3`);
      console.log(`   IA: 0/2`);
      console.log(`   Fotos: 0/10\n`);
    }

    console.log('✅ Todos os usuários foram resetados para o plano FREE!');
    console.log('✅ Todos os roteiros foram deletados!');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Desconectado do MongoDB');
    process.exit(0);
  }
};

resetUser();
