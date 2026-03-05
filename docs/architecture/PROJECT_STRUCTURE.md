# Estrutura do Projeto

**Organização completa do repositório**

---

## 📁 Estrutura Geral

```
guia-aventureiro/
├── .github/                    # GitHub Actions CI/CD
│   └── workflows/
│       └── test.yml            # Pipeline de testes
├── automation/                 # Testes E2E (237 tests)
│   ├── tests/
│   │   ├── auth/               # Testes de autenticação
│   │   ├── itinerary/          # Testes de roteiros
│   │   ├── subscription/       # Testes de assinatura
│   │   └── helpers/            # 🆕 testRetry, testFixtures
│   ├── TESTING_BEST_PRACTICES.md
│   └── jest.config.js          # Config com coverage
├── backend/                    # API Node.js + Express
│   ├── src/
│   │   ├── config/             # DB, Cloudinary config
│   │   ├── constants/          # 🆕 errorCodes, limits, messages
│   │   ├── controllers/        # Lógica de negócio
│   │   ├── fixtures/           # 🆕 Seed data (users, itineraries)
│   │   ├── helpers/            # 🆕 date, string, response, validation
│   │   ├── middleware/         # Auth, validation, error handling
│   │   ├── models/             # Mongoose models
│   │   ├── routes/             # Express routes
│   │   ├── services/           # Stripe, email, external APIs
│   │   └── validators/         # 🆕 Joi schemas (user, itinerary)
│   ├── scripts/                # 🆕 seed.js, healthCheck.js, backup.js
│   ├── BACKEND_BEST_PRACTICES.md  # 🆕 600+ linhas
│   ├── server.js               # Entry point
│   └── package.json
├── mobile/                     # React Native + Expo
│   ├── src/
│   │   ├── components/         # Componentes reutilizáveis
│   │   ├── contexts/           # Context API (Auth, theme)
│   │   ├── fixtures/           # 🆕 mockData (users, itineraries)
│   │   ├── helpers/            # 🆕 formatters, validators, dateHelpers
│   │   ├── hooks/              # Custom hooks
│   │   ├── navigation/         # React Navigation
│   │   ├── screens/            # Telas do app
│   │   ├── services/           # API calls (Axios)
│   │   ├── theme/              # 🆕 colors, spacing, typography, shadows
│   │   └── utils/              # Utilitários
│   ├── assets/                 # Imagens, fontes
│   ├── MOBILE_BEST_PRACTICES.md   # 🆕 600+ linhas
│   ├── App.tsx
│   └── package.json
├── docs/                       # 🆕 Documentação organizada
│   ├── INDEX.md                # Hub central (você está aqui: ../../INDEX.md)
│   ├── api/                    # API docs
│   │   ├── API.md              # Endpoints
│   │   ├── STRIPE.md           # Stripe integration
│   │   ├── CLOUDINARY.md       # Upload images
│   │   └── FIREBASE.md         # Push notifications
│   ├── architecture/           # Arquitetura
│   │   ├── OVERVIEW.md         # Visão geral
│   │   ├── PROJECT_STRUCTURE.md # Este arquivo
│   │   ├── DATABASE.md         # Schemas MongoDB
│   │   └── FLOWS.md            # Fluxos do sistema
│   ├── deployment/             # Deploy & produção
│   │   ├── DEPLOY_CHECKLIST.md
│   │   ├── IMPLEMENTATION_GUIDE_PRODUCTION_READY.md
│   │   └── APP_STORE_DESCRIPTIONS.md
│   ├── guides/                 # Guias práticos
│   │   ├── FAQ.md
│   │   ├── mobile/
│   │   │   ├── INTEGRATION_GUIDE.md
│   │   │   └── FIREBASE_SETUP.md
│   │   └── backend/
│   │       └── SCRIPTS.md
│   └── business/               # Negócio
│       ├── ORCAMENTO.md
│       └── SUBSCRIPTION_PLANS.md
├── landing-page/               # Landing page (HTML/CSS/JS)
├── CONTRIBUTING.md             # 🆕 Guia de contribuição
├── README.md                   # README principal
├── ROADMAP.md                  # Planejamento
├── CHANGELOG.md                # Histórico de mudanças
└── .gitignore
```

