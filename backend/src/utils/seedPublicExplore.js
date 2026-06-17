// backend/src/utils/seedPublicExplore.js
require('dotenv').config();

const mongoose = require('mongoose');
const User = require('../models/User');
const Itinerary = require('../models/Itinerary');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error('MONGO_URI não definida no ambiente.');
}

const buildDate = (baseDate, dayOffset) => {
  const date = new Date(baseDate);
  date.setUTCDate(date.getUTCDate() + dayOffset);
  date.setUTCHours(12, 0, 0, 0);
  return date;
};

const createActivity = (activity) => ({
  time: activity.time,
  title: activity.title,
  description: activity.description,
  location: activity.location,
  estimatedCost: activity.estimatedCost,
  duration: activity.duration,
  category: activity.category,
  completed: false,
});

const createDay = (baseDate, dayNumber, title, activities, notes = '') => ({
  date: buildDate(baseDate, dayNumber - 1),
  dayNumber,
  title,
  activities: activities.map(createActivity),
  dailyBudget: activities.reduce((sum, item) => sum + (item.estimatedCost || 0), 0),
  notes,
});

const publicUsersSeed = [
  {
    name: 'Maria Santos',
    email: 'maria.explore@example.com',
    password: 'Senha123!@#',
    acceptedTerms: true,
    publicProfile: true,
    preferences: {
      travelStyle: 'casal',
      interests: ['cultural', 'gastronomia', 'urbano'],
      budgetLevel: 'medio',
      pace: 'moderado',
    },
    isPremium: false,
    avatar: 'https://i.pravatar.cc/150?img=5',
  },
  {
    name: 'Pedro Oliveira',
    email: 'pedro.explore@example.com',
    password: 'Senha123!@#',
    acceptedTerms: true,
    publicProfile: true,
    preferences: {
      travelStyle: 'amigos',
      interests: ['aventura', 'praia', 'natureza'],
      budgetLevel: 'medio',
      pace: 'intenso',
    },
    isPremium: true,
    avatar: 'https://i.pravatar.cc/150?img=33',
  },
  {
    name: 'Ana Costa',
    email: 'ana.explore@example.com',
    password: 'Senha123!@#',
    acceptedTerms: true,
    publicProfile: true,
    preferences: {
      travelStyle: 'familia',
      interests: ['cultural', 'compras', 'gastronomia'],
      budgetLevel: 'luxo',
      pace: 'relaxado',
    },
    isPremium: true,
    avatar: 'https://i.pravatar.cc/150?img=47',
  },
];

