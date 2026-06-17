require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Itinerary = require('../models/Itinerary');

const toDateIso = (value) => new Date(`${value}T12:00:00.000Z`);

const buildDays = (startDate, dayBlueprints) => {
  const start = toDateIso(startDate);

  return dayBlueprints.map((day, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);

    return {
      dayNumber: index + 1,
      date,
      title: day.title,
      activities: day.activities,
      dailyBudget: day.dailyBudget || 0,
      notes: day.notes || '',
    };
  });
};

const seeds = [
  {
    owner: {
      name: 'Lucas Viagens',
      email: 'explore.lucas@seed.local',
      password: 'Seed123!',
      publicProfile: true,
      acceptedTerms: true,
    },
    itineraries: [
      {
        title: 'Paris Essencial em 4 dias',
        destination: {
          city: 'Paris',
          country: 'Franca',
          coverImage:
            'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&h=800&fit=crop',
        },
        startDate: '2026-09-10',
        endDate: '2026-09-13',
        budget: { level: 'medio', estimatedTotal: 8200, currency: 'BRL' },
        preferences: {
          interests: ['cultura', 'gastronomia', 'museus'],
          travelStyle: 'casal',
          pace: 'moderado',
        },
        status: 'concluido',
        rating: { score: 5, comment: 'Roteiro muito equilibrado para primeira vez na cidade.' },
        views: 3120,
        likesCount: 188,
        days: buildDays('2026-09-10', [
          {
            title: 'Chegada e Torre Eiffel',
            activities: [
              {
                time: '10:00',
                title: 'Check-in e ajuste de roteiro',
                description: 'Chegada no hotel e reconhecimento do bairro.',
                location: { name: '7th arrondissement', address: 'Paris' },
                category: 'hospedagem',
                duration: 90,
                estimatedCost: 0,
              },
              {
                time: '15:00',
                title: 'Visita a Torre Eiffel',
                description: 'Subida no fim da tarde para pegar luz dourada.',
                location: { name: 'Torre Eiffel', address: 'Champ de Mars, Paris' },
                category: 'atracao',
                duration: 180,
                estimatedCost: 240,
              },
            ],
            dailyBudget: 900,
          },
          {
            title: 'Louvre e Jardin des Tuileries',
            activities: [
              {
                time: '09:00',
                title: 'Museu do Louvre',
                description: 'Entrada antecipada para reduzir filas.',
                location: { name: 'Musee du Louvre', address: 'Rue de Rivoli, Paris' },
                category: 'atracao',
                duration: 240,
                estimatedCost: 180,
              },
              {
                time: '14:30',
                title: 'Passeio no Jardin des Tuileries',
                location: { name: 'Jardin des Tuileries', address: 'Paris' },
                category: 'atracao',
                duration: 120,
                estimatedCost: 0,
              },
            ],
            dailyBudget: 650,
          },
          {
            title: 'Montmartre e Sacre-Coeur',
            activities: [
              {
                time: '10:00',
                title: 'Basilica de Sacre-Coeur',
                location: {
                  name: 'Sacre-Coeur',
                  address: '35 Rue du Chevalier de la Barre, Paris',
                },
                category: 'atracao',
                duration: 120,
                estimatedCost: 0,
              },
              {
                time: '13:00',
                title: 'Almoco em bistro local',
                category: 'alimentacao',
                duration: 90,
                estimatedCost: 210,
              },
            ],
            dailyBudget: 720,
          },
          {
            title: 'Orsay e retorno',
            activities: [
              {
                time: '09:30',
                title: 'Musee d Orsay',
                location: { name: 'Musee d Orsay', address: '1 Rue de la Legion d Honneur, Paris' },
                category: 'atracao',
                duration: 180,
                estimatedCost: 170,
              },
              {
                time: '15:00',
                title: 'Transfer para aeroporto',
                category: 'transporte',
                duration: 90,
                estimatedCost: 160,
              },
            ],
            dailyBudget: 550,
          },
        ]),
      },
      {
        title: 'Roma Classica em 3 dias',
        destination: {
          city: 'Roma',
          country: 'Italia',
          coverImage:
            'https://images.unsplash.com/photo-1525874684015-58379d421a52?w=1200&h=800&fit=crop',
        },
        startDate: '2026-10-02',
        endDate: '2026-10-04',
        budget: { level: 'medio', estimatedTotal: 6100, currency: 'BRL' },
        preferences: {
          interests: ['historia', 'arte', 'gastronomia'],
          travelStyle: 'amigos',
          pace: 'intenso',
        },
        status: 'planejando',
        views: 1740,
        likesCount: 96,
        days: buildDays('2026-10-02', [
          {
            title: 'Coliseu e Forum Romano',
            activities: [
              {
                time: '08:30',
                title: 'Tour Coliseu',
                location: { name: 'Colosseo', address: 'Piazza del Colosseo, Roma' },
                category: 'atracao',
                duration: 180,
                estimatedCost: 260,
              },
              {
                time: '13:00',
                title: 'Forum Romano',
                category: 'atracao',
                duration: 150,
                estimatedCost: 120,
              },
            ],
            dailyBudget: 780,
          },
          {
            title: 'Vaticano',
            activities: [
              {
                time: '09:00',
                title: 'Museus do Vaticano',
                category: 'atracao',
                duration: 240,
                estimatedCost: 260,
              },
              {
                time: '14:00',
                title: 'Basilica de Sao Pedro',
                category: 'atracao',
                duration: 120,
                estimatedCost: 0,
              },
            ],
            dailyBudget: 720,
          },
          {
            title: 'Centro historico e Fontana di Trevi',
            activities: [
              {
                time: '10:00',
                title: 'Pantheon',
                category: 'atracao',
                duration: 90,
                estimatedCost: 0,
              },
              {
                time: '12:00',
                title: 'Fontana di Trevi e Piazza Navona',
                category: 'atracao',
                duration: 150,
                estimatedCost: 0,
              },
            ],
            dailyBudget: 610,
          },
        ]),
      },
    ],
  },
  {
    owner: {
      name: 'Marina Rota Global',
      email: 'explore.marina@seed.local',
      password: 'Seed123!',
      publicProfile: true,
      acceptedTerms: true,
    },
    itineraries: [
      {
        title: 'Tóquio Moderna e Tradicional em 5 dias',
        destination: {
          city: 'Toquio',
          country: 'Japao',
          coverImage:
            'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&h=800&fit=crop',
        },
        startDate: '2026-11-12',
        endDate: '2026-11-16',
        budget: { level: 'luxo', estimatedTotal: 12800, currency: 'BRL' },
        preferences: {
          interests: ['cultura', 'tecnologia', 'culinaria'],
          travelStyle: 'solo',
          pace: 'moderado',
        },
        status: 'concluido',
        rating: { score: 5, comment: 'Perfeito para primeira viagem ao Japao.' },
        views: 4020,
        likesCount: 244,
        days: buildDays('2026-11-12', [
          {
            title: 'Shibuya e Harajuku',
            activities: [
              {
                time: '10:00',
                title: 'Shibuya Crossing e Hachiko',
                category: 'atracao',
                duration: 120,
                estimatedCost: 0,
              },
              {
                time: '14:00',
                title: 'Meiji Jingu e Yoyogi',
                category: 'atracao',
                duration: 180,
                estimatedCost: 40,
              },
            ],
            dailyBudget: 930,
          },
          {
            title: 'Asakusa e Tokyo Skytree',
            activities: [
              {
                time: '09:00',
                title: 'Templo Senso-ji',
                category: 'atracao',
                duration: 150,
                estimatedCost: 0,
              },
              {
                time: '16:00',
                title: 'Tokyo Skytree',
                category: 'atracao',
                duration: 120,
                estimatedCost: 170,
              },
            ],
            dailyBudget: 880,
          },
          {
            title: 'Akihabara e Ueno',
            activities: [
              {
                time: '10:00',
                title: 'Akihabara Electric Town',
                category: 'compras',
                duration: 180,
                estimatedCost: 320,
              },
              {
                time: '15:00',
                title: 'Parque Ueno e museus',
                category: 'atracao',
                duration: 150,
                estimatedCost: 90,
              },
            ],
            dailyBudget: 940,
          },
          {
            title: 'Odaiba',
            activities: [
              {
                time: '11:00',
                title: 'teamLab Planets',
                category: 'atracao',
                duration: 180,
                estimatedCost: 210,
              },
              {
                time: '17:00',
                title: 'Passeio pela waterfront de Odaiba',
                category: 'atracao',
                duration: 120,
                estimatedCost: 0,
              },
            ],
            dailyBudget: 890,
          },
          {
            title: 'Mercado e retorno',
            activities: [
              {
                time: '08:00',
                title: 'Café da manha em Tsukiji',
                category: 'alimentacao',
                duration: 90,
                estimatedCost: 130,
              },
              {
                time: '13:00',
                title: 'Transfer para aeroporto',
                category: 'transporte',
                duration: 90,
                estimatedCost: 190,
              },
            ],
            dailyBudget: 610,
          },
        ]),
      },
      {
        title: 'Nova York em 4 dias',
        destination: {
          city: 'Nova York',
          country: 'Estados Unidos',
          coverImage:
            'https://images.unsplash.com/photo-1496588152823-86ff7695f283?w=1200&h=800&fit=crop',
        },
        startDate: '2027-01-20',
        endDate: '2027-01-23',
        budget: { level: 'luxo', estimatedTotal: 14900, currency: 'BRL' },
        preferences: {
          interests: ['urbano', 'musicais', 'gastronomia'],
          travelStyle: 'casal',
          pace: 'intenso',
        },
        status: 'planejando',
        views: 2660,
        likesCount: 142,
        days: buildDays('2027-01-20', [
          {
            title: 'Midtown Manhattan',
            activities: [
              {
                time: '09:00',
                title: 'Top of the Rock',
                category: 'atracao',
                duration: 120,
                estimatedCost: 230,
              },
              {
                time: '14:00',
                title: 'Times Square e Broadway',
                category: 'atracao',
                duration: 180,
                estimatedCost: 0,
              },
            ],
            dailyBudget: 980,
          },
          {
            title: 'Central Park e museus',
            activities: [
              {
                time: '10:00',
                title: 'Passeio de bike no Central Park',
                category: 'atracao',
                duration: 150,
                estimatedCost: 140,
              },
              {
                time: '14:00',
                title: 'MET Museum',
                category: 'atracao',
                duration: 180,
                estimatedCost: 180,
              },
            ],
            dailyBudget: 860,
          },
          {
            title: 'Downtown e Brooklyn',
            activities: [
              {
                time: '09:30',
                title: 'Battery Park e balsa',
                category: 'atracao',
                duration: 150,
                estimatedCost: 80,
              },
              {
                time: '15:30',
                title: 'Brooklyn Bridge ao pôr do sol',
                category: 'atracao',
                duration: 120,
                estimatedCost: 0,
              },
            ],
            dailyBudget: 840,
          },
          {
            title: 'Soho e retorno',
            activities: [
              {
                time: '10:30',
                title: 'Soho e Greenwich Village',
                category: 'compras',
                duration: 180,
                estimatedCost: 260,
              },
              {
                time: '16:00',
                title: 'Transfer para aeroporto',
                category: 'transporte',
                duration: 90,
                estimatedCost: 220,
              },
            ],
            dailyBudget: 770,
          },
        ]),
      },
    ],
  },
  {
    owner: {
      name: 'Caio Mochila',
      email: 'explore.caio@seed.local',
      password: 'Seed123!',
      publicProfile: true,
      acceptedTerms: true,
    },
    itineraries: [
      {
        title: 'Barcelona e Gaudi em 3 dias',
        destination: {
          city: 'Barcelona',
          country: 'Espanha',
          coverImage:
            'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1200&h=800&fit=crop',
        },
        startDate: '2026-08-18',
        endDate: '2026-08-20',
        budget: { level: 'medio', estimatedTotal: 5900, currency: 'BRL' },
        preferences: {
          interests: ['arquitetura', 'praia', 'gastronomia'],
          travelStyle: 'solo',
          pace: 'moderado',
        },
        status: 'concluido',
        rating: { score: 4, comment: 'Compacto e eficiente para poucos dias.' },
        views: 1980,
        likesCount: 118,
        days: buildDays('2026-08-18', [
          {
            title: 'Sagrada Familia e Gracia',
            activities: [
              {
                time: '09:00',
                title: 'Sagrada Familia',
                category: 'atracao',
                duration: 180,
                estimatedCost: 210,
              },
              {
                time: '14:00',
                title: 'Passeio por Gracia',
                category: 'atracao',
                duration: 120,
                estimatedCost: 0,
              },
            ],
            dailyBudget: 620,
          },
          {
            title: 'Parc Guell e Barceloneta',
            activities: [
              {
                time: '10:00',
                title: 'Parc Guell',
                category: 'atracao',
                duration: 150,
                estimatedCost: 95,
              },
              {
                time: '16:00',
                title: 'Fim de tarde na Barceloneta',
                category: 'atracao',
                duration: 150,
                estimatedCost: 0,
              },
            ],
            dailyBudget: 580,
          },
          {
            title: 'Gótico e retorno',
            activities: [
              {
                time: '09:30',
                title: 'Bairro Gótico',
                category: 'atracao',
                duration: 150,
                estimatedCost: 0,
              },
              {
                time: '13:30',
                title: 'Mercado La Boqueria',
                category: 'alimentacao',
                duration: 90,
                estimatedCost: 150,
              },
            ],
            dailyBudget: 540,
          },
        ]),
      },
      {
        title: 'Londres em 5 dias',
        destination: {
          city: 'Londres',
          country: 'Reino Unido',
          coverImage:
            'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&h=800&fit=crop',
        },
        startDate: '2027-03-05',
        endDate: '2027-03-09',
        budget: { level: 'luxo', estimatedTotal: 13300, currency: 'BRL' },
        preferences: {
          interests: ['historia', 'museus', 'teatro'],
          travelStyle: 'familia',
          pace: 'moderado',
        },
        status: 'planejando',
        views: 2230,
        likesCount: 129,
        days: buildDays('2027-03-05', [
          {
            title: 'Westminster',
            activities: [
              {
                time: '09:00',
                title: 'Big Ben e Parliament',
                category: 'atracao',
                duration: 120,
                estimatedCost: 0,
              },
              {
                time: '13:00',
                title: 'London Eye',
                category: 'atracao',
                duration: 90,
                estimatedCost: 190,
              },
            ],
            dailyBudget: 780,
          },
          {
            title: 'British Museum e Covent Garden',
            activities: [
              {
                time: '10:00',
                title: 'British Museum',
                category: 'atracao',
                duration: 180,
                estimatedCost: 0,
              },
              {
                time: '15:00',
                title: 'Covent Garden',
                category: 'atracao',
                duration: 120,
                estimatedCost: 0,
              },
            ],
            dailyBudget: 690,
          },
          {
            title: 'Tower Bridge e City',
            activities: [
              {
                time: '09:30',
                title: 'Tower of London',
                category: 'atracao',
                duration: 180,
                estimatedCost: 230,
              },
              {
                time: '15:30',
                title: 'Tower Bridge Exhibition',
                category: 'atracao',
                duration: 90,
                estimatedCost: 110,
              },
            ],
            dailyBudget: 760,
          },
          {
            title: 'Notting Hill e Hyde Park',
            activities: [
              {
                time: '10:00',
                title: 'Portobello Road Market',
                category: 'compras',
                duration: 120,
                estimatedCost: 220,
              },
              {
                time: '15:00',
                title: 'Hyde Park',
                category: 'atracao',
                duration: 120,
                estimatedCost: 0,
              },
            ],
            dailyBudget: 740,
          },
          {
            title: 'Camden e retorno',
            activities: [
              {
                time: '09:30',
                title: 'Camden Market',
                category: 'alimentacao',
                duration: 150,
                estimatedCost: 180,
              },
              {
                time: '14:30',
                title: 'Transfer para aeroporto',
                category: 'transporte',
                duration: 90,
                estimatedCost: 210,
              },
            ],
            dailyBudget: 650,
          },
        ]),
      },
    ],
  },
];

