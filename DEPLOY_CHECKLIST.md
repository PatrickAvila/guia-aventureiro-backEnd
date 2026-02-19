# 🚀 Deploy e Produção - Guia Completo

**Última Atualização:** 10/02/2026

---

## 📋 PRÉ-REQUISITOS

### Contas Necessárias
- [x] Expo Account (gratuita) - https://expo.dev
- [ ] Apple Developer Account ($99/ano) - Para iOS
- [ ] Google Play Console ($25 única vez) - Para Android

### Ferramentas
```bash
npm install -g eas-cli
eas login
eas whoami
```

---

## ✅ CHECKLIST PRÉ-LANÇAMENTO

### 🔐 **1. SEGURANÇA (CRÍTICO)**

- [x] **Variáveis de Ambiente**
  - [x] `.env` não está no Git
  - [x] `.env.example` criado com placeholders
  - [x] Secrets de produção gerados (JWT_SECRET, etc)
  - [ ] Secrets salvos em gerenciador seguro (1Password, LastPass)
  
- [x] **MongoDB**
  - [x] MongoDB Atlas configurado (não local)
  - [x] Autenticação ativa
  - [x] IP whitelist configurado
  - [x] Backup automático diário
  - [x] Índices otimizados (32 índices)
  
- [x] **Backend Security**
  - [x] Helmet configurado
  - [x] CORS configurado
  - [x] Rate limiting ativo
  - [x] HTTPS obrigatório
  - [x] Content Security Policy (CSP)

---

### 🧪 **2. TESTES**

- [x] **Fluxo Completo**
  - [x] Registro → Login → Criar roteiro → Logout (Expo Go)
  - [x] Teste em dispositivos reais
  - [ ] Teste build iOS em iPhone real
  - [ ] Teste build Android real
  
- [ ] **Casos de Erro**
  - [ ] Sem internet
  - [ ] API key inválida
  - [ ] Login com senha errada
  - [ ] Token expirado
  - [ ] Upload foto >10MB
  
- [ ] **Performance**
  - [ ] App com 100+ roteiros
  - [ ] Tempo resposta IA (<3s)
  - [ ] Memória (sem leaks)

---

### 🎨 **3. UI/UX**

- [ ] **Design**
  - [ ] Tema claro/escuro em todas telas
  - [ ] Contraste de cores (acessibilidade)
  - [ ] Telas pequenas (iPhone SE)
  - [ ] Telas grandes (iPad, tablets)
  - [ ] Loading states
  - [ ] Mensagens de erro claras
  
- [ ] **Textos**
  - [ ] Revisão gramatical
  - [ ] Tom de voz consistente
  - [ ] Mensagens amigáveis (não técnicas)

---

### 📊 **4. ANALYTICS**

- [ ] **Firebase Analytics**
  - [ ] Projeto criado no Firebase Console
  - [ ] `google-services.json` (Android) na raiz mobile/
  - [ ] `GoogleService-Info.plist` (iOS) na raiz mobile/
  - [ ] Rebuild: `npx expo run:android/ios`
  - [ ] DebugView testado
  
- [ ] **Eventos Rastreados**
  - [ ] Cadastro, Login
  - [ ] Roteiro criado/visualizado
  - [ ] Upload fotos
  - [ ] Conquistas desbloqueadas
  - [ ] Compartilhamentos

- [ ] **Error Tracking**
  - [ ] Sentry ou Bugsnag configurado
  - [ ] Alertas de erros críticos

Consulte [mobile/FIREBASE_README.md](mobile/FIREBASE_README.md) para detalhes.

---

### ⚙️ **5. CONFIGURAÇÕES DEPLOY**

#### **Backend (Render.com)**

- [x] **Hospedagem**
  - [x] Backend deployado no Render.com
  - [x] URL: https://guia-aventureiro-backend.onrender.com
  - [x] Health check: `/health`
  - [x] SSL/HTTPS automático
  - [x] `NODE_ENV=production`
  - [ ] Auto-deploy do GitHub configurado
  
