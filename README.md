# 🗺️ Guia do Aventureiro

**Planeje suas viagens com Inteligência Artificial**

![Status](https://img.shields.io/badge/status-MVP%20Completo-success)
![Versão](https://img.shields.io/badge/versão-1.0.7-blue)
![Testes](https://img.shields.io/badge/testes-94.1%25%20passando-brightgreen)
![Licença](https://img.shields.io/badge/licença-MIT-green)

---

## 📱 Sobre o Projeto

O **Guia do Aventureiro** é um aplicativo mobile que utiliza Inteligência Artificial para criar roteiros de viagem personalizados em segundos. Com ele, você pode planejar, organizar e compartilhar suas aventuras de forma simples e intuitiva.

### ✨ Features Principais

- 🤖 **IA Groq (Llama 3.3):** Roteiros personalizados em 1-2 segundos
- 📸 **Upload de Fotos:** Até 10 fotos por roteiro (Cloudinary)
- 💰 **Controle de Orçamento:** Gerencie gastos por categoria
- 💳 **Pagamentos Stripe:** Sistema completo de assinaturas Premium
- 🌍 **Explorar:** Descubra roteiros de outros viajantes
- ⭐ **Avaliações:** Sistema completo de reviews e comentários
- 🏆 **Gamificação:** 20 conquistas e sistema de níveis
- 📱 **Modo Offline:** Cache e sincronização automática
- 🌓 **Temas:** Modo claro e escuro
- 🎓 **Tutorial Híbrido:** Onboarding + tooltips contextuais inteligentes
- 🔐 **Segurança:** Rate limiting, validações, autenticação JWT

---

## 🏗️ Arquitetura

### **Backend (Node.js + Express)**
```
backend/
├── src/
│   ├── config/          # Configurações (DB, Cloudinary)
│   ├── controllers/     # Lógica de negócio
│   ├── middleware/      # Auth, validators, rate limiting
│   ├── models/          # Schemas MongoDB
│   ├── routes/          # Rotas da API
│   ├── services/        # Serviços (IA, orçamento)
│   └── utils/           # Utilitários (logger)
├── logs/                # Logs da aplicação
├── .env                 # Variáveis de ambiente (NÃO COMMITAR)
├── .env.example         # Template de variáveis
├── package.json
└── server.js            # Entry point
```

### **Mobile (React Native + Expo)**
```
mobile/
├── src/
│   ├── components/      # Componentes reutilizáveis
│   │   └── Tooltip.tsx  # Componente de tooltip contextual
│   ├── config/          # Configurações (env)
│   ├── constants/       # Constantes (cores, temas)
│   ├── contexts/        # Context API (Auth, Theme)
│   ├── hooks/           # Custom hooks
│   │   └── useTooltip.ts # Hook de gerenciamento de tooltips
│   ├── navigation/      # React Navigation
│   ├── screens/         # Telas do app
│   ├── services/        # APIs e serviços
│   ├── types/           # TypeScript types
│   └── utils/           # Utilitários
├── assets/              # Imagens, fontes
├── app.json             # Configuração Expo
├── App.tsx              # Entry point
└── package.json
```

---

## 🚀 Como Rodar o Projeto

### **Pré-requisitos**

- Node.js 20+ ([Download](https://nodejs.org))
- npm ou yarn
- MongoDB Atlas (grátis) ou MongoDB local
- Expo CLI: `npm install -g expo-cli`
- Contas gratuitas:
  - [Groq AI](https://console.groq.com/keys) - IA grátis
  - [MongoDB Atlas](https://cloud.mongodb.com) - Database grátis
  - [Cloudinary](https://cloudinary.com) - Upload de fotos grátis

---

### **1️⃣ Backend (Node.js)**

```bash
# Entrar na pasta do backend
cd backend

# Instalar dependências
npm install

# Copiar .env.example para .env
cp .env.example .env
# Windows: copy .env.example .env

# Para produção, use o template dedicado
# Windows: copy .env.production.example .env.production
# (arquivo em backend/.env.production.example)

# Editar .env e preencher:
# - MONGO_URI (MongoDB Atlas ou local)
# - GROQ_API_KEY (https://console.groq.com/keys)
# - CLOUDINARY_* (https://cloudinary.com/console)
# - JWT_SECRET e JWT_REFRESH_SECRET (gerar com crypto)

# Gerar JWT secrets fortes
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Rodar servidor (desenvolvimento)
npm run dev

# Servidor rodará em: http://localhost:3000
# Health check: http://localhost:3000/health
```

---

### **2️⃣ Mobile (React Native/Expo)**

```bash
# Entrar na pasta mobile
cd mobile

# Instalar dependências
npm install

# Criar arquivo de ambiente local
# Windows: copy .env.local.example .env.local
# Mac/Linux: cp .env.local.example .env.local

# Em .env.local, configure:
# EXPO_PUBLIC_LOCAL_API_URL=http://SEU-IP-LOCAL:3000/api
# EXPO_PUBLIC_PROD_API_URL=https://seu-backend-producao/api

# Rodar em ambiente local (Expo Go + backend local)
npm run start:local

# Rodar simulando ambiente de produção (usa API de produção)
npm run start:prod

# Opções:
# - Pressione 'a' para Android (emulador ou físico)
# - Pressione 'i' para iOS (apenas Mac)
# - Escanear QR Code com Expo Go (iOS/Android)
```

**Encontrar seu IP local:**
```bash
# Windows
ipconfig
# Procure por "Endereço IPv4" (ex: 192.168.1.100)

# Mac/Linux
ifconfig | grep inet
```

---

## 🔑 Configuração de Variáveis de Ambiente

### **Backend (.env)**

```env
# MongoDB Atlas (Recomendado)
MONGO_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/guia_aventureiro_db

# JWT Secrets (GERAR NOVOS!)
JWT_SECRET=072d43d7b528fcbb06bd623d42cb465201ee32bb7692795bf709a0371e03390a
JWT_REFRESH_SECRET=59364e349be282ea5ef77b447bc710e9126ec06c2048044236bfebedc8d814bf

# Groq AI (Grátis - 14.400 req/dia)
GROQ_API_KEY=gsk_SUA_CHAVE_AQUI

# Cloudinary (Grátis - 25GB)
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=seu_api_secret
```

### **Mobile (src/config/env.ts)**

```typescript
// O app lê de variáveis EXPO_PUBLIC_* no .env.local
// e seleciona ambiente por EXPO_PUBLIC_APP_ENV (local|production)
```

---

## 📚 API Documentation

### **Base URL**
```
http://localhost:3000/api
```

### **Principais Endpoints**

#### **Autenticação**
```http
POST   /api/auth/register        # Cadastro
POST   /api/auth/login           # Login
POST   /api/auth/refresh         # Refresh token
GET    /api/auth/me              # Dados do usuário
```

#### **Roteiros (Itinerários)**
```http
GET    /api/itineraries          # Listar roteiros (paginado)
POST   /api/itineraries          # Criar roteiro
GET    /api/itineraries/:id      # Detalhe do roteiro
PUT    /api/itineraries/:id      # Atualizar roteiro
DELETE /api/itineraries/:id      # Deletar roteiro
```

#### **IA (Geração de Roteiros)**
```http
POST   /api/ai/generate          # Gerar roteiro com IA
```

#### **Explorar**
```http
GET    /api/explore              # Feed de roteiros públicos
GET    /api/explore/trending     # Roteiros em alta
POST   /api/explore/:id/like     # Curtir roteiro
POST   /api/explore/:id/save     # Salvar roteiro
```

#### **Avaliações**
```http
POST   /api/ratings/:itineraryId # Criar avaliação
GET    /api/ratings/:itineraryId # Listar avaliações
```

#### **Conquistas**
```http
GET    /api/achievements         # Listar conquistas do usuário
GET    /api/achievements/stats   # Estatísticas
```

📖 **Documentação completa:**
- [API.md](API.md) - Documentação completa da API
- [docs/INDEX.md](docs/INDEX.md) - Hub central da documentação
- [docs/STRIPE.md](docs/STRIPE.md) - Sistema de assinatura e pagamentos
- [CHANGELOG.md](CHANGELOG.md) - Histórico de mudanças
- [automation/README.md](automation/README.md) - Guia de testes

---

## 🛠️ Stack Tecnológica

### **Backend**
- Node.js 20+
- Express.js
- MongoDB + Mongoose
- JWT (autenticação)
- Groq AI (Llama 3.3 70B)
- Cloudinary (upload)
- Helmet (segurança)
- Winston (logs)

### **Mobile**
- React Native
- Expo (SDK 50+)
- TypeScript
- React Navigation
- AsyncStorage (persistência de tooltips e onboarding)
- Axios
- Sistema de Tutorial Híbrido (onboarding screens + tooltips contextuais)

### **DevOps**
- Render (backend hosting)
- MongoDB Atlas (database)
- Cloudinary (imagens)
- Expo EAS (mobile builds)

---

## 📊 Status do Projeto

### **MVP Completo ✅ (20/20 features)**

- ✅ Autenticação e perfis
- ✅ Geração de roteiros com IA (Groq)
- ✅ Upload de fotos
- ✅ Sistema de orçamento
- ✅ Modo offline
- ✅ Avaliações e compartilhamento
- ✅ Explorar roteiros públicos
- ✅ Gamificação
- ✅ Temas claro/escuro
- ✅ Tutorial híbrido (onboarding + tooltips)
- ✅ Segurança completa

### **Próximas Features (Roadmap)**

📋 [ROADMAP.md](ROADMAP.md) - Planejamento completo

**Versão 1.1 (30 dias):**
- Orçamento detalhado com gráficos
- Mapa interativo
- Notificações push

**Versão 2.0 (90 dias):**
- Plano Premium (R$ 9,90/mês)
- Afiliações (Booking, Decolar)
- Features avançadas

---

## 🧪 Testes

**TODOS os testes estão centralizados em `automation/`**

```bash
cd automation
npm install  # Primeira vez
npm test     # Roda todos os testes (237 testes em 16 suites)

# Scripts úteis
npm run test:cleanup      # Verificar se banco está limpo
npm run test:force-clean  # Limpar dados de teste manualmente
npm run test:watch        # Watch mode
npm run test:coverage     # Cobertura de código
```

**Estatísticas:**
- ✅ **237 testes** em 16 suites
- ✅ **223 passando** (94.1%)
- ⏭️ **14 skipped** (funcionalidades não implementadas)
- ✅ **16/16 suites passando** (100%)
- ⏱️ **~50 segundos** de execução
- 🧹 **Limpeza automática** de dados após cada execução
- 🔒 **Testes de segurança** incluídos
- 🔄 **Testes independentes** - podem rodar em qualquer ordem

📖 **Guia completo:** [automation/README.md](automation/README.md)

---

## 🚀 Deploy

### **Backend (Render - Grátis)**

1. Criar conta no [Render](https://render.com)
2. Conectar repositório GitHub
3. Configurar variáveis de ambiente
4. Deploy automático a cada push

📖 **Guia completo:** [PRODUCAO_CHECKLIST.md](PRODUCAO_CHECKLIST.md)

### **Mobile (Expo EAS)**

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login Expo
eas login

# Configurar projeto
eas build:configure

# Build iOS (precisa Apple Developer)
eas build --platform ios

# Build Android
eas build --platform android
```

---

## 💰 Custos (Início)

| Serviço | Custo | Limite Grátis |
|---------|-------|---------------|
| MongoDB Atlas | **Grátis** | 512MB |
| Cloudinary | **Grátis** | 25GB/mês |
| Groq AI | **Grátis** | 14.400 req/dia |
| Render | **Grátis** | 750h/mês |
| **TOTAL** | **R$ 0/mês** | Até ~1.000 usuários |

**Contas pagas (futuro):**
- Apple Developer: R$ 499/ano (iOS obrigatório)
- Google Play: R$ 125 (única vez, Android)

---

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

---

## 👨‍💻 Autor

**Guia do Aventureiro Team**

- 📧 Email: contato@guiaaventureiro.com
- 📱 Instagram: [@guia.aventureiro](https://instagram.com/guia.aventureiro)

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Add nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

---

## 📝 Changelog

### v1.0.7 (24/02/2026)
- 💳 **Stripe Integration** completa e funcional
- ✅ Checkout Stripe (pagamento seguro via browser)
- ✅ Webhooks com verificação de assinatura (segurança)
- ✅ Customer Portal (usuário gerencia própria assinatura)
- ✅ Upgrade/Downgrade automático FREE ↔ PREMIUM
- ✅ PricingScreen com UX premium (FAQ, badges, loading states)
- ✅ Scripts de automação (test-payment.js, cancel-subscription.js)
- 📚 Documentação completa em [docs/STRIPE.md](docs/STRIPE.md)
- 🔒 Idempotência e rate limiting nos endpoints de pagamento
- 🎯 Pronto para staging (modo test OK)

### v1.0.6 (19/02/2026)
- 🧪 **237 testes** implementados e 94.1% passando
- ✅ Sistema de testes completo (16 suites, 100% independentes)
- 🔧 Correções no backend (colaboradores, perfil, IA)
- 📚 Documentação consolidada (docs/INDEX.md)
- 🧹 Testes movidos para `automation/` (organização)
- ✅ Backend: suporte a tutorial/onboarding completo
- 🐛 Bugs corrigidos: self-removal, owner validation, rate limiting em testes

### v1.0.5 (11/02/2026)
- 🎓 Sistema de tutorial híbrido implementado
- ✅ 5 tooltips contextuais inteligentes
- ✅ Componente Tooltip reutilizável com animações
- ✅ Hook useTooltip para gerenciamento centralizado
- ✅ Botão "Rever Tutorial" com reset completo

### v1.0.0 (29/12/2025)
- 🎉 MVP completo com 20 features
- ✅ IA real com Groq (Llama 3.3)
- ✅ Sistema de avaliações e compartilhamento
- ✅ Gamificação completa
- ✅ Modo offline funcional

📖 **Changelog completo:** [CHANGELOG.md](CHANGELOG.md)

---

## 🙏 Agradecimentos

- [Groq](https://groq.com) - IA ultrarrápida e gratuita
- [MongoDB Atlas](https://mongodb.com/atlas) - Database confiável
- [Cloudinary](https://cloudinary.com) - Upload de imagens
- [Expo](https://expo.dev) - Plataforma React Native

---

## 📞 Suporte

Encontrou um bug? Tem uma sugestão?

- 🐛 [Abrir Issue](https://github.com/seu-usuario/guia-aventureiro/issues)
- 💬 [Discussões](https://github.com/seu-usuario/guia-aventureiro/discussions)
- 📧 Email: suporte@guiaaventureiro.com

---

**⭐ Se gostou do projeto, deixe uma estrela no GitHub!**

---

Made with ❤️ and ☕ by Guia do Aventureiro Team
