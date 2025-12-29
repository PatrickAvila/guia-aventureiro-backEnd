# ❓ FAQ - Perguntas Frequentes

## Guia do Aventureiro

---

## 📱 Sobre o App

### **O que é o Guia do Aventureiro?**

O Guia do Aventureiro é um aplicativo mobile que usa Inteligência Artificial para criar roteiros de viagem personalizados em segundos. Você pode planejar, organizar, compartilhar e acompanhar seus gastos em viagens.

### **O app é grátis?**

Sim! 100% gratuito durante a fase MVP. No futuro, pode haver um plano premium com recursos avançados, mas sempre haverá uma versão gratuita.

### **Preciso de internet para usar?**

Não necessariamente! O app possui **modo offline** que permite:
- Visualizar roteiros já baixados
- Adicionar gastos offline
- Ver fotos salvas

A sincronização acontece automaticamente quando você voltar online.

---

## 🤖 Geração de Roteiros com IA

### **Como funciona a IA?**

Usamos Groq AI (modelo Llama 3.3 70B) para gerar roteiros personalizados. A IA analisa:
- Seu destino
- Número de dias
- Orçamento disponível
- Interesses pessoais (cultura, aventura, gastronomia, etc)
- Estilo de viagem

E cria um roteiro completo com atividades, horários, locais e custos estimados.

### **Os roteiros são precisos?**

A IA é muito boa, mas sempre recomendamos **verificar informações** como:
- Horários de funcionamento
- Preços atualizados
- Necessidade de reservas
- Condições climáticas

Tratamos a IA como um "guia inicial" que você pode personalizar.

### **Posso editar o roteiro gerado?**

Sim! Todos os roteiros podem ser editados:
- Adicionar/remover atividades
- Mudar horários
- Ajustar orçamento
- Adicionar notas pessoais

### **Quantos roteiros posso criar?**

Ilimitados! Não há limite de roteiros na versão gratuita.

---

## 💰 Controle de Orçamento

### **Como funciona o orçamento?**

Quando você gera um roteiro, a IA calcula automaticamente um **orçamento estimado** baseado em:
- Nível de orçamento escolhido (econômico, médio, luxo)
- Número de dias
- Destino

Durante a viagem, você pode adicionar **gastos reais** por categoria:
- 🏨 Hospedagem
- 🍽️ Alimentação
- 🚗 Transporte
- 🎭 Atrações
- 🛍️ Compras
- 💳 Outros

### **Os valores do orçamento estimado são em qual moeda?**

Por padrão, em **Reais (R$)**. No futuro, adicionaremos suporte a outras moedas.

### **Qual a diferença entre os níveis de orçamento?**

| Nível | Custo/Dia | Perfil |
|-------|-----------|--------|
| Econômico | R$ 300 | Albergues, transporte público, comida local |
| Médio | R$ 650 | Hotéis 3-4★, mix transporte, restaurantes variados |
| Luxo | R$ 1.450 | Hotéis 5★, carros, restaurantes premium |

### **Posso alterar o orçamento depois de criar?**

Sim! Você pode editar o orçamento estimado a qualquer momento.

---

## 📸 Fotos e Upload

### **Quantas fotos posso adicionar?**

Até **10 fotos por roteiro**.

### **Qual o tamanho máximo de foto?**

10MB por foto. O app comprime automaticamente para 800x600 pixels para economizar espaço.

### **Onde as fotos são armazenadas?**

No **Cloudinary**, um serviço profissional de armazenamento de imagens. Suas fotos ficam seguras e acessíveis de qualquer dispositivo.

### **As fotos são públicas?**

Apenas se você tornar o roteiro **público**. Roteiros privados têm fotos visíveis só para você e colaboradores.

---

## 🌍 Explorar Roteiros

### **O que é a aba "Explorar"?**

Um feed de roteiros **públicos** compartilhados por outros usuários. Você pode:
- Descobrir novos destinos
- Ver roteiros em alta
- Curtir e salvar roteiros
- Copiar roteiros para sua conta

### **Posso usar roteiros de outras pessoas?**

Sim! Você pode **copiar** qualquer roteiro público para sua conta e personalizá-lo.

### **Como tornar meu roteiro público?**

Ao criar/editar um roteiro, ative a opção **"Tornar público"**. Seu nome e foto de perfil ficarão visíveis.

---

## ⭐ Avaliações e Compartilhamento

### **Como avaliar um roteiro?**

Após concluir uma viagem, você pode avaliar de 1-5 estrelas e adicionar:
- Comentário
- Fotos da viagem
- Melhor experiência
- Pior experiência
- Dica especial

### **Posso compartilhar um roteiro?**

Sim! Você pode compartilhar via:
- WhatsApp
- Link direto
- Copiar link
- Outros apps (compartilhamento nativo)

O link permite que qualquer pessoa veja o roteiro, mesmo sem ter o app instalado.

---

## 🏆 Gamificação

### **O que são conquistas?**

São badges (medalhas) que você desbloqueia ao usar o app:
- Criar primeiro roteiro
- Viajar para 5 países diferentes
- Adicionar 50 fotos
- Completar 10 viagens
- E mais 16 conquistas!

### **Como funciona o sistema de níveis?**

