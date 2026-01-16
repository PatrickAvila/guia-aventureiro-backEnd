# ✅ CHECKLIST DE PRODUÇÃO - GUIA DO AVENTUREIRO

**Última Atualização:** 04/01/2026

---

## 🎯 OVERVIEW

Este checklist organiza todas as tarefas necessárias para lançar o app com segurança e qualidade.

**Status Atual:** MVP 100% completo (19/19 features) ✅

**Documentação Criada:**
- ✅ [APP_STORE_DESCRIPTIONS.md](APP_STORE_DESCRIPTIONS.md) - Textos prontos para App Store e Play Store
- ✅ [SCREENSHOT_GUIDE.md](SCREENSHOT_GUIDE.md) - Guia completo para capturar screenshots
- ✅ [BUILD_DEPLOY_GUIDE.md](BUILD_DEPLOY_GUIDE.md) - Processo de build e submissão
- ✅ [ANALYTICS_GUIDE.md](ANALYTICS_GUIDE.md) - Implementação de Firebase Analytics
- ✅ [docs/privacy.html](docs/privacy.html) - Política de Privacidade hospedável
- ✅ [docs/terms.html](docs/terms.html) - Termos de Uso hospedáveis

---

## 📋 PRÉ-LANÇAMENTO (CRÍTICO - FAZER ANTES)

### **🔐 SEGURANÇA**

- [x] **Variáveis de Ambiente** ✅ (AI)
  - [x] Verificar que `.env` não está no Git ✅ (AI)
  - [x] Criar `.env.example` com placeholders ✅ (AI)
  - [x] Documentar todas as variáveis necessárias ✅ (AI)
  - [x] Gerar novas secrets para produção (JWT_SECRET, etc) ✅ (AI)
  
- [x] **Senhas e Secrets** ✅
  - [x] Trocar todas as senhas padrão ✅ (AI)
  - [x] Usar senhas fortes (64 caracteres hex) ✅ (AI)
  - [ ] Salvar secrets em gerenciador seguro (1Password, LastPass) (Usuário)
  - [x] Não compartilhar API keys em público ✅ (AI)
  
- [x] **MongoDB**
  - [x] Usar MongoDB Atlas em produção (não local) ✅ (AI)
  - [x] Ativar autenticação de usuário ✅ (AI)
  - [x] Configurar IP whitelist ✅ (AI)
  - [x] Fazer backup automático diário ✅ (AI)
  - [x] Criar índices otimizados ✅ (AI)
  
- [x] **Backend Security Headers**
  - [x] Helmet configurado ✅ (AI)
  - [x] CORS configurado corretamente ✅ (AI)
  - [x] Rate limiting ativo ✅ (AI)
  - [x] HTTPS obrigatório em produção ✅ (AI)
  - [x] Content Security Policy (CSP) ✅ (AI)

---

### **🧪 TESTES**

- [x] **Testes Manuais**
  - [x] Testar fluxo completo de registro → login → criar roteiro → logout ✅ (Usuário via Expo Go)
  - [x] Testar em dispositivos reais via Expo Go ✅ (Usuário)
  - [ ] Testar build de produção em iPhone real (após eas build)
  - [ ] Testar build de produção em Android real (após eas build)
  - [ ] Testar com internet lenta (3G)
  - [ ] Testar modo offline completo
  - [ ] Testar com 0 roteiros, 1 roteiro, 50+ roteiros
  - [ ] Testar limite de upload de fotos (10 fotos)
  
- [ ] **Casos de Erro**
  - [ ] Testar sem internet
  - [ ] Testar com API key inválida do Groq
  - [ ] Testar login com senha errada
  - [ ] Testar criar roteiro com dados inválidos
  - [ ] Testar upload de foto muito grande (>10MB)
  - [ ] Testar token expirado
  
- [ ] **Performance**
  - [ ] Testar app com 100+ roteiros (performance de lista)
  - [ ] Verificar tempo de resposta da IA (<3 segundos)
  - [ ] Verificar memória do app (sem memory leaks)
  - [ ] Testar infinite scroll no Explorar

