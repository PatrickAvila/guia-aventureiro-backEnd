# Backend Best Practices
**Guia Aventureiro - Convenções e Padrões de Desenvolvimento Backend**

---

## 📑 Índice

1. [Estrutura de Pastas](#estrutura-de-pastas)
2. [Constants](#constants)
3. [Helpers](#helpers)
4. [Validators](#validators)
5. [Fixtures](#fixtures)
6. [Scripts](#scripts)
7. [Controllers](#controllers)
8. [Models](#models)
9. [Middleware](#middleware)
10. [Rotas](#rotas)
11. [Tratamento de Erros](#tratamento-de-erros)
12. [Segurança](#segurança)
13. [Testes](#testes)

---

## 📁 Estrutura de Pastas

```
backend/
├── src/
│   ├── config/          # Configurações (DB, Cloudinary, etc.)
│   ├── constants/       # 🆕 Constantes e códigos de erro
│   ├── controllers/     # Lógica de negócio
│   ├── helpers/         # 🆕 Funções utilitárias reutilizáveis
│   ├── middleware/      # Middleware (auth, validation, etc.)
│   ├── models/          # Models do Mongoose
│   ├── routes/          # Definição de rotas
│   ├── services/        # Serviços externos (Stripe, email, etc.)
│   ├── validators/      # 🆕 Schemas Joi para validação
│   └── fixtures/        # 🆕 Dados de seed
├── scripts/             # 🆕 Scripts utilitários (seed, backup, health)
├── server.js            # Entry point
└── package.json
```

---

## 🔢 Constants

### ✅ Use constantes para valores mágicos

**❌ Evite:**
```javascript
if (user.itineraries.length >= 3) {
  return res.status(403).json({ message: 'Limite atingido' });
}
```

**✅ Prefira:**
```javascript
const { limits, errorCodes, messages } = require('../constants');

if (user.itineraries.length >= limits.SUBSCRIPTION_LIMITS.free.itineraries) {
  return res.status(403).json({
    message: messages.ERRORS.SUBSCRIPTION.LIMIT_REACHED,
    errorCode: errorCodes.SUBSCRIPTION.LIMIT_REACHED,
  });
}
```

### 📦 Disponíveis em `/constants`

```javascript
const { errorCodes, limits, messages } = require('../constants');

// Error codes
errorCodes.AUTH.INVALID_CREDENTIALS  // 'AUTH_001'
errorCodes.VALIDATION.EMPTY_FIELD    // 'VAL_001'
errorCodes.SUBSCRIPTION.LIMIT_REACHED // 'SUB_001'

// Limits
limits.SUBSCRIPTION_LIMITS.free.itineraries  // 3
limits.FILE_SIZE.photos                       // 5MB
limits.PAGINATION.default                     // 20

// Messages
messages.SUCCESS.CREATED
messages.ERRORS.NOT_FOUND
messages.VALIDATION.isValidEmail(email)
```

---

## 🛠️ Helpers

### ✅ Use helpers para lógica reutilizável

**❌ Evite:**
```javascript
const formatDate = (date) => {
  // Lógica duplicada em vários arquivos
  return date.toISOString().split('T')[0];
};
```

**✅ Prefira:**
```javascript
const { date, string, response, validation } = require('../helpers');

// Date helpers
date.formatDate(new Date(), 'DD/MM/YYYY');
date.addDays(startDate, 7);
date.daysBetween(start, end);

// String helpers
string.slugify('Meu Título Aqui');  // 'meu-titulo-aqui'
string.sanitizeEmail(email);
string.maskEmail('joao@example.com'); // 'jo***@example.com'

// Response helpers (explicado na seção Controllers)
response.success(res, data, message);
response.error(res, message, statusCode);
response.paginated(res, data, page, pageSize, total);

// Validation helpers
validation.isValidEmail(email);
validation.validatePassword(password);
validation.isValidCPF(cpf);
```

---

## ✅ Validators

### ✅ Use Joi para validação de schemas

**❌ Evite validação manual:**
```javascript
if (!email || !senha) {
  return res.status(400).json({ message: 'Campos obrigatórios' });
}
if (senha.length < 6) {
  return res.status(400).json({ message: 'Senha muito curta' });
}
```

**✅ Prefira schemas Joi:**
```javascript
const { userValidator, itineraryValidator } = require('../validators');

// No controller
const { error } = userValidator.signupSchema.validate(req.body);
if (error) {
  return response.badRequest(res, error.details[0].message);
}
```

### 📦 Validators disponíveis

```javascript
// User validators
userValidator.signupSchema
userValidator.loginSchema
userValidator.updateProfileSchema
userValidator.changePasswordSchema

// Itinerary validators
itineraryValidator.createItinerarySchema
itineraryValidator.updateItinerarySchema
itineraryValidator.addDaySchema
itineraryValidator.listQuerySchema
```

---

## 🗂️ Fixtures

### ✅ Use fixtures para seed e testes

```javascript
const { users, itineraries } = require('../fixtures');

// Seed padrão
const sampleUsers = users.sampleUsers; // 5 usuários prontos
const sampleItineraries = itineraries.sampleItineraries; // 5 roteiros

// Factory customizado
const newUser = users.createUser({
  nome: 'Custom User',
  email: 'custom@example.com',
});

const newItinerary = itineraries.createItinerary(userId, {
  titulo: 'Roteiro Custom',
  destinos: ['Rio', 'SP'],
});
```

---

## 🛠️ Scripts

### 📊 Seed do banco de dados

```bash
# Seed normal (adiciona dados)
node backend/scripts/seed.js

# Seed com limpeza (remove tudo antes)
node backend/scripts/seed.js --clear
```

### 🏥 Health check

```bash
# Verifica status de todos os serviços
node backend/scripts/healthCheck.js
```

Verifica:
- ✅ MongoDB
- ✅ Backend API
- ✅ Cloudinary
- ✅ Stripe
- ✅ Variáveis de ambiente

### 💾 Backup

```bash
# Faz backup do MongoDB
node backend/scripts/backup.js
```

- Cria backup em `backend/backups/`
- Compacta automaticamente
- Mantém últimos 5 backups

---

## 🎮 Controllers

### ✅ Estrutura padrão de um controller

```javascript
const { response } = require('../helpers');
const { errorCodes, messages } = require('../constants');
const { itineraryValidator } = require('../validators');
const Itinerary = require('../models/Itinerary');

module.exports = {
  // Criar roteiro
  create: async (req, res) => {
    try {
      // 1. Validar dados de entrada
      const { error } = itineraryValidator.createItinerarySchema.validate(req.body);
      if (error) {
        return response.badRequest(res, error.details[0].message);
      }

      // 2. Lógica de negócio
      const itinerary = await Itinerary.create({
        ...req.body,
        userId: req.user._id,
      });

      // 3. Resposta padronizada
      return response.created(res, itinerary, messages.SUCCESS.CREATED);

    } catch (err) {
      console.error('Error creating itinerary:', err);
      return response.serverError(res, messages.ERRORS.SERVER.GENERIC);
    }
  },

  // Listar roteiros com paginação
  list: async (req, res) => {
    try {
      // 1. Validar query params
      const { error, value } = itineraryValidator.listQuerySchema.validate(req.query);
      if (error) {
        return response.badRequest(res, error.details[0].message);
      }

      const { page, pageSize, status, search, sortBy, order } = value;

      // 2. Build query
      const query = { userId: req.user._id };
      if (status) query.status = status;
      if (search) query.titulo = { $regex: search, $options: 'i' };

      // 3. Executar query com paginação
      const skip = (page - 1) * pageSize;
      const [itineraries, total] = await Promise.all([
        Itinerary.find(query)
          .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
          .skip(skip)
          .limit(pageSize),
        Itinerary.countDocuments(query),
      ]);

      // 4. Resposta paginada
      return response.paginated(res, itineraries, page, pageSize, total);

    } catch (err) {
      console.error('Error listing itineraries:', err);
      return response.serverError(res);
    }
  },
};
```

### ✅ Sempre use response helpers

```javascript
// ✅ Sucessos
response.success(res, data, message);           // 200
response.created(res, data, message);           // 201
response.noContent(res);                        // 204
response.paginated(res, data, page, size, total); // 200 com pagination

// ✅ Erros
response.badRequest(res, message, errors);      // 400
response.unauthorized(res, message);            // 401
response.forbidden(res, message);               // 403
response.notFound(res, message);                // 404
response.conflict(res, message);                // 409
response.tooManyRequests(res, message);         // 429
response.serverError(res, message);             // 500
```

---

## 📐 Models

### ✅ Estrutura padrão de um model

```javascript
const mongoose = require('mongoose');

const ItinerarySchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: [true, 'Título é obrigatório'],
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // ✅ Index para queries frequentes
    },
    status: {
      type: String,
      enum: ['planejamento', 'confirmado', 'em-andamento', 'concluido', 'cancelado'],
      default: 'planejamento',
    },
  },
  {
    timestamps: true, // ✅ Adiciona createdAt e updatedAt
  }
);

// ✅ Virtuals para campos calculados
ItinerarySchema.virtual('duracao').get(function () {
  const { date } = require('../helpers');
  return date.daysBetween(this.dataInicio, this.dataFim);
});

// ✅ Métodos de instância
ItinerarySchema.methods.isOwner = function (userId) {
  return this.userId.toString() === userId.toString();
};

// ✅ Métodos estáticos
ItinerarySchema.statics.findByUser = function (userId) {
  return this.find({ userId });
};

module.exports = mongoose.model('Itinerary', ItinerarySchema);
```

---

## 🔐 Middleware

### ✅ Middleware de autenticação

```javascript
const jwt = require('jsonwebtoken');
const { response } = require('../helpers');
const { messages, errorCodes } = require('../constants');

module.exports = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return response.unauthorized(res, messages.ERRORS.AUTH.TOKEN_MISSING);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();

  } catch (err) {
    return response.unauthorized(res, messages.ERRORS.AUTH.TOKEN_INVALID);
  }
};
```

### ✅ Middleware de validação de schema

```javascript
const { response } = require('../helpers');

module.exports = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message,
      }));
      return response.badRequest(res, 'Dados inválidos', errors);
    }

    next();
  };
};
```

---

## 🛣️ Rotas

### ✅ Estrutura padrão de rotas

```javascript
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const itineraryController = require('../controllers/itineraryController');

// Rotas públicas
router.get('/public', itineraryController.listPublic);

// Rotas protegidas
router.use(authMiddleware); // ✅ Aplica auth para rotas abaixo

router.get('/', itineraryController.list);
router.post('/', itineraryController.create);
router.get('/:id', itineraryController.getById);
router.put('/:id', itineraryController.update);
router.delete('/:id', itineraryController.delete);

module.exports = router;
```

---

## ❌ Tratamento de Erros

### ✅ Middleware global de erros

```javascript
// No server.js
const errorHandler = (err, req, res, next) => {
  console.error('Global Error Handler:', err);

  // Erros do Mongoose
  if (err.name === 'ValidationError') {
    return response.badRequest(res, err.message);
  }
  if (err.name === 'CastError') {
    return response.badRequest(res, 'ID inválido');
  }

  // Erros do JWT
  if (err.name === 'JsonWebTokenError') {
    return response.unauthorized(res, messages.ERRORS.AUTH.TOKEN_INVALID);
  }

  // Erro genérico
  return response.serverError(res, messages.ERRORS.SERVER.GENERIC);
};

app.use(errorHandler);
```

### ✅ Errors customizados

```javascript
class AppError extends Error {
  constructor(message, statusCode, errorCode) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }
}

// Uso no controller
if (!itinerary) {
  throw new AppError(
    messages.ERRORS.NOT_FOUND,
    404,
    errorCodes.RESOURCE.NOT_FOUND
  );
}
```

---

## 🔐 Segurança

### ✅ Checklist de segurança

- ✅ **Senhas**: Sempre usar `bcrypt.hash()` antes de salvar
- ✅ **JWT**: Nunca commitar `JWT_SECRET` no código
- ✅ **Validação**: Validar TODOS os inputs com Joi
- ✅ **Rate Limiting**: Implementar limites de requisições
- ✅ **CORS**: Configurar origins permitidas
- ✅ **Helmet**: Usar `helmet` para headers de segurança
- ✅ **Logs**: Nunca logar senhas ou tokens completos
- ✅ **Encryption**: Dados sensíveis devem ser criptografados

### ✅ Exemplo: Rate limiting

```javascript
const rateLimit = require('express-rate-limit');
const { limits } = require('./constants');

const loginLimiter = rateLimit({
  windowMs: limits.RATE_LIMITS.login.windowMs,
  max: limits.RATE_LIMITS.login.maxAttempts,
  message: messages.ERRORS.RATE_LIMIT.TOO_MANY_REQUESTS,
});

app.use('/api/auth/login', loginLimiter);
```

---

## 🧪 Testes

### ✅ Estrutura de teste

```javascript
const request = require('supertest');
const app = require('../server');
const { users } = require('../fixtures');

describe('POST /api/auth/signup', () => {
  it('deve criar usuário com dados válidos', async () => {
    const userData = users.createUser({
      nome: 'Test User',
      email: 'test@example.com',
      senha: 'Test123!',
    });

    const response = await request(app)
      .post('/api/auth/signup')
      .send(userData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('_id');
  });

  it('deve retornar erro com email inválido', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'invalid', senha: '123456' })
      .expect(400);

    expect(response.body.success).toBe(false);
  });
});
```

---

## 📚 Resumo

### ✅ Principais melhorias implementadas

1. **Constants**: Centralizou error codes, limits, messages
2. **Helpers**: Criou funções reutilizáveis (date, string, response, validation)
3. **Validators**: Schemas Joi para validação consistente
4. **Fixtures**: Dados de seed para desenvolvimento e testes
5. **Scripts**: Automação de seed, backup e health check
6. **Response Helpers**: Padronização de respostas da API

### 🎯 Próximos passos

- Implementar middleware de rate limiting
- Adicionar logs estruturados (Winston)
- Criar testes de integração
- Implementar cache (Redis)
- Documentação OpenAPI/Swagger

---

**📝 Última atualização**: Janeiro 2026
**👤 Mantenedor**: Equipe Guia Aventureiro
