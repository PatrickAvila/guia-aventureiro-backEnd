# 💳 INTEGRAÇÃO STRIPE - Guia do Aventureiro

**Status:** ✅ Implementado (Modo Test)  
**Versão:** v1.0.7  
**Data:** 24/02/2026

---

## 📋 Visão Geral

Sistema completo de pagamentos integrado com Stripe para monetizar o plano **Premium** (R$ 9,90/mês).

### ✨ Funcionalidades

- ✅ Checkout Stripe (pagamento seguro via browser)
- ✅ Webhook para processamento automático de eventos
- ✅ Customer Portal (usuário gerencia própria assinatura)
- ✅ Upgrade automático FREE → PREMIUM
- ✅ Downgrade automático ao cancelar
- ✅ Idempotência (eventos processados apenas 1 vez)
- ✅ Rate limiting (proteção contra abuso)
- ✅ Logs detalhados (Winston) para auditoria
- ✅ Verificação de assinatura em webhooks (segurança)

---

## 🏗️ Arquitetura

### Fluxo Completo

```
┌─────────────────────────────┐
│  Mobile App (React Native)  │
│                             │
│  1. Usuário clica          │
│     "Assinar Premium"      │
└──────────┬──────────────────┘
           │
           │ POST /api/subscriptions/create-checkout
           ▼
┌─────────────────────────────┐
│  Backend (Express)          │
│                             │
│  2. subscriptionController  │
│     .createCheckoutSession  │
│                             │
│  3. stripeService           │
│     .createCheckoutSession  │
└──────────┬──────────────────┘
           │
           │ stripe.checkout.sessions.create()
           ▼
┌─────────────────────────────┐
│  Stripe API                 │
│                             │
│  4. Cria sessão             │
│  5. Retorna URL             │
└──────────┬──────────────────┘
           │
           │ Retorna { sessionId, url }
           ▼
┌─────────────────────────────┐
│  Mobile App                 │
│                             │
│  6. Linking.openURL(url)    │
│  7. Abre browser nativo     │
└──────────┬──────────────────┘
           │
           │ Usuário preenche cartão
           ▼
┌─────────────────────────────┐
│  Stripe Checkout            │
│                             │
│  8. Processa pagamento      │
│  9. checkout.session        │
│     .completed event        │
└──────────┬──────────────────┘
           │
           │ Webhook: POST /api/subscriptions/webhook
           ▼
┌─────────────────────────────┐
│  Backend                    │
│                             │
│  10. verifyStripeSignature  │
│  11. handleWebhook          │
│  12. upgradeUserToPremium   │
│  13. Atualiza limites       │
│      (50 slots, ∞ criações) │
└──────────┬──────────────────┘
           │
           │ React Query invalida cache
           ▼
┌─────────────────────────────┐
│  Mobile App                 │
│                             │
│  14. ProfileScreen mostra   │
│      badge "Premium"        │
│  15. Limites atualizados    │
└─────────────────────────────┘
```

---

## 🔧 Configuração

### 1. Criar Conta Stripe

1. Acesse: https://dashboard.stripe.com/register
2. Complete cadastro
3. Acesse: https://dashboard.stripe.com/test/apikeys

### 2. Criar Produto Premium

1. Acesse: https://dashboard.stripe.com/test/products
2. Clique "Add Product"
3. Preencha:
   - **Name:** Guia Aventureiro Premium
   - **Description:** Acesso ilimitado a roteiros e recursos premium
   - **Pricing:** Recurring (mensal)
   - **Price:** R$ 9,90
   - **Currency:** BRL (Real Brasileiro)
4. Salve e copie o **Price ID** (ex: `price_1AbCdEfGhIjKlMnO`)

### 3. Configurar Customer Portal

1. Acesse: https://dashboard.stripe.com/test/settings/billing/portal
2. Ative "Customer Portal"
3. Configurações recomendadas:
   - ✅ Permitir cancelamento de assinatura
   - ✅ Mostrar histórico de faturas
   - ✅ Atualizar método de pagamento
   - ❌ Desabilitar mudança de plano (por enquanto)

### 4. Configurar Webhooks

**Desenvolvimento (localhost):**

```bash
# Instalar Stripe CLI
# macOS: brew install stripe/stripe-cli/stripe
# Windows: scoop install stripe
# Linux: Ver https://stripe.com/docs/stripe-cli

# Login no Stripe
stripe login

# Forward webhooks para localhost
stripe listen --forward-to localhost:3000/api/subscriptions/webhook

# Copiar Webhook Signing Secret (whsec_...)
```

**Produção (Render.com):**

1. Acesse: https://dashboard.stripe.com/test/webhooks
2. Clique "Add Endpoint"
3. Preencha:
   - **Endpoint URL:** `https://guia-aventureiro-backend.onrender.com/api/subscriptions/webhook`
   - **Events to send:**
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_failed`
4. Copie o **Webhook Signing Secret** (whsec_...)

### 5. Variáveis de Ambiente

**backend/.env**

```env
# === STRIPE (Test Mode) ===
STRIPE_SECRET_KEY=sk_test_51xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
STRIPE_PREMIUM_PRICE_ID=price_xxxxxxxxxxxxx