const itinerarySeedData = [
  {
    title: 'Paris Essencial em 4 Dias',
    destination: {
      city: 'Paris',
      country: 'França',
      coverImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
    },
    startDate: '2026-07-05',
    endDate: '2026-07-08',
    budget: { level: 'luxo', estimatedTotal: 12800, currency: 'BRL' },
    preferences: {
      interests: ['cultural', 'gastronomia', 'urbano'],
      travelStyle: 'casal',
      pace: 'moderado',
    },
    ownerEmail: 'maria.explore@example.com',
    isPublic: true,
    status: 'concluido',
    generatedByAI: false,
    likes: 182,
    views: 4812,
    days: [
      createDay('2026-07-05', 1, 'Chegada e Torre Eiffel', [
        {
          time: '10:00',
          title: 'Check-in no hotel',
          description: 'Hospedagem no 7º arrondissement',
          location: { name: 'Hotel Le Marais', address: 'Paris, França' },
          estimatedCost: 1200,
          duration: 60,
          category: 'hospedagem',
        },
        {
          time: '16:00',
          title: 'Torre Eiffel',
          description: 'Visita ao cartão-postal da cidade',
          location: { name: 'Tour Eiffel', address: 'Champ de Mars, Paris' },
          estimatedCost: 180,
          duration: 180,
          category: 'atracao',
        },
        {
          time: '20:30',
          title: 'Jantar no Le Jules Verne',
          description: 'Jantar com vista panorâmica',
          location: { name: 'Le Jules Verne', address: 'Tour Eiffel, Paris' },
          estimatedCost: 420,
          duration: 120,
          category: 'alimentacao',
        },
      ]),
      createDay('2026-07-05', 2, 'Louvre e Sena', [
        {
          time: '09:00',
          title: 'Museu do Louvre',
          description: 'Coleções clássicas e Mona Lisa',
          location: { name: 'Musée du Louvre', address: 'Rue de Rivoli, Paris' },
          estimatedCost: 160,
          duration: 240,
          category: 'atracao',
        },
        {
          time: '15:30',
          title: 'Cruzeiro no Rio Sena',
          description: 'Passeio de barco pelo centro histórico',
          location: { name: 'Seine River Cruise', address: 'Port de la Bourdonnais, Paris' },
          estimatedCost: 90,
          duration: 90,
          category: 'atracao',
        },
        {
          time: '19:30',
          title: 'Bistrô francês',
          description: 'Jantar em Saint-Germain',
          location: { name: 'Café de Flore', address: 'Boulevard Saint-Germain, Paris' },
          estimatedCost: 260,
          duration: 90,
          category: 'alimentacao',
        },
      ]),
      createDay('2026-07-05', 3, 'Montmartre e Sacré-Cœur', [
        {
          time: '08:30',
          title: 'Passeio em Montmartre',
          description: 'Ruas charmosas e artistas locais',
          location: { name: 'Montmartre', address: '18º arrondissement, Paris' },
          estimatedCost: 0,
          duration: 120,
          category: 'atracao',
        },
        {
          time: '11:00',
          title: 'Basílica de Sacré-Cœur',
          description: 'Vista panorâmica de Paris',
          location: { name: 'Basilique du Sacré-Cœur', address: 'Paris' },
          estimatedCost: 0,
          duration: 90,
          category: 'atracao',
        },
        {
          time: '18:00',
          title: 'Degustação de vinhos',
          description: 'Experiência gastronômica',
          location: { name: 'Le Baron Rouge', address: 'Paris' },
          estimatedCost: 150,
          duration: 120,
          category: 'alimentacao',
        },
      ]),
      createDay('2026-07-05', 4, 'Compras e despedida', [
        {
          time: '10:00',
          title: 'Galeries Lafayette',
          description: 'Compras e arquitetura icônica',
          location: { name: 'Galeries Lafayette', address: 'Haussmann, Paris' },
          estimatedCost: 300,
          duration: 180,
          category: 'compras',
        },
        {
          time: '16:00',
          title: 'Último café parisiense',
          description: 'Encerrando a viagem com calma',
          location: { name: 'Angelina Paris', address: 'Rue de Rivoli, Paris' },
          estimatedCost: 85,
          duration: 60,
          category: 'alimentacao',
        },
      ]),
    ],
  },
  {
    title: 'Nova York Clássica em 5 Dias',
    destination: {
      city: 'Nova York',
      country: 'Estados Unidos',
      coverImage: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59',
    },
    startDate: '2026-08-12',
    endDate: '2026-08-16',
    budget: { level: 'luxo', estimatedTotal: 15600, currency: 'BRL' },
    preferences: {
      interests: ['urbano', 'cultural', 'compras'],
      travelStyle: 'amigos',
      pace: 'intenso',
    },
    ownerEmail: 'pedro.explore@example.com',
    isPublic: true,
    status: 'concluido',
    generatedByAI: false,
    likes: 241,
    views: 6230,
    days: [
      createDay('2026-08-12', 1, 'Times Square e Broadway', [
        {
          time: '12:00',
          title: 'Chegada e check-in',
          description: 'Hotel em Midtown',
          location: { name: 'Midtown Manhattan', address: 'Nova York, EUA' },
          estimatedCost: 1700,
          duration: 60,
          category: 'hospedagem',
        },
        {
          time: '16:00',
          title: 'Times Square',
          description: 'Primeiro contato com a cidade',
          location: { name: 'Times Square', address: 'Manhattan, NY' },
          estimatedCost: 0,
          duration: 120,
          category: 'atracao',
        },
        {
          time: '20:00',
          title: 'Espetáculo da Broadway',
          description: 'Musical à noite',
          location: { name: 'Broadway Theatre District', address: 'Manhattan, NY' },
          estimatedCost: 520,
          duration: 180,
          category: 'atracao',
        },
      ]),
      createDay('2026-08-12', 2, 'Central Park e museus', [
        {
          time: '09:00',
          title: 'Passeio de bicicleta no Central Park',
          description: 'Manhã ao ar livre',
          location: { name: 'Central Park', address: 'Manhattan, NY' },
          estimatedCost: 120,
          duration: 120,
          category: 'atracao',
        },
        {
          time: '13:00',
          title: 'Metropolitan Museum of Art',
          description: 'Acervo de arte mundial',
          location: { name: 'The Met', address: '1000 5th Ave, NY' },
          estimatedCost: 180,
          duration: 240,
          category: 'atracao',
        },
        {
          time: '19:30',
          title: "Jantar em Hell's Kitchen",
          description: 'Gastronomia nova-iorquina',
          location: { name: "Hell's Kitchen", address: 'Manhattan, NY' },
          estimatedCost: 250,
          duration: 90,
          category: 'alimentacao',
        },
      ]),
      createDay('2026-08-12', 3, 'Estátua da Liberdade e Wall Street', [
        {
          time: '08:30',
          title: 'Ferry para a Estátua da Liberdade',
          description: 'Visita a Liberty Island',
          location: { name: 'Battery Park', address: 'Manhattan, NY' },
          estimatedCost: 240,
          duration: 240,
          category: 'atracao',
        },
        {
          time: '15:00',
          title: 'Wall Street e One World',
          description: 'Centro financeiro e observatório',
          location: { name: 'Financial District', address: 'Nova York, EUA' },
          estimatedCost: 180,
          duration: 180,
          category: 'atracao',
        },
      ]),
      createDay('2026-08-12', 4, 'Brooklyn e Dumbo', [
        {
          time: '10:00',
          title: 'Brooklyn Bridge',
          description: 'Caminhada panorâmica',
          location: { name: 'Brooklyn Bridge', address: 'Nova York, EUA' },
          estimatedCost: 0,
          duration: 90,
          category: 'atracao',
        },
        {
          time: '12:00',
          title: 'DUMBO',
          description: 'Fotos clássicas de Manhattan',
          location: { name: 'DUMBO', address: 'Brooklyn, NY' },
          estimatedCost: 60,
          duration: 120,
          category: 'atracao',
        },
        {
          time: '18:30',
          title: 'Pizza em Brooklyn',
          description: 'Fim de tarde gastronômico',
          location: { name: "Juliana's Pizza", address: 'Brooklyn, NY' },
          estimatedCost: 110,
          duration: 90,
          category: 'alimentacao',
        },
      ]),
      createDay('2026-08-12', 5, 'Compras e encerramento', [
        {
          time: '11:00',
          title: '5th Avenue',
          description: 'Compras nas principais lojas',
          location: { name: 'Fifth Avenue', address: 'Manhattan, NY' },
          estimatedCost: 400,
          duration: 180,
          category: 'compras',
        },
        {
          time: '16:00',
          title: 'Café no Rockefeller Center',
          description: 'Última pausa antes do voo',
          location: { name: 'Rockefeller Center', address: 'Manhattan, NY' },
          estimatedCost: 95,
          duration: 60,
          category: 'alimentacao',
        },
      ]),
    ],
  },
  {
    title: 'Dubai em 4 Dias',
    destination: {
      city: 'Dubai',
      country: 'Emirados Árabes Unidos',
      coverImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c',
    },
    startDate: '2026-09-03',
    endDate: '2026-09-06',
    budget: { level: 'luxo', estimatedTotal: 14900, currency: 'BRL' },
    preferences: {
      interests: ['urbano', 'luxo', 'gastronomia'],
      travelStyle: 'casal',
      pace: 'moderado',
    },
    ownerEmail: 'ana.explore@example.com',
    isPublic: true,
    status: 'concluido',
    generatedByAI: false,
    likes: 153,
    views: 4021,
    days: [
      createDay('2026-09-03', 1, 'Downtown Dubai', [
        {
          time: '14:00',
          title: 'Check-in no hotel',
          description: 'Hospedagem com vista para o skyline',
          location: { name: 'Downtown Dubai', address: 'Dubai, UAE' },
          estimatedCost: 2100,
          duration: 60,
          category: 'hospedagem',
        },
        {
          time: '18:00',
          title: 'Burj Khalifa',
          description: 'Mirante no edifício mais alto do mundo',
          location: { name: 'Burj Khalifa', address: '1 Sheikh Mohammed bin Rashid Blvd' },
          estimatedCost: 220,
          duration: 120,
          category: 'atracao',
        },
        {
          time: '20:30',
          title: 'Dubai Mall e jantar',
          description: 'Noite no maior shopping da cidade',
          location: { name: 'Dubai Mall', address: 'Dubai, UAE' },
          estimatedCost: 180,
          duration: 120,
          category: 'compras',
        },
      ]),
      createDay('2026-09-03', 2, 'Deserto e cultura', [
        {
          time: '09:30',
          title: 'Dubai Museum',
          description: 'Contexto histórico da cidade',
          location: { name: 'Al Fahidi Fort', address: 'Dubai, UAE' },
          estimatedCost: 40,
          duration: 90,
          category: 'atracao',
        },
        {
          time: '16:00',
          title: 'Safari no deserto',
          description: 'Dunas, jantar e show cultural',
          location: { name: 'Deserto de Dubai', address: 'Dubai, UAE' },
          estimatedCost: 480,
          duration: 360,
          category: 'atracao',
        },
      ]),
      createDay('2026-09-03', 3, 'Marina e Palm Jumeirah', [
        {
          time: '10:00',
          title: 'Dubai Marina',
          description: 'Passeio pela orla moderna',
          location: { name: 'Dubai Marina', address: 'Dubai, UAE' },
          estimatedCost: 0,
          duration: 120,
          category: 'atracao',
        },
        {
          time: '13:00',
          title: 'The View at The Palm',
          description: 'Vista aérea da Palm Jumeirah',
          location: { name: 'The View', address: 'Palm Jumeirah, Dubai' },
          estimatedCost: 160,
          duration: 90,
          category: 'atracao',
        },
        {
          time: '19:30',
          title: 'Jantar no Pier 7',
          description: 'Restaurantes com vista da marina',
          location: { name: 'Pier 7', address: 'Dubai Marina, Dubai' },
          estimatedCost: 260,
          duration: 120,
          category: 'alimentacao',
        },
      ]),
      createDay('2026-09-03', 4, 'Últimos passeios', [
        {
          time: '11:00',
          title: 'Souk Madinat Jumeirah',
          description: 'Compras e arquitetura árabe',
          location: { name: 'Madinat Jumeirah', address: 'Dubai, UAE' },
          estimatedCost: 120,
          duration: 120,
          category: 'compras',
        },
        {
          time: '16:00',
          title: 'Café com vista para o Burj Al Arab',
          description: 'Encerramento com visual icônico',
          location: { name: 'Burj Al Arab', address: 'Dubai, UAE' },
          estimatedCost: 180,
          duration: 60,
          category: 'alimentacao',
        },
      ]),
    ],
  },
  {
    title: 'Rio de Janeiro Costeiro em 3 Dias',
    destination: {
      city: 'Rio de Janeiro',
      country: 'Brasil',
      coverImage: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325',
    },
    startDate: '2026-10-10',
    endDate: '2026-10-12',
    budget: { level: 'medio', estimatedTotal: 3800, currency: 'BRL' },
    preferences: {
      interests: ['praia', 'urbano', 'gastronomia'],
      travelStyle: 'amigos',
      pace: 'moderado',
    },
    ownerEmail: 'maria.explore@example.com',
    isPublic: true,
    status: 'concluido',
    generatedByAI: false,
    likes: 311,
    views: 7050,
    days: [
      createDay('2026-10-10', 1, 'Copacabana e Pão de Açúcar', [
        {
          time: '11:00',
          title: 'Chegada e praia de Copacabana',
          description: 'Manhã livre na orla',
          location: { name: 'Copacabana', address: 'Rio de Janeiro, Brasil' },
          estimatedCost: 0,
          duration: 180,
          category: 'atracao',
        },
        {
          time: '16:00',
          title: 'Bondinho do Pão de Açúcar',
          description: 'Fim de tarde com vista panorâmica',
          location: { name: 'Pão de Açúcar', address: 'Urca, Rio de Janeiro' },
          estimatedCost: 160,
          duration: 180,
          category: 'atracao',
        },
      ]),
      createDay('2026-10-10', 2, 'Cristo Redentor e Santa Teresa', [
        {
          time: '08:30',
          title: 'Cristo Redentor',
          description: 'Visita cedo para evitar filas',
          location: { name: 'Corcovado', address: 'Rio de Janeiro, Brasil' },
          estimatedCost: 90,
          duration: 150,
          category: 'atracao',
        },
        {
          time: '13:00',
          title: 'Santa Teresa',
          description: 'Almoço e passeio pelo bairro',
          location: { name: 'Santa Teresa', address: 'Rio de Janeiro, Brasil' },
          estimatedCost: 120,
          duration: 180,
          category: 'alimentacao',
        },
        {
          time: '19:30',
          title: 'Lapa à noite',
          description: 'Bares e música ao vivo',
          location: { name: 'Lapa', address: 'Rio de Janeiro, Brasil' },
          estimatedCost: 90,
          duration: 120,
          category: 'atracao',
        },
      ]),
      createDay('2026-10-10', 3, 'Ipanema e despedida', [
        {
          time: '10:00',
          title: 'Praia de Ipanema',
          description: 'Último mergulho',
          location: { name: 'Ipanema', address: 'Rio de Janeiro, Brasil' },
          estimatedCost: 0,
          duration: 180,
          category: 'atracao',
        },
        {
          time: '15:00',
          title: 'Almoço no Leblon',
          description: 'Fechando a viagem com comida boa',
          location: { name: 'Leblon', address: 'Rio de Janeiro, Brasil' },
          estimatedCost: 140,
          duration: 90,
          category: 'alimentacao',
        },
      ]),
    ],
  },
  {
    title: 'Roma Histórica em 4 Dias',
    destination: {
      city: 'Roma',
      country: 'Itália',
      coverImage: 'https://images.unsplash.com/photo-1525874684015-58379d421a52',
    },
    startDate: '2026-11-18',
    endDate: '2026-11-21',
    budget: { level: 'medio', estimatedTotal: 9200, currency: 'BRL' },
    preferences: {
      interests: ['cultural', 'gastronomia', 'urbano'],
      travelStyle: 'casal',
      pace: 'moderado',
    },
    ownerEmail: 'pedro.explore@example.com',
    isPublic: true,
    status: 'concluido',
    generatedByAI: false,
    likes: 207,
    views: 5588,
    days: [
      createDay('2026-11-18', 1, 'Coliseu e Fórum Romano', [
        {
          time: '09:00',
          title: 'Coliseu',
          description: 'Visita guiada ao anfiteatro',
          location: { name: 'Colosseo', address: 'Roma, Itália' },
          estimatedCost: 140,
          duration: 180,
          category: 'atracao',
        },
        {
          time: '13:00',
          title: 'Fórum Romano',
          description: 'Ruínas e história antiga',
          location: { name: 'Foro Romano', address: 'Roma, Itália' },
          estimatedCost: 90,
          duration: 150,
          category: 'atracao',
        },
      ]),
      createDay('2026-11-18', 2, 'Vaticano', [
        {
          time: '08:30',
          title: 'Museus Vaticanos',
          description: 'Acervo de arte e história',
          location: { name: 'Vatican Museums', address: 'Cidade do Vaticano' },
          estimatedCost: 180,
          duration: 240,
          category: 'atracao',
        },
        {
          time: '13:00',
          title: 'Basílica de São Pedro',
          description: 'Arquitetura e cúpula',
          location: { name: "St. Peter's Basilica", address: 'Cidade do Vaticano' },
          estimatedCost: 0,
          duration: 120,
          category: 'atracao',
        },
        {
          time: '20:00',
          title: 'Jantar em Trastevere',
          description: 'Massa fresca e vinho italiano',
          location: { name: 'Trastevere', address: 'Roma, Itália' },
          estimatedCost: 220,
          duration: 120,
          category: 'alimentacao',
        },
      ]),
      createDay('2026-11-18', 3, 'Centro histórico e fontes', [
        {
          time: '10:00',
          title: 'Pantheon',
          description: 'Monumento clássico preservado',
          location: { name: 'Pantheon', address: 'Roma, Itália' },
          estimatedCost: 0,
          duration: 90,
          category: 'atracao',
        },
        {
          time: '12:00',
          title: 'Fontana di Trevi',
          description: 'Pausa para fotos e tradição',
          location: { name: 'Trevi Fountain', address: 'Roma, Itália' },
          estimatedCost: 0,
          duration: 60,
          category: 'atracao',
        },
        {
          time: '18:30',
          title: 'Gelato e passeio',
          description: 'Fim de tarde leve pelo centro',
          location: { name: 'Centro Storico', address: 'Roma, Itália' },
          estimatedCost: 45,
          duration: 90,
          category: 'alimentacao',
        },
      ]),
      createDay('2026-11-18', 4, 'Compras e despedida', [
        {
          time: '11:00',
          title: 'Via del Corso',
          description: 'Compras e vitrines',
          location: { name: 'Via del Corso', address: 'Roma, Itália' },
          estimatedCost: 200,
          duration: 180,
          category: 'compras',
        },
        {
          time: '16:00',
          title: 'Último espresso',
          description: 'Encerrando a viagem com calma',
          location: { name: 'Piazza Navona', address: 'Roma, Itália' },
          estimatedCost: 30,
          duration: 45,
          category: 'alimentacao',
        },
      ]),
    ],
  },
];

