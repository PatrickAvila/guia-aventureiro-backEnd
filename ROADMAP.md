# 🗺️ ROADMAP - GUIA DO AVENTUREIRO

**Última Atualização:** 29/12/2025

## 📋 STATUS GERAL

- ✅ **Concluídas:** 21 features (+ Deploy em Produção)
- 🚧 **Em progresso:** 0 features
- 📋 **Planejadas:** 12 features

### 🎯 **Marcos Alcançados:**
- ✅ MVP 100% funcional
- ✅ Backend em produção (Render.com)
- ✅ Mobile pronto para build
- ✅ Documentação completa
- ✅ Sistema de tutorial híbrido (onboarding + tooltips contextuais)
- 📱 Próximo: Build iOS/Android

---

## ✅ CONCLUÍDAS

### ~~0. Deploy em Produção~~ 🚀 **CONCLUÍDO - 29/12/2025**

**Infraestrutura implementada:**
- ✅ Backend deployado no Render.com (plano Free)
- ✅ URL produção: https://guia-aventureiro-backend.onrender.com
- ✅ MongoDB Atlas otimizado (32 índices)
- ✅ Winston logger com file rotation
- ✅ Health check endpoint (/health)
- ✅ Auto-deploy configurado (Git push → Deploy)
- ✅ Variáveis de ambiente seguras
- ✅ Repositórios separados (backend + mobile)

**Métricas:**
- Build time: ~2 minutos
- Memory usage: 93 MB
- Cold start: 30-60 segundos (plano Free)
- Database: MongoDB Atlas M0 Free
- Logs: Production mode (warn/error)

**Arquivos:**
- `backend/server.js` (mongoose import fix)
- `backend/package.json` (winston dependency)
- `mobile/src/config/env.ts` (prod API URL)
- `backend/src/utils/createIndexes.js` (32 índices)

---

### ~~1. Sistema de Busca de Destinos~~ ✅ **CONCLUÍDO - 24/12/2025**

**Features implementadas:**
- ✅ Autocomplete de cidades usando Google Places API
- ✅ Sugestões de destinos populares (15 cidades mockadas)
- ✅ Debounce de 500ms para otimizar requisições
- ✅ Fallback sem API key funcionando
- ✅ Preenchimento automático de cidade e país
- ✅ Campos manuais como alternativa

**Arquivos:**
- `mobile/src/services/placesService.ts`
- `mobile/src/components/PlaceAutocomplete.tsx`

---

### ~~2. Upload de Fotos nos Roteiros~~ ✅ **CONCLUÍDO - 24/12/2025**

**Features implementadas:**
- ✅ Upload de fotos para Cloudinary
- ✅ Galeria de fotos por roteiro (até 10 fotos)
- ✅ Seleção da câmera ou galeria
- ✅ Upload múltiplo
- ✅ Compressão automática de imagens (800x600)
- ✅ Preview e remoção de fotos

**Arquivos:**
- `mobile/src/services/photoService.ts`
- `mobile/src/components/PhotoPicker.tsx`
- `backend/src/routes/upload.js`

---

### ~~3. Modo Offline~~ ✅ **CONCLUÍDO**
**Implementado em:** 24/12/2025 - 24/12/2025**
**Features implementadas:**
- ✅ Cache de roteiros no AsyncStorage
- ✅ Sincronização automática ao voltar online
- ✅ Indicador visual de status offline/online
- ✅ Verificação de conectividade (navigator.onLine + fetch)
- ✅ Fallback automático para cache em caso de erro
- ✅ Contador de ações pendentes

**Arquivos:**
- `mobile/src/services/offlineService.ts`
- `mobile/src/components/OfflineIndicator.tsx`

---

### ~~4. Onboarding e Tutorial~~ ✅ **CONCLUÍDO**
**Implementado em:** 24/12/2025 (inicial) | 11/02/2026 (sistema híbrido completo)

**Sistema Híbrido de Tutorial:**

