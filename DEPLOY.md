# 🚀 Guia de Deploy - Guia do Aventureiro

Este documento contém instruções completas para fazer deploy da aplicação em produção.

## 📋 Pré-requisitos

Antes de começar, você precisa:

### 1. Criar Contas nas Plataformas

- **Render.com** (backend): https://render.com/
  - Plano Free disponível
  - Faça login com GitHub para auto-deploy

- **Expo Account** (mobile builds): https://expo.dev/
  - Necessário para EAS Build
  - Plano Free: 30 builds/mês

- **Apple Developer** (iOS): https://developer.apple.com/
  - Necessário apenas para publicar na App Store
  - Custo: $99/ano
  - **Opcional na fase inicial** - pode testar sem

- **Google Play Console** (Android): https://play.google.com/console
  - Necessário para publicar no Google Play
  - Custo único: $25
  - **Opcional na fase inicial** - pode distribuir APK manualmente

### 2. Instalar Ferramentas

```bash
# EAS CLI (para builds mobile)
npm install -g eas-cli

# Expo CLI (caso não tenha)
npm install -g expo-cli
```

---

## 🔧 Parte 1: Deploy do Backend (Render)

### Passo 1: Preparar o Repositório

1. Certifique-se que está tudo commitado no Git:
```bash
git add .
git commit -m "Preparação para produção"
git push origin main
```

2. Seu código **já está pronto** com:
   - ✅ `render.yaml` configurado
   - ✅ Scripts de produção no `package.json`
   - ✅ Logs configurados (Winston)
   - ✅ Índices do MongoDB otimizados

### Passo 2: Criar Serviço no Render

1. Acesse https://dashboard.render.com/
2. Clique em **"New +"** → **"Web Service"**
3. Conecte seu repositório GitHub
4. Selecione o repositório `guia-aventureiro`

O Render vai **detectar automaticamente** o arquivo `render.yaml` e configurar tudo.

### Passo 3: Configurar Variáveis de Ambiente

No painel do Render, vá em **"Environment"** e adicione:

```bash
# MongoDB (use seu MongoDB Atlas)
MONGO_URI=mongodb+srv://seu-usuario:sua-senha@cluster.mongodb.net/guia-aventureiro?retryWrites=true&w=majority

# JWT Secrets (já gerados no .env - copie daqui)
JWT_SECRET=072d43d7b528fcbb06bd623d42cb465201ee32bb7692795bf709a0371e03390a
JWT_REFRESH_SECRET=59364e349be282ea5ef77b447bc710e9126ec06c2048044236bfebedc8d814bf

# Groq AI
GROQ_API_KEY=sua-chave-groq

# Cloudinary (para upload de fotos)
CLOUDINARY_CLOUD_NAME=seu-cloud-name
CLOUDINARY_API_KEY=sua-api-key
CLOUDINARY_API_SECRET=seu-api-secret

# Node Environment
NODE_ENV=production
PORT=10000
```

**⚠️ IMPORTANTE:**
- Use os **mesmos valores** do seu arquivo `.env` local
- O `MONGO_URI` deve apontar para seu MongoDB Atlas (já configurado)
- Não compartilhe essas chaves publicamente

### Passo 4: Deploy Automático

1. Clique em **"Create Web Service"**
2. O Render vai:
   - Instalar dependências
   - Criar índices do MongoDB (via `npm run indexes`)
   - Iniciar o servidor
3. Aguarde 3-5 minutos

### Passo 5: Verificar Deploy

Acesse a URL fornecida pelo Render + `/health`:
```
https://seu-app.onrender.com/health
```

Deve retornar:
```json
{
  "status": "OK",
  "service": "Guia do Aventureiro API",
  "database": "connected",
  "memory": { "rss": "50 MB", ... },
  "uptime": 123.45,
  "environment": "production"
}
```

---

## 📱 Parte 2: Build do Aplicativo Mobile

### Passo 1: Configurar EAS CLI

```bash
# Login no Expo
eas login

# Configure o projeto
cd mobile
eas build:configure
```

