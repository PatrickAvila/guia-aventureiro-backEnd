# 📊 Analytics - Guia de Implementação

## 🎯 Objetivos do Analytics

Rastrear dados para:
- **Entender comportamento dos usuários** (quais telas mais usam)
- **Identificar problemas** (onde usuários desistem)
- **Medir crescimento** (novos usuários, retenção)
- **Otimizar recursos** (quais funcionalidades são populares)
- **Detectar bugs** (crashes, erros)

---

## 🔧 Opções de Analytics

### 1. **Expo Analytics** (Recomendado para começar)
✅ Grátis  
✅ Fácil implementação  
✅ Integrado ao Expo  
❌ Recursos limitados  

### 2. **Google Analytics 4 (GA4)** (Recomendado)
✅ Grátis e poderoso  
✅ Dashboards completos  
✅ Integração com Google Cloud  
❌ Configuração mais complexa  

### 3. **Firebase Analytics** (Completo)
✅ Grátis até 10GB/mês  
✅ Real-time  
✅ Integra com Crashlytics  
❌ Requer configuração Firebase  

### 4. **Mixpanel** (Avançado)
✅ Análises detalhadas  
✅ Funnels e cohorts  
❌ Pago após 100k eventos/mês  

### 5. **Amplitude** (Profissional)
✅ Analytics de produto  
✅ User journey tracking  
❌ Pago (grátis até 10M eventos/mês)  

---

## 🚀 Implementação Recomendada: Firebase Analytics

### Passo 1: Instalar Dependências

```bash
cd mobile

# Instalar Firebase
npx expo install @react-native-firebase/app @react-native-firebase/analytics

# OU (se usar vanilla RN)
npm install @react-native-firebase/app @react-native-firebase/analytics
```

### Passo 2: Configurar Firebase (Web Console)

1. Acesse https://console.firebase.google.com
2. Clique em "Add project"
3. Nome: "Guia do Aventureiro"
4. Habilitar Google Analytics: **Yes**
5. Selecionar conta do Google Analytics

### Passo 3: Adicionar Apps iOS/Android

**iOS:**
1. Clique em "Add app" → iOS
2. Bundle ID: `com.guiaaventureiro.app`
3. Baixar `GoogleService-Info.plist`
4. Salvar em: `mobile/ios/GoogleService-Info.plist` (se tiver pasta ios)

**Android:**
1. Clique em "Add app" → Android
2. Package name: `com.guiaaventureiro.app`
3. Baixar `google-services.json`
4. Salvar em: `mobile/android/app/google-services.json`

### Passo 4: Configurar app.json

```json
{
  "expo": {
    "plugins": [
      "@react-native-firebase/app",
      "@react-native-firebase/analytics"
    ],
    "android": {
      "googleServicesFile": "./google-services.json"
    },
    "ios": {
      "googleServicesFile": "./GoogleService-Info.plist"
    }
  }
}
```

### Passo 5: Criar Service de Analytics

**mobile/src/services/analyticsService.ts**
```typescript
import analytics from '@react-native-firebase/analytics';

class AnalyticsService {
  // Rastrear visualização de tela
  async logScreenView(screenName: string) {
    try {
      await analytics().logScreenView({
        screen_name: screenName,
        screen_class: screenName,
      });
      console.log(`📊 Screen viewed: ${screenName}`);
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }

  // Rastrear evento personalizado
  async logEvent(eventName: string, params?: Record<string, any>) {
    try {
      await analytics().logEvent(eventName, params);
      console.log(`📊 Event logged: ${eventName}`, params);
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }

  // Definir propriedade do usuário
  async setUserProperty(name: string, value: string) {
    try {
      await analytics().setUserProperty(name, value);
      console.log(`👤 User property set: ${name} = ${value}`);
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }

  // Definir ID do usuário
  async setUserId(userId: string) {
    try {
      await analytics().setUserId(userId);
      console.log(`👤 User ID set: ${userId}`);
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }

  // Eventos pré-definidos úteis
  async logLogin(method: string) {
    await this.logEvent('login', { method });
  }

  async logSignup(method: string) {
    await this.logEvent('sign_up', { method });
  }

  async logSearch(searchTerm: string) {
    await this.logEvent('search', { search_term: searchTerm });
  }

  async logShare(contentType: string, itemId: string) {
    await this.logEvent('share', { content_type: contentType, item_id: itemId });
  }

  // Eventos customizados do app
  async logItineraryCreated(data: {
    destination: string;
    duration: number;
    budget: number;
    preferences: string[];
  }) {
    await this.logEvent('itinerary_created', {
      destination: data.destination,
      duration_days: data.duration,
      budget_range: this.getBudgetRange(data.budget),
      preferences: data.preferences.join(','),
    });
  }

  async logItineraryViewed(itineraryId: string, isOwner: boolean) {
    await this.logEvent('itinerary_viewed', {
      itinerary_id: itineraryId,
      is_owner: isOwner,
    });
  }

  async logPhotoUploaded(source: 'camera' | 'gallery') {
    await this.logEvent('photo_uploaded', { source });
  }

  async logBudgetExceeded(amount: number, limit: number) {
    await this.logEvent('budget_exceeded', {
      amount,
      limit,
      percentage: Math.round((amount / limit) * 100),
    });
  }

  async logAchievementUnlocked(achievementId: string) {
    await this.logEvent('achievement_unlocked', { achievement_id: achievementId });
  }

  async logThemeToggled(theme: 'light' | 'dark') {
    await this.logEvent('theme_toggled', { theme });
  }

  // Helpers
  private getBudgetRange(budget: number): string {
    if (budget < 1000) return '0-1k';
    if (budget < 3000) return '1k-3k';
    if (budget < 5000) return '3k-5k';
    if (budget < 10000) return '5k-10k';
    return '10k+';
  }
}

export default new AnalyticsService();
```

