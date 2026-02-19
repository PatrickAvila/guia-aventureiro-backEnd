// check-user.js - Verificar dados do usuário no banco
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const checkUser = async () => {
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

    console.log('📋 Dados do usuário:', user.email);
    console.log('\n🔐 Campos de Premium Antigos:');
    console.log('   isPremium:', user.isPremium);
    console.log('   premiumExpiry:', user.premiumExpiry);
    
    console.log('\n📦 Subscription (novo sistema):');
    console.log('   Plan:', user.subscription?.plan || 'N/A');
    console.log('   Status:', user.subscription?.status || 'N/A');
    
    if (user.subscription?.usage) {
      console.log('\n📊 Usage:');
      console.log('   Roteiros:', user.subscription.usage.itineraries?.current || 0, '/', user.subscription.usage.itineraries?.limit || 0);
      console.log('   IA:', user.subscription.usage.aiGenerations?.current || 0, '/', user.subscription.usage.aiGenerations?.limit || 0);
      console.log('   Fotos:', user.subscription.usage.photos?.current || 0, '/', user.subscription.usage.photos?.limit || 0);
    }
    
    console.log('\n📄 Documento completo:');
    console.log(JSON.stringify(user.toObject(), null, 2));
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Desconectado do MongoDB');
    process.exit(0);
  }
};

checkUser();
