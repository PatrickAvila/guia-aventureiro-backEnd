# 🌐 Hospedar Documentos Legais (Privacy & Terms)

## 🎯 Objetivo
Hospedar os arquivos HTML de Política de Privacidade e Termos de Uso em uma URL pública para usar nas lojas de aplicativos.

**Arquivos a hospedar:**
- `docs/privacy.html` → https://seusite.com/privacy
- `docs/terms.html` → https://seusite.com/terms

---

## 📌 Opção 1: GitHub Pages (RECOMENDADO - Grátis)

### Passo 1: Preparar Repositório
```bash
# Já está no Git, apenas garantir que docs/ está commitado
git add docs/privacy.html docs/terms.html
git commit -m "docs: add legal documents"
git push origin main
```

### Passo 2: Ativar GitHub Pages
1. Acesse seu repositório no GitHub
2. Vá em **Settings** → **Pages**
3. Em "Source", selecione **main branch** → **/ (root)**
4. Clique em **Save**
5. Aguardar 2-3 minutos

### Passo 3: URLs Geradas
Após ativar, seus documentos estarão em:
```
https://<seu-usuario>.github.io/<nome-do-repo>/docs/privacy.html
https://<seu-usuario>.github.io/<nome-do-repo>/docs/terms.html
```

**Exemplo:**
```
https://seunome.github.io/guia-aventureiro/docs/privacy.html
https://seunome.github.io/guia-aventureiro/docs/terms.html
```

### Passo 4: Usar URLs no App
Adicione aos stores e no app:
- **App Store Connect:** "Privacy Policy URL"
- **Google Play Console:** "Privacy Policy"
- **App (mobile/src/screens/ProfileScreen.tsx):**

```typescript
const PRIVACY_URL = 'https://seunome.github.io/guia-aventureiro/docs/privacy.html';
const TERMS_URL = 'https://seunome.github.io/guia-aventureiro/docs/terms.html';
```

---

## 📌 Opção 2: Render Static Site (Grátis)

### Passo 1: Criar Novo Static Site no Render
1. Acesse https://dashboard.render.com
2. Clique em **New** → **Static Site**
3. Conecte seu repositório GitHub
4. Configurar:
   - **Name:** guia-aventureiro-docs
   - **Root Directory:** `docs`
   - **Build Command:** (deixar vazio)
   - **Publish Directory:** `.`

### Passo 2: Deploy
Clique em "Create Static Site" e aguardar deploy (1-2 min)

### Passo 3: URLs Geradas
```
https://guia-aventureiro-docs.onrender.com/privacy.html
https://guia-aventureiro-docs.onrender.com/terms.html
```

---

## 📌 Opção 3: Netlify (Grátis)

### Passo 1: Deploy via Drag & Drop
1. Acesse https://app.netlify.com/drop
2. Arraste a pasta `docs/` para a área de upload
3. Aguardar upload (30 segundos)

### Passo 2: URLs Geradas
Netlify gera URL aleatória:
```
https://random-name-123.netlify.app/privacy.html
https://random-name-123.netlify.app/terms.html
```

### Passo 3: Customizar Domínio (Opcional)
1. Acesse o site no Netlify
2. **Site settings** → **Change site name**
3. Nome: `guia-aventureiro-docs`
4. Nova URL:
```
https://guia-aventureiro-docs.netlify.app/privacy.html
https://guia-aventureiro-docs.netlify.app/terms.html
```

---

## 📌 Opção 4: Vercel (Grátis)

### Passo 1: Instalar Vercel CLI
```bash
npm install -g vercel
```

### Passo 2: Deploy
```bash
cd c:\Users\conta\OneDrive\Área de Trabalho\guia-aventureiro
vercel deploy docs/ --prod
```

### Passo 3: Seguir Wizard
- Login com GitHub
- Confirmar configurações
- Aguardar deploy

### URLs Geradas:
```
https://guia-aventureiro-docs.vercel.app/privacy.html
https://guia-aventureiro-docs.vercel.app/terms.html
```

---

## 📌 Opção 5: Seu Próprio Backend (Render)

Se você já tem o backend no Render, pode servir os HTMLs diretamente:

### Passo 1: Copiar arquivos para backend
```bash
# Copiar arquivos
copy docs\privacy.html backend\public\privacy.html
copy docs\terms.html backend\public\terms.html
```

### Passo 2: Servir arquivos estáticos (backend/server.js)
```javascript
const express = require('express');
const path = require('path');

const app = express();

// Servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, 'public')));

// ... resto do código
```

### Passo 3: URLs Geradas
```
https://guia-aventureiro-backend.onrender.com/privacy.html
https://guia-aventureiro-backend.onrender.com/terms.html
```

---

## ✅ Recomendação

### Para Começar Rápido: **GitHub Pages**
✅ Grátis  
✅ Sem configuração extra  
✅ Já está no repositório  
✅ SSL automático  
✅ Sempre disponível  

### Para Produção Profissional: **Netlify ou Vercel**
✅ Mais rápido (CDN global)  
✅ Domínio customizado fácil  
✅ Analytics integrado  
✅ Previews automáticos  

---

## 🔗 Atualizar Links no Código

Após hospedar, atualizar URLs em:

### 1. mobile/src/screens/ProfileScreen.tsx
```typescript
const PRIVACY_URL = 'https://SEU-DOMINIO/privacy.html';
const TERMS_URL = 'https://SEU-DOMINIO/terms.html';
```

### 2. APP_STORE_DESCRIPTIONS.md
Atualizar seção "Informações adicionais" com URLs finais.

### 3. eas.json (se aplicável)
```json
{
  "submit": {
    "production": {
      "ios": {
        "privacyPolicyUrl": "https://SEU-DOMINIO/privacy.html"
      }
    }
  }
}
```

---

## 🧪 Testar URLs

Após hospedar, testar:
- [ ] Abrir no navegador desktop
- [ ] Abrir no navegador mobile (Safari, Chrome)
- [ ] Verificar HTTPS (cadeado verde)
- [ ] Verificar layout responsivo
- [ ] Verificar que não há erro 404

---

## 📝 Checklist Final

- [ ] Arquivos hospedados e acessíveis
- [ ] URLs funcionando (HTTPS)
- [ ] Links atualizados no app
- [ ] Links adicionados nas lojas (App Store Connect, Play Console)
- [ ] Testado em navegadores mobile
- [ ] Backup das URLs salvo (caso precise resubmeter)

---

## 💡 Dica Extra: Criar Página Index

Crie `docs/index.html` como página inicial:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Guia do Aventureiro - Documentação</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            text-align: center;
        }
        h1 {
            color: #005A8D;
        }
        a {
            display: block;
            margin: 20px 0;
            padding: 15px;
            background: #005A8D;
            color: white;
            text-decoration: none;
            border-radius: 8px;
        }
        a:hover {
            background: #004570;
        }
    </style>
</head>
<body>
    <h1>📱 Guia do Aventureiro</h1>
    <p>Documentação Legal</p>
    
    <a href="privacy.html">📋 Política de Privacidade</a>
    <a href="terms.html">📄 Termos de Uso</a>
    
    <hr>
    <p style="color: #666;">
        © 2026 Guia do Aventureiro. Todos os direitos reservados.
    </p>
</body>
</html>
```

Isso cria uma landing page em `https://seudominio.com/` com links para os documentos.

---

**Escolha uma opção e configure agora! 🚀**
