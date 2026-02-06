/**
 * 🌐 API ROUTES - Worker Minds para Command Center
 * 
 * Endpoints para a aba "Mentes" do Empire Command Center
 */

const { getWorkerMinds, getWorkerMind, updateWorkerBrain, getMindsSnapshot, MINDS_CONFIG } = require('./worker-minds-api');

// ==================== ROTAS ====================

const routes = {
  /**
   * GET /api/workers/minds
   * Obter lista de todos os minds
   */
  'GET /api/workers/minds': (req, res) => {
    const minds = getWorkerMinds();
    
    return {
      success: true,
      data: {
        minds,
        count: minds.length,
        online: minds.filter(m => m.status === 'working').length,
        idle: minds.filter(m => m.status === 'idle').length
      }
    };
  },
  
  /**
   * GET /api/workers/minds/:workerId
   * Obter mind específica
   */
  'GET /api/workers/minds/:workerId': (req, res) => {
    const { workerId } = req.params;
    const mind = getWorkerMind(workerId);
    
    if (mind.error) {
      return { success: false, error: mind.error };
    }
    
    return { success: true, data: mind };
  },
  
  /**
   * POST /api/workers/minds/:workerId
   * Atualizar brain de um worker
   */
  'POST /api/workers/minds/:workerId': (req, res) => {
    const { workerId } = req.params;
    const { thought, task, status } = req.body;
    
    const result = updateWorkerBrain(workerId, thought, task);
    
    if (status) {
      const { createMonitor } = require('./worker-brain-monitor');
      const monitor = createMonitor();
      monitor.updateWorkerStatus(workerId.toUpperCase(), status, task);
    }
    
    return result;
  },
  
  /**
   * GET /api/workers/minds/snapshot
   * Snapshot formatado para humanos
   */
  'GET /api/workers/minds/snapshot': (req, res) => {
    const snapshot = getMindsSnapshot();
    
    return {
      success: true,
      data: {
        format: 'markdown',
        content: snapshot
      }
    };
  },
  
  /**
   * GET /api/workers/minds/config
   * Obter configuração dos minds
   */
  'GET /api/workers/minds/config': (req, res) => {
    return {
      success: true,
      data: {
        workers: Object.keys(MINDS_CONFIG.WORKER_TO_MIND),
        available_skills: [
          'Automação', 'Coordenação', 'Análise', 'Comunicação',
          'Growth Hacking', 'Criação de Reels', 'Engajamento',
          'Copywriting', 'Headlines', 'Storytelling', 'Persuasão',
          'Criação de Ofertas', 'Pricing', 'Upsells', 'Conversão'
        ]
      }
    };
  }
};

// ==================== EXPORTS ====================

module.exports = {
  routes
};
