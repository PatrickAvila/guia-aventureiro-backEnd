# 🤝 Guia de Contribuição

Obrigado por considerar contribuir com o **Guia Aventureiro**! Este documento fornece diretrizes para contribuições ao projeto.

---

## 📋 Índice

1. [Código de Conduta](#código-de-conduta)
2. [Como Contribuir](#como-contribuir)
3. [Padrões de Código](#padrões-de-código)
4. [Workflow Git](#workflow-git)
5. [Pull Requests](#pull-requests)
6. [Rodando Localmente](#rodando-localmente)
7. [Testes](#testes)

---

## 📜 Código de Conduta

Este projeto segue um código de conduta. Ao participar, você concorda em:

- ✅ Ser respeitoso e inclusivo
- ✅ Aceitar feedback construtivo
- ✅ Focar no que é melhor para a comunidade
- ❌ Não usar linguagem ou comportamento inadequado

---

## 🛠️ Como Contribuir

### Reportando Bugs

1. **Verifique** se o bug já não foi reportado
2. **Crie uma issue** com:
   - Título descritivo
   - Passos para reproduzir
   - Comportamento esperado vs atual
   - Screenshots (se aplicável)
   - Ambiente (OS, versões, etc.)

### Sugerindo Features

1. **Verifique o Roadmap** para ver se já está planejada
2. **Crie uma issue** com:
   - Descrição clara da feature
   - Justificativa (por que é útil?)
   - Exemplos de uso
   - Mockups (se relevante)

### Desenvolvendo

1. **Fork** o repositório
2. **Clone** localmente
3. **Crie uma branch** a partir de `main`
4. **Desenvolva** seguindo os padrões
5. **Teste** suas mudanças
6. **Commit** e **push**
7. **Abra um Pull Request**

---

## 💻 Padrões de Código

### Backend (Node.js)

Siga o [Backend Best Practices](backend/BACKEND_BEST_PRACTICES.md):

```javascript
// ✅ Use constants
const { errorCodes, limits, messages } = require('../constants');

// ✅ Use helpers
const { date, string, response, validation } = require('../helpers');

// ✅ Valide com Joi
const { userValidator } = require('../validators');

// ✅ Response padronizado
return response.success(res, data, messages.SUCCESS.CREATED);

// ✅ Tratamento de erro
try {
  // ...
} catch (err) {
  console.error('Error:', err);
  return response.serverError(res);
}
```

### Mobile (React Native)

Siga o [Mobile Best Practices](mobile/MOBILE_BEST_PRACTICES.md):

```tsx
// ✅ Use theme tokens
import { colors, spacing, typography, shadows } from '@/theme';

// ✅ Use helpers
import { formatCurrency, isValidEmail, addDays } from '@/helpers';

// ✅ TypeScript com interfaces
interface ButtonProps {
  title: string;
  onPress: () => void;
}

// ✅ Componentes com memo quando necessário
export const Button: React.FC<ButtonProps> = React.memo(({ title, onPress }) => {
  return <TouchableOpacity style={styles.button} onPress={onPress}>
    <Text style={styles.text}>{title}</Text>
  </TouchableOpacity>;
});

// ✅ StyleSheet com theme
const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: spacing.borderRadius.md,
  },
});
```

### Formatação

- **Backend**: JavaScript (ES6+), semicolons, 2 espaços
- **Mobile**: TypeScript, semicolons, 2 espaços
- **Imports**: Organize em 3 grupos (libs, internos, relativos)
- **Naming**:
  - PascalCase: Componentes React
  - camelCase: Funções, variáveis
  - UPPER_CASE: Constantes

---

## 🌿 Workflow Git

### Branches

```
main           # Branch principal (produção)
develop        # Branch de desenvolvimento
feature/*      # Features novas (feature/add-gamification)
fix/*          # Correções (fix/auth-token-bug)
docs/*         # Documentação (docs/update-api-guide)
test/*         # Testes (test/add-user-validation-tests)
```

### Commits

Use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Features
git commit -m "feat: add gamification badges"

# Fixes
git commit -m "fix: resolve token expiration issue"

# Docs
git commit -m "docs: update API documentation"

# Tests
git commit -m "test: add user validation tests"

# Refactor
git commit -m "refactor: extract date helpers"

# Chore
git commit -m "chore: update dependencies"
```

### Exemplo de Workflow

```bash
# 1. Fork e clone
git clone https://github.com/SEU-USER/guia-aventureiro.git
cd guia-aventureiro

# 2. Configure upstream
git remote add upstream https://github.com/ORIGINAL/guia-aventureiro.git

# 3. Crie branch
git checkout -b feature/minha-feature

# 4. Desenvolva e commit
git add .
git commit -m "feat: add my new feature"

# 5. Push
git push origin feature/minha-feature

# 6. Abra PR no GitHub
```

---

## 🔍 Pull Requests

### Checklist antes de abrir PR

- [ ] Código segue os [padrões](#padrões-de-código)
- [ ] Testes adicionados/atualizados
- [ ] Documentação atualizada (se necessário)
- [ ] Build passa sem erros
- [ ] Nenhuma dependência desnecessária adicionada
- [ ] Commits seguem [Conventional Commits](#commits)

### Template de PR

```markdown
## Descrição
Breve descrição do que foi feito

## Tipo de mudança
- [ ] Bug fix
- [ ] Nova feature
- [ ] Breaking change
- [ ] Documentação

## Como testar
1. Passo 1
2. Passo 2
3. Resultado esperado

## Screenshots (se aplicável)
Adicione prints ou GIFs

## Checklist
- [ ] Testes passando
- [ ] Documentação atualizada
- [ ] Código revisado
```

---

## 🚀 Rodando Localmente

### Pré-requisitos

- Node.js 16+
- MongoDB (local ou Atlas)
- Expo CLI (`npm install -g expo-cli`)
- Stripe CLI (para webhooks)

### Backend

```bash
cd backend
npm install
cp .env.example .env  # Configure suas variáveis
npm run dev           # Roda em http://localhost:5000
```

### Mobile

```bash
cd mobile
npm install
npx expo start        # Abre dev menu
# Pressione 'i' para iOS ou 'a' para Android
```

### Seed do Banco

```bash
cd backend
node scripts/seed.js --clear  # Popula com dados de teste
```

---

## 🧪 Testes

### Backend

```bash
cd backend
npm test              # Roda todos os testes
npm run test:watch    # Watch mode
npm run test:coverage # Com coverage
```

### Mobile

```bash
cd mobile
npm test              # Roda testes do mobile
```

### Automation (Testes E2E)

```bash
cd automation
npm install
npm test              # Roda 237 testes
```

### Escrevendo Testes

Siga o [Testing Best Practices](automation/TESTING_BEST_PRACTICES.md):

```javascript
// Padrão AAA (Arrange, Act, Assert)
describe('User signup', () => {
  it('should create user with valid data', async () => {
    // Arrange
    const userData = { nome: 'Test', email: 'test@example.com', senha: 'Test123!' };

    // Act
    const response = await request(app).post('/api/auth/signup').send(userData);

    // Assert
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
```

---

## 📚 Recursos Úteis

- [Backend Best Practices](backend/BACKEND_BEST_PRACTICES.md)
- [Mobile Best Practices](mobile/MOBILE_BEST_PRACTICES.md)
- [Testing Best Practices](automation/TESTING_BEST_PRACTICES.md)
- [API Documentation](docs/api/API.md)
- [FAQ](docs/guides/FAQ.md)

---

## 🆘 Precisa de Ajuda?

- **Dúvidas gerais**: Abra uma issue com label `question`
- **Problemas técnicos**: Consulte [FAQ](docs/guides/FAQ.md)
- **Discussões**: Use GitHub Discussions

---

## 🙏 Obrigado!

Toda contribuição é valiosa, seja código, documentação, reportando bugs ou sugerindo features. Obrigado por ajudar a melhorar o Guia Aventureiro! 🚀

---

**📝 Última atualização**: Janeiro 2026