const upsertUser = async (payload) => {
  const existing = await User.findOne({ email: payload.email });
  if (existing) {
    existing.name = payload.name;
    existing.publicProfile = true;
    existing.acceptedTerms = true;
    await existing.save();
    return existing;
  }

  const created = new User(payload);
  await created.save();
  return created;
};

const upsertItinerary = async (ownerId, itineraryPayload) => {
  const query = {
    owner: ownerId,
    title: itineraryPayload.title,
    'destination.city': itineraryPayload.destination.city,
    'destination.country': itineraryPayload.destination.country,
  };

  const likes = Array.from({ length: itineraryPayload.likesCount || 0 }, () => ownerId);

  const update = {
    owner: ownerId,
    title: itineraryPayload.title,
    destination: itineraryPayload.destination,
    startDate: toDateIso(itineraryPayload.startDate),
    endDate: toDateIso(itineraryPayload.endDate),
    budget: itineraryPayload.budget,
    preferences: itineraryPayload.preferences,
    days: itineraryPayload.days,
    status: itineraryPayload.status,
    generatedByAI: false,
    isPublic: true,
    rating: itineraryPayload.rating,
    views: itineraryPayload.views || 0,
    likes,
    collaborators: [],
    lastEditedBy: ownerId,
    lastEditedAt: new Date(),
  };

  await Itinerary.findOneAndUpdate(query, update, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  });
};

const seedExploreItineraries = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI não definida no .env');
  }

  await mongoose.connect(process.env.MONGO_URI);

  try {
    for (const seed of seeds) {
      const owner = await upsertUser(seed.owner);

      for (const itinerary of seed.itineraries) {
        await upsertItinerary(owner._id, itinerary);
      }
    }

    const publicCount = await Itinerary.countDocuments({ isPublic: true });
    console.log(`✅ Seed de Explore concluída. Roteiros públicos disponíveis: ${publicCount}`);
  } finally {
    await mongoose.disconnect();
  }
};

seedExploreItineraries().catch((error) => {
  console.error('❌ Erro ao executar seed do Explore:', error);
  process.exit(1);
});
