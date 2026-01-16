# 🚀 Guia de Build e Deploy - Produção

## 📋 Pré-requisitos

### Contas Necessárias
- [ ] Conta Expo (gratuita) - https://expo.dev
- [ ] Apple Developer Account ($99/ano) - Para iOS
- [ ] Google Play Console ($25 taxa única) - Para Android
- [ ] Conta de email para suporte (suporte@guiaaventureiro.com)

### Ferramentas
```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login no Expo
eas login

# Verificar configuração
eas whoami
```

---

## 🔧 Configuração Inicial

### 1. Configurar eas.json

Seu arquivo atual está OK, mas precisa atualizar credenciais:

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "seu-email@icloud.com",  // ← ALTERAR
        "ascAppId": "1234567890",            // ← ALTERAR após criar app
        "appleTeamId": "ABCD123456"          // ← ALTERAR
      },
      "android": {
        "serviceAccountKeyPath": "./google-play-service-account.json",
        "track": "production"
      }
    }
  }
}
```

### 2. Atualizar app.json

Verifique versões antes de cada build:

```json
{
  "expo": {
    "version": "1.0.0",           // ← Incrementar para cada atualização
    "android": {
      "versionCode": 1             // ← Incrementar (inteiro)
    },
    "ios": {
      "buildNumber": "1"           // ← Incrementar (string)
    }
  }
}
```

---

## 📦 Processo de Build

### Build para Android (.apk para testes)
```bash
# Build de preview (APK para testar em dispositivos)
eas build --platform android --profile preview

# Aguardar build (5-15 minutos)
# Baixar APK do link fornecido
# Testar em dispositivo real
```

### Build de Produção (Android .aab)
```bash
# Build para Google Play Store
eas build --platform android --profile production

# Nota: Gera .aab (Android App Bundle)
# Tamanho menor e otimizado para Play Store
```

### Build para iOS (Desenvolvimento)
```bash
# Build para testar no simulador
eas build --platform ios --profile development

# Build de preview (TestFlight)
eas build --platform ios --profile preview
```

### Build de Produção (iOS)
```bash
# Build para App Store
eas build --platform ios --profile production

# Nota: Requer certificados e provisioning profiles
# EAS gerencia isso automaticamente na primeira vez
```

### Build para ambas as plataformas
```bash
# Build simultâneo (economiza tempo)
eas build --platform all --profile production
```

---

## 🍎 iOS - App Store

### Passo 1: Criar App no App Store Connect
1. Acesse https://appstoreconnect.apple.com
2. Clique em "My Apps" → "+" → "New App"
3. Preencha:
   - **Platform:** iOS
   - **Name:** Guia do Aventureiro
   - **Primary Language:** Portuguese (Brazil)
   - **Bundle ID:** com.guiaaventureiro.app
   - **SKU:** guia-aventureiro-001
   - **User Access:** Full Access

### Passo 2: Preparar Informações
- [ ] Screenshots (veja SCREENSHOT_GUIDE.md)
- [ ] Ícone 1024x1024 (sem alpha channel)
- [ ] Descrição (veja APP_STORE_DESCRIPTIONS.md)
- [ ] Palavras-chave
- [ ] URL de privacidade: https://guiaaventureiro.com/privacy
- [ ] URL de suporte: https://guiaaventureiro.com

### Passo 3: Fazer Build
```bash
# Build de produção
eas build --platform ios --profile production

# Aguardar conclusão (15-30 min)
```

### Passo 4: Enviar para App Store
```bash
# Método 1: Via EAS Submit (automático)
eas submit --platform ios --latest