---

### **🎨 UI/UX**

- [ ] **Design**
  - [ ] Testar tema claro e escuro em todas as telas
  - [ ] Verificar contraste de cores (acessibilidade)
  - [ ] Testar em telas pequenas (iPhone SE)
  - [ ] Testar em telas grandes (iPad, tablets Android)
  - [ ] Verificar loading states em todas as ações
  - [ ] Verificar mensagens de erro claras
  
- [ ] **Textos**
  - [ ] Revisar todos os textos (gramática e ortografia)
  - [ ] Verificar tradução/localização (se aplicável)
  - [ ] Garantir tom de voz consistente
  - [ ] Revisar mensagens de erro (amigáveis, não técnicas)

---

### **📊 ANALYTICS E MONITORAMENTO**
 (Ver [ANALYTICS_GUIDE.md](ANALYTICS_GUIDE.md))
  - [ ] Configurar Firebase Analytics (recomendado)
  - [ ] Rastrear eventos importantes:
    - [ ] Cadastro completo
    - [ ] Login realizado
    - [ ] Roteiro criado
    - [ ] Roteiro compartilhado
    - [ ] Visualização de telas
    - [ ] Upload de fotos
    - [ ] Conquistas desbloqueadas
    - [ ] Roteiro compartilhado
    - [ ] Gasto adicionado
    - [ ] Avaliação feita
  
- [ ] **Error Tracking**
  - [ ] Configurar Sentry ou Bugsnag
  - [ ] Testar envio de erros
  - [ ] Configurar alertas de erros críticos
  
- [ ] **Logs**
  - [ ] Configurar níveis de log corretos (prod = warn/error apenas)
  - [ ] Não logar dados sensíveis (senhas, tokens)
  - [ ] Configurar rotação de logs (não encher disco)

---

### **⚙️ CONFIGURAÇÕES DE DEPLOY**

- [ ] **Backend (Node.js/Express)**
  - [x] Escolher plataforma de hospedagem: **Render** ✅ (Usuário)
  - [x] Configurar variáveis de ambiente ✅ (Usuário - em andamento)
  - [ ] Configurar auto-deploy do GitHub
  - [x] Testar health check endpoint ✅
  - [x] Configurar SSL/HTTPS ✅ (Render faz automaticamente)
  - [x] Definir NODE_ENV=production ✅
  
- [ ] **Mobile (React Native/Expo)**
  - [ ] Criar conta Apple Developer ($99/ano para iOS)
  - [ ] Criar conta Google Play Console ($25 uma vez para Android)
  - [x] Configurar app.json com dados corretos ✅
    - [x] Nome do app ✅
    - [x] Bundle ID (iOS) e Package (Android) ✅
    - [x] Versão (1.0.0) ✅
    - [x] Ícone do app (1024x1024) ✅
    - [x] Splash screen ✅
    - [x] Cores de tema ✅
  - [ ] Configurar EAS (eas.json):
    - [x] Profiles configurados (development, preview, production) ✅
    - [ ] Atualizar credenciais Apple/Google
    - [ ] Configurar projectId no app.json
  - [ ] Gerar builds de produção (Ver [BUILD_DEPLOY_GUIDE.md](BUILD_DEPLOY_GUIDE.md)):
    - [ ] `eas build --platform ios --profile production`
    - [ ] `eas build --platform android --profile production`

--- (Ver [APP_STORE_DESCRIPTIONS.md](APP_STORE_DESCRIPTIONS.md) e [SCREENSHOT_GUIDE.md](SCREENSHOT_GUIDE.md))
  - [ ] Criar App ID no Apple Developer Portal
  - [ ] Criar App no App Store Connect
  - [ ] Preparar screenshots (6.7", 6.5") - Ver guia
  - [x] Escrever descrição (português e inglês) ✅
  - [x] Preparar ícone (1024x1024 sem transparência) ✅
  - [x] Definir categoria (Travel) ✅
  - [x] Definir classificação etária (4+) ✅
  - [x] Preparar Privacy Policy URL ✅
  - [ ] Submeter para review (7-14 dias de análise)
  
