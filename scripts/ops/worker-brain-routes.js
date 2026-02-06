/**
 * 🌐 API ROUTES - Worker Brain Monitor
 * Endpoints para integrar com API HUB
 */

const { createMonitor } = require('./worker-brain-monitor');

const monitor = createMonitor();

// ==================== ROUTES ====================

const routes = {
  /**
   * GET /api/workers/brain
   * Obter brain completo de todos os workers
   */
  'GET /api/workers/brain': (req, res) => {
    const status = monitor.getAllWorkersStatus();
    return {
      success: true,
      data: status
    };
  },
  
  /**
   * GET /api/workers/brain/:workerId
   * Obter brain de um worker específico
   */
  'GET /api/workers/brain/:workerId': (req, res) => {
    const { workerId } = req.params;
    const brain = monitor.getWorkerBrain(workerId.toUpperCase());
    
    if (brain.error) {
      return { success: false, error: brain.error };
    }
    
    return { success: true, data: brain };
  },
  
  /**
   * POST /api/workers/brain/:workerId/thought
   * Adicionar pensamento ao brain de um worker
   */
  'POST /api/workers/brain/:workerId/thought': (req, res) => {
    const { workerId } = req.params;
    const { thought } = req.body;
    
    if (!thought) {
      return { success: false, error: 'Thought is required' };
    }
    
    const result = monitor.addBrainThought(workerId.toUpperCase(), thought);
    
    if (result.error) {
      return { success: false, error: result.error };
    }
    
    return { success: true, data: result };
  },
  
  /**
   * POST /api/workers/brain/:workerId/status
   * Atualizar status de um worker
   */
  'POST /api/workers/brain/:workerId/status': (req, res) => {
    const { workerId } = req.params;
    const { status, task } = req.body;
    
    const result = monitor.updateWorkerStatus(workerId.toUpperCase(), status, task);
    
    if (result.error) {
      return { success: false, error: result.error };
    }
    
    return { success: true, data: result };
  },
  
  /**
   * POST /api/workers/brain/:workerId/metric
   * Atualizar métrica de um worker
   */
  'POST /api/workers/brain/:workerId/metric': (req, res) => {
    const { workerId } = req.params;
    const { metric, value } = req.body;
    
    const result = monitor.updateWorkerMetric(workerId.toUpperCase(), metric, value);
    
    if (result.error) {
      return { success: false, error: result.error };
    }
    
    return { success: true, data: result };
  },
  
  /**
   * GET /api/workers/snapshot
   * Gerar snapshot formatado para humanos
   */
  'GET /api/workers/snapshot': (req, res) => {
    const snapshot = monitor.generateHumanSnapshot();
    
    return {
      success: true,
      data: {
        format: 'markdown',
        content: snapshot
      }
    };
  },
  
  /**
   * GET /api/workers/users
   * Obter usuários autorizados
   */
  'GET /api/workers/users': (req, res) => {
    return { success: true, data: monitor.getUsers() };
  },
  
  /**
   * POST /api/workers/users
   * Adicionar novo usuário
   */
  'POST /api/workers/users': (req, res) => {
    const { userId, name, role, permissions, monitors } = req.body;
    
    if (!userId || !name) {
      return { success: false, error: 'userId and name are required' };
    }
    
    const result = monitor.addUser(userId, {
      name,
      role: role || 'Monitor',
      permissions: permissions || ['read'],
      monitors: monitors || ['all']
    });
    
    return { success: true, data: result };
  },
  
  /**
   * POST /api/workers/simulate/:workerId
   * Simular atividade de worker (para teste)
   */
  'POST /api/workers/simulate/:workerId': (req, res) => {
    const { workerId } = req.params;
    const result = monitor.simulateWorkerActivity(workerId.toUpperCase());
    
    return { success: true, data: result };
  }
};

// ==================== EXPORTS ====================

module.exports = {
  routes,
  monitor
};
