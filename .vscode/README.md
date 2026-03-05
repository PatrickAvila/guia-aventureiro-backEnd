# VSCode Workspace Settings
**Configurações recomendadas para desenvolvimento**

---

## 📦 Instalação Automática de Extensões

Ao abrir o projeto no VSCode, você verá uma notificação para instalar as extensões recomendadas.

### Extensões Essenciais

- **Prettier** - Formatação de código
- **ESLint** - Linting JavaScript/TypeScript
- **EditorConfig** - Consistência entre editores

### Extensões React Native

- **React Native Tools** - Debug e snippets
- **ES7+ React/Redux/React-Native snippets** - Snippets úteis

### Extensões Node.js

- **npm Intellisense** - Autocomplete imports
- **Path Intellisense** - Autocomplete paths

### Extensões Git

- **GitLens** - Git supercharged
- **Git Graph** - Visualização de branches

---

## ⚙️ Configurações

### Format on Save

O código é automaticamente formatado ao salvar, usando Prettier.

### Auto Import Update

Quando você move/renomeia arquivos, os imports são atualizados automaticamente.

### Path Aliases

```javascript
// Backend
import { errorCodes } from '~/constants';

// Mobile
import { colors } from '@/theme';
```

---

## 🎨 Tema Recomendado

- **Tema**: One Dark Pro
- **Ícones**: Material Icon Theme

---

## 🔧 Personalizações

Edite `.vscode/settings.json` para personalizar:

```json
{
  "workbench.colorTheme": "Seu Tema",
  "editor.fontSize": 14,
  "editor.fontFamily": "Fira Code, Consolas"
}
```

---

## 📝 Última atualização: Janeiro 2026