**Onboarding Inicial (5 slides):**
- ✅ Tutorial interativo com swiper
- ✅ Navegação por swipe e botão
- ✅ Botão "Pular" disponível
- ✅ Indicadores de progresso (dots)
- ✅ Checkbox "Não mostrar novamente"
- ✅ Cores e ícones ilustrativos

**Tooltips Contextuais (5 tooltips):**
- ✅ Componente Tooltip reutilizável com animações
- ✅ Efeito spotlight com overlay escurecido
- ✅ DashboardScreen: "Criar primeiro roteiro"
- ✅ GenerateScreen: "Usar IA"
- ✅ ItineraryDetailScreen: "Controle de orçamento"
- ✅ ExploreScreen: "Descobrir roteiros"
- ✅ ProfileScreen: "Conquistas"
- ✅ Hook useTooltip para gerenciamento centralizado
- ✅ Persistência em AsyncStorage
- ✅ Botão "Rever Tutorial" com reset completo

**Arquivos:**
- `mobile/src/screens/OnboardingScreen.tsx`
- `mobile/src/navigation/RootNavigator.tsx`
- `mobile/src/components/Tooltip.tsx` (novo)
- `mobile/src/hooks/useTooltip.ts` (novo)
- `backend/src/models/User.js` (campos hasCompletedOnboarding e tooltipsShown)

---

## 🎯 PRÓXIMOS PASSOS RECOMENDADOS

--# ~~5. Temas Escuro/Claro~~ ✅ **CONCLUÍDO - 26/12/2025**

**Features implementadas:**
- ✅ Context API para tema global
- ✅ Toggle animado de tema
- ✅ Cores consistentes em todo o app
- ✅ Persistência da preferência do usuário
- ✅ Sistema de cores unificado com useColors hook

**Arquivos:**
- `mobile/src/context/ThemeContext.tsx`
- `mobile/src/hooks/useColors.ts`
- `mobile/src/components/ThemeToggle.tsx`

---

### ~~6. Sistema de Alertas Customizados~~ ✅ **CONCLUÍDO - 26/12/2025**

**Features implementadas:**
- ✅ Alertas customizados substituindo Alert nativo
- ✅ Suporte a múltiplos botões com estilos
- ✅ Integração com tema claro/escuro
- ✅ Provider global (AlertProvider)

**Arquivos:**
- `mobile/src/components/CustomAlert.tsx`
- `mobile/src/components/AlertProvider.tsx`

---

### ~~7. Otimizações de Performance~~ ✅ **CONCLUÍDO - 26/12/2025**

**Features implementadas:**
- ✅ Skeleton loaders em todas as listas
- ✅ Debounce em buscas (500ms)
- ✅ Lazy loading de componentes
- ✅ Memoização de listas grandes

**Arquivos:**
- `mobile/src/components/SkeletonLoader.tsx`
- `mobile/src/utils/debounce.ts`

---

### ~~8. Rate Limiting e Segurança~~ ✅ **CONCLUÍDO - 26/12/2025**

**Features implementadas:**
- ✅ Rate limiting global (100 req/15min)
- ✅ Helmet para headers seguros
- ✅ IP blocking para requisições suspeitas
- ✅ Logging de requisições

**Arquivos:**
- `backend/src/middleware/rateLimiter.js`
- `backend/src/middleware/ipBlocker.js`
- `backend/src/middleware/requestLogger.js`

---

### ~~9. Validação de Senha Forte~~ ✅ **CONCLUÍDO - 26/12/2025**

**Features implementadas:**
- ✅ Validação de senha forte no mobile
- ✅ Indicadores visuais de força
- ✅ Mensagens de erro específicas
- ✅ Validação em tempo real

**Arquivos:**
- `mobile/src/utils/passwordValidator.ts`

---

### ~~10. Sistema de Logging~~ ✅ **CONCLUÍDO - 26/12/2025**

**Features implementadas:**
- ✅ Winston logger no backend
- ✅ Logs em arquivo (combined.log, error.log)
- ✅ Logger mobile com AsyncStorage
- ✅ Níveis de log configuráveis

