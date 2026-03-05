/**
 * Itinerary Fixtures - Dados de exemplo para seeding
 */

module.exports = {
  /**
   * Roteiros de exemplo
   * NOTA: userId será preenchido durante o seeding
   */
  sampleItineraries: [
    {
      titulo: 'Aventura na Chapada Diamantina',
      descricao: 'Roteiro de 5 dias explorando as cachoeiras e trilhas da Chapada',
      destinos: ['Lençóis', 'Vale do Capão', 'Mucugê'],
      dataInicio: new Date('2025-06-15'),
      dataFim: new Date('2025-06-20'),
      orcamento: {
        valor: 2500,
        moeda: 'BRL',
        gastoPorDia: 500,
        categorias: {
          hospedagem: 800,
          alimentacao: 700,
          transporte: 500,
          atividades: 500,
        },
      },
      categorias: ['aventura', 'montanha', 'eco-turismo'],
      visibilidade: 'publico',
      status: 'planejamento',
      dias: [
        {
          data: new Date('2025-06-15'),
          titulo: 'Chegada em Lençóis',
          atividades: [
            {
              titulo: 'Check-in pousada',
              horario: '14:00',
              local: 'Pousada do Vale',
              custo: 150,
            },
            {
              titulo: 'Visita ao centro histórico',
              horario: '16:00',
              local: 'Centro de Lençóis',
              descricao: 'Explorar as casinhas coloniais e restaurantes',
            },
          ],
        },
        {
          data: new Date('2025-06-16'),
          titulo: 'Cachoeira do Sossego',
          atividades: [
            {
              titulo: 'Trilha Cachoeira do Sossego',
              horario: '07:00',
              descricao: 'Trilha de 6km com cachoeira linda no final',
              custo: 80,
            },
          ],
        },
      ],
      fotos: [],
      comentarios: [],
      likes: 0,
      compartilhamentos: 0,
    },
    {
      titulo: 'Europa Cultural - Paris e Londres',
      descricao: 'Roteiro de 10 dias visitando os principais pontos turísticos',
      destinos: ['Paris', 'Londres'],
      dataInicio: new Date('2025-09-01'),
      dataFim: new Date('2025-09-10'),
      orcamento: {
        valor: 18000,
        moeda: 'BRL',
        gastoPorDia: 1800,
        categorias: {
          hospedagem: 6000,
          alimentacao: 4000,
          transporte: 5000,
          atividades: 3000,
        },
      },
      categorias: ['cultural', 'urbano', 'gastronomia'],
      visibilidade: 'publico',
      status: 'planejamento',
      dias: [
        {
          data: new Date('2025-09-01'),
          titulo: 'Chegada em Paris',
          atividades: [
            {
              titulo: 'Check-in hotel',
              horario: '15:00',
              local: 'Hotel Le Marais',
              custo: 800,
            },
          ],
        },
      ],
      fotos: [],
      comentarios: [],
      likes: 0,
      compartilhamentos: 0,
    },
    {
      titulo: 'Praias do Nordeste',
      descricao: 'Roteiro de praia passando por 3 destinos incríveis',
      destinos: ['Jericoacoara', 'Maragogi', 'Porto de Galinhas'],
      dataInicio: new Date('2025-12-10'),
      dataFim: new Date('2025-12-17'),
      orcamento: {
        valor: 4500,
        moeda: 'BRL',
        gastoPorDia: 642,
      },
      categorias: ['praia', 'aventura'],
      visibilidade: 'publico',
      status: 'planejamento',
      dias: [],
      fotos: [],
      comentarios: [],
      likes: 0,
      compartilhamentos: 0,
    },
    {
      titulo: 'Final de semana em Ouro Preto',
      descricao: 'Roteiro cultural pelas igrejas históricas',
      destinos: ['Ouro Preto', 'Mariana'],
      dataInicio: new Date('2025-04-05'),
      dataFim: new Date('2025-04-07'),
      orcamento: {
        valor: 800,
        moeda: 'BRL',
        gastoPorDia: 266,
      },
      categorias: ['cultural', 'rural'],
      visibilidade: 'amigos',
      status: 'confirmado',
      dias: [
        {
          data: new Date('2025-04-05'),
          titulo: 'Chegada e Centro Histórico',
          atividades: [
            {
              titulo: 'Visita Igreja São Francisco',
              horario: '10:00',
              custo: 20,
            },
            {
              titulo: 'Almoço na Praça Tiradentes',
              horario: '13:00',
              custo: 60,
            },
          ],
        },
      ],
      fotos: [],
      comentarios: [],
      likes: 0,
      compartilhamentos: 0,
    },
    {
      titulo: 'Fernando de Noronha',
      descricao: 'Paraíso ecológico - mergulho e trilhas',
      destinos: ['Fernando de Noronha'],
      dataInicio: new Date('2025-10-15'),
      dataFim: new Date('2025-10-20'),
      orcamento: {
        valor: 7000,
        moeda: 'BRL',
        gastoPorDia: 1400,
      },
      categorias: ['praia', 'eco-turismo', 'aventura'],
      visibilidade: 'publico',
      status: 'planejamento',
      dias: [],
      fotos: [],
      comentarios: [],
      likes: 0,
      compartilhamentos: 0,
    },
  ],

  /**
   * Factory para criar roteiro customizado
   */
  createItinerary: (userId, overrides = {}) => {
    const baseItinerary = {
      titulo: 'Roteiro Teste',
      descricao: 'Descrição do roteiro teste',
      destinos: ['Destino 1'],
      dataInicio: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 dias
      dataFim: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // +10 dias
      userId,
      orcamento: {
        valor: 1000,
        moeda: 'BRL',
      },
      categorias: ['aventura'],
      visibilidade: 'privado',
      status: 'planejamento',
      dias: [],
      fotos: [],
      comentarios: [],
      likes: 0,
      compartilhamentos: 0,
      createdAt: new Date(),
    };

    return { ...baseItinerary, ...overrides };
  },
};
