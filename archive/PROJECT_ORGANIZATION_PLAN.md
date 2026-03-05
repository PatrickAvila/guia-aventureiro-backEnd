# 🏗️ PLANO DE REORGANIZAÇÃO - Guia Aventureiro

**Data:** 3 de Março de 2026
**Status:** 📋 Proposta de arquitetura organizada

---

## 🎯 Objetivo

Aplicar o mesmo padrão de organização usado em `automation/` para **todo o projeto**, garantindo:
- ✅ **Rastreabilidade**: Fácil encontrar código relacionado
- ✅ **Manutenibilidade**: Estrutura clara para mudanças
- ✅ **Escalabilidade**: Pronto para crescer sem virar bagunça
- ✅ **Onboarding**: Novos devs entendem rápido
- ✅ **Consistência**: Padrões seguidos em todo o código

---

## 📂 Estrutura Proposta

\`\`\`
guia-aventureiro/
├── 📁 automation/          ✅ JÁ ORGANIZADO
│   ├── tests/
│   │   ├── helpers/       (testRetry, testFixtures, testCleanup)
│   │   └── *.test.js
│   ├── scripts/           (generate-report, verifyCleanup)
│   ├── TESTING_BEST_PRACTICES.md
│   └── jest.config.js
│
├── 📁 backend/             🔄 MELHORAR
│   ├── src/
│   │   ├── config/        ✅ Existente (database, stripe, etc)
│   │   ├── constants/     🆕 CRIAR (errorCodes, limits, messages)
│   │   ├── controllers/   ✅ Existente
│   │   ├── fixtures/      🆕 CRIAR (seedData, mockUsers, mockItineraries)
│   │   ├── helpers/       🆕 CRIAR (dateHelpers, stringHelpers, validationHelpers)
│   │   ├── middleware/    ✅ Existente
│   │   ├── models/        ✅ Existente
│   │   ├── routes/        ✅ Existente
│   │   ├── services/      ✅ Existente
│   │   ├── utils/         ✅ Melhorar (logger, createIndexes)
│   │   └── validators/    🆕 CRIAR (userValidator, itineraryValidator)
│   ├── scripts/           🆕 CRIAR (seed, healthCheck, migration, backup)
│   ├── BACKEND_BEST_PRACTICES.md  🆕 CRIAR
│   └── API_CONVENTIONS.md          🆕 CRIAR
│
├── 📁 mobile/              🔄 MELHORAR
│   ├── src/
│   │   ├── components/    ✅ Melhorar (base/, forms/, layout/)
│   │   ├── config/        ✅ Existente
│   │   ├── constants/     ✅ Melhorar (categorizar por tipo)
│   │   ├── contexts/      ✅ Existente
│   │   ├── fixtures/      🆕 CRIAR (mockData, sampleItineraries)
│   │   ├── helpers/       🆕 CRIAR (dateHelpers, formatters, validators)
│   │   ├── hooks/         ✅ Expandir (useFetch, useDebounce, useAsync)
│   │   ├── lib/           🆕 CRIAR (analytics, storage, permissions)
│   │   ├── navigation/    ✅ Existente
│   │   ├── screens/       ✅ Existente
│   │   ├── services/      ✅ Existente
│   │   ├── theme/         🆕 CRIAR (colors, spacing, typography, shadows)
│   │   ├── types/         ✅ Existente
│   │   └── utils/         ✅ Existente
│   ├── scripts/           🆕 CRIAR (build, deploy, generate-icons)
│   ├── MOBILE_BEST_PRACTICES.md  🆕 CRIAR
│   └── COMPONENTS_GUIDE.md       🆕 CRIAR
│
├── 📁 docs/                🔄 REORGANIZAR
│   ├── api/               🆕 CRIAR (endpoints, schemas, examples)
│   ├── architecture/      🆕 CRIAR (diagrams, decisions)
│   ├── deployment/        🆕 CRIAR (aws, render, vercel)
│   ├── development/       🆕 CRIAR (setup, conventions, debugging)
│   ├── mobile/            🆕 CRIAR (components, navigation, state)
│   ├── INDEX.md           🆕 CRIAR (hub central)
│   └── CONTRIBUTING.md    🆕 CRIAR
│
├── 📁 scripts/             🆕 CRIAR (root-level utilities)
│   ├── setup-dev.sh       (Setup completo dev)
│   ├── restart-services.sh (Kill + restart backend/mobile)
│   ├── health-check.sh    (Verificar todos os serviços)
│   └── backup-db.sh       (Backup MongoDB)
│
├── 📁 .vscode/             🆕 CRIAR (settings compartilhados)
│   ├── settings.json      (Prettier, ESLint, formatação)
│   ├── extensions.json    (Extensões recomendadas)
│   └── launch.json        (Debug configs)
│
├── .editorconfig           🆕 CRIAR (Consistência IDE)
├── .prettierrc             🆕 CRIAR (Formatação)
├── PROJECT_STRUCTURE.md    🆕 CRIAR (Este arquivo expandido)
└── README.md               ✅ Atualizar com nova estrutura
\`\`\`

---

## 🔧 Implementação Fase 1: Backend

### 1.1 Criar \`backend/src/constants/\`

\`\`\`javascript
// constants/errorCodes.js
module.exports = {
  AUTH: {
    INVALID_CREDENTIALS: 'AUTH_001',
    TOKEN_EXPIRED: 'AUTH_002',
    UNAUTHORIZED: 'AUTH_003',
  },
  VALIDATION: {
    INVALID_INPUT: 'VAL_001',
    MISSING_FIELD: 'VAL_002',
  },
  SUBSCRIPTION: {
    LIMIT_REACHED: 'SUB_001',
    INVALID_TIER: 'SUB_002',
  }
};

// constants/limits.js
module.exports = {
  SUBSCRIPTION_LIMITS: {
    free: {
      itineraries: 3,
      collaborators: 0,
      photos: 10,
      aiGenerations: 1,
    },
    premium: {
      itineraries: Infinity,
      collaborators: 10,
      photos: 100,
      aiGenerations: 50,
    },
  },
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
  },
  FILE_SIZE: {
    MAX_PHOTO_SIZE: 5 * 1024 * 1024, // 5MB
    MAX_AVATAR_SIZE: 2 * 1024 * 1024, // 2MB
  }
};

// constants/messages.js
module.exports = {
  SUCCESS: {
    CREATED: 'Recurso criado com sucesso',
    UPDATED: 'Recurso atualizado com sucesso',
    DELETED: 'Recurso removido com sucesso',
  },
  ERRORS: {
    NOT_FOUND: 'Recurso não encontrado',
    UNAUTHORIZED: 'Acesso não autorizado',
    VALIDATION_FAILED: 'Dados inválidos',
  }
};
\`\`\`

### 1.2 Criar \`backend/src/helpers/\`

\`\`\`javascript
// helpers/dateHelpers.js
const dayjs = require('dayjs');

module.exports = {
  formatDate: (date, format = 'YYYY-MM-DD') => dayjs(date).format(format),
  addDays: (date, days) => dayjs(date).add(days, 'day').toDate(),
  isFuture: (date) => dayjs(date).isAfter(dayjs()),
  daysBetween: (start, end) => dayjs(end).diff(dayjs(start), 'day'),
};

// helpers/stringHelpers.js
module.exports = {
  slugify: (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  truncate: (text, maxLength) => text.length > maxLength ? \`\${text.slice(0, maxLength)}...\` : text,
  sanitizeEmail: (email) => email.toLowerCase().trim(),
};

// helpers/responseHelpers.js
module.exports = {
  success: (res, data, message, statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  },
  error: (res, message, statusCode = 500, errorCode = null) => {
    return res.status(statusCode).json({
      success: false,
      message,
      errorCode,
    });
  },
  paginated: (res, data, page, pageSize, total) => {
    return res.status(200).json({
      success: true,
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  },
};
\`\`\`

### 1.3 Criar \`backend/src/validators/\`

\`\`\`javascript
// validators/userValidator.js
const Joi = require('joi');

const signupSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  acceptedTerms: Joi.boolean().valid(true).required(),
});

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  avatar: Joi.string().uri(),
  bio: Joi.string().max(500),
});

module.exports = {
  validateSignup: (data) => signupSchema.validate(data),
  validateUpdateProfile: (data) => updateProfileSchema.validate(data),
};

// validators/itineraryValidator.js
const Joi = require('joi');

const createItinerarySchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  destination: Joi.object({
    city: Joi.string().required(),
    country: Joi.string().required(),
  }).required(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')).required(),
  duration: Joi.number().integer().min(1).max(365),
});

module.exports = {
  validateCreate: (data) => createItinerarySchema.validate(data),
};
\`\`\`

### 1.4 Criar \`backend/src/fixtures/\`

\`\`\`javascript
// fixtures/users.js
module.exports = {
  sampleUsers: [
    {
      name: 'Demo User',
      email: 'demo@guia-aventureiro.com',
      password: 'Demo@123',
      subscriptionTier: 'free',
    },
    {
      name: 'Premium Demo',
      email: 'premium@guia-aventureiro.com',
      password: 'Demo@123',
      subscriptionTier: 'premium',
    },
  ],
};

// fixtures/itineraries.js
module.exports = {
  sampleItineraries: [
    {
      title: 'Roteiro Completo Rio de Janeiro',
      destination: { city: 'Rio de Janeiro', country: 'Brasil' },
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-06-07'),
      duration: 7,
      budget: { level: 'medio', estimatedTotal: 2500, currency: 'BRL' },
      activities: [
        { day: 1, description: 'Cristo Redentor', location: 'Corcovado' },
        { day: 2, description: 'Praias', location: 'Copacabana/Ipanema' },
      ],
    },
  ],
};
\`\`\`

### 1.5 Criar \`backend/scripts/\`

\`\`\`javascript
// scripts/seed.js
const mongoose = require('mongoose');
const User = require('../src/models/User');
const { sampleUsers } = require('../src/fixtures/users');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  await User.deleteMany({ email: /@guia-aventureiro\\.com$/ });
  await User.insertMany(sampleUsers);
  console.log('✅ Database seeded');
  process.exit(0);
}

seed();
\`\`\`

---

## 🔧 Implementação Fase 2: Mobile

### 2.1 Melhorar \`mobile/src/constants/\`

\`\`\`typescript
// constants/index.ts (barrel export)
export * from './api';
export * from './errors';
export * from './limits';
export * from './routes';
export * from './storage';

// constants/api.ts
export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: '/auth/signup',
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
  },
  ITINERARIES: {
    LIST: '/roteiros',
    CREATE: '/roteiros',
    DETAIL: (id: string) => \`/roteiros/\${id}\`,
  },
} as const;

// constants/errors.ts
export const ERROR_MESSAGES = {
  NETWORK: 'Erro de conexão. Verifique sua internet.',
  UNAUTHORIZED: 'Sessão expirada. Faça login novamente.',
  VALIDATION: 'Dados inválidos. Verifique os campos.',
} as const;

// constants/limits.ts
export const LIMITS = {
  FREE: {
    ITINERARIES: 3,
    PHOTOS: 10,
    AI_GENERATIONS: 1,
  },
  PREMIUM: {
    ITINERARIES: Infinity,
    PHOTOS: 100,
    AI_GENERATIONS: 50,
  },
} as const;
\`\`\`

### 2.2 Criar \`mobile/src/helpers/\`

\`\`\`typescript
// helpers/formatters.ts
export const formatCurrency = (value: number, currency: string = 'BRL'): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(value);
};

export const formatDate = (date: Date | string, format: 'short' | 'long' = 'short'): string => {
  const d = new Date(date);
  return format === 'short'
    ? d.toLocaleDateString('pt-BR')
    : d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
};

export const formatDuration = (days: number): string => {
  if (days === 1) return '1 dia';
  if (days < 7) return \`\${days} dias\`;
  const weeks = Math.floor(days / 7);
  return weeks === 1 ? '1 semana' : \`\${weeks} semanas\`;
};

// helpers/validators.ts
export const isValidEmail = (email: string): boolean => {
  return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
};

export const isStrongPassword = (password: string): boolean => {
  return password.length >= 6 && /[A-Z]/.test(password) && /[0-9]/.test(password);
};
\`\`\`

### 2.3 Criar \`mobile/src/fixtures/\`

\`\`\`typescript
// fixtures/mockData.ts
export const MOCK_USER = {
  _id: 'mock-user-1',
  name: 'Usuário Demo',
  email: 'demo@example.com',
  avatar: 'https://i.pravatar.cc/150?img=1',
  subscriptionTier: 'free',
};

export const MOCK_ITINERARIES = [
  {
    _id: 'mock-itinerary-1',
    title: 'Roteiro Rio de Janeiro',
    destination: { city: 'Rio de Janeiro', country: 'Brasil' },
    coverImage: 'https://source.unsplash.com/800x600/?rio-de-janeiro',
    duration: 7,
    budget: { level: 'medio', estimatedTotal: 2500, currency: 'BRL' },
  },
];
\`\`\`

### 2.4 Criar \`mobile/src/theme/\`

\`\`\`typescript
// theme/index.ts
export const theme = {
  colors: {
    primary: '#FF6B6B',
    secondary: '#4ECDC4',
    background: '#F7F7F7',
    text: '#333333',
    error: '#E74C3C',
    success: '#2ECC71',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    h1: { fontSize: 32, fontWeight: 'bold' },
    h2: { fontSize: 24, fontWeight: 'bold' },
    body: { fontSize: 16, fontWeight: 'normal' },
    caption: { fontSize: 12, fontWeight: 'normal' },
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
  },
};
\`\`\`

---

## 📚 Implementação Fase 3: Documentação

### 3.1 Criar \`docs/INDEX.md\`

\`\`\`markdown
# 📚 Documentação - Guia do Aventureiro

## 🗂️ Índice

### Para Desenvolvedores
- [Setup e Instalação](development/SETUP.md)
- [Convenções de Código](development/CONVENTIONS.md)
- [Debugging](development/DEBUGGING.md)
- [Contribuindo](CONTRIBUTING.md)

### Backend
- [Arquitetura](architecture/BACKEND_ARCHITECTURE.md)
- [API Reference](api/README.md)
- [Boas Práticas](../backend/BACKEND_BEST_PRACTICES.md)
- [Modelos de Dados](api/schemas/)

### Mobile
- [Arquitetura](architecture/MOBILE_ARCHITECTURE.md)
- [Componentes](../mobile/COMPONENTS_GUIDE.md)
- [Navegação](mobile/NAVIGATION.md)
- [State Management](mobile/STATE.md)

### Deploy
- [AWS Deploy](deployment/AWS.md)
- [Render Deploy](deployment/RENDER.md)
- [CI/CD](deployment/CICD.md)

### Outros
- [Stripe Integration](STRIPE.md)
- [Privacy Policy](privacy.html)
- [Terms of Service](terms.html)
\`\`\`

---

## 🛠️ Implementação Fase 4: Tooling

### 4.1 Criar \`.vscode/settings.json\`

\`\`\`json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.associations": {
    "*.js": "javascript",
    "*.ts": "typescript",
    "*.tsx": "typescriptreact"
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/coverage": true,
    "**/.expo": true
  }
}
\`\`\`

### 4.2 Criar \`.editorconfig\`

\`\`\`ini
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false
\`\`\`

---

## 📊 Benefícios Esperados

| Aspecto | Antes | Depois | Ganho |
|---------|-------|--------|-------|
| **Organização** | Dispersa | Centralizada | +90% |
| **Rastreabilidade** | Difícil encontrar | Estrutura clara | +80% |
| **Reutilização** | Código duplicado | Helpers centralizados | +70% |
| **Onboarding** | 3-5 dias | 1-2 dias | -60% tempo |
| **Manutenibilidade** | Média | Alta | +100% |
| **Escalabilidade** | Limitada | Pronta | ✅ |

---

## ✅ Checklist de Implementação

### Fase 1: Backend (1-2 dias)
- [ ] Criar \`constants/\` (errorCodes, limits, messages)
- [ ] Criar \`helpers/\` (date, string, response)
- [ ] Criar \`validators/\` (user, itinerary, etc)
- [ ] Criar \`fixtures/\` (seed data)
- [ ] Criar \`scripts/\` (seed, health, backup)
- [ ] Documentar \`BACKEND_BEST_PRACTICES.md\`
- [ ] Atualizar imports nos controllers

### Fase 2: Mobile (1-2 dias)
- [ ] Reorganizar \`constants/\` com categorias
- [ ] Criar \`helpers/\` (formatters, validators)
- [ ] Criar \`fixtures/\` (mock data)
- [ ] Criar \`theme/\` centralizado
- [ ] Criar \`lib/\` para utilities
- [ ] Documentar \`MOBILE_BEST_PRACTICES.md\`
- [ ] Documentar \`COMPONENTS_GUIDE.md\`

### Fase 3: Docs (4-6h)
- [ ] Criar \`docs/INDEX.md\`
- [ ] Organizar em pastas (api/, mobile/, deployment/)
- [ ] Criar \`CONTRIBUTING.md\`
- [ ] Documentar arquitetura

### Fase 4: Tooling (2-3h)
- [ ] Criar \`.vscode/\` configs
- [ ] Criar \`.editorconfig\`
- [ ] Criar \`.prettierrc\`
- [ ] Criar \`scripts/\` no root

### Fase 5: Migration (1 dia)
- [ ] Atualizar imports antigos
- [ ] Mover código para novos helpers
- [ ] Testar todas as features
- [ ] Atualizar README.md

---

## 🚀 Próximos Passos

1. **Revisar proposta** e ajustar se necessário
2. **Aprovar fase por fase** para não quebrar nada
3. **Implementar incrementalmente** (1-2 features por dia)
4. **Testar depois de cada fase**
5. **Documentar as mudanças** no CHANGELOG

---

**Quer que eu comece a implementar? Qual fase prefere primeiro?**

- [ ] **Fase 1: Backend** (constants, helpers, validators)
- [ ] **Fase 2: Mobile** (theme, helpers, fixtures)
- [ ] **Fase 3: Docs** (reorganizar documentação)
- [ ] **Fase 4: Tooling** (.vscode, .editorconfig)
- [ ] **Todas as fases** (implementação completa)
\`\`\`
