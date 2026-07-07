# API Documentation - Guia do Aventureiro

**Versao:** `1.0.8`
**Base URL (dev):** `http://localhost:3000/api`
**Base URL (prod):** `https://guia-aventureiro-backend.onrender.com/api`

## Autenticacao

Rotas publicas:

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/refresh`
- `GET /auth/public/:userId`

Rotas protegidas (Bearer JWT):

- `POST /auth/logout`
- `GET /auth/profile`
- `PUT /auth/profile`
- `PUT /auth/password`
- `DELETE /auth/account`

Headers para rotas protegidas:

- `Authorization: Bearer [token_jwt]`
- `Content-Type: application/json`

Regras de senha (validadores atuais):

- Minimo 6 caracteres
- Pelo menos: 1 letra maiuscula, 1 minuscula e 1 numero

## Roteiros (/api/roteiros)

Todas as rotas abaixo sao protegidas por JWT.

- `GET /roteiros`
  - Query suportada: `page`, `limit`, `sortBy`, `order`
- `GET /roteiros/:id`
- `POST /roteiros`
- `POST /roteiros/generate`
- `PUT /roteiros/:id`
- `DELETE /roteiros/:id`
- `POST /roteiros/:id/duplicate`

Colaboradores:

- `POST /roteiros/:id/collaborators`
- `DELETE /roteiros/:id/collaborators/:collaboratorId`

Orcamento/Gastos:

- `POST /roteiros/:id/expenses`
- `PUT /roteiros/:id/expenses/:expenseId`
- `DELETE /roteiros/:id/expenses/:expenseId`
- `GET /roteiros/:id/budget-summary`

Compartilhamento:

- `POST /roteiros/:id/share`
- `DELETE /roteiros/:id/share`

## Compartilhamento publico (/api/shared)

- `GET /shared/:shareId` (publica)
- `POST /shared/:shareId/copy` (protegida + limites)

## Explore (/api/explore)

Publicas:

- `GET /explore/itineraries`
- `GET /explore/featured`
- `GET /explore/popular-destinations`

Protegidas:

- `POST /explore/like/:id`
- `POST /explore/save/:id`
- `GET /explore/saved`

Regra de visibilidade:

- Feed e listagens de explore retornam apenas roteiros publicos.
- As listagens consideram apenas donos com perfil publico.

## Avaliacoes (/api/ratings)

- `POST /ratings/:itineraryId` (protegida)
- `GET /ratings/:itineraryId` (publica)
- `GET /ratings/:itineraryId/all` (publica)
- `GET /ratings/:itineraryId/my-rating` (protegida)
- `GET /ratings/my-ratings` (protegida)
- `DELETE /ratings/:ratingId` (protegida)
- `POST /ratings/:ratingId/like` (protegida)

## Conquistas (/api/achievements)

- `GET /achievements/my-achievements` (protegida)
- `GET /achievements/stats` (protegida)
- `GET /achievements/leaderboard` (publica)
- `POST /achievements/check` (protegida)

## Assinaturas (/api/subscriptions)

Publicas:

- `GET /subscriptions/plans`
- `GET /subscriptions/stripe-config`

Protegidas:

- `GET /subscriptions/my-subscription`
- `GET /subscriptions/usage`
- `POST /subscriptions/cancel`
- `POST /subscriptions/reactivate`

Fluxo Stripe (protegido):

- `POST /subscriptions/create-checkout`
- `POST /subscriptions/customer-portal`
- `POST /subscriptions/cancel-stripe`
- `GET /subscriptions/stripe-status`

Webhook Stripe:

- `POST /subscriptions/webhook`
- Registrado no `server.js` com raw body para validacao de assinatura.

## Checkout (/api/checkout)

- `POST /checkout/create-session` (protegida)
- `GET /checkout/verify/:sessionId` (protegida)
- `GET /checkout/success` (publica)
- `GET /checkout/cancel` (publica)

## Upload de fotos (/api/upload)

Todas protegidas.

- `POST /upload`
- `POST /upload/multiple`
- `DELETE /upload/:publicId` (requer `itineraryId`)
- `DELETE /upload`

Regras de plano:

- Free: sem upload.
- Premium: ate 20 fotos por roteiro.

## IA legada (/api/ai)

- `POST /ai/generate`
- Atualmente responde `501` orientando para usar `/api/roteiros/generate`.

## Outras areas expostas no backend

Tambem existem rotas para:

- `/notifications`
- `/social`
- `/recommendations`
- `/chat`
- `/push`
- `/test` (somente dev/test)

## Health check

- `GET /health`

## Observacoes de compatibilidade

- Namespace atual de itinerarios e `/api/roteiros` (nao `/api/itineraries`).
- Rotas de auth atuais usam `signup/profile` (nao `register/me`).
- Esta documentacao reflete o estado atual do backend em producao.
