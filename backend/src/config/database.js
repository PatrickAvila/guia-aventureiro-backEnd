const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('🔄 Conectando ao MongoDB...');
    
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI não definida no .env');
    }
    
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000, // Timeout de 30s (aumentado)
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });
    
    mongoose.set('maxTimeMS', 30000);
    
    console.log('✅ MongoDB conectado com sucesso!');
    console.log(`   Database: ${mongoose.connection.db.databaseName}`);
    console.log(`   Host: ${mongoose.connection.host}`);
  } catch (error) {
    console.error('❌ Erro ao conectar MongoDB:', error.message);
    console.error('\n💡 Possíveis soluções:');
    console.error('   1. Verifique se o cluster MongoDB Atlas está ativo');
    console.error('   2. Adicione seu IP na whitelist do Atlas (0.0.0.0/0 para qualquer IP)');
    console.error('   3. Verifique usuário/senha no MONGO_URI (.env)');
    console.error('   4. Ou use MongoDB local: mongod --dbpath ./data\n');
    
    // Não mata o processo em dev, permite continuar
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.warn('⚠️  Servidor rodando SEM banco de dados (modo desenvolvimento)');
    }
  }
};

module.exports = connectDB;