Quando perguntar se quer usar `eas.json` existente, responda **YES** (já está configurado).

### Passo 2: Atualizar URL da API

1. Abra `mobile/src/config/env.ts`
2. Substitua `API_URL` pela URL do Render:

```typescript
export const API_URL = 'https://seu-app.onrender.com/api';
```

3. Commit:
```bash
git add .
git commit -m "Update API URL para produção"
```

### Passo 3: Build Android (APK para Testes)

```bash
# Build preview (APK instalável)
eas build --profile preview --platform android
```

Isso vai:
- Enviar código para servidores Expo
- Compilar APK
- Gerar link de download

**Tempo:** 10-15 minutos

### Passo 4: Testar APK

1. Baixe o APK do link fornecido
2. Instale no celular Android
3. Teste todas as funcionalidades:
   - ✅ Login/Cadastro
   - ✅ Gerar roteiro com IA
   - ✅ Editar roteiro
   - ✅ Upload de foto
   - ✅ Compartilhar roteiro
   - ✅ Explorar roteiros públicos
   - ✅ Conquistas/XP
   - ✅ Modo offline

### Passo 5: Build iOS (TestFlight)

**Pré-requisito:** Apple Developer Account ativo

```bash
# Build para iOS
eas build --profile production --platform ios
```

Vai pedir credenciais Apple:
- Apple ID
- App-Specific Password

**Tempo:** 15-20 minutos

### Passo 6: Builds de Produção (App Store + Google Play)

Quando estiver pronto para publicar:

```bash
# Build e submit automático
eas build --profile production --platform all
eas submit --platform ios
eas submit --platform android
```

---

## 🔐 Parte 3: Configurações de Produção

### MongoDB Atlas - Otimizações

1. Acesse https://cloud.mongodb.com/
2. Vá em **Database Access** → Adicione IP do Render na whitelist
3. Em **Network Access** → Adicione `0.0.0.0/0` (permitir de qualquer lugar)
4. Crie índices:

```bash
# No seu terminal local
cd backend
npm run indexes
```

### Cloudinary - Upload de Imagens

1. Acesse https://cloudinary.com/
2. Dashboard → Copie:
   - Cloud Name
   - API Key
   - API Secret
3. Cole no Render (Environment Variables)

### Groq AI - Rate Limits

Plano Free:
- 14.400 requisições/dia
- ~600 req/hora
- Suficiente para MVP com poucos usuários

Se precisar de mais:
- Groq oferece plano pago
- Ou implemente fila de requisições

---

## 🧪 Parte 4: Testes de Produção

### Checklist de Testes

Backend (Render):
- [ ] `/health` retorna status OK
- [ ] Login funciona
- [ ] Cadastro funciona
- [ ] Geração de roteiro com IA
- [ ] Upload de foto funciona
- [ ] Banco de dados conectado
- [ ] Logs aparecem no Render

Mobile (APK/TestFlight):
- [ ] Login/Cadastro
- [ ] Gerar roteiro
- [ ] Editar roteiro
- [ ] Upload de foto
- [ ] Compartilhar roteiro
- [ ] Explorar roteiros públicos
- [ ] Sistema de conquistas
- [ ] Modo offline (sem internet)
- [ ] Push notifications (se implementado)

---

## 📊 Parte 5: Monitoramento

### Logs no Render

Acesse: Dashboard → Seu serviço → **Logs**

Tipos de logs:
- `error.log` - Apenas erros
- `combined.log` - Tudo (warn + error em produção)

### Métricas

Render fornece:
- CPU usage
- Memory usage
- Request count
- Response time

### Alertas

Configure alertas no Render:
1. Settings → Notifications
2. Adicione email ou Slack
3. Configure para:
   - Deploy failures
   - Service down
   - High memory usage

---

## 🚨 Troubleshooting

### Backend não inicia

1. Verifique logs no Render
2. Confirme variáveis de ambiente
3. Teste `MONGO_URI` localmente:
```bash
mongosh "sua-connection-string"
```