async function seed() {
  await mongoose.connect(MONGO_URI);

  const usersByEmail = new Map();
  for (const userData of publicUsersSeed) {
    const user = await User.findOneAndUpdate(
      { email: userData.email },
      {
        $set: {
          name: userData.name,
          email: userData.email,
          avatar: userData.avatar,
          publicProfile: true,
          acceptedTerms: true,
          hasCompletedOnboarding: true,
          preferences: userData.preferences,
          isPremium: userData.isPremium,
          subscription: {
            plan: userData.isPremium ? 'premium' : 'free',
            status: 'active',
          },
        },
        $setOnInsert: {
          password: userData.password,
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    usersByEmail.set(userData.email, user);
  }

  let upserted = 0;
  let updated = 0;

  for (const itinerarySeed of itinerarySeedData) {
    const owner = usersByEmail.get(itinerarySeed.ownerEmail);
    if (!owner) {
      throw new Error(`Owner não encontrado para ${itinerarySeed.title}`);
    }

    const payload = {
      owner: owner._id,
      title: itinerarySeed.title,
      destination: itinerarySeed.destination,
      startDate: itinerarySeed.startDate,
      endDate: itinerarySeed.endDate,
      duration: itinerarySeed.days.length,
      budget: {
        level: itinerarySeed.budget.level,
        estimatedTotal: itinerarySeed.budget.estimatedTotal,
        currency: itinerarySeed.budget.currency,
      },
      preferences: itinerarySeed.preferences,
      days: itinerarySeed.days,
      status: itinerarySeed.status,
      generatedByAI: itinerarySeed.generatedByAI,
      isPublic: itinerarySeed.isPublic,
      likes: [],
      views: itinerarySeed.views,
      lastEditedBy: owner._id,
      lastEditedAt: new Date(),
      aiPrompt: null,
    };

    const existing = await Itinerary.findOne({ title: itinerarySeed.title, owner: owner._id });
    if (existing) {
      await Itinerary.updateOne({ _id: existing._id }, { $set: payload });
      updated += 1;
    } else {
      await Itinerary.create(payload);
      upserted += 1;
    }
  }

  console.log(`Seed concluída: ${upserted} criados, ${updated} atualizados.`);
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error('Erro ao executar seed pública do Explore:', error);
  try {
    await mongoose.disconnect();
  } catch (disconnectError) {
    console.error('Erro ao desconectar do MongoDB:', disconnectError);
  }
  process.exit(1);
});
