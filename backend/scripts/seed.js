/**
 * Seed Script - Popula o banco de dados com fixtures
 * Uso: node backend/scripts/seed.js [--clear]
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Carrega variáveis de ambiente
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Importa models
const User = require('../src/models/User');
const Itinerary = require('../src/models/Itinerary');

// Importa fixtures
const { users, itineraries } = require('../src/fixtures');

/**
 * Conecta ao banco de dados
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB conectado');
  } catch (error) {
    console.error('❌ Erro ao conectar MongoDB:', error.message);
    process.exit(1);
  }
};

/**
 * Limpa o banco de dados
 */
const clearDatabase = async () => {
  try {
    await User.deleteMany({});
    await Itinerary.deleteMany({});
    console.log('🗑️  Banco de dados limpo');
  } catch (error) {
    console.error('❌ Erro ao limpar banco:', error.message);
    throw error;
  }
};

/**
 * Popula usuários
 */
const seedUsers = async () => {
  try {
    const createdUsers = await User.insertMany(users.sampleUsers);
    console.log(`✅ ${createdUsers.length} usuários criados`);
    return createdUsers;
  } catch (error) {
    console.error('❌ Erro ao criar usuários:', error.message);
    throw error;
  }
};

/**
 * Popula roteiros
 */
const seedItineraries = async (createdUsers) => {
  try {
    // Distribui roteiros entre os usuários
    const itinerariesWithUsers = itineraries.sampleItineraries.map((itinerary, index) => {
      const userIndex = index % createdUsers.length;
      return {
        ...itinerary,
        userId: createdUsers[userIndex]._id,
        createdAt: new Date(),
      };
    });

    const createdItineraries = await Itinerary.insertMany(itinerariesWithUsers);
    console.log(`✅ ${createdItineraries.length} roteiros criados`);
    return createdItineraries;
  } catch (error) {
    console.error('❌ Erro ao criar roteiros:', error.message);
    throw error;
  }
};

/**
 * Exibe resumo
 */
const displaySummary = (createdUsers, createdItineraries) => {
  console.log('\n📊 RESUMO DO SEED:');
  console.log('━'.repeat(50));
  console.log(`👥 Usuários criados: ${createdUsers.length}`);
  console.log(`📋 Roteiros criados: ${createdItineraries.length}`);
  console.log('━'.repeat(50));
  console.log('\n🔑 CREDENCIAIS DE TESTE:');
  console.log('Senha padrão: Test123!');
  console.log('\nUsuários:');
  createdUsers.forEach((user, index) => {
    console.log(`  ${index + 1}. ${user.email} (${user.assinatura.tipo})`);
  });
  console.log('\n✅ Seed concluído com sucesso!\n');
};

/**
 * Executa o seed
 */
const runSeed = async () => {
  try {
    console.log('🌱 Iniciando seed do banco de dados...\n');

    // Verifica se deve limpar o banco
    const shouldClear = process.argv.includes('--clear');

    await connectDB();

    if (shouldClear) {
      await clearDatabase();
    }

    // Popula dados
    const createdUsers = await seedUsers();
    const createdItineraries = await seedItineraries(createdUsers);

    // Exibe resumo
    displaySummary(createdUsers, createdItineraries);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro durante o seed:', error);
    process.exit(1);
  }
};

// Executa o script
runSeed();