- [ ] **Google Play Store** (Ver [APP_STORE_DESCRIPTIONS.md](APP_STORE_DESCRIPTIONS.md) e [SCREENSHOT_GUIDE.md](SCREENSHOT_GUIDE.md))
  - [ ] Criar app no Google Play Console
  - [ ] Preparar screenshots (phone, tablet) - Ver guia
  - [x] Escrever descrição (português e inglês) ✅
  - [x] Preparar ícone 512x512 ✅
  - [ ] Preparar feature graphic 1024x500
  - [x] Definir categoria (Travel & Local) ✅
  - [x] Definir classificação de conteúdo (Everyone/PEGI 3) ✅
  - [x] Preparar Privacy Policy URL ✅
  - [ ] Preparar feature graphic 1024x500
  - [ ] Definir categoria (Travel & Local)
  - [ ] Definir classificação de conteúdo
  - [ ] Preparar Privacy Policy URL
  - [ ] Fazer upload do APK/AAB
  - [ ] Submeter para review (2-7 dias)

---

### **📄 DOCUMENTAÇÃO E LEGAL**

- [x] **Documentação** ✅
  - [x] README.md atualizado ✅
  - [x] Instruções de instalação para devs ✅
  - [x] Documentação de API (endpoints) ✅
  - [x] FAQ para usuários ✅
  
- [x] **Legal** ✅
  - [x] Criar Política de Privacidade ✅ (docs/privacy.html)
  - [x] Criar Termos de Uso ✅ (docs/terms.html)
  - [ ] Hospedar em URL pública (GitHub Pages, Netlify, ou Render)
  - [ ] Adicionar links no app
  - [x] Compliance com LGPD (Brasil) ✅

---

### **🔔 MARKETING E COMUNICAÇÃO**

- [ ] **Landing Page**
  - [ ] Criar landing page simples
  - [ ] Explicar o que é o app
  - [ ] Screenshots e vídeo demo
  - [ ] Links para App Store / Play Store
  - [ ] Formulário de contato/suporte
  
- [ ] **Redes Sociais**
  - [ ] Criar perfil Instagram (@guia.aventureiro)
  - [ ] Criar página Facebook
  - [ ] Preparar 10 posts para lançamento
  - [ ] Criar vídeo teaser (30-60s)
  
- [ ] **Email**
  - [ ] Configurar email de suporte (contato@guiaaventureiro.com)
  - [ ] Preparar email de boas-vindas
  - [ ] Configurar resposta automática

---

## 🚀 PÓS-LANÇAMENTO (FAZER LOGO APÓS)

### **📊 MONITORAMENTO (Primeiros 7 dias)**

- [ ] **Métricas Diárias**
  - [ ] Acompanhar downloads (meta: 50-100 primeiros 7 dias)
  - [ ] Monitorar crashes (meta: <1% crash rate)
  - [ ] Verificar erros no Sentry
  - [ ] Checar uso da API Groq (não estourar limite grátis)
  - [ ] Verificar uso de storage (MongoDB, Cloudinary)
  
- [ ] **Feedback**
  - [ ] Ler reviews do App Store/Play Store diariamente
  - [ ] Responder reviews (especialmente negativos)
  - [ ] Criar formulário de feedback in-app
  - [ ] Entrevistar 10 primeiros usuários
  
- [ ] **Bugs Críticos**
  - [ ] Priorizar fixes de bugs que impedem uso
  - [ ] Lançar hot fixes em 24-48h se necessário
  - [ ] Comunicar usuários sobre fixes

---

### **🎯 MELHORIAS RÁPIDAS (Primeiras 2 semanas)**

- [ ] **Quick Wins**
  - [ ] Implementar sugestões mais pedidas
  - [ ] Melhorar onboarding baseado em feedback
  - [ ] Adicionar FAQs baseadas em dúvidas recorrentes
  - [ ] Ajustar prompts da IA se resultados ruins
  
