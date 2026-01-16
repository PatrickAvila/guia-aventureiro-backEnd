# 📸 Guia de Screenshots para App Stores

## 🎯 Objetivo
Criar screenshots de alta qualidade que mostrem os melhores recursos do app e convençam usuários a baixar.

---

## 📱 Requisitos Técnicos

### App Store (iOS)
| Dispositivo | Resolução | Quantidade |
|-------------|-----------|------------|
| iPhone 6.7" (14 Pro Max, 15 Pro Max) | 1290 x 2796 px | 3-10 obrigatório |
| iPhone 6.5" (11 Pro Max, XS Max) | 1242 x 2688 px | 3-10 obrigatório |
| iPad Pro 12.9" (6ª geração) | 2048 x 2732 px | 3-10 opcional |

### Google Play Store (Android)
| Tipo | Especificação | Quantidade |
|------|---------------|------------|
| Capturas de tela | Mínimo 320px (largura ou altura) | 3-8 |
| Gráfico de destaque | 1024 x 500 px | 1 obrigatório |
| Vídeo promocional | Link do YouTube | 1 opcional |

**Formatos aceitos:** PNG ou JPEG (PNG recomendado para qualidade)

---

## 🖼️ Screenshots Essenciais

### 1. Onboarding/Login ⭐
**Objetivo:** Primeira impressão - mostrar que é fácil começar

**Elementos para capturar:**
- Tela de onboarding com ilustrações
- Ou tela de login limpa e moderna
- Botões de "Começar" ou "Criar conta"

**Texto sugerido:**
> "Planeje viagens incríveis com IA em segundos"

---

### 2. Dashboard (Tela Inicial) ⭐⭐⭐
**Objetivo:** Mostrar a interface principal e roteiros salvos

**Elementos para capturar:**
- Lista de roteiros com fotos
- Cards coloridos e organizados
- Botão "+" para criar novo roteiro
- Estatísticas rápidas (opcional)

**Texto sugerido:**
> "Todos os seus roteiros em um só lugar"

---

### 3. Geração de Roteiro com IA ⭐⭐⭐
**Objetivo:** Destacar o principal diferencial - IA

**Elementos para capturar:**
- Formulário de criação (destino, datas, orçamento)
- Loading com "Gerando roteiro..." ou animação
- Ícone de IA/robô/estrela brilhando

**Texto sugerido:**
> "Inteligência Artificial cria roteiros personalizados para você"

---

### 4. Detalhes do Roteiro ⭐⭐⭐
**Objetivo:** Mostrar a qualidade e detalhes dos roteiros gerados

**Elementos para capturar:**
- Cronograma dia a dia
- Sugestões de pontos turísticos
- Horários e dicas
- Fotos dos destinos (se disponível)

**Texto sugerido:**
> "Roteiros completos com cronograma dia a dia"

---

### 5. Controle de Orçamento ⭐⭐
**Objetivo:** Mostrar gerenciamento financeiro

**Elementos para capturar:**
- Gráfico de gastos vs orçamento
- Categorias (transporte, hospedagem, alimentação)
- Barra de progresso do orçamento
- Total gasto vs total planejado

**Texto sugerido:**
> "Gerencie gastos e mantenha o orçamento sob controle"

---

### 6. Explorar Roteiros ⭐⭐
**Objetivo:** Mostrar comunidade e inspiração

**Elementos para capturar:**
- Cards de roteiros públicos
- Filtros (destino, orçamento, duração)
- Fotos de diferentes destinos
- Avaliações/estrelas

**Texto sugerido:**
> "Descubra roteiros criados por outros viajantes"

---

### 7. Perfil e Conquistas ⭐
**Objetivo:** Gamificação e personalização

**Elementos para capturar:**
- Foto de perfil
- Estatísticas (países visitados, km percorridos)
- Badges/medalhas desbloqueadas
- Gráficos de progresso

**Texto sugerido:**
> "Acompanhe suas conquistas e estatísticas de viagem"

---

### 8. Modo Escuro 🌙
**Objetivo:** Mostrar design moderno e elegante

**Elementos para capturar:**
- Qualquer tela em dark mode (preferência: Dashboard ou Detalhes)
- Contraste entre claro/escuro
- Interface elegante e confortável

**Texto sugerido:**
> "Interface moderna com modo escuro"

---

## 🎨 Boas Práticas de Design

### ✅ O que fazer:
- **Use dados reais e atrativos** (Paris, Nova York, Bali, etc)
- **Inclua fotos bonitas** dos destinos
- **Destaque cores vibrantes** do app
- **Mostre UI limpa** (sem textos cortados ou bugs)
- **Adicione texto explicativo** em cada screenshot (se permitido)
- **Use dispositivos com tela cheia** (sem notch/borda se possível)
- **Capture em modo retrato** (vertical)
- **Mantenha consistência** de estilo entre screenshots

### ❌ O que evitar:
- Dados de teste óbvios ("Teste 123", "asdasd")
- Screenshots borradas ou pixeladas
- Telas de erro ou loading infinito
- Informações pessoais reais (emails, telefones)
- Conteúdo ofensivo ou inadequado
- Screenshots em baixa resolução

---

## 🛠️ Como Capturar Screenshots

### Método 1: Simulador iOS (Xcode)
```bash
# 1. Abrir simulador
npx expo start --ios

# 2. No simulador, escolha o dispositivo:
# iPhone 14 Pro Max (6.7")

# 3. Capturar tela:
# Cmd + S (salva na área de trabalho)
# Ou: File > New Screenshot
```

### Método 2: Dispositivo Real (iOS)
```bash
# 1. Conectar iPhone via cabo
# 2. No Mac, abrir QuickTime Player
# 3. File > New Movie Recording
# 4. Selecionar iPhone como fonte
# 5. Navegar no app e capturar (Cmd + Ctrl + Esc)
```

