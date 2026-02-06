/**
 * 🚨 ALERTS SENDER
 * Envia alertas Telegram quando eventos críticos ocorrem
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Tenta carregar env do Next.js se possível
try {
  const { loadOpsEnv } = require('../_load-ops-env');
  loadOpsEnv();
} catch (e) { /* fallback para process.env vindo de fora */ }

// Configuração (via variáveis de ambiente ou .env)
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT = process.env.TELEGRAM_CHAT_ID || '385573206';

// Tipos de alerta
const ALERT_TYPES = {
  PIPELINE_FAILURE: { emoji: '❌', title: 'Pipeline Falhou', priority: 'high' },
  SCHEDULING_ERROR: { emoji: '⚠️', title: 'Erro de Agendamento', priority: 'medium' },
  HIGH_FAILURE_RATE: { emoji: '🚨', title: 'Taxa de Falhas Alta', priority: 'high' },
  TASK_BLOCKED: { emoji: '🚫', title: 'Tarefa Bloqueada', priority: 'low' },
  SYSTEM_WARNING: { emoji: '⚡', title: 'Aviso do Sistema', priority: 'medium' },
  SUCCESS: { emoji: '✅', title: 'Sucesso', priority: 'low' },
  DAILY_REPORT: { emoji: '📊', title: 'Relatório Diário', priority: 'low' }
};

async function sendTelegram(message, chatId = TELEGRAM_CHAT) {
  if (!TELEGRAM_TOKEN) {
    console.log('📱 Telegram alert (no token):', message);
    return { sent: false, reason: 'no_token' };
  }

  const data = JSON.stringify({
    chat_id: chatId,
    text: message,
    parse_mode: 'Markdown'
  });

  return new Promise((resolve, reject) => {
    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ sent: json.ok, response: json });
        } catch (e) {
          resolve({ sent: false, error: e.message });
        }
      });
    });

    req.on('error', (e) => resolve({ sent: false, error: e.message }));
    req.write(data);
    req.end();
  });
}

async function sendAlert(type, message, details = '') {
  const alert = ALERT_TYPES[type] || ALERT_TYPES.SYSTEM_WARNING;

  const fullMessage = `${alert.emoji} *${alert.title}*\n\n${message}${details ? `\n\n${details}` : ''}`;

  console.log(`🚨 Sending alert: ${alert.title}`);

  const result = await sendTelegram(fullMessage);

  if (result.sent) {
    console.log('✅ Alert sent successfully');
  } else {
    console.log('⚠️ Alert failed:', result.error || 'unknown');
  }

  return result;
}

async function checkFailuresAndAlert() {
  const csvPath = path.join(__dirname, '..', 'results', 'posting-log-v2.csv');

  if (!fs.existsSync(csvPath)) return;

  const csv = fs.readFileSync(csvPath, 'utf8');
  const lines = csv.split('\n').filter(l => l.trim());

  // Ver últimas 24 horas
  const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
  let failures = 0;
  let recentFailures = 0;

  lines.slice(1).forEach(line => {
    const cols = line.split(',');
    const dateTime = cols[0];
    const status = cols[8];

    if (status === 'failed') {
      failures++;
      if (new Date(dateTime).getTime() > oneDayAgo) {
        recentFailures++;
      }
    }
  });

  if (recentFailures >= 3) {
    await sendAlert(
      'HIGH_FAILURE_RATE',
      `${recentFailures} falhas detectadas nas últimas 24 horas`,
      `Total: ${failures} falhas no histórico`
    );
  }
}

// CLI
if (require.main === module) {
  const type = process.argv[2] || 'SYSTEM_WARNING';
  const message = process.argv[3] || 'Alerta de teste';

  sendAlert(type, message).then(() => process.exit(0));
}

module.exports = { sendAlert, checkFailuresAndAlert, ALERT_TYPES };