---

## 📂 Detalhamento por Pasta

### **backend/src/**

```
src/
├── config/                     # Configurações
│   ├── database.js             # MongoDB connection
│   └── cloudinary.js           # Cloudinary setup
├── constants/                  # 🆕 Centralizados
│   ├── errorCodes.js           # AUTH_001, VAL_001, SUB_001...
│   ├── limits.js               # Subscription limits, pagination
│   ├── messages.js             # SUCCESS, ERRORS, WARNINGS
│   └── index.js                # Barrel export
├── controllers/                # Lógica de negócio
│   ├── authController.js       # Login, signup, logout
│   ├── userController.js       # GetProfile, update, delete
│   ├── itineraryController.js  # CRUD roteiros
│   └── subscriptionController.js # Stripe payments
├── fixtures/                   # 🆕 Seed data
│   ├── users.js                # 5 usuários + factory
│   ├── itineraries.js          # 5 roteiros + factory
│   └── index.js
├── helpers/                    # 🆕 Funções utilitárias
│   ├── dateHelpers.js          # formatDate, addDays, daysBetween
│   ├── stringHelpers.js        # slugify, truncate, sanitize
│   ├── responseHelpers.js      # success, error, paginated
│   ├── validationHelpers.js    # isValidEmail, validatePassword
│   └── index.js
├── middleware/                 # Express middleware
│   ├── auth.js                 # JWT authentication
│   ├── errorHandler.js         # Global error handler
│   └── rateLimiter.js          # Rate limiting
├── models/                     # Mongoose models
│   ├── User.js
│   ├── Itinerary.js
│   ├── Subscription.js
│   └── Notification.js
├── routes/                     # Express routes
│   ├── authRoutes.js           # /api/auth/*
│   ├── userRoutes.js           # /api/users/*
│   ├── itineraryRoutes.js      # /api/itineraries/*
│   └── subscriptionRoutes.js   # /api/subscriptions/*
├── services/                   # Serviços externos
│   ├── stripeService.js        # Stripe API
│   ├── emailService.js         # Email (futuro)
│   └── cloudinaryService.js    # Upload images
└── validators/                 # 🆕 Joi schemas
    ├── userValidator.js        # signup, login, updateProfile
    ├── itineraryValidator.js   # create, update, addDay
    └── index.js
```

### **mobile/src/**

```
src/
├── components/                 # Componentes reutilizáveis
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── ItineraryCard.tsx
│   └── LoadingSpinner.tsx
├── contexts/                   # Context API
│   ├── AuthContext.tsx         # Auth state global
│   └── ThemeContext.tsx        # Theme provider (futuro)
├── fixtures/                   # 🆕 Mock data
│   ├── mockData.ts             # Users, itineraries, categories
│   └── index.ts
├── helpers/                    # 🆕 Utilitários
│   ├── formatters.ts           # formatCurrency, formatDate, formatPhone
│   ├── validators.ts           # isValidEmail, validatePassword, isValidCPF
│   ├── dateHelpers.ts          # addDays, daysBetween, isFuture
│   └── index.ts
├── hooks/                      # Custom hooks
│   ├── useAuth.ts              # Hook authentication
│   ├── useItineraries.ts       # Hook data fetching
│   └── useTypedNavigation.ts   # Typed navigation
├── navigation/                 # React Navigation
│   ├── RootNavigator.tsx       # Stack principal
│   ├── TabNavigator.tsx        # Bottom tabs
│   └── types.ts                # Navigation types
├── screens/                    # Telas
│   ├── auth/
│   │   ├── LoginScreen.tsx
│   │   └── SignupScreen.tsx
│   ├── home/
│   │   └── HomeScreen.tsx
│   ├── itinerary/
│   │   ├── ItineraryListScreen.tsx
│   │   ├── ItineraryDetailsScreen.tsx
│   │   └── CreateItineraryScreen.tsx
│   └── profile/
│       └── ProfileScreen.tsx
├── services/                   # API services
│   ├── api.ts                  # Axios config
│   ├── authService.ts          # Auth endpoints
│   ├── itineraryService.ts     # Itinerary endpoints
│   └── subscriptionService.ts  # Stripe endpoints
├── theme/                      # 🆕 Design tokens
│   ├── colors.ts               # 80+ cores
│   ├── spacing.ts              # Sistema de espaçamento
│   ├── typography.ts           # Font sizes, weights
│   ├── shadows.ts              # Cross-platform shadows
│   └── index.ts
└── utils/                      # Outros utilitários
    └── storage.ts              # AsyncStorage helpers
```

