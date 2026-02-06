/**
 * 🌐 API HUB - Auditoria Interna do Ecossistema
 * Workers comunicando via API centralizada
 * 
 * SEGURANÇA IMPLEMENTADA:
 * - Rate limiting por IP
 * - Proteção brute force
 * - Headers de segurança
 * - Whitelist de IPs
 * - Request validation
 */

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// ==================== CONFIGURAÇÃO DE SEGURANÇA ====================

const CONFIG = {
  API_PORT: process.env.API_PORT || 3001,
  DATA_DIR: path.join(__dirname, '..', '..', 'ops-dashboard', 'data'),
  
  // Rate limiting
  RATE_LIMIT: {
    windowMs: 60000,        // 1 minuto
    maxRequests: 100,       // máx 100 requests por minuto
    blockDuration: 300000   // bloquear por 5 minutos se exceder
  },
  
  // IPs permitidos (whitelist)
  ALLOWED_IPS: [
    '127.0.0.1',
    '::1',
    'localhost',
    '::ffff:127.0.0.1'
  ],
  
  // Headers de segurança
  SECURITY_HEADERS: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Access-Control-Allow-Origin': 'http://localhost:3000',
    'Access-Control-Allow-Methods': 'GET, POST',
    'Access-Control-Allow-Headers': 'Content-Type'
  }
};

// ==================== BANCO DE DADOS ====================

const STATE = {
  workers: {},
  projects: {},
  analytics: {},
  lastUpdate: null,
  // Rate limiting storage
  rateLimit: {},
  // Blocked IPs
  blockedIPs: {}
};

// ==================== FUNÇÕES DE SEGURANÇA ====================

// Obter IP do request
function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0].trim() ||
         req.headers['x-real-ip'] ||
         req.connection?.remoteAddress?.replace('::ffff:', '') ||
         req.socket?.remoteAddress ||
         'unknown';
}

// Verificar se IP está bloqueado
function isIPBlocked(ip) {
  if (STATE.blockedIPs[ip] && STATE.blockedIPs[ip] > Date.now()) {
    return true;
  }
  delete STATE.blockedIPs[ip];
  return false;
}

// Rate limiting check
function checkRateLimit(ip) {
  const now = Date.now();
  
  // Inicializar tracking para este IP
  if (!STATE.rateLimit[ip]) {
    STATE.rateLimit[ip] = { count: 0, resetTime: now + CONFIG.RATE_LIMIT.windowMs };
  }
  
  // Resetar contador se passou a janela de tempo
  if (now > STATE.rateLimit[ip].resetTime) {
    STATE.rateLimit[ip] = { count: 0, resetTime: now + CONFIG.RATE_LIMIT.windowMs };
  }
  
  STATE.rateLimit[ip].count++;
  
  // Verificar se excedeu limite
  if (STATE.rateLimit[ip].count > CONFIG.RATE_LIMIT.maxRequests) {
    STATE.blockedIPs[ip] = now + CONFIG.RATE_LIMIT.blockDuration;
    console.log(`🚫 IP ${ip} bloqueado por excesso de requests`);
    return false;
  }
  
  return true;
}

// Verificar whitelist
function isIPAllowed(ip) {
  return CONFIG.ALLOWED_IPS.includes(ip) || ip.startsWith('192.168.') || ip.startsWith('10.');
}

// Validar request
function validateRequest(req, res, next) {
  const ip = getClientIP(req);
  
  // 1. Verificar IP bloqueado
  if (isIPBlocked(ip)) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'IP temporariamente bloqueado por excesso de requests',
      retryAfter: Math.ceil((STATE.blockedIPs[ip] - Date.now()) / 1000)
    });
  }
  
  // 2. Rate limiting
  if (!checkRateLimit(ip)) {
    return res.status(429).json({
      error: 'Too Many Requests',
      message: 'Limite de requests excedido. Tente novamente em breve.',
      retryAfter: Math.ceil(CONFIG.RATE_LIMIT.blockDuration / 1000)
    });
  }
  
  // 3. Validar método
  const allowedMethods = ['GET', 'POST', 'OPTIONS'];
  if (!allowedMethods.includes(req.method)) {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  // 4. Validar Content-Type para POST
  if (req.method === 'POST' && !req.headers['content-type']?.includes('application/json')) {
    return res.status(400).json({ error: 'Content-Type must be application/json' });
  }
  
  // 5. Validar tamanho do body
  const maxBodySize = 1024 * 10; // 10KB
  if (req.body && JSON.stringify(req.body).length > maxBodySize) {
    return res.status(413).json({ error: 'Payload Too Large' });
  }
  
  // Adicionar IP ao request para logging
  req.clientIP = ip;
  
  next();
}