# Método 2: Manual via App Store Connect
# 1. Baixar .ipa do link fornecido
# 2. Upload via Transporter (Mac App)
```

### Passo 5: Completar Submissão
1. Voltar ao App Store Connect
2. Selecionar build enviado
3. Adicionar screenshots
4. Preencher descrições e metadados
5. Adicionar informações de contato
6. Selecionar rating de idade (4+)
7. **Submit for Review**

### Passo 6: Aguardar Revisão
- ⏱️ Tempo médio: 24-48 horas
- 📧 Notificações por email
- Status: "Waiting for Review" → "In Review" → "Ready for Sale"

---

## 🤖 Android - Google Play Store

### Passo 1: Criar App no Google Play Console
1. Acesse https://play.google.com/console
2. Clique em "Create app"
3. Preencha:
   - **App name:** Guia do Aventureiro
   - **Default language:** Portuguese (Brazil)
   - **App or game:** App
   - **Free or paid:** Free
4. Aceite políticas e crie

### Passo 2: Configurar Service Account (para submissão automática)
```bash
# 1. Criar service account no Google Cloud Console
# 2. Baixar JSON key
# 3. Salvar como: mobile/google-play-service-account.json
# 4. Adicionar ao .gitignore
```

### Passo 3: Preparar Assets
- [ ] Ícone 512x512 (PNG com transparência)
- [ ] Gráfico de destaque 1024x500
- [ ] Screenshots (3-8 imagens)
- [ ] Descrição curta (80 chars)
- [ ] Descrição completa (4000 chars)

### Passo 4: Fazer Build
```bash
# Build de produção (gera .aab)
eas build --platform android --profile production

# Aguardar conclusão (10-20 min)
```

### Passo 5: Enviar para Play Store
```bash
# Método 1: Via EAS Submit (automático)
eas submit --platform android --latest

# Método 2: Manual via Play Console
# 1. Baixar .aab do link fornecido
# 2. Upload em "Release" → "Production"
```

### Passo 6: Completar Listagem da Loja
1. **App content**
   - Privacy Policy: https://guiaaventureiro.com/privacy
   - Ads: No
   - Target audience: Ages 13+
   - App category: Travel & Local

2. **Store listing**
   - Título, descrição curta, descrição completa
   - Screenshots e gráficos
   - Ícone da aplicação

3. **Pricing & distribution**
   - Free
   - Available in all countries
   - Content rating: Complete questionnaire (Everyone)

4. **Submit for Review**

### Passo 7: Aguardar Revisão
- ⏱️ Tempo médio: 1-7 dias (primeira vez pode demorar mais)
- 📧 Notificações por email
- Status: "Under review" → "Approved" → "Published"

---

## 🔐 Assinatura de Apps (Signing)

### Android
```bash
# EAS gerencia automaticamente
# Na primeira build, cria keystore
# Guarda credenciais de forma segura

# Ver credenciais
eas credentials
```

### iOS
```bash
# EAS gerencia certificados automaticamente
# Na primeira build:
# 1. Cria Distribution Certificate
# 2. Cria Provisioning Profile
# 3. Registra Bundle ID

# Ver credenciais
eas credentials
```

---

## 🔄 Updates Over-The-Air (OTA)

### Publicar atualização sem rebuild
```bash
# Para mudanças em JS/assets (não código nativo)
eas update --branch production --message "Fix: correção de bug no orçamento"

# Usuários recebem update automaticamente na próxima abertura
```

### Quando usar OTA vs Build:
- **OTA (rápido):** Mudanças em JS, assets, configurações
- **Build (lento):** Mudanças em código nativo, dependências, versão

---

## 📊 Monitoramento e Analytics

### 1. Sentry (Crash Reporting)
```bash
# Instalar
npm install --save @sentry/react-native

# Configurar (mobile/App.tsx)
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'SUA_DSN_DO_SENTRY',
  enableAutoSessionTracking: true,
  environment: __DEV__ ? 'development' : 'production',
});
```

### 2. Google Analytics / Firebase
```bash
# Instalar
npx expo install expo-firebase-analytics

# Configurar
import analytics from '@react-native-firebase/analytics';