### Passo 6: Integrar em Telas

**mobile/src/screens/DashboardScreen.tsx**
```typescript
import { useFocusEffect } from '@react-navigation/native';
import analyticsService from '../services/analyticsService';

export default function DashboardScreen() {
  // Rastrear quando tela é visualizada
  useFocusEffect(
    React.useCallback(() => {
      analyticsService.logScreenView('Dashboard');
    }, [])
  );

  const handleCreateItinerary = () => {
    analyticsService.logEvent('create_itinerary_button_clicked');
    navigation.navigate('Generate');
  };

  // ... resto do código
}
```

**mobile/src/screens/GenerateScreen.tsx**
```typescript
const handleGenerate = async () => {
  try {
    setLoading(true);

    const response = await generateItinerary(formData);

    // Rastrear sucesso
    await analyticsService.logItineraryCreated({
      destination: formData.destination,
      duration: formData.duration,
      budget: formData.budget,
      preferences: formData.preferences,
    });

    navigation.navigate('ItineraryDetail', { id: response.id });
  } catch (error) {
    // Rastrear erro
    analyticsService.logEvent('itinerary_generation_failed', {
      error: error.message,
    });
    showAlert('Erro', 'Falha ao gerar roteiro');
  } finally {
    setLoading(false);
  }
};
```

**mobile/src/context/AuthContext.tsx**
```typescript
const login = async (email: string, password: string) => {
  try {
    const response = await authService.login(email, password);
    setUser(response.user);

    // Rastrear login
    await analyticsService.logLogin('email');
    await analyticsService.setUserId(response.user.id);
    await analyticsService.setUserProperty('account_created', response.user.createdAt);

    return response;
  } catch (error) {
    throw error;
  }
};
```

---

## 📈 Eventos Importantes para Rastrear

### Autenticação
- `sign_up` - Novo usuário criado
- `login` - Login realizado
- `logout` - Logout realizado

### Roteiros
- `itinerary_created` - Roteiro criado com IA
- `itinerary_viewed` - Roteiro visualizado
- `itinerary_edited` - Roteiro editado
- `itinerary_deleted` - Roteiro excluído
- `itinerary_shared` - Roteiro compartilhado

### Orçamento
- `budget_set` - Orçamento definido
- `expense_added` - Gasto adicionado
- `budget_exceeded` - Orçamento ultrapassado

### Explorar
- `explore_search` - Busca realizada
- `public_itinerary_viewed` - Roteiro público visualizado
- `itinerary_rated` - Avaliação dada

### Conquistas
- `achievement_unlocked` - Conquista desbloqueada
- `achievements_viewed` - Tela de conquistas acessada

### Configurações
- `profile_edited` - Perfil editado
- `password_changed` - Senha alterada
- `theme_toggled` - Tema alternado
- `cache_cleared` - Cache limpo
- `account_deleted` - Conta excluída

### Fotos
- `photo_uploaded` - Foto adicionada
- `photo_deleted` - Foto removida

---

## 🔍 Análises Úteis no Firebase Console

### 1. **Eventos em Tempo Real**
Dashboard → Realtime → Ver eventos conforme acontecem

