/**
 * 🌐 MINDS API ROUTES
 * 
 * Endpoints para o Command Center integrar Workers + Gurus
 */

const { getAllMinds, getMind, getWorkers, getGurus, WORKERS_DATA, GURUS_DATA } = require('./minds-api');

// ==================== ROUTES ====================

const routes = {
  /**
   * GET /api/intel/minds
   * Obter todos os minds (workers + gurus)
   */
  'GET /api/intel/minds': (req, res) => {
    const minds = getAllMinds();
    const workers = getWorkers();
    const gurus = getGurus();
    
    return {
      ok: true,
      minds: minds,
      workers: workers.map(w => ({
        id: w.id,
        name: w.name,
        role: w.role,
        type: 'worker',
        apex_score: w.apex_score,
        top_skill: w.top_skill,
        status: w.status,
        current_task: w.current_task,
        neural_data_files: w.neural_data_files
      })),
      gurus: gurus.map(g => ({
        id: g.id,
        name: g.name,
        role: g.role,
        type: 'guru',
        apex_score: g.apex_score,
        top_skill: g.top_skill,
        signature_technique: g.signature_technique,
        neural_data_files: g.neural_data_files
      })),
      summary: {
        total_minds: minds.length,
        workers_online: workers.filter(w => w.status === 'working').length,
        workers_idle: workers.filter(w => w.status === 'idle').length,
        gurus_available: gurus.filter(g => g.status === 'available').length
      }
    };
  },
  
  /**
   * GET /api/intel/minds/:id
   * Obter mind específica
   */
  'GET /api/intel/minds/:id': (req, res) => {
    const { id } = req.params;
    const mind = getMind(id);
    
    if (mind.error) {
      return { ok: false, error: mind.error };
    }
    
    return { ok: true, mind };
  },
  
  /**
   * GET /api/intel/minds/workers
   * Obter só workers
   */
  'GET /api/intel/minds/workers': (req, res) => {
    const workers = getWorkers();
    
    return {
      ok: true,
      workers: workers.map(w => ({
        id: w.id,
        name: w.name,
        role: w.role,
        apex_score: w.apex_score,
        top_skill: w.top_skill,
        status: w.status,
        current_task: w.current_task,
        neural_data_files: w.neural_data_files,
        about: w.about,
        dna: w.dna,
        proficiencies: w.proficiencies
      }))
    };
  },
  
  /**
   * GET /api/intel/minds/gurus
   * Obter só gurus
   */
  'GET /api/intel/minds/gurus': (req, res) => {
    const gurus = getGurus();
    
    return {
      ok: true,
      gurus: gurus.map(g => ({
        id: g.id,
        name: g.name,
        role: g.role,
        apex_score: g.apex_score,
        top_skill: g.top_skill,
        signature_technique: g.signature_technique,
        famous_quote: g.famous_quote,
        neural_data_files: g.neural_data_files,
        about: g.about,
        dna: g.dna,
        proficiencies: g.proficiencies
      }))
    };
  },
  
  /**
   * GET /api/intel/minds/suggestions/:type
   * Sugestões de gurus para tipo de copy
   */
  'GET /api/intel/minds/suggestions/:type': (req, res) => {
    const { type } = req.params;
    
    const suggestions = {
      headline: {
        gurus: ['carlton', 'kennedy', 'fascinations'],
        reason: 'Headlines diretas, authority e hooks curtos'
      },
      email: {
        gurus: ['halbert', 'makepeace', 'sugarman'],
        reason: 'Curiosidade, emoção e fluxo natural'
      },
      salesletter: {
        gurus: ['kennedy', 'bencivenga', 'carlton'],
        reason: 'Prova lógica, autoridade e confronto'
      },
      vsl: {
        gurus: ['sugarman', 'makepeace', 'kennedy'],
        reason: 'Stream of consciousness, emoção e neurológica'
      },
      social: {
        gurus: ['fascinations', 'carlton', 'makepeace'],
        reason: 'Fascinations, direto e urgência'
      },
      offer: {
        gurus: ['kennedy', 'hormozi', 'bencivenga'],
        reason: 'Authority, pricing e prova lógica'
      }
    };
    
    const suggestion = suggestions[type.toLowerCase()] || suggestions.headline;
    
    const gurus = getGurus().filter(g => suggestion.gurus.includes(g.id));
    
    return {
      ok: true,
      type,
      suggestion,
      gurus: gurus.map(g => ({
        id: g.id,
        name: g.name,
        role: g.role,
        apex_score: g.apex_score,
        signature_technique: g.signature_technique
      }))
    };
  },
  
  /**
   * GET /api/intel/minds/summary
   * Resumo dos minds
   */
  'GET /api/intel/minds/summary': (req, res) => {
    const workers = getWorkers();
    const gurus = getGurus();
    
    return {
      ok: true,
      data: {
        workers: {
          total: workers.length,
          online: workers.filter(w => w.status === 'working').length,
          idle: workers.filter(w => w.status === 'idle').length,
          list: workers.map(w => ({
            id: w.id,
            name: w.name,
            status: w.status,
            current_task: w.current_task
          }))
        },
        gurus: {
          total: gurus.length,
          available: gurus.length,
          list: gurus.map(g => ({
            id: g.id,
            name: g.name,
            role: g.role,
            apex_score: g.apex_score
          }))
        }
      }
    };
  }
};

// ==================== EXPORTS ====================

module.exports = {
  routes
};