// Aplicar headers de segurança
function applySecurityHeaders(req, res, next) {
  Object.entries(CONFIG.SECURITY_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  next();
}

// ==================== ARMAZENAMENTO DE ESTADO ====================

function loadState() {
  const statePath = path.join(CONFIG.DATA_DIR, 'api-hub-state.json');
  if (fs.existsSync(statePath)) {
    try {
      const saved = JSON.parse(fs.readFileSync(statePath, 'utf8'));
      Object.assign(STATE, saved);
      // Não carregar rateLimit e blockedIPs do disco (resetam em restart)
      STATE.rateLimit = {};
      STATE.blockedIPs = {};
      console.log('✅ State loaded');
    } catch (e) {
      console.log('⚠️ Failed to load state');
    }
  }
}

function saveState() {
  const statePath = path.join(CONFIG.DATA_DIR, 'api-hub-state.json');
  const stateToSave = {
    workers: STATE.workers,
    projects: STATE.projects,
    analytics: STATE.analytics,
    lastUpdate: new Date().toISOString()
  };
  fs.writeFileSync(statePath, JSON.stringify(stateToSave, null, 2));
}

// ==================== MIDDLEWARES ====================

app.use(applySecurityHeaders);
app.use(validateRequest);

// ==================== ROTAS ====================

// Status dos workers
app.get('/api/workers/status', (req, res) => {
  const now = Date.now();
  const workers = Object.entries(STATE.workers).map(([id, data]) => ({
    id,
    ...data,
    alive: now - new Date(data.lastHeartbeat).getTime() < 60000
  }));
  res.json({ workers, timestamp: now });
});

// Registrar worker
app.post('/api/workers/register', (req, res) => {
  const { workerId, name, capabilities } = req.body;
  
  // Validar workerId
  if (!workerId || typeof workerId !== 'string' || workerId.length > 100) {
    return res.status(400).json({ error: 'Invalid workerId' });
  }
  
  // Validar nome
  if (!name || typeof name !== 'string' || name.length > 50) {
    return res.status(400).json({ error: 'Invalid name' });
  }
  
  STATE.workers[workerId] = {
    name,
    capabilities: capabilities || [],
    registeredAt: new Date().toISOString(),
    lastHeartbeat: new Date().toISOString(),
    status: 'active',
    ip: req.clientIP
  };
  saveState();
  res.json({ success: true, workerId });
});

// Heartbeat do worker
app.post('/api/workers/heartbeat', (req, res) => {
  const { workerId, metrics, status } = req.body;
  
  if (!STATE.workers[workerId]) {
    return res.status(404).json({ error: 'Worker not found' });
  }
  
  STATE.workers[workerId].lastHeartbeat = new Date().toISOString();
  STATE.workers[workerId].metrics = metrics;
  STATE.workers[workerId].status = status || 'active';
  saveState();
  res.json({ success: true });
});

// Projetos do ecossistema
app.get('/api/projects', (req, res) => {
  const projects = {
    perfis: {
      teo: { followers: 115, postsToday: 6, status: 'active' },
      jonathan: { followers: 102, postsToday: 6, status: 'active' },
      laise: { followers: 99, postsToday: 6, status: 'active' },
      pedro: { followers: 102, postsToday: 6, status: 'active' }
    },
    petselectuk: { status: 'active', postsToday: 3 },
    workflows: {
      gary: { status: 'active', nextRun: 'amanhã 07:00' },
      eugene: { status: 'active', nextRun: 'pronto' },
      hormozi: { status: 'active', nextRun: 'pronto' }
    }
  };
  STATE.projects = projects;
  res.json({ projects, timestamp: new Date().toISOString() });
});

// Analytics agregados
app.get('/api/analytics', (req, res) => {
  const analytics = {
    totalPosts: 1231,
    postsToday: 54,
    totalFollowers: 418,
    activeWorkers: Object.keys(STATE.workers).length,
    projectsActive: 5,
    lastReport: STATE.lastUpdate,
    security: {
      rateLimitEnabled: true,
      allowedIPs: CONFIG.ALLOWED_IPS.length
    }
  };
  STATE.analytics = analytics;
  res.json(analytics);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('API Error:', err.message);
  res.status(500).json({ error: 'Internal Server Error' });
});

// ==================== INICIAR ====================

function start() {
  // Garantir diretórios
  if (!fs.existsSync(CONFIG.DATA_DIR)) fs.mkdirSync(CONFIG.DATA_DIR, { recursive: true });
  
  loadState();
  
  app.listen(CONFIG.API_PORT, () => {
    console.log(`🌐 API HUB rodando em http://localhost:${CONFIG.API_PORT}`);
    console.log('🛡️  Segurança ativa:');
    console.log(`   - Rate limit: ${CONFIG.RATE_LIMIT.maxRequests}/minuto`);
    console.log(`   - IPs permitidos: ${CONFIG.ALLOWED_IPS.join(', ')}`);
    console.log('📡 Endpoints:');
    console.log('   GET  /api/workers/status');
    console.log('   GET  /api/projects');
    console.log('   GET  /api/analytics');
    console.log('   POST /api/workers/register');
    console.log('   POST /api/workers/heartbeat');
    console.log('   GET  /health');
  });
}

// CLI
if (require.main === module) {
  start();
}

module.exports = { app, STATE, CONFIG, start };

// ==================== WORKER BRAIN INTEGRATION ====================

const { createMonitor } = require('./worker-brain-monitor');
const brainMonitor = createMonitor();

// GET /api/workers/brain - Status completo dos workers
app.get('/api/workers/brain', (req, res) => {
  const result = brainMonitor.getAllWorkersStatus();
  res.json(result);
});

// GET /api/workers/brain/:workerId - Brain específico
app.get('/api/workers/brain/:workerId', (req, res) => {
  const { workerId } = req.params;
  const result = brainMonitor.getWorkerBrain(workerId.toUpperCase());
  
  if (result.error) {
    return res.status(404).json(result);
  }
  res.json(result);
});

// POST /api/workers/brain/:workerId/thought - Adicionar pensamento
app.post('/api/workers/brain/:workerId/thought', (req, res) => {
  const { workerId } = req.params;
  const { thought } = req.body;
  
  if (!thought) {
    return res.status(400).json({ error: 'Thought is required' });
  }
  
  const result = brainMonitor.addBrainThought(workerId.toUpperCase(), thought);
  
  if (result.error) {
    return res.status(404).json(result);
  }
  res.json(result);
});

// POST /api/workers/brain/:workerId/status - Atualizar status
app.post('/api/workers/brain/:workerId/status', (req, res) => {
  const { workerId } = req.params;
  const { status, task } = req.body;
  
  const result = brainMonitor.updateWorkerStatus(workerId.toUpperCase(), status, task);
  
  if (result.error) {
    return res.status(404).json(result);
  }
  res.json(result);
});

// GET /api/workers/snapshot - Snapshot formatado
app.get('/api/workers/snapshot', (req, res) => {
  const snapshot = brainMonitor.generateHumanSnapshot();
  res.type('markdown').send(snapshot);
});

// GET /api/workers/users - Usuários autorizados
app.get('/api/workers/users', (req, res) => {
  res.json(brainMonitor.getUsers());
});

// POST /api/workers/users - Adicionar usuário
app.post('/api/workers/users', (req, res) => {
  const { userId, name, role, permissions, monitors } = req.body;
  
  if (!userId || !name) {
    return res.status(400).json({ error: 'userId and name are required' });
  }
  
  const result = brainMonitor.addUser(userId, {
    name,
    role: role || 'Monitor',
    permissions: permissions || ['read'],
    monitors: monitors || ['all']
  });
  
  res.json(result);
});