# === PRODUÇÃO (depois de testar) ===
# STRIPE_SECRET_KEY=sk_live_51xxxxxxxxxxxxx
# STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx (webhook de produção)
```

---

## 🧪 Testes

### Test Cards (Modo Test)

```
✅ SUCESSO
Número: 4242 4242 4242 4242
Data: 12/30 (qualquer data futura)
CVC: 123 (qualquer 3 dígitos)

❌ FALHA (cartão recusado)
Número: 4000 0000 0000 0002

⏳ 3D SECURE (requer autenticação)
Número: 4000 0027 6000 3184
```

### Testar Fluxo Completo

```bash
# 1. Criar usuário de teste (se não existe)
node automation/user.js --email patrick@email.com --action reset-all

# 2. Iniciar backend
cd backend
npm run dev

# 3. Em outro terminal, forward webhooks (se localhost)
stripe listen --forward-to localhost:3000/api/subscriptions/webhook

# 4. Testar pagamento
node automation/test-payment.js --email patrick@email.com
# Seguir instruções na tela (abrir URL, usar test card)

# 5. Verificar upgrade
node automation/user.js --email patrick@email.com --action check

# 6. Testar cancelamento
node automation/cancel-subscription.js --email patrick@email.com --immediately

# 7. Verificar downgrade
node automation/user.js --email patrick@email.com --action check
```

### Cenários de Teste

| Cenário | Comando | Resultado Esperado |
|---------|---------|-------------------|
| Criar checkout | `test-payment.js` | URL do Stripe Checkout |
| Pagamento sucesso | Usar card 4242... | Upgrade para Premium |
| Pagamento falha | Usar card 4000 0000 0000 0002 | Status `past_due` |
| Cancelar imediato | `cancel-subscription.js --immediately` | Downgrade para Free |
| Cancelar ao fim do período | `cancel-subscription.js` | Premium até fim do mês |

---

## 📡 Webhooks

### Eventos Processados

| Evento | Quando? | Ação |
|--------|---------|------|
| `checkout.session.completed` | Pagamento confirmado | Upgrade para Premium |
| `customer.subscription.updated` | Assinatura atualizada | Atualizar status/datas |
| `customer.subscription.deleted` | Assinatura cancelada | Downgrade para Free |
| `invoice.payment_failed` | Pagamento falhou | Atualizar status `past_due` |

### Idempotência

Todos os eventos são salvos em `ProcessedEvent` collection:

```javascript
{
  stripeEventId: "evt_1AbCdEfGhIjKlMnO",
  eventType: "checkout.session.completed",
  processedAt: "2026-02-24T10:00:00.000Z",
  userId: "65abc123...",
  metadata: { customerId: "cus_..." }
}
```

Se o mesmo evento chegar 2x, é ignorado na segunda vez.

### Segurança

Webhooks são verificados usando **assinatura Stripe**:

```javascript
const signature = req.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(
  req.rawBody,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET
);
// ✅ Se assinatura inválida, retorna 400
```

---

## 🎨 UX Mobile

### PricingScreen

**Recursos:**
- ✅ Comparação visual FREE vs PREMIUM
- ✅ Badge "Mais Popular" no Premium
- ✅ FAQ colapsável (4 perguntas)
- ✅ Botão "Assinar Premium" (abre Stripe Checkout)
- ✅ Botão "Gerenciar Assinatura" (somente Premium)  
- ✅ Loading states (checkout, portal)
- ✅ Mensagens de erro amigáveis

**Fluxo do Usuário:**

1. Abre PricingScreen
2. Vê planos FREE e PREMIUM
3. Clica "Assinar Premium"
4. App cria checkout session
5. Abre browser nativo com Stripe Checkout
6. Usuário preenche cartão
7. Stripe processa pagamento
8. Webhook atualiza backend
9. App recarrega (React Query invalida cache)
10. ProfileScreen mostra badge "Premium"

---

## 🔒 Segurança

### ✅ Implementado

1. **Webhook Signature Verification**  
   - Valida que webhook veio realmente do Stripe
   - Previne webhooks falsos/maliciosos

2. **Rate Limiting**  
   - Checkout: 5 tentativas / 15 minutos
   - Previne abuso e teste de cartões roubados

3. **Idempotência**  
   - Eventos processados apenas 1 vez
   - Previne duplicação de upgrades

4. **Validações de Negócio**  
   - Não permitir upgrade se já é Premium
   - Validar ownership antes de cancelar

5. **HTTPS Obrigatório**  
   - Webhooks só aceitam HTTPS (produção)
   - Render.com já fornece SSL

6. **Logs Detalhados**  
   - Winston logger com timestamps
   - Auditoria completa de todas as operações

---

## 📊 Monitoramento

### Logs Winston

```bash
# Ver logs em produção
tail -f backend/logs/error.log
tail -f backend/logs/combined.log

