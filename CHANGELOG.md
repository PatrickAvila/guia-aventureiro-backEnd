# 📜 CHANGELOG

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

---

## [1.0.3] - 04/01/2026

### 🧹 **Limpeza de Código**

#### 🗑️ **Arquivos Removidos**

**Raiz do projeto:**
- `DEPLOY.md` - Defasado (substituído por BUILD_DEPLOY_GUIDE.md)
- `PRIVACY_POLICY.md` - Duplicado (existe docs/privacy.html)
- `TERMS_OF_SERVICE.md` - Duplicado (existe docs/terms.html)
- `render.yaml` - Não utilizado (backend tem próprio)
- `package.json` e `package-lock.json` - Não necessários na raiz
- `node_modules/` - Pasta vazia removida

**Arquivos de sistema:**
- Arquivos .log removidos
- .DS_Store e Thumbs.db limpos

#### ✂️ **Código Removido**

**backend/src/controllers/ratingController.js:**
- 172 linhas de métodos legados removidos:
  - `addRating()`, `updateRating()`, `deleteRating()`, `getRatedItineraries()`
  - Substituídos por API moderna em `/api/ratings`

**backend/src/routes/itineraries.js:**
- 5 rotas duplicadas de rating removidas
- Agora usa apenas `/api/ratings/*`

**backend/src/controllers/budgetController.js:**
- Comentário TODO obsoleto removido

**mobile/src/services/authService.ts:**
- Console.logs de debug removidos (login, logout)

#### 🔧 **Modificado**

**backend/.env.example:**
- Atualizado de `OPENAI_API_KEY` para `GROQ_API_KEY`
- Comentários explicativos adicionados

#### 📊 **Estatísticas da Limpeza**
- 7 arquivos deletados
- ~200 linhas de código removidas
- ~15 console.logs eliminados
- Projeto mais limpo e organizado

---

## [1.0.2] - 04/01/2026

### 🎨 **Melhorias de UX e Preparação para Produção**

#### ✨ **Adicionado**

**Documentação de Produção:**
- `APP_STORE_DESCRIPTIONS.md`: Textos prontos para App Store e Google Play (PT/EN)
- `SCREENSHOT_GUIDE.md`: Guia completo para capturar screenshots das lojas
- `BUILD_DEPLOY_GUIDE.md`: Processo detalhado de build EAS e submissão
- `ANALYTICS_GUIDE.md`: Implementação de Firebase Analytics e Crashlytics
- `HOSTING_LEGAL_DOCS.md`: Guia para hospedar Privacy Policy e Terms
- `docs/index.html`: Landing page para documentos legais
- `docs/terms.html`: Termos de Uso em HTML (já existia privacy.html)

**Mobile - Configuração de Ambiente:**
- Sistema automático de detecção dev/prod via `__DEV__` flag
- Console logs indicando ambiente ativo ao iniciar app
- URLs alternam automaticamente entre localhost e Render

#### 🐛 **Corrigido**

**Mobile - ProfileScreen:**
- Modal "compartilhar perfil": Alinhamento de título com botão X
- Modal "dados e armazenamento": Título centralizado, removido botão duplicado
- Cache clear: App não congela mais (fecha modal antes de showAlert)
- Propriedade `paddingBottom` duplicada removida

**Mobile - GenerateScreen:**
- Scroll lag na primeira abertura corrigido com `removeClippedSubviews={true}`
- Performance otimizada com `scrollEventThrottle={16}`

#### 🔧 **Modificado**

**mobile/src/config/env.ts:**
- Adicionada função `getEnvVars()` com detecção `__DEV__`
- Logs de console indicando ambiente (desenvolvimento/produção)
- Comentários explicativos sobre configuração

**PRODUCAO_CHECKLIST.md:**
- Atualizado com progresso real (testes via Expo Go, Render deployment)
- Links para novos guias criados
- Marcado itens concluídos (ambiente automático, descrições de loja, etc)

---

## [1.0.1] - 29/12/2025

### 🚀 **Deploy em Produção**

#### ✨ **Adicionado**