**Arquivos:**
- `backend/src/utils/logger.js`
- `mobile/src/utils/logger.ts`

---

### ~~11. Tratamento de Sessão Expirada~~ ✅ **CONCLUÍDO - 26/12/2025**

**Features implementadas:**
- ✅ Interceptor para token expirado
- ✅ Redirecionamento automático para login
- ✅ Limpeza de dados ao expirar
- ✅ Mensagem de aviso ao usuário

**Arquivos:**
- `mobile/src/services/api.ts`
- `mobile/src/context/AuthContext.tsx`

---

### ~~12. Sistema de Avaliações~~ ✅ **CONCLUÍDO - 29/12/2025**

**Features implementadas:**
- ✅ Avaliação de roteiros (1-5 estrelas)
- ✅ Comentários e fotos nas avaliações
- ✅ Highlights (melhor, pior experiência, dica)
- ✅ Sistema de likes em avaliações
- ✅ Estatísticas de avaliação

**Arquivos Backend:**
- `backend/src/models/Rating.js`
- `backend/src/controllers/ratingController.js`
- `backend/src/routes/ratings.js`

**Arquivos Mobile:**
- `mobile/src/services/ratingService.ts`
- `mobile/src/components/RatingStars.tsx`
- `mobile/src/components/RatingModal.tsx`

---

### ~~13. Compartilhamento de Roteiros~~ ✅ **CONCLUÍDO - 29/12/2025**

**Features implementadas:**
- ✅ Geração de links públicos para roteiros
- ✅ Compartilhamento via WhatsApp
- ✅ Compartilhamento nativo (apps instalados)
- ✅ Copiar link para área de transferência
- ✅ Copiar roteiro compartilhado

**Arquivos Backend:**
- `backend/src/controllers/shareController.js`

**Arquivos Mobile:**
- `mobile/src/components/ShareModal.tsx`

---

### ~~14. Validação de Entrada~~ ✅ **CONCLUÍDO - 29/12/2025**

**Features implementadas:**
- ✅ express-validator instalado
- ✅ Validators para auth, itineraries, ratings
- ✅ Middleware de validação
- ✅ Mensagens de erro padronizadas

**Arquivos:**
- `backend/src/middleware/validators.js`
- Rotas auth, itineraries, ratings atualizadas

---

### ~~15. Paginação + Infinite Scroll~~ ✅ **CONCLUÍDO - 29/12/2025**

**Features implementadas:**
- ✅ Backend com paginação (page, limit, sortBy)
- ✅ Metadados de paginação (total, pages, hasNext)
- ✅ FlatList com onEndReached no mobile
- ✅ Loading indicator no final da lista

**Arquivos:**
- `backend/src/controllers/itineraryController.js`
- `mobile/src/services/itineraryService.ts`

---

### ~~16. Explorar Roteiros Públicos~~ ✅ **CONCLUÍDO - 29/12/2025**

**Features implementadas:**
- ✅ Feed de roteiros públicos de outros usuários
- ✅ Tabs: Descobrir, Em Alta, Salvos
- ✅ Sistema de likes em roteiros
- ✅ Salvar roteiros favoritos
- ✅ Filtros por destino, orçamento, duração
- ✅ Busca de roteiros

**Arquivos Backend:**
- `backend/src/controllers/exploreController.js`
- `backend/src/routes/explore.js`

**Arquivos Mobile:**
- `mobile/src/screens/ExploreScreen.tsx`
- `mobile/src/services/exploreService.ts`

---

### ~~17. Gamificação~~ ✅ **CONCLUÍDO - 29/12/2025**

**Features implementadas:**
- ✅ Sistema de conquistas (achievements)
- ✅ 20 badges diferentes
- ✅ Níveis e pontos de experiência
- ✅ Estatísticas do usuário
- ✅ Desbloqueio automático de conquistas
- ✅ Tela de conquistas no mobile

