// check-subscription.js - Verificar subscription na coleção separada
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Subscription = require('./src/models/Subscription');

const checkSubscription = async () => {
  try {
    console.log('🔌 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado ao MongoDB\n');

    // Buscar todas as subscriptions
    const subscriptions = await Subscription.find({}).populate('user', 'email');
    
    console.log(`📋 Total de subscriptions: ${subscriptions.length}\n`);
    
    subscriptions.forEach((sub, index) => {
      console.log(`${index + 1}. ${sub.user?.email || 'N/A'}`);
      console.log(`   Plan: ${sub.plan}`);
      console.log(`   Status: ${sub.status}`);
      console.log(`   Roteiros: ${sub.usage.itineraries.current}/${sub.usage.itineraries.limit}`);
      console.log(`   IA: ${sub.usage.aiGenerations.current}/${sub.usage.aiGenerations.limit}`);
      console.log(`   Fotos: ${sub.usage.photos.current}/${sub.usage.photos.limit}\n`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Desconectado do MongoDB');
    process.exit(0);
  }
};

checkSubscription();