### 2. **Funil de Conversão**
Analytics → Funnels → Criar:
1. Sign up
2. Itinerary created
3. Photo uploaded
4. Itinerary shared

### 3. **Retenção de Usuários**
Analytics → Retention → Ver quantos usuários voltam

### 4. **Telas Mais Visitadas**
Analytics → Events → screen_view

### 5. **Dados Demográficos**
Analytics → User Properties → Ver idade, localização, etc.

---

## 🐛 Crash Reporting com Firebase Crashlytics

### Instalar
```bash
npx expo install @react-native-firebase/crashlytics
```

### Configurar app.json
```json
{
  "expo": {
    "plugins": [
      "@react-native-firebase/crashlytics"
    ]
  }
}
```

### Usar
**mobile/App.tsx**
```typescript
import crashlytics from '@react-native-firebase/crashlytics';

// Rastrear erro não-fatal
try {
  await someRiskyOperation();
} catch (error) {
  crashlytics().recordError(error);
  console.error(error);
}

// Log customizado
crashlytics().log('User clicked generate button');

// Definir atributos
crashlytics().setAttribute('user_role', 'premium');

// Forçar crash (apenas para testar)
// crashlytics().crash();
```

---

## 🔒 Privacidade e GDPR

### Desabilitar Analytics (se usuário recusar)
```typescript
import analytics from '@react-native-firebase/analytics';

const disableAnalytics = async () => {
  await analytics().setAnalyticsCollectionEnabled(false);
};
```

### Adicionar Consentimento
**mobile/src/screens/OnboardingScreen.tsx**
```typescript
const [analyticsConsent, setAnalyticsConsent] = useState(false);

const handleComplete = async () => {
  await AsyncStorage.setItem('analytics_consent', analyticsConsent.toString());
  
  if (analyticsConsent) {
    await analytics().setAnalyticsCollectionEnabled(true);
  } else {
    await analytics().setAnalyticsCollectionEnabled(false);
  }

  navigation.navigate('Signup');
};
```

---

## 📊 Dashboard Personalizado (Opcional)

### Exportar dados para BigQuery
1. Firebase Console → Project Settings
2. Integrations → BigQuery → Link
3. Habilitar exportação de Analytics
4. Criar dashboards personalizados no Google Data Studio

---

## ✅ Checklist de Implementação

- [ ] Firebase projeto criado
- [ ] google-services.json e GoogleService-Info.plist adicionados
- [ ] @react-native-firebase/analytics instalado
- [ ] app.json configurado com plugins
- [ ] analyticsService.ts criado
- [ ] Eventos importantes rastreados:
  - [ ] Visualização de telas
  - [ ] Login/Signup
  - [ ] Criação de roteiro
  - [ ] Upload de foto
  - [ ] Compartilhamento
- [ ] Crashlytics configurado (opcional)
- [ ] Consentimento de privacidade implementado
- [ ] Testado em dev mode
- [ ] Verificado no Firebase Console

---

## 🧪 Testar Analytics

### Debug Mode (iOS)
```bash
# Habilitar debug
expo run:ios -- -FIRDebugEnabled

# Desabilitar debug
expo run:ios -- -FIRDebugDisabled
```

### Debug Mode (Android)
```bash
# Habilitar
adb shell setprop debug.firebase.analytics.app com.guiaaventureiro.app

# Desabilitar
adb shell setprop debug.firebase.analytics.app .none.
```

### Ver eventos em tempo real
1. Firebase Console → Analytics → DebugView
2. Abrir app no simulador/dispositivo
3. Navegar entre telas
4. Ver eventos aparecendo em tempo real

---

## 📞 Recursos Úteis

- [Firebase Analytics Docs](https://rnfirebase.io/analytics/usage)
- [Firebase Console](https://console.firebase.google.com)
- [Eventos Recomendados](https://support.google.com/analytics/answer/9267735)
- [GDPR Compliance](https://firebase.google.com/support/privacy)

---

## 💡 Dicas Finais

1. **Não rastreie demais** - Foque em eventos importantes
2. **Use nomes consistentes** - `itinerary_created` não `create_itinerary`
3. **Adicione contexto** - Sempre envie parâmetros relevantes
4. **Teste antes de produção** - Use DebugView
5. **Respeite privacidade** - Não rastreie dados sensíveis
6. **Monitore regularmente** - Veja dashboards semanalmente

**Analytics bem implementado = Produto melhor! 📈**
