/**
 * 🧠 WORKER BRAIN API SERVER
 * Servidor standalone para monitorar workers
 */

const express = require('express');
const { createMonitor } = require('./worker-brain-monitor');

const app = express();
const PORT = 3003;

const monitor = createMonitor();

// Middleware
app.use(express.json());

// ==================== ROTAS ====================

// GET /api/workers/brain - Status completo
app.get('/api/workers/brain', (req, res) => {
  const result = monitor.getAllWorkersStatus();
  res.json(result);
});

// GET /api/workers/brain/:workerId - Brain específico
app.get('/api/workers/brain/:workerId', (req, res) => {
  const { workerId } = req.params;
  const result = monitor.getWorkerBrain(workerId.toUpperCase());
  
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
  
  const result = monitor.addBrainThought(workerId.toUpperCase(), thought);
  
  if (result.error) {
    return res.status(404).json(result);
  }
  res.json(result);
});

// POST /api/workers/brain/:workerId/status - Atualizar status
app.post('/api/workers/brain/:workerId/status', (req, res) => {
  const { workerId } = req.params;
  const { status, task } = req.body;
  
  const result = monitor.updateWorkerStatus(workerId.toUpperCase(), status, task);
  
  if (result.error) {
    return res.status(404).json(result);
  }
  res.json(result);
});

// POST /api/workers/brain/:workerId/metric - Atualizar métrica
app.post('/api/workers/brain/:workerId/metric', (req, res) => {
  const { workerId } = req.params;
  const { metric, value } = req.body;
  
  const result = monitor.updateWorkerMetric(workerId.toUpperCase(), metric, value);
  
  if (result.error) {
    return res.status(404).json(result);
  }
  res.json(result);
});

// GET /api/workers/snapshot - Snapshot formatado
app.get('/api/workers/snapshot', (req, res) => {
  const snapshot = monitor.generateHumanSnapshot();
  res.type('markdown').send(snapshot);
});

// GET /api/workers/users - Usuários autorizados
app.get('/api/workers/users', (req, res) => {
  res.json(monitor.getUsers());
});

// POST /api/workers/users - Adicionar usuário
app.post('/api/workers/users', (req, res) => {
  const { userId, name, role, permissions, monitors } = req.body;
  
  if (!userId || !name) {
    return res.status(400).json({ error: 'userId and name are required' });
  }
  
  const result = monitor.addUser(userId, {
    name,
    role: role || 'Monitor',
    permissions: permissions || ['read'],
    monitors: monitors || ['all']
  });
  
  res.json(result);
});

// POST /api/workers/simulate/:workerId - Simular atividade
app.post('/api/workers/simulate/:workerId', (req, res) => {
  const { workerId } = req.params;
  const result = monitor.simulateWorkerActivity(workerId.toUpperCase());
  res.json(result);
});

// GET /health - Healthcheck
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'worker-brain-monitor',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// ==================== INICIAR ====================

app.listen(PORT, () => {
  console.log(`🧠 WORKER BRAIN API rodando em http://localhost:${PORT}`);
  console.log('📡 Endpoints:');
  console.log('   GET  /api/workers/brain');
  console.log('   GET  /api/workers/brain/:workerId');
  console.log('   POST /api/workers/brain/:workerId/thought');
  console.log('   POST /api/workers/brain/:workerId/status');
  console.log('   GET  /api/workers/snapshot');
  console.log('   GET  /api/workers/users');
  console.log('   POST /api/workers/users');
  console.log('   POST /api/workers/simulate/:workerId');
  console.log('   GET  /health');
});

// CLI
if (require.main === module) {
  // Já iniciou acima
}