await analytics().logEvent('itinerary_created', {
  destination: 'Paris',
  budget: 5000,
});
```

---

## 🧪 Checklist Pré-Produção

### Código
- [ ] Remover console.logs
- [ ] Configurar __DEV__ corretamente
- [ ] Testar em dispositivos reais (iOS + Android)
- [ ] Verificar performance (scroll lag, etc)
- [ ] Testar fluxo completo (signup → criar roteiro → explorar)

### Backend
- [ ] Variáveis de ambiente configuradas no Render
- [ ] CORS configurado para app móvel
- [ ] Rate limiting configurado
- [ ] MongoDB Atlas com backups
- [ ] Cloudinary com limites adequados
- [ ] Groq API com fallback

### Configurações
- [ ] env.ts com URLs corretas
- [ ] app.json com versões corretas
- [ ] eas.json com profiles corretos
- [ ] .gitignore com secrets

### Documentação
- [ ] Política de Privacidade hospedada
- [ ] Termos de Uso hospedados
- [ ] README atualizado
- [ ] CHANGELOG atualizado

### Assets
- [ ] Ícone do app 1024x1024
- [ ] Splash screen configurado
- [ ] Screenshots de todas as telas
- [ ] Gráficos para lojas

---

## 🐛 Troubleshooting

### Build falhou
```bash
# Ver logs detalhados
eas build:view <BUILD_ID>

# Problemas comuns:
# 1. Certificados expirados → eas credentials
# 2. Dependências incompatíveis → verificar package.json
# 3. Falta de memória → aguardar e tentar novamente
```

### Submit rejeitado (App Store)
**Motivos comuns:**
- Falta de privacidade policy
- Screenshots não correspondem ao app
- Funcionalidades quebradas
- Violação de guidelines

**Solução:** Ler feedback, corrigir e reenviar

### Submit rejeitado (Play Store)
**Motivos comuns:**
- Content rating incorreto
- Privacy policy não acessível
- Permissões não justificadas
- Ícone/screenshots de baixa qualidade

**Solução:** Corrigir conforme solicitado e atualizar

---

## 📈 Pós-Lançamento

### 1. Monitorar Reviews
- Responder reviews negativos em 24h
- Agradecer reviews positivos
- Coletar feedback para melhorias

### 2. Atualizar Regularmente
```bash
# Incrementar versão
# app.json: "version": "1.0.1"
# app.json: android.versionCode → 2
# app.json: ios.buildNumber → "2"

# Build e submit
eas build --platform all --profile production
eas submit --platform all --latest
```

### 3. Marketing
- Criar posts para redes sociais
- Compartilhar com amigos/família
- Coletar primeiros usuários
- Pedir reviews de usuários satisfeitos

---

## 📞 Recursos Úteis

### Documentação Oficial
- [Expo EAS Build](https://docs.expo.dev/build/introduction/)
- [Expo EAS Submit](https://docs.expo.dev/submit/introduction/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Play Store Policy](https://play.google.com/about/developer-content-policy/)

### Comunidades
- [Expo Discord](https://chat.expo.dev/)
- [Stack Overflow - React Native](https://stackoverflow.com/questions/tagged/react-native)
- [Reddit - r/reactnative](https://reddit.com/r/reactnative)

---

## ✅ Checklist Final

### Antes da primeira build:
- [ ] Código finalizado e testado
- [ ] Versões atualizadas (app.json)
- [ ] URLs de produção configuradas (env.ts)
- [ ] Secrets configurados (.env, Render)
- [ ] Documentação legal hospedada

### Antes do submit:
- [ ] Build testado em dispositivos reais
- [ ] Screenshots capturados (SCREENSHOT_GUIDE.md)
- [ ] Descrições prontas (APP_STORE_DESCRIPTIONS.md)
- [ ] Contas de desenvolvedor criadas
- [ ] Informações de suporte preparadas
- [ ] Conta de teste criada para revisores

### Pós-submit:
- [ ] Monitorar emails de notificação
- [ ] Preparar respostas para possíveis rejeições
- [ ] Planejar atualizações futuras
- [ ] Configurar Analytics
- [ ] Criar materiais de marketing

---

**Boa sorte com o lançamento! 🎉**
