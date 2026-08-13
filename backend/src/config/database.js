const mongoose = require('mongoose');

const connectDB = async () => {
  console.log('🔄 Conectando ao MongoDB...');

  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI/MONGODB_URI não definida no ambiente');
  }

  // Evita flakes no CI e em startups lentos do banco
  const maxRetries = process.env.NODE_ENV === 'test' || process.env.TEST_MODE === 'true' ? 6 : 3;
  const retryDelayMs = 5000;

  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
      });

      mongoose.set('maxTimeMS', 30000);

      console.log('✅ MongoDB conectado com sucesso!');
      console.log(`   Database: ${mongoose.connection.db.databaseName}`);
      console.log(`   Host: ${mongoose.connection.host}`);
      return;
    } catch (error) {
      lastError = error;
      console.error(
        `❌ Tentativa ${attempt}/${maxRetries} falhou ao conectar MongoDB: ${error.message}`
      );

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
      }
    }
  }

  console.error(
    '❌ Erro ao conectar MongoDB após retries:',
    lastError?.message || 'erro desconhecido'
  );
  console.error('\n💡 Possíveis soluções:');
  console.error('   1. Verifique se o cluster MongoDB Atlas está ativo');
  console.error('   2. Adicione seu IP na whitelist do Atlas (0.0.0.0/0 para qualquer IP)');
  console.error('   3. Verifique usuário/senha no MONGO_URI (.env)');
  console.error('   4. Ou use MongoDB local: mongod --dbpath ./data\n');

  // Não mata o processo em dev/test, permite diagnóstico sem quebrar boot
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  } else {
    console.warn('⚠️  Servidor rodando SEM banco de dados (modo desenvolvimento/teste)');
  }
};

module.exports = connectDB;