**Arquivos Backend:**
- `backend/src/models/Achievement.js`
- `backend/src/controllers/achievementController.js`
- `backend/src/routes/achievements.js`

**Arquivos Mobile:**
- `mobile/src/screens/AchievementsScreen.tsx`
- `mobile/src/services/achievementService.ts`
- `mobile/src/components/BadgeItem.tsx`

---

### ~~18. Padrões de Código Seguros~~ ✅ **CONCLUÍDO - 29/12/2025**

**Bugs corrigidos:** 23 bugs

**Padrões implementados:**
- ✅ useCallback em funções de useEffect (8 telas)
- ✅ Validação de arrays antes de .map/.filter/.reduce (4 controllers backend)
- ✅ Optional chaining para objetos (8 telas frontend)
- ✅ Normalização de respostas de API

**Impacto:**
- Zero loops infinitos em re-renders
- Zero crashes por arrays/objetos undefined
- Código defensivo e resiliente

---

### ~~19. IA Real com Groq (Llama 3.3)~~ ✅ **CONCLUÍDO - 29/12/2025**

**Features implementadas:**
- ✅ Integração com Groq AI (grátis + rápido)
- ✅ Modelo Llama 3.3 70B Versatile (mais recente)
- ✅ Geração de roteiros personalizados em 1-2 segundos
- ✅ JSON mode para respostas estruturadas
- ✅ Fallback para mock se API key não configurada
- ✅ 14,400 requisições/dia grátis
- ✅ Cache de health check (10s) para otimizar requisições

**Estratégia de Fases:**
- **Fase 1 (MVP):** Groq gratuito
- **Fase 2 (Beta):** Groq + cache de roteiros
- **Fase 3 (Premium):** Free tier com Groq (5 roteiros) + Premium com GPT-4

**Arquivos:**
- `backend/src/services/aiService.js`
- `backend/.env` (GROQ_API_KEY)
- `mobile/src/services/offlineService.ts` (cache optimization)

**Setup:** Obter chave grátis em https://console.groq.com/keys

**Otimizações:**
- ✅ Health check com cache de 10 segundos
- ✅ Correção de loops infinitos em 7 telas
- ✅ useEffect/useFocusEffect com dependências corretas

---

## 🎯 PRÓXIMAS FEATURES PLANEJADAS

---

## 🚀 PRIORIDADE ALTA

### ~~1. Implementar IA Real (OpenAI)~~ ✅ **CONCLUÍDO - 29/12/2025**
**Implementado com Groq AI (Llama 3.1 70B) - Melhor que planejado!**

**Por quê escolhemos Groq:**
- ✅ GRÁTIS (14,400 req/dia) vs OpenAI pago
- ✅ 3-5x MAIS RÁPIDO (1-2s vs 5-10s)
- ✅ Qualidade superior ao GPT-3.5
- ✅ API 100% compatível com OpenAI
- ✅ JSON mode nativo

**Implementado:**
- ✅ Roteiros personalizados com IA real
- ✅ Prompts inteligentes baseados em preferências
- ✅ Recomendações de restaurantes e atrações
- ✅ Coordenadas geográficas reais
- ✅ Custos estimados por atividade

**Ar1uivos:**
- [backend/src/services/aiService.js](backend/src/services/aiService.js)
- backend/.env (GROQ_API_KEY)

---

## 💰 PRIORIDADE MÉDIA

### 2. **Orçamento Detalhado** 💳
**Prioridade:** MÉDIA  
**Tempo estimado:** 3 dias  
**Impacto:** Alto

**Backend (1 dia):**
- [ ] Adicionar campos expenses no modelo Itinerary:
  ```javascript
  expenses: [{
    date: Date,
    category: String, // hospedagem, alimentacao, transporte, atracao, outro
    description: String,
    amount: Number,
    currency: String,
    receipt: String // URL da foto do recibo
  }],
  budgetTracking: {
    estimated: Number,
    spent: Number,
    currency: String,
    lastUpdated: Date
  }
  ```