**Infraestrutura:**
- Backend deployado no Render.com (https://guia-aventureiro-backend.onrender.com)
- MongoDB Atlas em produção com 32 índices otimizados
- Winston logger com rotação de arquivos (5MB, 5 arquivos)
- Health check endpoint com métricas (status, DB, memória, uptime)
- Variáveis de ambiente configuradas (JWT, Groq, Cloudinary)

**Organização:**
- Repositórios separados: backend e mobile
- GitHub: PatrickAvila/guia-aventureiro-backEnd
- GitHub: PatrickAvila/guia-aventureiro-mobile

**Mobile:**
- API URL configurada para produção
- Fallback dev/prod configurado
- EAS Build preparado (profiles: dev, preview, production)

#### 🔧 **Modificado**

- Scripts npm: start simplificado (sem NODE_ENV inline)
- Package.json: adicionado winston dependency
- Server.js: importado mongoose para health check
- Logs: modo produção (warn/error only)

#### 📊 **Performance**

- 32 índices MongoDB criados (User: 5, Itinerary: 13, Rating: 9, Achievement: 5)
- Health check cache: 10 segundos
- Compressão de build: 4s
- Deploy time: ~2 minutos

---

## [1.0.0] - 29/12/2025

### 🎉 **Lançamento Inicial - MVP Completo**

#### ✨ **Adicionado**

**Autenticação e Perfil:**
- Sistema completo de cadastro e login
- Autenticação JWT com refresh tokens
- Perfil do usuário com foto e preferências
- Validação de senha forte
- Tratamento de sessão expirada

**Geração de Roteiros com IA:**
- Integração com Groq AI (Llama 3.3 70B)
- Geração personalizada baseada em preferências
- Roteiros com atividades, horários e custos
- 14.400 requisições/dia grátis
- Tempo de resposta: 1-2 segundos

**Sistema de Orçamento:**
- Cálculo automático de orçamento estimado
- 3 níveis: Econômico (R$ 300/dia), Médio (R$ 650/dia), Luxo (R$ 1.450/dia)
- Controle de gastos por categoria
- Adicionar/editar/deletar gastos
- Visualização de progresso e alertas

**Upload de Fotos:**
- Integração com Cloudinary
- Até 10 fotos por roteiro
- Compressão automática (800x600)
- Galeria de fotos
- Seleção de câmera ou galeria

**Modo Offline:**
- Cache de roteiros no AsyncStorage
- Sincronização automática ao voltar online
- Indicador visual de status
- Ações pendentes armazenadas

**Explorar Roteiros:**
- Feed de roteiros públicos
- Tabs: Descobrir, Em Alta, Salvos
- Sistema de likes e saves
- Filtros por destino, orçamento e duração
- Infinite scroll

**Sistema de Avaliações:**
- Avaliação de 1-5 estrelas
- Comentários e fotos
- Highlights (melhor, pior, dica)
- Sistema de likes em avaliações
- Estatísticas de rating

**Compartilhamento:**
- Links públicos de roteiros
- WhatsApp, link direto, nativo
- Copiar roteiros compartilhados

**Gamificação:**
- 20 conquistas diferentes
- Sistema de níveis e XP
- Badges (comum, raro, épico, lendário)
- Estatísticas do usuário
- Tela de conquistas

**Temas e UI:**
- Tema claro e escuro
- Persistência de preferência
- Sistema de cores unificado
- Alertas customizados
- Toast notifications
- Skeleton loaders

**Segurança:**
- Rate limiting (100 req/15min)
- Helmet security headers
- IP blocking
- Validação de entrada (express-validator)
- Sanitização de dados
- Request logging

**Documentação:**
- README.md completo
- API.md com todos os endpoints
- ROADMAP.md com planejamento
- PRODUCAO_CHECKLIST.md
- ORCAMENTO.md explicando sistema de gastos
- FAQ.md com perguntas frequentes
- PRIVACY_POLICY.md (LGPD compliant)
- TERMS_OF_SERVICE.md

#### 🔧 **Técnico**

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT autenticação
- Winston logger
- Cloudinary upload
- Groq AI integration

**Mobile:**
- React Native + Expo
- TypeScript
- React Navigation v6
- AsyncStorage
- Axios

**DevOps:**
- .env.example criado
- .gitignore atualizado
- JWT secrets fortes gerados
- Configurações de produção

#### 🐛 **Corrigido**

- Loops infinitos em 7 telas (useEffect/useFocusEffect)
- Health check com cache de 10s (reduz spam de requisições)
- Arrays undefined causando crashes
- Optional chaining em objetos
- Normalização de respostas de API

#### 📊 **Estatísticas**

- **Features Completas:** 19/19 (100% MVP)
- **Arquivos Backend:** 25+
- **Arquivos Mobile:** 45+
- **Linhas de Código:** ~15.000
- **Endpoints API:** 30+
- **Telas Mobile:** 13

---

## [Futuro]

### 📋 **Planejado para v1.1** (30 dias)

- [ ] Orçamento detalhado com gráficos
- [ ] Mapa interativo dos roteiros
- [ ] Notificações push
- [ ] Compartilhamento Instagram Stories
- [ ] Conversão de moedas

### 📋 **Planejado para v1.2** (60 dias)

- [ ] Integração com calendário
- [ ] Templates de roteiros populares
- [ ] Chat entre colaboradores
- [ ] Modo colaborativo em tempo real

### 📋 **Planejado para v2.0** (90 dias)

- [ ] Plano Premium (R$ 9,90/mês)
- [ ] IA melhorada (GPT-4)
- [ ] Afiliações (Booking, Decolar)
- [ ] Export PDF profissional

---

## 🔖 **Formato de Versionamento**

Seguimos [Semantic Versioning](https://semver.org/):
- **MAJOR.MINOR.PATCH** (ex: 1.0.0)
- **MAJOR:** Mudanças incompatíveis
- **MINOR:** Novas funcionalidades compatíveis
- **PATCH:** Correções de bugs

---

## 📝 **Legenda**

- ✨ **Adicionado:** Novas funcionalidades
- 🔧 **Modificado:** Mudanças em features existentes
- 🐛 **Corrigido:** Correções de bugs
- 🗑️ **Removido:** Features removidas
- 🔒 **Segurança:** Correções de vulnerabilidades
- 📄 **Documentação:** Mudanças em docs

---

**Mantenedor:** Guia do Aventureiro Team  
**Contato:** changelog@guiaaventureiro.com
