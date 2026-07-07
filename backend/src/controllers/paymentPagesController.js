// backend/src/controllers/paymentPagesController.js

/**
 * Página de sucesso do pagamento
 */
exports.paymentSuccess = (req, res) => {
  const { session_id } = req.query;
  const safeSessionId = String(session_id || '');
  const escapeHtml = (value) =>
    String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  const safeSessionIdJson = JSON.stringify(safeSessionId);

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pagamento Aprovado</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      color: white;
    }
    .container {
      text-align: center;
      padding: 40px 20px;
    }
    .icon {
      font-size: 80px;
      margin-bottom: 20px;
      animation: bounce 1s ease-in-out;
    }
    h1 {
      font-size: 28px;
      margin: 0 0 10px 0;
      font-weight: 600;
    }
    p {
      font-size: 16px;
      opacity: 0.9;
      margin: 10px 0;
    }
    .session-id {
      font-size: 12px;
      opacity: 0.6;
      margin-top: 20px;
      word-break: break-all;
      padding: 0 20px;
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-20px); }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">🎉</div>
    <h1>Pagamento Aprovado!</h1>
    <p>Sua assinatura Premium foi ativada.</p>
    <p>Você será redirecionado em instantes...</p>
    ${safeSessionId ? `<p class="session-id">Session ID: ${escapeHtml(safeSessionId)}</p>` : ''}
  </div>
  <script>
    // Marcar como sucesso para o WebView detectar
    window.PAYMENT_SUCCESS = true;
    window.SESSION_ID = ${safeSessionIdJson};

    // Tentar notificar o React Native (se disponível)
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'PAYMENT_SUCCESS',
        sessionId: ${safeSessionIdJson}
      }));
    }
  </script>
</body>
</html>
  `;

  res.send(html);
};

/**
 * Página de cancelamento do pagamento
 */
exports.paymentCancel = (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pagamento Cancelado</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      color: white;
    }
    .container {
      text-align: center;
      padding: 40px 20px;
    }
    .icon {
      font-size: 80px;
      margin-bottom: 20px;
    }
    h1 {
      font-size: 28px;
      margin: 0 0 10px 0;
      font-weight: 600;
    }
    p {
      font-size: 16px;
      opacity: 0.9;
      margin: 10px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">❌</div>
    <h1>Pagamento Cancelado</h1>
    <p>Você cancelou o processo de upgrade.</p>
    <p>Tente novamente quando quiser!</p>
  </div>
  <script>
    // Marcar como cancelado para o WebView detectar
    window.PAYMENT_CANCELLED = true;

    // Tentar notificar o React Native (se disponível)
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'PAYMENT_CANCELLED'
      }));
    }
  </script>
</body>
</html>
  `;

  res.send(html);
};
