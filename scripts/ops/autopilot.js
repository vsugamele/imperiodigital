/**
 * 🤖 AUTOPILOT - Orquestrador de Automação
 * Roda a cada 6 horas para manter o ecossistema funcionando
 */

const fs = require('fs');
const path = require('path');
const { collectMetrics } = require('./metrics-collector');
const { runReflection } = require('./reflection-generator');
const { sendAlert, checkFailuresAndAlert } = require('./alerts-sender');

const ACTIVITY_LOG = path.join(__dirname, '..', 'ops-dashboard', 'tmp', 'autopilot-activity.json');

async function runAutopilot() {
  const startTime = Date.now();
  console.log('🤖 AUTOPILOT starting...');
  
  const actions = [];
  let hasErrors = false;
  
  try {
    // 1. Coletar métricas
    console.log('📊 Step 1: Collecting metrics...');
    const metrics = await collectMetrics();
    actions.push('Métricas coletadas');
    
    // 2. Verificar falhas e alertar se necessário
    console.log('🚨 Step 2: Checking for failures...');
    await checkFailuresAndAlert();
    actions.push('Verificação de falhas OK');
    
    // 3. Gerar reflexão
    console.log('🌅 Step 3: Generating reflection...');
    await runReflection();
    actions.push('Reflexão gerada');
    
    // 4. Verificar tarefas em progresso (>24h sem progresso)
    console.log('📋 Step 4: Checking blocked tasks...');
    const blockedTasks = await checkBlockedTasks();
    if (blockedTasks.length > 0) {
      actions.push(`${blockedTasks.length} tarefas movidas para blocked`);
    }
    
    // 5. Reportar tarefas blocked ao Vinicius
    console.log('📝 Step 5: Reporting blocked tasks...');
    const allBlocked = getAllBlockedTasks();
    if (allBlocked.length > 0) {
      await reportBlockedTasks(allBlocked);
    }
    
    // 6. Log de atividade
    const duration = Date.now() - startTime;
    updateActivityLog({
      lastAction: `AUTOPILOT: ${actions.join(', ')}`,
      status: 'standby',
      nextRun: new Date(Date.now() + (6 * 60 * 60 * 1000)).toISOString(),
      lastUpdate: new Date().toISOString(),
      backlogCount: metrics.tasks.backlog,
      blockedCount: allBlocked.length,
      doneCount: metrics.tasks.done,
      duration: `${duration}ms`,
      blockedTasks: allBlocked.map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
        blockedFor: extractBlockedInfo(t),
        priority: t.priority
      }))
    });
    
    console.log(`✅ AUTOPILOT done in ${duration}ms`);
    
  } catch (e) {
    hasErrors = true;
    console.error('❌ AUTOPILOT error:', e.message);
    
    await sendAlert(
      'PIPELINE_FAILURE',
      'Autopilot encontrou um erro',
      e.message
    );
  }
  
  return { success: !hasErrors, actions };
}

function extractBlockedInfo(task) {
  // Extrai o que é necessário do input
  const notes = task.notes || '';
  const match = notes.match(/BLOCKED:\s*(.+?)(?:\n|$)/i);
  if (match) return match[1].trim();
  
  // Se tem labels de paused
  if (task.labels?.includes('paused')) {
    return 'Projeto em pausa - aguardar despause';
  }
  
  return 'Aguardando input ou definição';
}

function getAllBlockedTasks() {
  const tasksPath = path.join(__dirname, '..', 'ops-dashboard', 'tasks.json');
  
  if (!fs.existsSync(tasksPath)) return [];
  
  const data = JSON.parse(fs.readFileSync(tasksPath, 'utf8'));
  
  return data.tasks.filter(task => task.status === 'blocked');
}

async function reportBlockedTasks(tasks) {
  const blockedList = tasks.map(t => {
    return `🔒 **${t.title}**
   📋 ${t.description}
   ❓ ${extractBlockedInfo(t)}
   ${t.priority === 'high' ? '🔥 Priority: HIGH' : ''}
`;
  }).join('\n');
  
  const message = `🚫 **TAREFAS BLOCKED - PRECISAM DO VINICIUS**

${blockedList}

**Total:** ${tasks.length} tarefas bloqueadas

Para desbloquear: Responda aqui qual tarefa quer resolver primeiro, ou me passe o input necessário.`;

  await sendAlert(
    'TASK_BLOCKED',
    `${tasks.length} tarefas bloqueadas precisam do seu input`,
    message
  );
}

async function checkBlockedTasks() {
  const tasksPath = path.join(__dirname, '..', 'ops-dashboard', 'tasks.json');
  
  if (!fs.existsSync(tasksPath)) return [];
  
  const data = JSON.parse(fs.readFileSync(tasksPath, 'utf8'));
  const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
  const moved = [];
  
  data.tasks.forEach(task => {
    if (task.status === 'doing') {
      const updatedAt = new Date(task.updatedAt).getTime();
      
      if (updatedAt < oneDayAgo) {
        if (task.labels?.includes('blocked')) {
          task.status = 'blocked';
          task.notes = `${task.notes}\n${new Date().toISOString()}: Movido para blocked (>24h sem progresso)`;
          moved.push(task);
        } else if (task.labels?.includes('simple')) {
          task.status = 'done';
          task.notes = `${task.notes}\n${new Date().toISOString()}: Concluído automaticamente`;
          moved.push(task);
        }
      }
    }
  });
  
  if (moved.length > 0) {
    fs.writeFileSync(tasksPath, JSON.stringify(data, null, 2));
  }
  
  return moved;
}

function updateActivityLog(state) {
  fs.writeFileSync(ACTIVITY_LOG, JSON.stringify(state, null, 2));
}

// CLI
if (require.main === module) {
  // Se args, pode ser só report
  if (process.argv.includes('--report')) {
    getAllBlockedTasks().then(tasks => {
      console.log('\n🚫 TAREFAS BLOCKED:\n');
      tasks.forEach(t => {
        console.log(`🔒 ${t.title}`);
        console.log(`   ${t.description}`);
        console.log(`   ❓ ${extractBlockedInfo(t)}\n`);
      });
    });
  } else {
    runAutopilot()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  }
}

module.exports = { runAutopilot, checkBlockedTasks, getAllBlockedTasks, reportBlockedTasks };
