/**
 * User Fixtures - Dados de exemplo para seeding
 */

const bcrypt = require('bcrypt');

// Senha padrão para todos os usuários de teste: "Test123!"
const defaultPasswordHash = bcrypt.hashSync('Test123!', 10);

module.exports = {
  /**
   * Usuários de exemplo
   */
  sampleUsers: [
    {
      nome: 'João Silva',
      email: 'joao@example.com',
      senha: defaultPasswordHash,
      telefone: '11987654321',
      bio: 'Aventureiro nato, amante de trilhas e montanhas',
      avatar: 'https://i.pravatar.cc/150?img=12',
      assinatura: {
        tipo: 'free',
        status: 'ativa',
      },
      perfil: {
        destinos_visitados: ['Rio de Janeiro', 'São Paulo', 'Minas Gerais'],
        interesses: ['aventura', 'montanha', 'eco-turismo'],
      },
      verificado: true,
      createdAt: new Date('2024-01-15'),
    },
    {
      nome: 'Maria Santos',
      email: 'maria@example.com',
      senha: defaultPasswordHash,
      telefone: '21987654321',
      bio: 'Exploradora urbana, fotógrafa de viagens',
      avatar: 'https://i.pravatar.cc/150?img=5',
      assinatura: {
        tipo: 'premium',
        status: 'ativa',
        stripeSubscriptionId: 'sub_test_maria',
        dataInicio: new Date('2024-03-01'),
        dataRenovacao: new Date('2025-03-01'),
      },
      perfil: {
        destinos_visitados: ['Paris', 'Londres', 'Nova York', 'Tóquio'],
        interesses: ['cultural', 'gastronomia', 'urbano'],
      },
      verificado: true,
      createdAt: new Date('2024-03-01'),
    },
    {
      nome: 'Pedro Oliveira',
      email: 'pedro@example.com',
      senha: defaultPasswordHash,
      telefone: '31987654321',
      bio: 'Viajante de fim de semana',
      avatar: 'https://i.pravatar.cc/150?img=33',
      assinatura: {
        tipo: 'free',
        status: 'ativa',
      },
      perfil: {
        destinos_visitados: ['Ouro Preto', 'Tiradentes'],
        interesses: ['cultural', 'praia'],
      },
      verificado: true,
      createdAt: new Date('2024-06-10'),
    },
    {
      nome: 'Ana Costa',
      email: 'ana@example.com',
      senha: defaultPasswordHash,
      telefone: '48987654321',
      bio: 'Amante de praias e mergulho',
      avatar: 'https://i.pravatar.cc/150?img=45',
      assinatura: {
        tipo: 'premium',
        status: 'ativa',
        stripeSubscriptionId: 'sub_test_ana',
        dataInicio: new Date('2024-08-01'),
        dataRenovacao: new Date('2025-08-01'),
      },
      perfil: {
        destinos_visitados: ['Florianópolis', 'Maragogi', 'Fernando de Noronha'],
        interesses: ['praia', 'aventura'],
      },
      verificado: true,
      createdAt: new Date('2024-08-01'),
    },
    {
      nome: 'Carlos Mendes',
      email: 'carlos@example.com',
      senha: defaultPasswordHash,
      telefone: '85987654321',
      bio: 'Explorador do Nordeste',
      avatar: 'https://i.pravatar.cc/150?img=60',
      assinatura: {
        tipo: 'free',
        status: 'ativa',
      },
      perfil: {
        destinos_visitados: ['Fortaleza', 'Jericoacoara'],
        interesses: ['praia', 'aventura'],
      },
      verificado: false,
      createdAt: new Date('2024-11-20'),
    },
  ],

  /**
   * Retorna senha padrão (para testes)
   */
  defaultPassword: 'Test123!',

  /**
   * Factory para criar usuário customizado
   */
  createUser: (overrides = {}) => {
    return {
      nome: 'Usuário Teste',
      email: `teste${Date.now()}@example.com`,
      senha: defaultPasswordHash,
      assinatura: {
        tipo: 'free',
        status: 'ativa',
      },
      perfil: {
        destinos_visitados: [],
        interesses: [],
      },
      verificado: true,
      createdAt: new Date(),
      ...overrides,
    };
  },
};