### Método 3: Android Emulator
```bash
# 1. Abrir emulador
npx expo start --android

# 2. No emulador, clicar no botão de screenshot (câmera)
# Ou: Ctrl + S
```

### Método 4: Dispositivo Real (Android)
```bash
# Método 1: Botões físicos
# Power + Volume Down (simultaneamente)

# Método 2: Via ADB
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png
```

---

## 🎬 Ferramentas para Embelezar Screenshots

### 1. **Fastlane Frameit** (Gratuito)
Adiciona moldura de dispositivo automaticamente.
```bash
# Instalar
brew install fastlane

# Usar
fastlane frameit
```

### 2. **App Mockup** (Online - Gratuito)
- [Mockuphone.com](https://mockuphone.com/)
- [Smartmockups.com](https://smartmockups.com/)
- Arraste screenshot e escolha modelo de dispositivo

### 3. **Figma/Canva** (Gratuito/Pago)
Crie designs personalizados com:
- Textos chamativos
- Destaques em recursos
- Gradientes de fundo
- Ícones explicativos

### 4. **Photoshop/GIMP** (Pago/Gratuito)
Para edições avançadas:
- Ajustar cores
- Adicionar sombras
- Criar composições

---

## 📐 Template de Organização

Crie uma pasta estruturada:

```
screenshots/
├── ios/
│   ├── 6.7-inch/
│   │   ├── 01-onboarding.png
│   │   ├── 02-dashboard.png
│   │   ├── 03-generate.png
│   │   ├── 04-details.png
│   │   ├── 05-budget.png
│   │   └── 06-explore.png
│   └── 6.5-inch/
│       └── (mesmos arquivos)
└── android/
    ├── 01-onboarding.png
    ├── 02-dashboard.png
    └── ...
```

---

## ✍️ Adicionando Texto aos Screenshots

### Opção 1: Ferramentas Online
Use [Canva](https://canva.com) ou [Figma](https://figma.com):
1. Importar screenshot
2. Adicionar texto com fonte moderna (Montserrat, Poppins, Inter)
3. Posicionar no topo ou rodapé
4. Exportar em alta resolução

### Opção 2: Fastlane Deliver
Crie arquivos de texto:
```
screenshots/
└── ios/
    ├── 6.7-inch/
    │   ├── 01-onboarding.png
    │   └── 01-onboarding.txt  → "Planeje viagens com IA"
```

---

## 🎥 Vídeo Promocional (Opcional)

### Duração ideal: 15-30 segundos

### Estrutura sugerida:
1. **0-3s:** Logo + slogan ("Planeje viagens com IA")
2. **3-8s:** Mostrar criação de roteiro (timelapse)
3. **8-13s:** Navegar entre telas principais
4. **13-18s:** Mostrar roteiro gerado
5. **18-23s:** Explorar roteiros públicos
6. **23-30s:** Call-to-action ("Baixe agora!")

### Ferramentas:
- **iMovie** (Mac - Gratuito)
- **DaVinci Resolve** (Multiplataforma - Gratuito)
- **CapCut** (Mobile/Desktop - Gratuito)

### Música de fundo:
- [YouTube Audio Library](https://studio.youtube.com/channel/UCxxx/music)
- [Epidemic Sound](https://epidemicsound.com) (Pago)
- [Artlist](https://artlist.io) (Pago)

---

## ✅ Checklist Final

### Antes de enviar:
- [ ] Capturas em resolução correta para cada plataforma
- [ ] Mínimo 3 screenshots (ideal: 5-8)
- [ ] Nomes de arquivo organizados (01, 02, 03...)
- [ ] Sem informações pessoais visíveis
- [ ] Dados atrativos (destinos famosos)
- [ ] UI sem bugs ou elementos cortados
- [ ] Cores vibrantes e atraentes
- [ ] Texto legível (se adicionado)
- [ ] Consistência de estilo
- [ ] Testado em diferentes tamanhos de tela

### Durante upload:
- [ ] App Store: Ordem correta (1ª imagem = mais importante)
- [ ] Play Store: Gráfico de destaque 1024x500
- [ ] Todas as imagens carregadas sem erros
- [ ] Preview em diferentes dispositivos

---

## 💡 Dicas Finais

### 🎯 Foco na Primeira Impressão
A primeira screenshot é a MAIS IMPORTANTE - 90% dos usuários decidem nos primeiros 3 segundos.

**Use na 1ª posição:**
- Dashboard com roteiros bonitos
- OU geração de roteiro com IA em destaque
- OU onboarding explicativo

### 📊 Ordem Sugerida de Screenshots:
1. Dashboard (visão geral)
2. Geração com IA (diferencial)
3. Detalhes do roteiro (qualidade)
4. Orçamento (utilidade)
5. Explorar (comunidade)
6. Perfil/Conquistas (gamificação)
7. Modo escuro (design)

### 🌍 Localize para Diferentes Públicos
Se traduzir app para inglês, crie screenshots separados com:
- Textos em inglês
- Destinos internacionais (New York, London, Tokyo)

---

## 📞 Precisa de Ajuda?

**Referências úteis:**
- [App Store Screenshot Guidelines](https://developer.apple.com/app-store/product-page/)
- [Play Store Graphic Assets](https://support.google.com/googleplay/android-developer/answer/9866151)
- [Fastlane Screenshots Guide](https://docs.fastlane.tools/getting-started/ios/screenshots/)

**Inspire-se:**
- Pesquise apps de viagem no App Store/Play Store
- Veja screenshots de apps populares (Airbnb, Booking, TripAdvisor)
- Analise o que chama sua atenção

---

**Boa sorte com o lançamento! 🚀**
