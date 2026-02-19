// Script para corrigir contadores de uso baseado nos roteiros reais no banco
require('dotenv').config();
const mongoose = require('mongoose');
const Subscription = require('./src/models/Subscription');
const Itinerary = require('./src/models/Itinerary');

async function fixCounters() {
  try {
    console.log('🔌 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado ao MongoDB\n');

    // Buscar todas as subscriptions
    const subscriptions = await Subscription.find();
    
    for (const subscription of subscriptions) {
      // Contar roteiros reais do usuário
      const itineraries = await Itinerary.find({ owner: subscription.user });
      const totalItineraries = itineraries.length;
      const aiGeneratedItineraries = itineraries.filter(i => i.generatedByAI).length;
      
      // Contar roteiros criados este mês
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthlyItineraries = await Itinerary.countDocuments({
        owner: subscription.user,
        createdAt: { $gte: startOfMonth }
      });
      
      // Atualizar contadores
      subscription.usage.itineraries.current = totalItineraries;
      subscription.usage.aiGenerations.current = aiGeneratedItineraries;
      subscription.usage.monthlyCreations.count = monthlyItineraries;
      subscription.usage.monthlyCreations.lastReset = startOfMonth;
      
      await subscription.save();
      
      console.log(`✅ Subscription atualizada:
         Roteiros ativos: ${totalItineraries}
         Com IA: ${aiGeneratedItineraries}
         Criados este mês: ${monthlyItineraries}`);
    }
    
    console.log('\n✅ Contadores corrigidos com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

fixCounters();