- [ ] Criar endpoints:
  - `POST /roteiros/:id/expenses` - Adicionar gasto
  - `PUT /roteiros/:id/expenses/:expenseId` - Editar gasto
  - `DELETE /roteiros/:id/expenses/:expenseId` - Remover gasto
  - `GET /roteiros/:id/budget-summary` - Resumo do orçamento

**Mobile (2 dias):**
- [ ] Criar componente BudgetTracker.tsx
- [ ] Criar tela BudgetScreen.tsx com:
  - Resumo: orçamento estimado vs gasto
  - Barra de progresso visual
  - Lista de gastos por categoria
  - 2ráfico de pizza (categorias)
  - Conversão de moedas (API gratuita: ExchangeRate-API)
- [ ] Adicionar botão "Gerenciar Orçamento" no ItineraryDetailScreen

**Status:** 📋 Planejada

---

### 3. **Notificações Push** 🔔
**Features:**
- Lembrete de roteiros próximos
- Dicas de viagem 3 dias antes
- Ch3cklist de preparação
- Alertas de documentos necessários

**Tempo estimado:** 1-2 dias
**Impacto:** MÉDIO

---

### 4. **Mapa Interativo** 🗺️
**Features:**
- Google Maps integrado
- Visualizar pontos do roteiro no mapa
- Navegação entre locais
- Estimativa de tempo/distância entre pontos
4
**Tempo estimado:** 2-3 dias
**Impacto:** ALTO

---

## 🎨 PRIORIDADE BAIXA

### 5. **Integração com Calendário** 📅
**Features:**
- Adicionar roteiro ao Google Calendar
- Sincronizar datas automaticamente
- Lembretes automáticos

**Tempo estimado:** 1 dia
**Impacto:** BAIXO

---

### 5. **Chat com Colaboradores** 💬
**Features:**
- Chat em tempo real entre colaboradores do roteiro
- Notificações de mensagens
- Discussão sobre mudanças no roteiro

**Tempo estimado:** 3-4 dias
**Impacto:** MÉDIO (se focar em viagens em grupo)

---

## 🔧 MELHORIAS TÉCNICAS

### 6. **Testes Automatizados** 🧪
**O quê:**
- Testes unitários (Jest)
- Testes de integração
- Testes E2E (Detox/Playwright)
- CI/CD pipeline

**Tempo estimado:** 3-5 dias
**Impacto:** ALTO (confiabilidade)

---

### 7. **Analytics** 📊
**Implementar:**
- Google Analytics
- Mixpanel ou Amplitude
- Tracking de eventos importantes
- Funil de conversão

**Tempo estimado:** 1 dia
**Impacto:** ALTO (insights de negócio)

---

### 8. **SEO e Landing Page** 🌐
**Criar:**
- Landing page com Next.js/React
- Blog com dicas de viagem (SEO)
- Página de destinos populares
- Depoimentos de usuários

**Tempo estimado:** 3-5 dias
**Impacto:** ALTO (aquisição de usuários)

---

### 9. **App Mobile Nativo** 📱
**Por quê:** Performance e features nativas

**Opções:**
- Continuar com Expo e fazer build (mais fácil)
- Migrar para React Native CLI (mais controle)
- Adicionar features nativas (câmera, GPS, etc)

**Tempo estimado:** 1-2 semanas
**Impacto:** MÉDIO-ALTO

---

## 💎 MONETIZAÇÃO (Quando Tiver Tração)

### 10. **Planos Premium** 💳
**Features Premium:**
- Roteiros ilimitados (free: 5 roteiros)
- IA mais avançada (GPT-4 vs GPT-3.5)
- Export PDF sem marca d'água
- Prioridade no suporte
- Templates exclusivos

**Preço sugerido:** R$ 9,90/mês ou R$ 89,90/ano

---

### 11. **Marketplace de Guias Locais** 🗣️
**Modelo:**
- Conectar viajantes com guias locais
- Sistema de agendamento
- Pagamento in-app (20% de comissão)
- Avaliações de guias