# Buscar por eventos Stripe
grep "Stripe" backend/logs/combined.log
grep "webhook" backend/logs/combined.log
```

### Stripe Dashboard

- **Pagamentos:** https://dashboard.stripe.com/test/payments
- **Assinaturas:** https://dashboard.stripe.com/test/subscriptions
- **Webhooks:** https://dashboard.stripe.com/test/webhooks
- **Logs:** https://dashboard.stripe.com/test/logs

### Métricas Importantes

| Métrica | Onde Ver | Meta |
|---------|----------|------|
| Conversion Rate | Analytics futuro | 5-10% |
| Churn Rate | Stripe Dashboard | <10% |
| MRR | Stripe Dashboard | Crescente |
| Failed Payments | Stripe Dashboard | <5% |

---

## 🚀 Deploy

### Staging (Teste)

1. Deploy backend no Render
2. Configurar variáveis de ambiente (Test Mode)
3. Configurar webhook no Stripe Dashboard (Test)
4. Testar fluxo completo com test card

### Production (Live)

1. Ativar conta Stripe (preencher dados bancários)
2. Trocar chaves Test → Live no .env
3. Reconfigurar webhook (Live)
4. Testar com cartão real (pequeno valor)
5. Monitorar logs por 24h
6. Anunciar para usuários

**Checklist Produção:**

- [ ] Conta Stripe verificada
- [ ] Dados bancários cadastrados
- [ ] Chaves Live configuradas
- [ ] Webhook Live configurado
- [ ] Customer Portal ativado
- [ ] Teste com cartão real OK
- [ ] Logs monitorados
- [ ] Email de boas-vindas (futuro)

---

## 🆘 Troubleshooting

### Problema: Webhook não está sendo chamado

**Possíveis causas:**
- URL do webhook incorreta no Stripe Dashboard
- Backend não está rodando
- Stripe CLI não está fowarding (localhost)
- Firewall bloqueando

**Solução:**
```bash
# Verificar se endpoint está acessível
curl -X POST https://guia-aventureiro-backend.onrender.com/api/subscriptions/webhook

# Ver logs do Stripe CLI
stripe listen --forward-to localhost:3000/api/subscriptions/webhook --print-json

# Reenviar evento manualmente
stripe events resend evt_xxxxxxxxxxxxx
```

### Problema: Upgrade não acontece após pagamento

**Possíveis causas:**
- Webhook falhou (ver logs)
- userId não está no metadata
- Subscription já é Premium

**Solução:**
```bash
# Ver logs do backend
tail -f backend/logs/error.log

# Sincronizar manualmente
node automation/sync-stripe.js --email patrick@email.com

# Verificar evento no Stripe
# Dashboard → Webhooks → Ver tentativas
```

### Problema: Erro "invalid_signature" no webhook

**Causa:**
- `STRIPE_WEBHOOK_SECRET` incorreto
- Webhook configurado com secret diferente

**Solução:**
```bash
# Gerar novo webhook secret
stripe listen --print-secret

# Atualizar backend/.env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Reiniciar backend
```

---

## 📚 Recursos

### Documentação Stripe

- API Reference: https://stripe.com/docs/api
- Checkout: https://stripe.com/docs/checkout
- Webhooks: https://stripe.com/docs/webhooks
- Testing: https://stripe.com/docs/testing

### Arquivos do Projeto

```
backend/
├── src/
│   ├── config/
│   │   └── stripe.js                    # Inicialização SDK
│   ├── controllers/
│   │   └── subscriptionController.js    # Endpoints + webhooks
│   ├── middleware/
│   │   └── verifyStripeSignature.js     # Segurança webhook
│   ├── models/
│   │   ├── Subscription.js              # Schema atualizado
│   │   └── ProcessedEvent.js            # Idempotência
│   ├── services/
│   │   └── stripeService.js             # Lógica de negócio
│   └── routes/
│       └── subscriptions.js             # Rotas
└── server.js                            # Webhook route (raw body)

mobile/
├── src/
│   ├── screens/
│   │   └── PricingScreen.tsx            # UX completa
│   └── services/
│       └── subscriptionService.ts       # API calls

automation/
├── test-payment.js                       # Testar checkout
├── cancel-subscription.js                # Testar cancelamento
└── sync-stripe.js                        # Sincronizar status

docs/
└── STRIPE.md                             # Este arquivo
```

---

## 🎯 Próximos Passos

### v1.1 (Curto Prazo)

- [ ] Email de boas-vindas ao assinar Premium
- [ ] Email de notificação de pagamento falhado
- [ ] Push notification ao upgradar/downgradar
- [ ] Analytics (conversion rate, MRR)

### v1.2 (Médio Prazo)

- [ ] Plano anual (desconto de 17%)
- [ ] Cupons de desconto
- [ ] Trial de 7 dias (Premium grátis)
- [ ] Programa de afiliados (10% comissão)

### v2.0 (Longo Prazo)

- [ ] Múltiplas moedas (USD, EUR)
- [ ] Planos corporativos (equipes)
- [ ] Integração com PayPal
- [ ] PIX (via Stripe)

---

**Última atualização:** 24/02/2026  
**Maintainer:** Patrick Avila  
**Status:** ✅ Pronto para Staging