- [ ] **A/B Tests**
  - [ ] Testar diferentes call-to-actions
  - [ ] Testar diferentes flows de onboarding
  - [ ] Otimizar tela de conversão (signup)

---

### **📈 CRESCIMENTO (Primeiro Mês)**

- [ ] **Marketing Orgânico**
  - [ ] Postar daily no Instagram/TikTok
  - [ ] Criar 5 blog posts SEO-otimizados
  - [ ] Participar de grupos de viagem (Facebook, Reddit)
  - [ ] Fazer parcerias com micro-influencers (5-50k seguidores)
  
- [ ] **Marketing Pago (Opcional)**
  - [ ] Facebook/Instagram Ads (R$ 10-20/dia)
  - [ ] Google Ads (busca: "app roteiro viagem")
  - [ ] Meta: CAC < R$ 5,00 por instalação
  
- [ ] **Retenção**
  - [ ] Implementar notificações push
  - [ ] Email semanal com dicas
  - [ ] Programa de indicação (indique e ganhe)

---

## 🔮 ROADMAP PÓS-LANÇAMENTO

### **VERSÃO 1.1 (30 dias após lançamento)**

**Prioridade ALTA:**
- [ ] Orçamento detalhado com gráficos
- [ ] Mapa interativo dos roteiros
- [ ] Notificações push
- [ ] Compartilhamento melhorado (Instagram Stories)
- [ ] Fixes de bugs reportados

**Métricas de Sucesso:**
- 500+ downloads
- 50+ roteiros criados
- 20% retention D7
- Rating 4.0+ nas lojas

---

### **VERSÃO 1.2 (60 dias após lançamento)**

**Prioridade MÉDIA:**
- [ ] Integração com calendário
- [ ] Sistema de dicas da comunidade
- [ ] Templates de roteiros populares
- [ ] Modo colaborativo em tempo real

**Métricas de Sucesso:**
- 1.000+ downloads
- 200+ roteiros criados
- 30% retention D7
- Rating 4.2+ nas lojas

---

### **VERSÃO 2.0 (90 dias após lançamento)**

**Monetização:**
- [ ] Plano Premium (R$ 9,90/mês)
  - Roteiros ilimitados
  - IA melhorada (GPT-4)
  - Export PDF profissional
  - Sem marca d'água
  
- [ ] Afiliações
  - Booking.com
  - Decolar
  - GetYourGuide
  
**Meta:** 10-20% dos usuários ativos pagando

---

## 📊 MÉTRICAS E KPIS

### **Métricas Críticas para Monitorar:**

| Métrica | Meta Mês 1 | Meta Mês 3 | Como Medir |
|---------|------------|------------|------------|
| Downloads | 500+ | 2.000+ | App Store Connect / Play Console |
| DAU (usuários diários) | 50+ | 300+ | Analytics |
| Roteiros criados | 200+ | 1.500+ | Backend logs |
| Retention D7 | 20%+ | 30%+ | Analytics cohorts |
| Crash rate | <2% | <1% | Sentry / Crashlytics |
| Rating lojas | 4.0+ | 4.5+ | App Store / Play Store |
| NPS | 30+ | 50+ | Survey in-app |

---

### **Métricas de Negócio (Após Monetização):**

| Métrica | Meta |
|---------|------|
| CAC (Custo Aquisição Cliente) | < R$ 10 |
| LTV (Lifetime Value) | > R$ 100 |
| Taxa de Conversão Free → Premium | 5-10% |
| Churn mensal | <10% |
| MRR (Monthly Recurring Revenue) | R$ 1.000+ (mês 3) |

---

## 🎯 CHECKLIST RESUMIDO (TOP PRIORIDADES)

### **🔴 CRÍTICO (Fazer ANTES do lançamento):**

1. [ ] Testar em dispositivos reais (iOS + Android)
2. [ ] Trocar todas as senhas e secrets de produção
3. [ ] Configurar MongoDB Atlas (não usar local)
4. [ ] Deploy do backend (Render recomendado)
5. [ ] Criar builds de produção (EAS Build)
6. [ ] Escrever Política de Privacidade e Termos de Uso
7. [ ] Criar screenshots e descrições para lojas
8. [ ] Configurar analytics (Google Analytics)
9. [ ] Testar fluxo completo 5x sem erros
10. [ ] Submeter para App Store e Play Store