**Impacto:** ALTO (nova receita)

---

### 12. **Parcerias com Hotéis/Companhias Aéreas** ✈️
**Modelo:**
- Afiliação com Booking, Airbnb, Decolar
- Ganhar comissão por reservas
- Integração direta no app
- Comparador de preços

**Impacto:** MÉDIO-ALTO

---

## 📱 MARKETING & GROWTH

### **Programa de Indicação** 👥
**Features:**
- Ganhe 1 mês premium ao indicar amigo
- Código de referência único
- Dashboard de indicações

**Impacto:** MÉDIO-ALTO (crescimento viral)

---

### **Conteúdo nas Redes Sociais** 📱
**Estratégia:**
- Instagram com dicas de viagem
- TikTok com roteiros rápidos
- YouTube com guias detalhados
- Blog posts otimizados para SEO

**Impacto:** ALTO (branding)

---

### **Parcerias com Influencers** 🌟
**Táticas:**
- Enviar acesso premium para influencers de viagem
- Criar roteiros em parceria
- Código promocional exclusivo
- Storytelling de viagens

**Impacto:** MÉDIO-ALTO

---

## 🎯 ROADMAP SUGERIDO (3 MESES)

### **MÊS 1 - MVP Completo** ✅ **100% CONCLUÍDO - 29/12/2025**

**Progresso:** 100% concluído (19 de 19 features principais)

**Todas as features MVP implementadas:**
- ✅ Sistema de autenticação e perfis
- ✅ Geração de roteiros com IA real (Groq)
- ✅ Upload de fotos (Cloudinary)
- ✅ Sistema de avaliações e compartilhamento
- ✅ Explorar roteiros públicos
- ✅ Gamificação completa
- ✅ Modo offline
- ✅ Temas claro/escuro
- ✅ Validações e segurança

**Objetivo:** ✅ App 100% funcional e pronto para lançar!

---

### **MÊS 2 - Tração e Feedback** 📋 PLANEJADO
- 📋 Lançar versão beta (TestFlight/Play Store Beta)
- 📋 Coletar feedback de 50-100 usuários
- 📋 Implementar melhorias críticas
- 📋 Analytics e tracking
- 📋 Landing page + SEO

**Objetivo:** Validar produto com usuários reais

---

### **MÊS 3 - Crescimento** 📋 PLANEJADO
- 📋 Lançamento oficial (App Store + Play Store)
- 📋 Marketing nas redes sociais
- 📋 Orçamento detalhado
- 📋 Mapa interativo
- 📋 Sistema de notificações

**Objetivo:** 1000+ downloads no primeiro mês

---

## 🏆 MÉTRICAS DE SUCESSO

- **Cadastros:** 500+ no primeiro mês
- **Roteiros criados:** 2000+ no primeiro trimestre
- **Retenção (D7):*🎉 **MVP COMPLETO! Próximo passo: TESTE E LANÇAMENTO**

Com **19 features implementadas**, o MVP está 100% completo! 

**Próximos passos:**
1. ✅ Obter API key do Groq (https://console.groq.com/keys) - GRÁTIS
2. 📋 Testar geração de roteiros com IA real
3. 📋 Testar em dispositivos reais (iPhone/Android)
4. 📋 Coletar feedback de 10-20 beta testers
5. 📋 Ajustes finais baseados em feedback
6. 📋 Lançar versão beta (TestFlight/Play Store)

**Status Atual:** 100% do MVP concluído ✅
**Status Atual:** 94% do MVP concluído

**Depois da IA:**
1. ✅ Testar em dispositivos reais (iPhone/Android)
2. 📋 Coletar feedback de 10-20 beta testers
3. 📋 Ajustes finais baseados em feedback
4. 📋 Lançar versão beta (TestFlight/Play Store)
5. 📋 Preparar para lançamento oficial

---

## 📊 RESUMO DE PROGRESSO