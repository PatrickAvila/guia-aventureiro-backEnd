// backend/src/services/aiService.js
const Groq = require('groq-sdk');

// Inicializar Groq (IA principal - Fase 1 e 2)
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Fallback mock caso Groq falhe
const generateMockItinerary = ({ destination, startDate, endDate }) => {
  const diffTime = Math.abs(new Date(endDate) - new Date(startDate));
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  const mockDays = [];
  
  for (let i = 1; i <= days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + (i - 1));
    
    mockDays.push({
      dayNumber: i,
      title: `Explorando ${destination.city} - Dia ${i}`,
      activities: [
        {
          time: '09:00',
          title: 'Café da manhã local',
          description: `Experimente a culinária típica de ${destination.city}`,
          location: {
            name: 'Café Central',
            address: `Centro de ${destination.city}`,
            coordinates: { lat: -23.550520, lng: -46.633308 },
          },
          estimatedCost: 30,
          duration: 60,
          category: 'alimentacao',
        },
        {
          time: '10:30',
          title: 'Visita ao centro histórico',
          description: `Conheça os principais pontos turísticos de ${destination.city}`,
          location: {
            name: 'Centro Histórico',
            address: `Centro de ${destination.city}`,
            coordinates: { lat: -23.551520, lng: -46.634308 },
          },
          estimatedCost: 50,
          duration: 180,
          category: 'atracao',
        },
        {
          time: '14:00',
          title: 'Almoço em restaurante típico',
          description: 'Saboreie pratos tradicionais da região',
          location: {
            name: 'Restaurante Tradicional',
            address: `Centro de ${destination.city}`,
            coordinates: { lat: -23.552520, lng: -46.635308 },
          },
          estimatedCost: 80,
          duration: 90,
          category: 'alimentacao',
        },
        {
          time: '16:00',
          title: 'Compras e souvenirs',
          description: 'Visite mercados locais e lojas de artesanato',
          location: {
            name: 'Mercado Municipal',
            address: `Centro de ${destination.city}`,
            coordinates: { lat: -23.553520, lng: -46.636308 },
          },
          estimatedCost: 100,
          duration: 120,
          category: 'compras',
        },
        {
          time: '19:00',
          title: 'Jantar com vista',
          description: 'Encerre o dia com um jantar especial',
          location: {
            name: 'Restaurante Panorâmico',
            address: `Centro de ${destination.city}`,
            coordinates: { lat: -23.554520, lng: -46.637308 },
          },
          estimatedCost: 120,
          duration: 120,
          category: 'alimentacao',
        },
      ],
    });
  }

  return { days: mockDays };
};

const generateItinerary = async ({ destination, startDate, endDate, budget, preferences }) => {
  try {
    // Verificar se tem API key configurada
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
      logger.warn('⚠️  GROQ_API_KEY não configurada. Usando MOCK temporário.');
      logger.info('📝 Configure sua chave em: https://console.groq.com/keys');
      return generateMockItinerary({ destination, startDate, endDate });
    }
    logger.info('🚀 Gerando roteiro com Groq AI (Llama 3.1 70B)...');
    
    const diffTime = Math.abs(new Date(endDate) - new Date(startDate));
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const prompt = `
Você é um especialista em planejamento de viagens. Crie um roteiro detalhado em português brasileiro para:

**Destino:** ${destination.city}, ${destination.country}
**Duração:** ${days} dias (${startDate} até ${endDate})
**Orçamento:** ${budget.level} (${budget.currency})
**Estilo de viagem:** ${preferences.travelStyle || 'relaxante'}
**Ritmo:** ${preferences.pace || 'moderado'}
**Interesses:** ${(preferences.interests || []).join(', ') || 'geral'}

IMPORTANTE: Para cada dia, forneça atividades variadas e interessantes. Inclua:
- Horários realistas (formato 24h como "09:00")
- Custos estimados em ${budget.currency} apropriados ao nível "${budget.level}"
- Coordenadas geográficas reais ou próximas do destino
- Categorias corretas: transporte, alimentacao, atracao, hospedagem, compras, outro

Retorne APENAS um JSON válido neste formato exato:
{
  "days": [
    {
      "dayNumber": 1,
      "title": "Título criativo do dia",
      "activities": [
        {
          "time": "09:00",
          "title": "Nome da atividade",
          "description": "Descrição envolvente e detalhada",
          "location": {
            "name": "Nome do local específico",
            "address": "Endereço completo real",
            "coordinates": { "lat": -23.550520, "lng": -46.633308 }
          },
          "estimatedCost": 50,
          "duration": 120,
          "category": "atracao"
        }
      ]
    }
  ]
}
`.trim();

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile', // Modelo atualizado (dezembro 2024)
      messages: [
        {
          role: 'system',
          content: 'Você é um assistente de viagens especializado em criar roteiros detalhados e otimizados. Sempre responda APENAS com JSON válido, sem texto adicional.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 8000,
    });

    const content = completion.choices[0].message.content;
    logger.info('✅ Roteiro gerado com sucesso!');
    
    const response = JSON.parse(content);
    return response;
  } catch (error) {
    logger.error('Erro ao gerar roteiro com IA:', error);
    throw new Error('Erro ao gerar roteiro com IA: ' + error.message);
  }
};

module.exports = {
  generateItinerary,
};