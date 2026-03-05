# Visão Geral da Arquitetura

**Guia Aventureiro - Arquitetura do Sistema**

---

## 📐 Diagrama de Alto Nível

```
┌─────────────────┐         ┌──────────────────┐
│                 │         │                  │
│  Mobile App     │◄────────┤   API Backend    │
│  (React Native) │  HTTPS  │   (Node.js)      │
│                 │         │                  │
└─────────────────┘         └─────────┬────────┘
                                      │
                        ┌─────────────┼─────────────┐
                        │             │             │
                  ┌─────▼──────┐ ┌───▼─────┐ ┌────▼─────┐
                  │  MongoDB   │ │ Stripe  │ │Cloudinary│
                  │  (Atlas)   │ │   API   │ │   CDN    │
                  └────────────┘ └─────────┘ └──────────┘
```

---

## 🏗️ Camadas do Sistema

### 1. **Frontend Mobile (React Native + Expo)**

- **Responsabilidade**: Interface do usuário, navegação, estado local
- **Tecnologias**: React Native, Expo, TypeScript, Context API
- **Comunicação**: Axios para chamadas HTTP, SecureStore para tokens
- **Arquitetura**: Component-based, theme system centralizado

### 2. **Backend API (Node.js + Express)**

- **Responsabilidade**: Lógica de negócio, validação, autenticação
- **Tecnologias**: Express, JWT, bcrypt, Joi
- **Estrutura**: MVC pattern (models, controllers, routes, middleware)
- **Segurança**: Helmet, CORS, rate limiting, JWT auth

### 3. **Banco de Dados (MongoDB Atlas)**

- **Responsabilidade**: Persistência de dados
- **Tecnologias**: Mongoose ODM
- **Models**: User, Itinerary, Subscription, Notification
- **Indexes**: userId, email, dataInicio para queries otimizadas

### 4. **Serviços Externos**

- **Stripe**: Pagamentos e assinaturas (webhooks para eventos)
- **Cloudinary**: Upload e storage de imagens
- **Firebase**: Push notifications (opcional)

---

## 🔄 Fluxos Principais

### Autenticação

```
Mobile                  Backend                 MongoDB
  │                        │                       │
  ├─1. POST /auth/signup──►│                       │
  │                        ├─2. Valida dados       │
  │                        ├─3. Hash senha         │
  │                        ├─4. Cria usuário──────►│
  │                        │◄─5. Salvo com _id─────┤
  │                        ├─6. Gera JWT           │
  │◄─7. { token, user }────┤                       │
  │                        │                       │
  ├─8. Salva em SecureStore│                       │
  └─9. Navega para Home    │                       │
```

### Criar Roteiro

```
Mobile                  Backend                 MongoDB
  │                        │                       │
  ├─1. POST /itineraries──►│                       │
  │   + JWT token          ├─2. Valida token       │
  │                        ├─3. Valida schema (Joi)│
  │                        ├─4. Verifica limites*  │
  │                        ├─5. Cria roteiro──────►│
  │                        │◄─6. Salvo─────────────┤
  │◄─7. { success, data }──┤                       │
  │                        │                       │
  └─8. Atualiza lista local│                       │

* Free: máximo 3 roteiros | Premium: ilimitado
```

### Upload de Foto

```
Mobile              Backend             Cloudinary        MongoDB
  │                    │                     │                │
  ├─1. Seleciona foto  │                     │                │
  ├─2. POST /upload───►│                     │                │
  │   FormData         ├─3. Valida (5MB)    │                │
  │                    ├─4. Upload──────────►│                │
  │                    │◄─5. URL retorn──────┤                │
  │                    ├─6. Salva URL────────────────────────►│
  │◄─7. { url }────────┤                     │                │
  │                    │                     │                │
  └─8. Exibe imagem    │                     │                │
```

---

## 🔐 Segurança

### Autenticação

- **JWT**: Token assinado com `JWT_SECRET`
- **Expire**: 7 dias (configurável em `constants/limits.js`)
- **Storage**: SecureStore no mobile (encrypted)
- **Refresh**: Não implementado ainda (roadmap)

### Autorização

```javascript
// Middleware verifica se usuário é dono do recurso
if (itinerary.userId.toString() !== req.user._id.toString()) {
  return response.forbidden(res, messages.ERRORS.AUTH.FORBIDDEN);
}
```

### Validação

- **Cliente (Mobile)**: Validação básica com helpers
- **Servidor (Backend)**: Validação Joi schemas (obrigatória)
- **Banco (MongoDB)**: Schemas Mongoose com types e constraints

### Rate Limiting

```javascript
// Login: 5 tentativas / 15min
// API geral: 100 requisições / 15min
```

---

## 📊 Modelo de Dados

### User
```javascript
{
  _id: ObjectId,
  nome: String,
  email: String (unique, indexed),
  senha: String (hashed),
  assinatura: {
    tipo: 'free' | 'premium',
    status: 'ativa' | 'cancelada',
    stripeSubscriptionId: String,
  },
  createdAt: Date,
  updatedAt: Date,
}
```

### Itinerary
```javascript
{
  _id: ObjectId,
  userId: ObjectId (indexed),
  titulo: String,
  destinos: [String],
  dataInicio: Date (indexed),
  dataFim: Date,
  orcamento: { valor: Number, moeda: String },
  status: 'planejamento' | 'confirmado' | 'concluido',
  visibilidade: 'publico' | 'privado',
  dias: [{ data: Date, atividades: [...] }],
  fotos: [String], // URLs do Cloudinary
  likes: Number,
  createdAt: Date,
}
```

---

## 🚀 Performance & Escalabilidade

### Backend

- **Indexes**: MongoDB indexes em `userId`, `email`, `dataInicio`
- **Pagination**: Default 20 itens, máximo 100
- **Cache**: Futuro (Redis para dados often-read)
- **Rate Limit**: Express rate limiter

### Mobile

- **Lazy Loading**: FlatList com `initialNumToRender={10}`
- **Image Cache**: React Native cached images
- **State**: Context API (futuro: React Query para cache)

### Database

- **MongoDB Atlas**: Cluster M10 (2GB RAM, auto-scaling)
- **Backups**: Automatizados via script `backup.js`
- **Monitoring**: Atlas metrics + health check script

---

## 📈 Monitoramento

### Backend Health Check

```bash
node backend/scripts/healthCheck.js
```

Verifica:
- ✅ MongoDB connection
- ✅ Stripe API
- ✅ Cloudinary API
- ✅ Env variables

### Logs

- **Backend**: `console.error` para erros (futuro: Winston)
- **Mobile**: `console.log` em dev, removido em produção
- **Stripe**: Webhook logs via dashboard

---

## 🔄 CI/CD

Ver [.github/workflows/test.yml](../../.github/workflows/test.yml)

```yaml
on: [push, pull_request]
jobs:
  test:
    - runs: MongoDB service
    - runs: 237 testes
    - uploads: Coverage to Codecov
```

---

## 📚 Referências

- [Backend Best Practices](../../backend/BACKEND_BEST_PRACTICES.md)
- [Mobile Best Practices](../../mobile/MOBILE_BEST_PRACTICES.md)
- [API Documentation](../api/API.md)
- [Database Schema](./DATABASE.md)

---

**📝 Última atualização**: Janeiro 2026