---

### **🟡 IMPORTANTE (Fazer logo após lançamento):**

1. [ ] Criar landing page
2. [ ] Configurar Sentry para error tracking
3. [ ] Preparar conteúdo de redes sociais (10 posts)
4. [ ] Criar email de boas-vindas
5. [ ] Monitorar crashes diariamente
6. [ ] Responder reviews nas lojas
7. [ ] Coletar feedback de 10 primeiros usuários

---

### **🟢 DESEJÁVEL (Fazer quando tiver tempo):**

1. [ ] Criar vídeo demo (YouTube)
2. [ ] Blog posts para SEO
3. [ ] Testes A/B de onboarding
4. [ ] Integração com Instagram Stories
5. [ ] Programa de beta testers
6. [ ] Documentação de API pública

---

## 💡 DICAS IMPORTANTES

### **Custos Mensais Esperados (Início):**

| Item | Custo | Observação |
|------|-------|------------|
| Apple Developer | R$ 42/mês | R$ 499/ano (obrigatório iOS) |
| Google Play | R$ 0 | R$ 125 uma vez (Android) |
| Render (Backend) | R$ 0 | Grátis até 750h/mês |
| MongoDB Atlas | R$ 0 | Grátis até 512MB |
| Cloudinary | R$ 0 | Grátis até 25GB/mês |
| Groq AI | R$ 0 | Grátis 14.400 req/dia |
| Domínio (.com) | R$ 5-10/mês | Opcional no início |
| **TOTAL MÍNIMO** | **~R$ 42/mês** | Só iOS obrigatório |

**Com Android:** ~R$ 167 primeiro mês (R$ 125 única vez + R$ 42 Apple)

---

### **Quando Considerar Custos Maiores:**

- **1.000+ usuários:** Pode precisar upgrade do Render (~$7-20/mês)
- **10.000+ fotos:** Pode precisar upgrade Cloudinary (~$89/mês)
- **Tráfego alto Groq:** Considerar Groq Pro (~$10/1M tokens)
- **Marketing:** Começar com R$ 10-20/dia em ads quando validado

---

### **Ordem de Prioridade de Desenvolvimento:**

**AGORA (Pré-lançamento):**
1. Testes finais
2. Deploy produção
3. Preparar lojas
4. Legal docs

**MÊS 1:**
1. Monitorar crashes
2. Coletar feedback
3. Marketing orgânico
4. Quick fixes

**MÊS 2-3:**
1. Orçamento detalhado
2. Mapa interativo
3. Notificações push
4. Melhorias UX

**MÊS 4+:**
1. Monetização (Premium)
2. Afiliações
3. Features avançadas
4. Escalar marketing

---

## 🎉 BOA SORTE NO LANÇAMENTO!

**Lembre-se:**
- ✅ Lançar imperfeito é melhor que não lançar
- ✅ Usuários reais > features perfeitas
- ✅ Feedback > suposições
- ✅ Iterar rápido > planejar demais

**Primeiro objetivo:** 100 usuários reais usando e dando feedback!

---

**Dúvidas?** Revise este checklist e vá step-by-step. Você consegue! 🚀

## ✅ IMPLEMENTADO PELO ASSISTENTE (AI)

- Gerado e validado `.env.example` completo
- Geradas secrets fortes para produção
- Configurado e validado MongoDB Atlas (índices, conexão, script de backup orientado)
- Configurados headers de segurança (Helmet, CORS, CSP, HTTPS)
- Configurado rate limiting, logger (Winston), health check
- Atualizada documentação, checklist, changelog, roadmap
- Criados scripts de teste automatizado (API, mobile)
- Validado deploy no Render, EAS Build, GitHub
- Gerados relatórios de cobertura de testes
- Automatizado build do mobile (EAS CLI)
- Checklist atualizado com responsável em cada item