### **automation/tests/**

```
tests/
├── auth/                       # Testes auth (22 tests)
│   ├── signup.test.js
│   ├── login.test.js
│   └── token.test.js
├── itinerary/                  # Testes itinerary (87 tests)
│   ├── create.test.js
│   ├── update.test.js
│   ├── delete.test.js
│   ├── list.test.js
│   └── days.test.js
├── subscription/               # Testes subscription (35 tests)
│   ├── upgrade.test.js
│   ├── limits.test.js
│   └── webhook.test.js
├── helpers/                    # 🆕 Test utilities
│   ├── testRetry.js            # Retry logic, axiosWithRetry
│   ├── testFixtures.js         # Fixtures factories
│   └── testCleanup.js          # DB cleanup
└── integration/                # Testes E2E (93 tests)
    ├── full-flow.test.js
    └── gamification.test.js
```

---

## 🆕 Novidades da Reorganização

### Backend (Fase 1)

✅ **constants/** - Centralizou 268 linhas de magic numbers
✅ **helpers/** - 56 funções utilitárias reutilizáveis
✅ **validators/** - 350 linhas de Joi schemas
✅ **fixtures/** - Seed data para desenvolvimento
✅ **scripts/** - seed.js, healthCheck.js, backup.js
✅ **BACKEND_BEST_PRACTICES.md** - 600+ linhas de docs

### Mobile (Fase 2)

✅ **theme/** - Design system completo (colors, spacing, typography, shadows)
✅ **helpers/** - 450 linhas de formatters/validators/dateHelpers
✅ **fixtures/** - Mock data para desenvolvimento e testes
✅ **MOBILE_BEST_PRACTICES.md** - 600+ linhas de docs

### Docs (Fase 3)

✅ **docs/INDEX.md** - Hub central de navegação
✅ **docs/** organizado em api/, architecture/, deployment/, guides/, business/
✅ **CONTRIBUTING.md** - Guia de contribuição completo

---

## 📊 Estatísticas

- **Total de arquivos criados**: 30+ arquivos novos
- **Linhas de código adicionadas**: ~3500 linhas
- **Documentação**: ~2500 linhas
- **Testes**: 237 testes (94% passing)
- **Coverage**: 65% lines, 50% branches

---

## 🔍 Busca Rápida

**Precisa encontrar algo?**

- **Constantes**: `backend/src/constants/`
- **Helpers backend**: `backend/src/helpers/`
- **Helpers mobile**: `mobile/src/helpers/`
- **Theme tokens**: `mobile/src/theme/`
- **Fixtures backend**: `backend/src/fixtures/`
- **Mock data mobile**: `mobile/src/fixtures/`
- **Validators**: `backend/src/validators/`
- **Scripts**: `backend/scripts/`
- **Docs API**: `docs/api/`
- **Best Practices**: `backend/BACKEND_BEST_PRACTICES.md` ou `mobile/MOBILE_BEST_PRACTICES.md`

---

**📝 Última atualização**: Janeiro 2026
