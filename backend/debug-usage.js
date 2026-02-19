// debug-usage.js - Verificar uso atual do usuário
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Subscription = require('./src/models/Subscription');
const Itinerary = require('./src/models/Itinerary');

const debugUsage = async () => {
  try {
    console.log('🔌 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado ao MongoDB\n');

    // Buscar usuário principal
    const user = await User.findOne({ email: 'patrick_avila99@outlook.com' });
    
    if (!user) {
      console.log('❌ Usuário não encontrado');
      return;
    }

    console.log('👤 Usuário:', user.email, '\n');

    // Buscar subscription
    const subscription = await Subscription.findOne({ user: user._id });
    
    if (!subscription) {
      console.log('❌ Subscription não encontrada');
      return;
    }

    console.log('📦 Subscription:');
    console.log('   Plan:', subscription.plan);
    console.log('   Status:', subscription.status);
    console.log('\n📊 Contadores de Uso:');
    console.log('   Roteiros:', subscription.usage.itineraries.current, '/', subscription.usage.itineraries.limit);
    console.log('   IA:', subscription.usage.aiGenerations.current, '/', subscription.usage.aiGenerations.limit);
    console.log('   Fotos:', subscription.usage.photos.current, '/', subscription.usage.photos.limit);

    // Contar roteiros reais no banco
    const actualCount = await Itinerary.countDocuments({ owner: user._id });
    console.log('\n🗂️  Roteiros REAIS no banco:', actualCount);

    // Listar roteiros
    const itineraries = await Itinerary.find({ owner: user._id });
    console.log('\n📝 Roteiros encontrados:');
    itineraries.forEach((it, index) => {
      console.log(`   ${index + 1}. ${it.title} (${it._id})`);
    });

    // Verificar discrepância
    if (actualCount !== subscription.usage.itineraries.current) {
      console.log('\n⚠️  DISCREPÂNCIA DETECTADA!');
      console.log(`   Contador: ${subscription.usage.itineraries.current}`);
      console.log(`   Real: ${actualCount}`);
      console.log('\n🔧 Corrigindo contador...');
      
      subscription.usage.itineraries.current = actualCount;
      await subscription.save();
      
      console.log('✅ Contador corrigido!');
      console.log(`   Novo valor: ${actualCount}/${subscription.usage.itineraries.limit}`);
    } else {
      console.log('\n✅ Contador está correto!');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Desconectado do MongoDB');
    process.exit(0);
  }
};

debugUsage();
