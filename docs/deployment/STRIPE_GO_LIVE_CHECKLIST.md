# ✅ Stripe Live - Checklist MVP (Solo)

Checklist curto para ativar cobrança real sem burocracia.

---

## 1) Stripe Live (Dashboard)

- [ ] Confirmar que o Dashboard está em modo **Live**
- [ ] Copiar chaves live: `sk_live_...` e `pk_live_...`
- [ ] Criar/validar produto Premium e copiar `price_...` live
- [ ] Criar webhook para `https://SEU_BACKEND/api/subscriptions/webhook`
- [ ] Copiar `whsec_...` do webhook live
- [ ] Habilitar eventos:
  - [ ] `checkout.session.completed`
  - [ ] `customer.subscription.created`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`
  - [ ] `invoice.payment_succeeded`
  - [ ] `invoice.payment_failed`

---

## 2) Backend (produção)

Usar template: [backend/.env.production.example](../../backend/.env.production.example)

- [ ] `NODE_ENV=production`
- [ ] `STRIPE_SECRET_KEY=sk_live_...`
- [ ] `STRIPE_PUBLISHABLE_KEY=pk_live_...`
- [ ] `STRIPE_WEBHOOK_SECRET=whsec_...`
- [ ] `STRIPE_PREMIUM_PRICE_ID=price_...` (live)
- [ ] `STRIPE_REDIRECT_BASE_URL=https://SEU_BACKEND`
- [ ] `FRONTEND_URL=https://...`
- [ ] Redeploy backend
- [ ] Validar `GET /health` = 200

---

## 3) Mobile (produção)

No `mobile/.env.local`:

- [ ] `EXPO_PUBLIC_APP_ENV=production`
- [ ] `EXPO_PUBLIC_PROD_API_URL=https://SEU_BACKEND/api`

Executar:

- [ ] `npm run start:prod`

---

## 4) Teste mínimo obrigatório (10 minutos)

- [ ] Fazer upgrade para Premium e confirmar status ativo no app
- [ ] Confirmar no backend que o usuário virou premium
- [ ] Cancelar assinatura e validar webhook de update/delete
- [ ] Validar que não há erro crítico de Stripe nos logs

---

## 5) Regra de decisão

### GO ✅
- [ ] Upgrade + cancelamento funcionam ponta a ponta
- [ ] Webhook chega e é processado
- [ ] Sem chave/test `price_id` de ambiente errado

### NO-GO ❌
- [ ] Webhook falhando
- [ ] Checkout conclui e usuário não vira premium
- [ ] Redirect com localhost/tunnel expirado

---

**Relacionado**
- [Deploy Checklist](./DEPLOY_CHECKLIST.md)
- [Guia de Implementação Produção](./IMPLEMENTATION_GUIDE_PRODUCTION_READY.md)
- [Integração Stripe](../api/STRIPE.md)
