# 📡 API Documentation - Guia do Aventureiro

**Versão:** 1.0.6  
**Base URL:** `http://localhost:3000/api` (dev) | `https://guia-aventureiro-backend.onrender.com/api` (prod)

---

## 🔐 Autenticação

Todas as rotas (exceto `/auth/register` e `/auth/login`) requerem autenticação via **JWT**.

### **Headers Necessários:**
```http
Authorization: Bearer <seu_token_jwt>
Content-Type: application/json
```

---

## 📋 Endpoints

### **1. Autenticação (`/api/auth`)**

#### **POST `/auth/register`** - Cadastro
Cria uma nova conta de usuário.

**Request:**
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "SenhaForte@123",
  "preferences": {
    "budgetLevel": "medio",
    "travelStyle": "aventura",
    "interests": ["natureza", "cultura", "gastronomia"]
  }
}
```

**Response (201):**
```json
{
  "message": "Usuário cadastrado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "67a1b2c3d4e5f6g7h8i9j0k1",
    "name": "João Silva",
    "email": "joao@example.com",
    "preferences": { ... },
    "stats": {
      "level": 1,
      "xp": 0,
      "totalItineraries": 0
    }
  }
}
```

**Validações:**
- `name`: 3-50 caracteres
- `email`: formato válido
- `password`: mínimo 8 caracteres, 1 maiúscula, 1 número, 1 especial
- `budgetLevel`: "economico" | "medio" | "luxo"

---

#### **POST `/auth/login`** - Login
Autentica um usuário existente.

**Request:**
```json
{
  "email": "joao@example.com",
  "password": "SenhaForte@123"
}
```

**Response (200):**
```json
{
  "message": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

**Erros:**
- `401`: Credenciais inválidas
- `404`: Usuário não encontrado

---

#### **GET `/auth/me`** 🔒 - Dados do Usuário
Retorna dados do usuário autenticado.

**Response (200):**
```json
{
  "_id": "67a1b2c3d4e5f6g7h8i9j0k1",
  "name": "João Silva",
  "email": "joao@example.com",
  "profilePicture": "https://res.cloudinary.com/...",
  "preferences": { ... },
  "hasCompletedOnboarding": false,
  "tooltipsShown": {
    "createItinerary": false,
    "useAI": false,
    "budget": false,
    "explore": false,
    "achievements": false
  },
  "stats": {
    "level": 5,
    "xp": 1250,
    "totalItineraries": 12,
    "totalTrips": 8,
    "countries": 3,
    "cities": 15
  },
  "createdAt": "2025-01-15T10:30:00Z"
}
```

**Campos de Tutorial:**
- `hasCompletedOnboarding` (boolean): Se usuário viu onboarding inicial
- `tooltipsShown` (object): Tooltips contextuais já visualizados
  - `createItinerary`: Tooltip de criar primeiro roteiro
  - `useAI`: Tooltip de usar IA para gerar roteiro
  - `budget`: Tooltip de controle de orçamento
  - `explore`: Tooltip de explorar roteiros públicos
  - `achievements`: Tooltip de conquistas

---

### **2. Roteiros (`/api/itineraries`)**

#### **GET `/itineraries`** 🔒 - Listar Roteiros
Lista roteiros do usuário autenticado com paginação.

**Query Params:**
- `page` (number): Página (default: 1)
- `limit` (number): Itens por página (default: 10, max: 50)
- `sortBy` (string): Campo de ordenação (default: "createdAt")
- `status` (string): Filtro por status ("planejado" | "em_andamento" | "concluido")

**Response (200):**
```json
{
  "itineraries": [
    {
      "_id": "67a1b2c3d4e5f6g7h8i9j0k1",
      "title": "5 Dias em Paris",
      "destination": {
        "city": "Paris",
        "country": "França"
      },
      "startDate": "2025-06-15",
      "endDate": "2025-06-20",
      "status": "planejado",
      "budget": {
        "estimatedTotal": 3250,
        "spent": 0,
        "currency": "R$"
      },
      "rating": 4.8,
      "isPublic": true,
      "photos": ["url1", "url2"],
      "createdAt": "2025-01-20T14:00:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "pages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

#### **POST `/itineraries`** 🔒 - Criar Roteiro
Cria um novo roteiro (geralmente via IA).

**Request:**
```json
{
  "title": "7 Dias em Tóquio",
  "destination": {
    "city": "Tóquio",
    "country": "Japão"
  },
  "startDate": "2025-10-01",
  "endDate": "2025-10-07",
  "days": [
    {
      "day": 1,
      "date": "2025-10-01",
      "activities": [
        {
          "time": "09:00",
          "title": "Visita ao Templo Senso-ji",
          "description": "Templo mais antigo de Tóquio",
          "location": {
            "name": "Senso-ji",
            "address": "Asakusa, Tóquio",
            "coordinates": {
              "lat": 35.7148,
              "lng": 139.7967
            }
          },
          "estimatedCost": 0,
          "estimatedDuration": 120
        }
      ]
    }
  ],
  "budget": {
    "estimatedTotal": 5000,
    "currency": "R$"
  },
  "isPublic": false
}
```

**Response (201):**
```json
{
  "message": "Roteiro criado com sucesso",
  "itinerary": { ... }
}
```

---

#### **GET `/itineraries/:id`** 🔒 - Detalhe do Roteiro
Retorna detalhes completos de um roteiro.

**Response (200):**
```json
{
  "_id": "67a1b2c3d4e5f6g7h8i9j0k1",
  "title": "7 Dias em Tóquio",
  "destination": { ... },
  "days": [ ... ],
  "budget": {
    "estimatedTotal": 5000,
    "spent": 1850,
    "currency": "R$"
  },
  "expenses": [
    {
      "_id": "exp123",
      "date": "2025-10-01",
      "category": "alimentacao",
      "description": "Jantar no restaurante Ichiran",
      "amount": 85,
      "currency": "R$"
    }
  ],
  "photos": [ ... ],
  "ratings": {
    "average": 4.7,
    "count": 12
  },
  "owner": {
    "_id": "user123",
    "name": "João Silva",
    "profilePicture": "..."
  }
}
```

---

#### **PUT `/itineraries/:id`** 🔒 - Atualizar Roteiro
Atualiza um roteiro existente.

**Request (Partial Update):**
```json
{
  "status": "em_andamento",
  "notes": "Viagem confirmada! Voos reservados."
}
```

**Response (200):**
```json
{
  "message": "Roteiro atualizado com sucesso",
  "itinerary": { ... }
}
```

---

#### **DELETE `/itineraries/:id`** 🔒 - Deletar Roteiro
Remove um roteiro permanentemente.

**Response (200):**
```json
{
  "message": "Roteiro deletado com sucesso"
}
```

---

### **3. IA - Geração de Roteiros (`/api/ai`)**

#### **POST `/ai/generate`** 🔒 - Gerar Roteiro com IA
Usa Groq AI (Llama 3.3) para criar roteiro personalizado.

**Request:**
```json
{
  "destination": "Barcelona, Espanha",
  "days": 5,
  "budgetLevel": "medio",
  "interests": ["arquitetura", "gastronomia", "praia"],
  "travelStyle": "cultural",
  "travelers": 2
}
```

**Response (200) - Demora 1-3 segundos:**
```json
{
  "itinerary": {
    "title": "5 Dias em Barcelona - Cultura e Gastronomia",
    "destination": {
      "city": "Barcelona",
      "country": "Espanha"
    },
    "days": [
      {
        "day": 1,
        "date": "2025-07-01",
        "activities": [
          {
            "time": "10:00",
            "title": "Sagrada Família",
            "description": "Visita à obra-prima de Gaudí...",
            "location": {
              "name": "Basílica da Sagrada Família",
              "coordinates": {
                "lat": 41.4036,
                "lng": 2.1744
              }
            },
            "estimatedCost": 150,
            "estimatedDuration": 120,
            "category": "atracao"
          }
        ]
      }
    ],
    "budget": {
      "estimatedTotal": 3250,
      "dailyAverage": 650,
      "breakdown": {
        "hospedagem": 1250,
        "alimentacao": 750,
        "transporte": 500,
        "atracoes": 750
      },
      "currency": "R$"
    },
    "tips": [
      "Compre o Barcelona Card para transporte ilimitado",
      "Reserve ingressos da Sagrada Família com antecedência"
    ]
  }
}
```

**Validações:**
- `days`: 1-30
- `budgetLevel`: "economico" | "medio" | "luxo"
- `travelStyle`: "aventura" | "cultural" | "relaxante" | "festa"

---

### **4. Explorar (`/api/explore`)**

#### **GET `/explore`** 🔒 - Feed de Roteiros Públicos
Lista roteiros públicos de outros usuários.

**Query Params:**
- `page`, `limit`: Paginação
- `destination`: Filtro por cidade/país
- `budgetLevel`: Filtro por nível de orçamento
- `minDays`, `maxDays`: Filtro por duração

**Response (200):**
```json
{
  "itineraries": [
    {
      "_id": "...",
      "title": "3 Dias no Rio de Janeiro",
      "owner": {
        "name": "Maria Santos",
        "profilePicture": "..."
      },
      "likes": 45,
      "saves": 12,
      "rating": 4.9,
      "preview": {
        "photo": "...",
        "highlights": ["Cristo Redentor", "Pão de Açúcar", "Ipanema"]
      }
    }
  ],
  "pagination": { ... }
}
```

---

#### **GET `/explore/trending`** 🔒 - Roteiros em Alta
Roteiros mais populares (30 dias).

**Response (200):**
```json
{
  "trending": [ ... ],
  "period": "30d"
}
```

---

#### **POST `/explore/:id/like`** 🔒 - Curtir Roteiro
Adiciona/remove like em um roteiro público.

**Response (200):**
```json
{
  "message": "Like adicionado",
  "likes": 46,
  "userLiked": true
}
```

---

#### **POST `/explore/:id/save`** 🔒 - Salvar Roteiro
Salva roteiro nos favoritos.

**Response (200):**
```json
{
  "message": "Roteiro salvo nos favoritos"
}
```

---

### **5. Avaliações (`/api/ratings`)**

#### **POST `/ratings/:itineraryId`** 🔒 - Criar Avaliação
Avalia um roteiro visitado.

**Request:**
```json
{
  "rating": 5,
  "comment": "Roteiro incrível! Tóquio é maravilhoso.",
  "highlights": {
    "best": "Templo Senso-ji ao entardecer",
    "worst": "Metrô muito lotado na hora do rush",
    "tip": "Compre JR Pass para economizar em transporte"
  },
  "photos": [
    "https://res.cloudinary.com/foto1.jpg",
    "https://res.cloudinary.com/foto2.jpg"
  ]
}
```

**Response (201):**
```json
{
  "message": "Avaliação criada com sucesso",
  "rating": {
    "_id": "...",
    "rating": 5,
    "comment": "...",
    "user": {
      "name": "João Silva",
      "profilePicture": "..."
    },
    "likes": 0,
    "createdAt": "2025-10-10T15:00:00Z"
  }
}
```

---

#### **GET `/ratings/:itineraryId`** 🔒 - Listar Avaliações
Lista avaliações de um roteiro.

**Query Params:**
- `page`, `limit`: Paginação
- `sortBy`: "createdAt" | "rating" | "likes"

**Response (200):**
```json
{
  "ratings": [ ... ],
  "summary": {
    "average": 4.7,
    "count": 15,
    "distribution": {
      "5": 10,
      "4": 3,
      "3": 2,
      "2": 0,
      "1": 0
    }
  },
  "pagination": { ... }
}
```

---

### **6. Conquistas (`/api/achievements`)**

#### **GET `/achievements`** 🔒 - Listar Conquistas
Retorna conquistas do usuário.

**Response (200):**
```json
{
  "achievements": [
    {
      "_id": "...",
      "type": "first_itinerary",
      "title": "Primeira Aventura",
      "description": "Criou seu primeiro roteiro",
      "icon": "🗺️",
      "rarity": "comum",
      "xp": 10,
      "unlockedAt": "2025-01-20T10:00:00Z"
    }
  ],
  "stats": {
    "unlockedCount": 8,
    "totalCount": 20,
    "percentage": 40
  }
}
```

---

#### **GET `/achievements/stats`** 🔒 - Estatísticas do Usuário
Retorna estatísticas detalhadas.

**Response (200):**
```json
{
  "level": 5,
  "xp": 1250,
  "nextLevelXp": 1500,
  "totalItineraries": 12,
  "totalTrips": 8,
  "countries": 3,
  "cities": 15,
  "totalPhotos": 45,
  "totalRatings": 6,
  "achievements": 8
}
```

---

### **7. Orçamento (`/api/itineraries/:id/expenses`)**

#### **POST `/itineraries/:id/expenses`** 🔒 - Adicionar Gasto
Registra um gasto no roteiro.

**Request:**
```json
{
  "category": "alimentacao",
  "description": "Jantar no restaurante Sushi Saito",
  "amount": 280,
  "date": "2025-10-02"
}
```

**Response (201):**
```json
{
  "message": "Gasto adicionado com sucesso",
  "expense": {
    "_id": "...",
    "category": "alimentacao",
    "amount": 280,
    "currency": "R$"
  },
  "budgetSummary": {
    "estimated": 5000,
    "spent": 2130,
    "remaining": 2870,
    "currency": "R$"
  }
}
```

**Categorias válidas:**
- `hospedagem`, `alimentacao`, `transporte`, `atracao`, `compras`, `outro`

---

#### **DELETE `/itineraries/:id/expenses/:expenseId`** 🔒 - Deletar Gasto
Remove um gasto.

**Response (200):**
```json
{
  "message": "Gasto deletado com sucesso"
}
```

---

### **8. Upload de Fotos (`/api/upload`)**

#### **POST `/upload`** 🔒 - Upload de Foto
Faz upload de foto para Cloudinary.

**Request (multipart/form-data):**
```
photo: <arquivo>
```

**Response (200):**
```json
{
  "url": "https://res.cloudinary.com/devbhqkyu/image/upload/v123/photo.jpg",
  "publicId": "guia_aventureiro/photo123"
}
```

**Limites:**
- Tamanho máximo: 10MB
- Formatos: JPG, PNG, WEBP
- Compressão automática para 800x600

---

### **9. Subscription (`/api/subscriptions`)**

#### **GET `/subscriptions/me`** 🔒 - Minha Assinatura
Retorna dados da assinatura atual do usuário.

**Response (200):**
```json
{
  "plan": "premium",
  "status": "active",
  "limits": {
    "maxItineraries": 20,
    "maxAiRequests": 50,
    "maxPhotos": 20
  },
  "usage": {
    "itinerariesCount": 12,
    "aiRequestsThisMonth": 23,
    "photosUsed": 45
  },
  "billingDate": "2026-03-19T00:00:00.000Z",
  "canUpgrade": true
}
```

#### **GET `/subscriptions/plans`** - Listar Planos
Lista todos os planos disponíveis.

**Response (200):**
```json
{
  "plans": [
    {
      "id": "free",
      "name": "Free",
      "price": 0,
      "limits": {
        "maxItineraries": 5,
        "maxAiRequests": 10,
        "maxPhotos": 5
      }
    },
    {
      "id": "premium",
      "name": "Premium",
      "price": 9.90,
      "limits": {
        "maxItineraries": 20,
        "maxAiRequests": 50,
        "maxPhotos": 20
      }
    },
    {
      "id": "pro",
      "name": "Pro",
      "price": 19.90,
      "limits": {
        "maxItineraries": -1,
        "maxAiRequests": -1,
        "maxPhotos": -1
      }
    }
  ]
}
```

#### **POST `/subscriptions/upgrade`** 🔒 - Fazer Upgrade
Faz upgrade do plano.

**Request:**
```json
{
  "plan": "premium",
  "paymentMethod": "credit_card",
  "paymentToken": "tok_visa_..."
}
```

**Response (200):**
```json
{
  "message": "Upgrade realizado com sucesso",
  "subscription": { ... }
}
```

---

### **10. Chat (`/api/chat`)**

#### **GET `/chat/itinerary/:id/messages`** 🔒 - Mensagens do Roteiro
Lista mensagens do chat do roteiro.

**Response (200):**
```json
{
  "messages": [
    {
      "_id": "...",
      "user": {
        "_id": "...",
        "name": "João Silva"
      },
      "message": "Que tal mudarmos o horário?",
      "createdAt": "2026-02-19T14:30:00.000Z"
    }
  ]
}
```

#### **POST `/chat/itinerary/:id/message`** 🔒 - Enviar Mensagem
Envia mensagem no chat (Socket.io para real-time).

**Request:**
```json
{
  "message": "Concordo! Vamos almoçar mais tarde"
}
```

---

### **11. Mapas (`/api/maps`)**

#### **GET `/maps/itinerary/:id`** 🔒 - Pontos do Roteiro no Mapa
Retorna coordenadas de todos os pontos do roteiro.

**Response (200):**
```json
{
  "points": [
    {
      "day": 1,
      "activity": "Visita ao Cristo Redentor",
      "coordinates": {
        "lat": -22.951916,
        "lng": -43.210487
      }
    }
  ]
}
```

---

### **12. Notificações (`/api/notifications`)**

#### **GET `/notifications`** 🔒 - Listar Notificações
Lista notificações do usuário.

**Response (200):**
```json
{
  "notifications": [
    {
      "_id": "...",
      "title": "Viagem se aproxima!",
      "message": "Sua viagem para Paris começa em 3 dias",
      "type": "reminder",
      "read": false,
      "createdAt": "2026-02-19T10:00:00.000Z"
    }
  ]
}
```

#### **PUT `/notifications/:id/read`** 🔒 - Marcar como Lida
Marca notificação como lida.

---

### **13. Recomendações (`/api/recommendations`)**

#### **GET `/recommendations`** 🔒 - Recomendações Personalizadas
Retorna roteiros recomendados baseados no perfil.

**Response (200):**
```json
{
  "recommendations": [
    {
      "_id": "...",
      "destination": "Paris, França",
      "reason": "Baseado nos seus roteiros culturais",
      "score": 0.92
    }
  ]
}
```

---

### **14. Orçamento (`/api/budget`)**

#### **GET `/budget/itinerary/:id`** 🔒 - Resumo do Orçamento
Retorna resumo completo do orçamento do roteiro.

**Response (200):**
```json
{
  "estimated": 5000,
  "spent": 2345.50,
  "remaining": 2654.50,
  "categories": {
    "hospedagem": 1200,
    "alimentacao": 680.50,
    "transporte": 465
  },
  "expenses": [
    {
      "_id": "...",
      "category": "hospedagem",
      "description": "Hotel 3 noites",
      "amount": 1200,
      "date": "2026-02-15"
    }
  ]
}
```

---

### **15. Social (`/api/social`)**

#### **POST `/social/share/:id`** 🔒 - Gerar Link de Compartilhamento
Gera link público para compartilhar roteiro.

**Response (200):**
```json
{
  "shareUrl": "https://guiaaventureiro.com/shared/abc123def456",
  "expiresAt": "2026-03-19T00:00:00.000Z"
}
```

---

## 🔒 Segurança

### **Rate Limiting**
- **100 requisições** por 15 minutos por IP
- Header `X-RateLimit-Remaining` indica quantas restam

### **Erros HTTP**

| Código | Descrição |
|--------|-----------|
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Token inválido/expirado |
| 403 | Forbidden - Sem permissão |
| 404 | Not Found - Recurso não encontrado |
| 429 | Too Many Requests - Rate limit excedido |
| 500 | Internal Server Error |

### **Formato de Erro**
```json
{
  "error": "Mensagem de erro amigável",
  "details": ["Campo 'email' é obrigatório"]
}
```

---

## 📊 Paginação Padrão

Todas as listas suportam:
```
?page=1&limit=10&sortBy=createdAt
```

Response:
```json
{
  "data": [ ... ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## 🧪 Testando a API

### **Postman/Insomnia**

1. Importar coleção (em breve)
2. Configurar variável `{{baseUrl}}` = `http://localhost:3000/api`
3. Fazer login para obter token
4. Adicionar token no header `Authorization`

### **cURL**

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@example.com","password":"senha123"}'

# Listar roteiros (com token)
curl http://localhost:3000/api/itineraries \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

**📝 Atualizado:** 19/02/2026  
**📊 Versão da API:** 1.0.6  
**🔗 GitHub Backend:** [github.com/PatrickAvila/guia-aventureiro-backEnd](https://github.com/PatrickAvila/guia-aventureiro-backEnd)  
**🔗 GitHub Mobile:** [github.com/PatrickAvila/guia-aventureiro-mobile](https://github.com/PatrickAvila/guia-aventureiro-mobile)