Cada ação no app ganha **XP (experiência)**:
- Criar roteiro: +50 XP
- Completar viagem: +100 XP
- Adicionar avaliação: +30 XP
- Desbloquear conquista: +10-100 XP

Conforme você sobe de nível, desbloqueia novas conquistas e badges especiais.

---

## 🔐 Segurança e Privacidade

### **Meus dados estão seguros?**

Sim! Implementamos:
- Criptografia de senhas (bcrypt)
- Comunicação HTTPS
- Tokens JWT para autenticação
- Rate limiting (proteção contra ataques)
- Conformidade com LGPD

Veja nossa [Política de Privacidade](PRIVACY_POLICY.md) completa.

### **Posso deletar minha conta?**

Sim! Em **Perfil → Configurações → Deletar Conta**. Todos os seus dados serão removidos em até 30 dias.

### **Vocês vendem meus dados?**

**NUNCA!** Não vendemos, alugamos ou compartilhamos seus dados pessoais para marketing.

---

## 📱 Compatibilidade

### **Quais dispositivos são compatíveis?**

- **iOS:** iPhone 6S ou superior (iOS 13+)
- **Android:** Android 6.0 (Marshmallow) ou superior

### **Funciona em tablet?**

Sim! O app funciona em tablets iOS e Android, mas é otimizado para smartphones.

### **Preciso de muito espaço no celular?**

O app tem ~50MB. Fotos e roteiros offline ocupam espaço adicional (você controla).

---

## 🌐 Destinos e Idiomas

### **Funciona para qualquer destino?**

Sim! A IA conhece destinos do mundo todo. Funciona melhor para cidades populares, mas também sugere roteiros para lugares menos conhecidos.

### **O app está em português?**

Sim! Todo o app está em **português do Brasil**. No futuro, adicionaremos outros idiomas.

### **A IA entende pedidos em português?**

Perfeitamente! A IA foi treinada para entender preferências em português e gera roteiros no nosso idioma.

---

## 🆘 Problemas Comuns

### **O app não está carregando meus roteiros**

1. Verifique sua conexão com internet
2. Tente fazer logout e login novamente
3. Limpe o cache em Configurações
4. Reinstale o app

### **Esqueci minha senha**

Clique em **"Esqueci minha senha"** na tela de login e siga as instruções por e-mail.

*(Funcionalidade de reset de senha em desenvolvimento)*

### **A IA não está gerando roteiros**

Verifique se:
- Você tem internet (IA requer conexão)
- Preencheu todos os campos obrigatórios
- Esperou 1-3 segundos (IA pode demorar um pouco)

Se persistir, entre em contato com suporte.

### **As fotos não estão fazendo upload**

- Verifique conexão com internet
- Confirme que a foto tem menos de 10MB
- Tente tirar uma nova foto ou selecionar outra da galeria

---

## 💬 Suporte

### **Como entro em contato com o suporte?**

- **E-mail:** suporte@guiaaventureiro.com
- **No app:** Perfil → Ajuda → Falar com Suporte
- **Instagram:** @guia.aventureiro (DM)

Respondemos em até 24-48 horas (dias úteis).

### **Como reportar um bug?**

Envie por e-mail para **bugs@guiaaventureiro.com** com:
- Descrição do problema
- Passos para reproduzir
- Screenshot (se possível)
- Modelo do celular e versão do app

### **Como sugerir uma feature?**

Adoramos sugestões! Envie para **ideias@guiaaventureiro.com** ou vote em features no nosso [GitHub Discussions](#).

---

## 🚀 Roadmap e Futuro

### **Quais novidades estão por vir?**

Veja nosso [ROADMAP.md](ROADMAP.md) completo, mas algumas features planejadas:

**Versão 1.1 (1-2 meses):**
- Gráficos de orçamento detalhados
- Mapa interativo com pontos do roteiro
- Notificações push

**Versão 2.0 (3-4 meses):**
- Plano Premium (recursos avançados)
- Chat entre colaboradores
- Integração com Booking/Airbnb

### **Quando haverá plano pago?**

Ainda sem data definida. Quando houver:
- Sempre haverá versão gratuita
- Preço previsto: ~R$ 9,90/mês
- Usuários antigos terão desconto vitalício

---

## 🌟 Dicas de Uso

### **Como aproveitar melhor o app?**

1. **Preencha suas preferências** no perfil para roteiros mais precisos
2. **Adicione gastos durante a viagem** para controle em tempo real
3. **Tire fotos** e documente suas experiências
4. **Avalie roteiros** após a viagem para ajudar outros viajantes
5. **Explore roteiros públicos** para se inspirar

### **Posso usar para viagens nacionais e internacionais?**

Sim! Funciona perfeitamente para ambos. A IA conhece destinos brasileiros (Rio, São Paulo, Nordeste) e internacionais (Paris, Nova York, Tóquio, etc).

### **Devo confiar 100% no roteiro da IA?**

Não! Trate como um **guia inicial excelente**, mas sempre:
- Verifique horários e preços
- Pesquise reviews de locais sugeridos
- Adapte ao seu gosto pessoal
- Considere imprevistos (clima, feriados, etc)

---

**💡 Não encontrou sua dúvida?**

Entre em contato: suporte@guiaaventureiro.com

---

**Atualizado em:** 29/12/2025  
**Versão do App:** 1.0.0
