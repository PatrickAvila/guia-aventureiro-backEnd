// delete-all-itineraries.js - Deletar TODOS os roteiros
require('dotenv').config();
const mongoose = require('mongoose');
const Itinerary = require('./src/models/Itinerary');

const deleteAllItineraries = async () => {
  try {
    console.log('🔌 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado ao MongoDB');

    // Buscar count antes
    const countBefore = await Itinerary.countDocuments();
    console.log(`\n📋 Total de roteiros no banco: ${countBefore}`);

    if (countBefore > 0) {
      // Mostrar os roteiros antes de deletar
      const itineraries = await Itinerary.find({});
      console.log(`\n📝 ${itineraries.length} roteiros encontrados`);

      // Deletar TODOS
      console.log('\n🗑️  Deletando TODOS os roteiros...');
      const result = await Itinerary.deleteMany({});
      console.log(`✅ ${result.deletedCount} roteiros deletados!`);
    } else {
      console.log('✅ Nenhum roteiro para deletar.');
    }

    // Verificar count depois
    const countAfter = await Itinerary.countDocuments();
    console.log(`\n📊 Total de roteiros após deleção: ${countAfter}`);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Desconectado do MongoDB');
    process.exit(0);
  }
};

deleteAllItineraries();
