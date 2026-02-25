# Landing Page - Guia do Aventureiro

Esta landing page permite que links de compartilhamento funcionem como **Universal Links (iOS)** e **App Links (Android)**.

## 📋 Checklist de Configuração

### 1️⃣ Registrar Domínio
- [ ] Comprar domínio `share.guiaaventureiro.app` (ou subdomínio)
- Sugestões: Cloudflare, Namecheap, GoDaddy

### 2️⃣ Hospedar Landing Page

**Opções de Hospedagem (GRATUITAS):**

#### A) Vercel (Recomendado) ⭐
```bash
# Instalar Vercel CLI
npm i -g vercel

# Na pasta landing-page, executar:
cd landing-page
vercel

# Seguir instruções e conectar ao domínio
```

#### B) Netlify
```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Deploy
cd landing-page
netlify deploy --prod
```

#### C) GitHub Pages
1. Criar repositório `guiaaventureiro-share`
2. Fazer upload dos arquivos
3. Ativar GitHub Pages em Settings
4. Configurar domínio customizado

#### D) Firebase Hosting
```bash
npm i -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### 3️⃣ Configurar DNS

No seu provedor de DNS (Cloudflare, etc):

```
Tipo: CNAME
Nome: share
Valor: [seu-projeto].vercel.app (ou outro host)
TTL: Auto
```

**OU** se usar IP direto:

```
Tipo: A
Nome: share
Valor: [IP do servidor]
TTL: Auto
```

### 4️⃣ Configurar SSL/HTTPS

- ✅ Vercel/Netlify: SSL automático
- ⚠️ Servidor próprio: Usar certbot (Let's Encrypt)

```bash
# Para servidor próprio
sudo certbot --nginx -d share.guiaaventureiro.app
```

### 5️⃣ Atualizar Arquivos de Verificação

#### iOS (apple-app-site-association)

1. Obter Team ID no [Apple Developer](https://developer.apple.com)
2. Substituir `TEAM_ID` em `.well-known/apple-app-site-association`

```json
"appID": "ABC123XYZ.com.guiaaventureiro.app"
```

#### Android (assetlinks.json)

1. Obter SHA256 fingerprint:

```bash
# Se app em desenvolvimento
cd mobile/android
./gradlew signingReport

# Copiar SHA256 de "Variant: debug"
```

2. Substituir em `.well-known/assetlinks.json`

```json
"sha256_cert_fingerprints": [
  "A1:B2:C3:D4:..."
]
```

### 6️⃣ Testar Universal Links

#### iOS
```bash
# Verificar configuração
curl https://share.guiaaventureiro.app/.well-known/apple-app-site-association

# Deve retornar JSON (não HTML)
# Content-Type: application/json
```

#### Android
```bash
# Verificar configuração
curl https://share.guiaaventureiro.app/.well-known/assetlinks.json

# Testar no dispositivo
adb shell am start -a android.intent.action.VIEW \
  -d "https://share.guiaaventureiro.app/r/abc-123"
```

### 7️⃣ Validar

- [ ] Acesse `https://share.guiaaventureiro.app` - deve mostrar a landing page
- [ ] Acesse `https://share.guiaaventureiro.app/.well-known/apple-app-site-association` - deve retornar JSON
- [ ] Acesse `https://share.guiaaventureiro.app/.well-known/assetlinks.json` - deve retornar JSON
- [ ] No iOS: Teste com [Apple's validator](https://search.developer.apple.com/appsearch-validation-tool/)
- [ ] No Android: Teste com [Digital Asset Links Tester](https://developers.google.com/digital-asset-links/tools/generator)

## 🚀 Deploy Rápido (Vercel)

```bash
cd landing-page
vercel --prod
```

Depois:
1. Vá em [vercel.com](https://vercel.com) → seu projeto
2. Settings → Domains → Add `share.guiaaventureiro.app`
3. Copie o DNS record para seu provedor

## 🧪 Testar Localmente

```bash
# Servidor HTTP simples
cd landing-page
python -m http.server 8000

# Acesse http://localhost:8000/r/abc-123
```

## 📝 Notas Importantes

1. **HTTPS obrigatório**: Universal/App Links só funcionam com HTTPS
2. **Sem redirecionamentos**: O arquivo `.well-known` não pode ter redirect 301/302
3. **Content-Type correto**: Deve ser `application/json`
4. **Cache**: Pode demorar até 24h para iOS reconhecer mudanças

## 🔗 Links Úteis

- [Apple Universal Links](https://developer.apple.com/ios/universal-links/)
- [Android App Links](https://developer.android.com/training/app-links)
- [Vercel Docs](https://vercel.com/docs)
- [Netlify Docs](https://docs.netlify.com/)