- [x] **Variáveis de Ambiente (Render)**
  - [x] `MONGODB_URI`
  - [x] `JWT_SECRET`
  - [x] `GROQ_API_KEY`
  - [x] `CLOUDINARY_CLOUD_NAME`
  - [x] `CLOUDINARY_API_KEY`
  - [x] `CLOUDINARY_API_SECRET`
  - [x] `NODE_ENV=production`
  - [x] **NUNCA definir `TEST_MODE=true` em produção**

#### **Mobile (Expo)**

- [x] **app.json**
  - [x] Nome do app
  - [x] Bundle ID (iOS): `com.guiaaventureiro.app`
  - [x] Package (Android): `com.guiaaventureiro.app`
  - [x] Versão: `1.0.0`
  - [x] Ícone (1024x1024)
  - [x] Splash screen
  
- [ ] **EAS Build**
  - [ ] `eas.json` configurado
  - [ ] Credenciais Apple/Google atualizadas
  - [ ] `projectId` no app.json

---

### 📄 **6. DOCUMENTAÇÃO LEGAL**

- [x] **Políticas**
  - [x] Política de Privacidade criada (`docs/privacy.html`)
  - [x] Termos de Uso criados (`docs/terms.html`)
  - [ ] Hospedados em URL pública (GitHub Pages/Netlify)
  - [ ] Links adicionados no app
  - [x] Compliance LGPD

---

## 📦 BUILD DO APP

### Atualizar Versões (app.json)
```json
{
  "version": "1.0.1",         // Incrementar
  "android": {
    "versionCode": 2          // Incrementar (inteiro)
  },
  "ios": {
    "buildNumber": "2"        // Incrementar (string)
  }
}
```

### Android
```bash
# Preview (APK para testes)
eas build --platform android --profile preview

# Production (AAB para Play Store)
eas build --platform android --profile production
```

### iOS
```bash
# Preview (TestFlight)
eas build --platform ios --profile preview

# Production (App Store)
eas build --platform ios --profile production
```

---

## 📱 SUBMISSÃO ÀS STORES

### **Google Play Store**

**Requisitos:**
- [ ] Screenshots (mínimo 2) - 1080x1920px ou 1080x2340px
- [ ] Feature Graphic (1024x500px)
- [ ] Ícone (512x512px)
- [ ] Privacy Policy URL
- [ ] Descrição curta/completa

**Processo:**
1. Play Console → Create App
2. Nome: **Guia do Aventureiro**
3. Categoria: **Travel & Local**
4. Upload AAB (gerado pelo EAS)
5. Preencher Release Notes
6. Submeter (análise 2-7 dias)

Consulte [APP_STORE_DESCRIPTIONS.md](APP_STORE_DESCRIPTIONS.md) para textos prontos.

---

### **Apple App Store**

**Requisitos:**
- [ ] Screenshots:
  - iPhone 6.7" (1290x2796px) - 3-10 obrigatório
  - iPhone 6.5" (1242x2688px) - 3-10 obrigatório
- [ ] Ícone (1024x1024px, sem transparência)
- [ ] Privacy Policy URL
- [ ] Descrição, Keywords

**Processo:**
1. App Store Connect → New App
2. Nome: **Guia do Aventureiro**
3. Bundle ID: `com.guiaaventureiro.app`
4. Upload IPA via Transporter ou `eas submit`
5. Preencher questionário
6. Demo account (se necessário)
7. Submeter (análise 7-14 dias)

Consulte [APP_STORE_DESCRIPTIONS.md](APP_STORE_DESCRIPTIONS.md) e [SCREENSHOT_GUIDE.md](SCREENSHOT_GUIDE.md).

---

## 🎬 SCREENSHOTS

### Telas Essenciais
1. Onboarding/Welcome
2. Dashboard com roteiros
3. Gerar roteiro (IA em ação)
4. Detalhes do roteiro
5. Galeria de fotos
6. Explorar (roteiros públicos)
7. Perfil com conquistas

