/**
 * 📊 METRICS COLLECTOR
 * Coleta métricas do ecossistema e salva em memory/
 */

const fs = require('fs');
const path = require('path');

const MEMORY_DIR = path.join(__dirname, '..', 'memory');
const METRICS_FILE = path.join(MEMORY_DIR, 'metrics.json');

// Métricas a coletar
const METRICS_SOURCES = {
  posts: 'results/posting-log-v2.csv',
  memory: 'memory/*.md',
  tasks: 'ops-dashboard/tasks.json',
  petselect: 'petselectuk/outputs'
};

async function collectMetrics() {
  const metrics = {
    timestamp: new Date().toISOString(),
    posts: { total: 0, scheduled: 0, failed: 0, today: 0 },
    tasks: { backlog: 0, blocked: 0, doing: 0, done: 0 },
    profiles: {},
    costs: { total: 0, today: 0 }
  };

  // 1. Contar posts do CSV
  try {
    const csvPath = path.resolve(__dirname, '..', '..', 'results', 'posting-log-v2.csv');
    if (fs.existsSync(csvPath)) {
      const csv = fs.readFileSync(csvPath, 'utf8');
      const lines = csv.split('\n').filter(l => l.trim());
      
      metrics.posts.total = Math.max(0, lines.length - 1);
      
      const today = new Date().toISOString().split('T')[0];
      let scheduled = 0, failed = 0, todayCount = 0;
      
      lines.slice(1).forEach(line => {
        if (!line.trim()) return;
        const cols = line.split(',');
        if (cols.length < 9) return;
        
        const status = cols[8];
        const date = cols[10]?.split('T')[0];
        
        if (status === 'scheduled') scheduled++;
        if (status === 'failed') failed++;
        if (date === today) todayCount++;
        
        const profile = cols[1];
        if (profile && profile !== 'petselectuk') {
          metrics.profiles[profile] = (metrics.profiles[profile] || 0) + 1;
        }
      });
      
      metrics.posts.scheduled = scheduled;
      metrics.posts.failed = failed;
      metrics.posts.today = todayCount;
    }
  } catch (e) {
    console.error('Error reading posts CSV:', e.message);
  }

  // 2. Contar tarefas
  try {
    const tasksPath = path.resolve(__dirname, '..', '..', 'ops-dashboard', 'tasks.json');
    if (fs.existsSync(tasksPath)) {
      const tasks = JSON.parse(fs.readFileSync(tasksPath, 'utf8'));
      tasks.tasks.forEach(t => {
        if (t.status === 'backlog') metrics.tasks.backlog++;
        else if (t.status === 'blocked') metrics.tasks.blocked++;
        else if (t.status === 'doing') metrics.tasks.doing++;
        else if (t.status === 'done') metrics.tasks.done++;
      });
    }
  } catch (e) {
    console.error('Error reading tasks:', e.message);
  }

  // 3. Salvar métricas
  fs.writeFileSync(METRICS_FILE, JSON.stringify(metrics, null, 2));
  console.log('📊 Metrics collected:', JSON.stringify(metrics, null, 2));
  
  return metrics;
}

// CLI
if (require.main === module) {
  collectMetrics().catch(console.error);
}

module.exports = { collectMetrics };
