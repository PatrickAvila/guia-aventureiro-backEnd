# Seed pública do Explore

Este script cria/atualiza usuários públicos e roteiros públicos reais para alimentar a tela de Explorar.

Execução:

```powershell
Set-Location "c:\Users\conta\OneDrive\Área de Trabalho\guia-aventureiro\backend"; node src/utils/seedPublicExplore.js
```

O seed é idempotente: ele usa email e título + owner para atualizar os registros existentes em vez de duplicar.