### Build mobile falha

1. Verifique `eas.json` está correto
2. Confirme Bundle ID único:
   - iOS: `com.guiaaventureiro.app`
   - Android: `com.guiaaventureiro.app`
3. Rode diagnóstico:
```bash
eas build:inspect
```

### MongoDB timeout

- MongoDB Atlas cluster pode estar pausado (cold start)
- Acesse Atlas → Resume cluster
- Timeout configurado para 30s (suficiente)

### Upload de fotos não funciona

1. Confirme credenciais Cloudinary
2. Teste endpoint `/api/upload` diretamente
3. Verifique limites de tamanho (5MB max)

### IA demora muito

- Groq demora 1-2s normalmente
- Se > 5s, pode ser rate limit
- Verifique quota no dashboard Groq

---

## 📈 Parte 6: Após Deploy

### Domínio Customizado (Opcional)

Render Free não inclui domínio. Para ter `api.guiaaventureiro.com`:

1. Compre domínio (Registro.br, Namecheap)
2. No Render: Settings → Custom Domain
3. Configure DNS:
```
CNAME api.guiaaventureiro.com → seu-app.onrender.com
```

### SSL/HTTPS

✅ Render fornece SSL automático (Let's Encrypt)

### Escalabilidade

Plano Free do Render:
- 750h/mês (suficiente para 1 serviço 24/7)
- 512MB RAM
- Sleep após 15min inatividade (cold start)

Para evitar sleep:
- Upgrade para plano pago ($7/mês)
- Ou configure ping externo (UptimeRobot)

### Backup

MongoDB Atlas Free:
- Backups automáticos diários
- Retenção: 7 dias
- Restauração via painel

---

## ✅ Checklist Final

Antes de considerar em produção:

### Backend
- [ ] Deploy no Render funcionando
- [ ] Health check retorna OK
- [ ] MongoDB conectado e índices criados
- [ ] Todas as variáveis de ambiente configuradas
- [ ] Cloudinary funcionando (upload)
- [ ] Groq AI gerando roteiros
- [ ] Logs configurados (Winston)

### Mobile
- [ ] Build Android (APK) testado
- [ ] Build iOS (TestFlight) testado
- [ ] API_URL apontando para Render
- [ ] Todas funcionalidades testadas
- [ ] App funciona offline
- [ ] Permissões (câmera, localização) funcionando

### Contas/Acessos
- [ ] Conta Render criada
- [ ] Conta Expo criada
- [ ] MongoDB Atlas configurado
- [ ] Cloudinary configurado
- [ ] Groq API key válida
- [ ] (Opcional) Apple Developer
- [ ] (Opcional) Google Play Console

### Documentação
- [ ] README.md atualizado com URLs produção
- [ ] API.md com endpoint produção
- [ ] Privacy Policy hospedada (GitHub Pages)
- [ ] Terms of Service hospedados (GitHub Pages)

---

## 🎯 Próximos Passos

1. **Deploy Backend** (20 minutos)
   - Criar serviço no Render
   - Configurar env vars
   - Verificar health check

2. **Build Mobile Android** (30 minutos)
   - Configurar EAS
   - Build preview
   - Testar APK

3. **Testes Completos** (1-2 horas)
   - Testar todas funcionalidades
   - Corrigir bugs encontrados

4. **Build iOS** (se aplicável)
   - Configurar Apple Developer
   - Build production
   - Submit TestFlight

5. **Publicação** (quando pronto)
   - Submit App Store
   - Submit Google Play
   - Aguardar aprovação (3-7 dias)

---

## 📞 Suporte

Problemas durante deploy:

- **Render Docs**: https://render.com/docs
- **EAS Build Docs**: https://docs.expo.dev/build/introduction/
- **MongoDB Atlas**: https://www.mongodb.com/docs/atlas/
- **Groq API**: https://console.groq.com/docs/

**Dica:** Todos os serviços têm planos free suficientes para MVP. Só pague quando tiver usuários reais.

---

**Boa sorte! 🚀**
