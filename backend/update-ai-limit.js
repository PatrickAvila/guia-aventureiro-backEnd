// update-ai-limit.js - Atualizar limite de IA para 3
require('dotenv').config();
const mongoose = require('mongoose');
const Subscription = require('./src/models/Subscription');

const updateAILimit = async () => {
  try {
    console.log('🔌 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado ao MongoDB\n');

    // Atualizar todas as subscriptions FREE
    const result = await Subscription.updateMany(
      { plan: 'free' },
      { 
        $set: { 
          'usage.aiGenerations.limit': 3 
        } 
      }
    );

    console.log('✅ Subscriptions FREE atualizadas:', result.modifiedCount);

    // Mostrar subscriptions atualizadas
    const subs = await Subscription.find({ plan: 'free' }).populate('user', 'email');
    
    console.log('\n📋 Subscriptions FREE após atualização:\n');
    subs.forEach((sub, index) => {
      console.log(`${index + 1}. ${sub.user?.email || 'N/A'}`);
      console.log(`   Roteiros: ${sub.usage.itineraries.current}/${sub.usage.itineraries.limit}`);
      console.log(`   IA: ${sub.usage.aiGenerations.current}/${sub.usage.aiGenerations.limit} ✅`);
      console.log();
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Desconectado do MongoDB');
    process.exit(0);
  }
};

updateAILimit();
