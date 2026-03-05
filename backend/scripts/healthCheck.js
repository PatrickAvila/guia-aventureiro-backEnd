/**
 * Health Check Script - Verifica status dos serviços
 * Uso: node backend/scripts/healthCheck.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const axios = require('axios');
const cloudinary = require('cloudinary').v2;
const Stripe = require('stripe');

// Carrega variáveis de ambiente
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Inicializa Stripe e Cloudinary
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Verifica MongoDB
 */
const checkMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB: OK');
    await mongoose.disconnect();
    return true;
  } catch (error) {
    console.error('❌ MongoDB: FALHOU', error.message);
    return false;
  }
};

/**
 * Verifica API Backend (se estiver rodando)
 */
const checkBackendAPI = async () => {
  try {
    const port = process.env.PORT || 5000;
    const response = await axios.get(`http://localhost:${port}/health`, {
      timeout: 5000,
    });

    if (response.status === 200) {
      console.log('✅ Backend API: OK');
      return true;
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('⚠️  Backend API: Não está rodando');
    } else {
      console.error('❌ Backend API: FALHOU', error.message);
    }
    return false;
  }
};

/**
 * Verifica Cloudinary
 */
const checkCloudinary = async () => {
  try {
    const result = await cloudinary.api.ping();
    if (result.status === 'ok') {
      console.log('✅ Cloudinary: OK');
      return true;
    }
  } catch (error) {
    console.error('❌ Cloudinary: FALHOU', error.message);
    return false;
  }
};

/**
 * Verifica Stripe
 */
const checkStripe = async () => {
  try {
    // Tenta listar produtos (apenas 1 para testar)
    await stripe.products.list({ limit: 1 });
    console.log('✅ Stripe: OK');
    return true;
  } catch (error) {
    console.error('❌ Stripe: FALHOU', error.message);
    return false;
  }
};

/**
 * Verifica variáveis de ambiente
 */
const checkEnvVariables = () => {
  const requiredVars = [
    'MONGO_URI',
    'JWT_SECRET',
    'STRIPE_SECRET_KEY',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);

  if (missing.length === 0) {
    console.log('✅ Variáveis de Ambiente: OK');
    return true;
  } else {
    console.error('❌ Variáveis de Ambiente: FALTANDO', missing.join(', '));
    return false;
  }
};

/**
 * Executa health check
 */
const runHealthCheck = async () => {
  console.log('🏥 Iniciando Health Check...\n');
  console.log('━'.repeat(50));

  const results = {
    env: checkEnvVariables(),
    mongodb: await checkMongoDB(),
    backend: await checkBackendAPI(),
    cloudinary: await checkCloudinary(),
    stripe: await checkStripe(),
  };

  console.log('━'.repeat(50));

  const allHealthy = Object.values(results).every(status => status === true);

  if (allHealthy) {
    console.log('\n✅ Todos os serviços estão funcionando!\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  Alguns serviços apresentaram problemas\n');
    process.exit(1);
  }
};

// Executa o script
runHealthCheck();