### Tamanhos Android
- Phone: 1080x1920px ou 1080x2340px (mínimo 2)
- Tablet: opcional

### Tamanhos iOS
- 6.7" iPhone: 1290x2796px (iPhone 14/15 Pro Max)
- 6.5" iPhone: 1242x2688px (iPhone 11/XS Max)

Consulte [SCREENSHOT_GUIDE.md](SCREENSHOT_GUIDE.md) para guia detalhado.

---

## 🔄 UPDATES (OTA)

### Publish Update sem Rebuild
```bash
# Atualizar JS/assets sem nova build
eas update --branch production --message "Correção de bugs"
```

**Quando usar OTA:**
- ✅ Correção bugs JS
- ✅ Mudanças UI
- ✅ Atualização textos

**Quando NÃO usar (precisa rebuild):**
- ❌ Mudança dependências nativas
- ❌ Mudança app.json (permissions)
- ❌ Novo SDK Expo

---

## 🌐 HOSPEDAR DOCUMENTOS LEGAIS

### GitHub Pages (Recomendado - Grátis)

1. Repositório → Settings → Pages
2. Source: `main` branch / `(root)`
3. Save

**URLs geradas:**
```
https://<usuario>.github.io/<repo>/docs/privacy.html
https://<usuario>.github.io/<repo>/docs/terms.html
```

### Alternativa: Render Static Site
- Render.com → New Static Site
- Conectar GitHub repo
- Publish Directory: `docs`

---

## 🛠️ TROUBLESHOOTING

### Eventos Firebase não aparecem
- ✅ Verificar `google-services.json` na raiz
- ✅ Fazer rebuild (`expo run:android/ios`)
- ✅ Aguardar até 24h (processamento)
- ✅ Usar DebugView para tempo real

### Build EAS falha
- ✅ Verificar credenciais Apple/Google
- ✅ Verificar `eas.json`
- ✅ Limpar cache: `eas build --clear-cache`

### Backend não responde em produção
- ✅ Verificar logs no Render Dashboard
- ✅ Testar `/health` endpoint
- ✅ Verificar variáveis de ambiente
- ✅ Verificar MongoDB Atlas connection

---

## 📊 MONITORAMENTO PÓS-LANÇAMENTO

### Métricas Importantes
- **Retenção**: D1, D7, D30
- **Engagement**: Tempo sessão, roteiros criados
- **Conversão**: Cadastro → Primeiro roteiro
- **Erros**: Taxa de crashes, erros de rede

### Dashboards
- Firebase Analytics → Dashboard
- Render.com → Metrics (CPU, Memory, Response Time)
- MongoDB Atlas → Metrics (Connections, Operations)

---

## 📋 CHECKLIST FINAL

Antes de submeter às lojas:

- [ ] Todos os testes passaram
- [ ] Build iOS/Android gerados com sucesso
- [ ] Screenshots capturados e otimizados
- [ ] Textos revisados (descrição, release notes)
- [ ] Privacy Policy hospedada e URL válida
- [ ] Firebase Analytics configurado e testado
- [ ] Backend em produção estável (>99% uptime)
- [ ] Variáveis de ambiente de produção validadas
- [ ] Error tracking configurado (Sentry/Bugsnag)
- [ ] Demo account preparado (se necessário para review)

---

## 🎯 RECURSOS ÚTEIS

- [APP_STORE_DESCRIPTIONS.md](APP_STORE_DESCRIPTIONS.md) - Textos prontos
- [SCREENSHOT_GUIDE.md](SCREENSHOT_GUIDE.md) - Guia de screenshots
- [mobile/FIREBASE_README.md](mobile/FIREBASE_README.md) - Firebase Analytics
- [README.md](README.md) - Documentação técnica
- [FAQ.md](FAQ.md) - Perguntas frequentes
- [CHANGELOG.md](CHANGELOG.md) - Histórico de versões

---

**Boa sorte com o lançamento! 🚀**
