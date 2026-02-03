/**
 * Pipeline Health Check
 * 
 * Verifica o status de execução dos pipelines de cada produto:
 * - Downloads de imagens
 * - Geração Gemini
 * - Criação de vídeos (FFmpeg)
 * - Uploads para Drive
 * - Agendamentos no Upload-Post
 * 
 * Uso: node scripts/pipeline-health-check.js
 */

const fs = require('fs');
const path = require('path');

// Configuração
const CONFIG = {
  profiles: ['teo', 'jonathan', 'laise', 'pedro'],
  imagesDir: path.join(__dirname, '..', 'images', 'generated'),
  videosDir: path.join(__dirname, '..', 'videos'),
  resultsDir: path.join(__dirname, '..', 'results'),
  postingLogCsv: path.join(__dirname, '..', 'results', 'posting-log-v2.csv'),
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY
};

// Supabase client (opcional - só funciona se @supabase/supabase-js estiver instalado)
let supabase = null;
try {
  const { createClient } = require('@supabase/supabase-js');
  if (CONFIG.supabaseUrl && CONFIG.supabaseKey) {
    supabase = createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey);
  }
} catch (e) {
  console.log('ℹ️  Supabase não disponível (execute npm install @supabase/supabase-js para habilitar)');
}

/**
 * Conta arquivos em diretório com filtro de padrão
 */
function countFiles(dir, pattern) {
  try {
    if (!fs.existsSync(dir)) return { count: 0, newest: null };
    const files = fs.readdirSync(dir);
    const filtered = pattern ? files.filter(f => pattern.test(f)) : files;
    const withMtime = filtered.map(f => ({
      name: f,
      mtime: fs.statSync(path.join(dir, f)).mtimeMs
    })).sort((a, b) => b.mtime - a.mtime);
    return { count: filtered.length, newest: withMtime[0] };
  } catch (e) {
    return { count: 0, newest: null, error: e.message };
  }
}

/**
 * Parse simples de CSV (sem dependências)
 */
function parseCsv(content) {
  const lines = content.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  
  return lines.slice(1).map(line => {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim().replace(/^"|"$/g, ''));
    
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || '';
    });
    return row;
  });
}

/**
 * Analisa posting-log-v2.csv para um perfil
 */
function analyzePostingLogSync(profile) {
  const results = {
    total: 0,
    scheduled: 0,
    posted: 0,
    confirmed: 0,
    failed: 0,
    in_progress: 0,
    lastRun: null,
    errors: []
  };

  if (!fs.existsSync(CONFIG.postingLogCsv)) {
    return results;
  }

  try {
    const content = fs.readFileSync(CONFIG.postingLogCsv, 'utf8');
    const rows = parseCsv(content);
    
    for (const row of rows) {
      if (row.product?.toLowerCase() === profile.toLowerCase()) {
        results.total++;
        const status = row.status?.toLowerCase() || '';
        
        if (status === 'scheduled') results.scheduled++;
        else if (status === 'posted') results.posted++;
        else if (status === 'confirmed') results.confirmed++;
        else if (status === 'failed') {
          results.failed++;
          if (row.raw_json) {
            try {
              const raw = JSON.parse(row.raw_json);
              if (raw.error) results.errors.push(raw.error);
            } catch {}
          }
        }
        else if (status === 'in_progress') results.in_progress++;

        if (row.scheduled_at) {
          const rowDate = new Date(row.scheduled_at);
          if (!isNaN(rowDate)) {
            if (!results.lastRun || rowDate > results.lastRun) {
              results.lastRun = rowDate;
            }
          }
        }
      }
    }
  } catch (e) {
    console.log(`⚠️  Error reading CSV: ${e.message}`);
  }

  return results;
}

/**
 * Determina status do pipeline baseado nos steps
 */
function calculatePipelineStatus(steps) {
  const { download, generate, video, upload, schedule } = steps;
  
  // Se todos estão OK
  if (download.ok && generate.ok && video.ok && upload.ok && schedule.ok) {
    return 'completed';
  }
  
  // Se nenhum passo começou
  if (!download.started && !generate.started && !video.started) {
    return 'pending';
  }
  
  // Se algum falhou
  if (download.error || generate.error || video.error || upload.error) {
    return 'failed';
  }
  
  // Se está em progresso
  return 'running';
}

/**
 * Verifica saúde do pipeline para um perfil
 */
function checkProfileHealth(profile) {
  const prefix = profile.toUpperCase() + '_REEL_';
  const re = new RegExp('^' + prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '.*\\.mp4$', 'i');
  const imageRe = new RegExp('^' + profile.toLowerCase() + '_\\d+\\.png$', 'i');

  // Step 1: Downloads de imagens
  const images = countFiles(CONFIG.imagesDir, imageRe);
  const recentImages = countFiles(CONFIG.imagesDir, new RegExp(`${profile.toLowerCase()}_\\d{8,}`));

  // Step 2: Vídeos gerados
  const videos = countFiles(CONFIG.videosDir, re);
  
  // Step 3: Posting log
  const logData = analyzePostingLogSync(profile);

  // Step 4: Verificar se há vídeos recentes (últimas 24h)
  const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
  const hasRecentVideo = videos.newest && videos.newest.mtime > oneDayAgo;

  // Calcular steps
  const steps = {
    download: {
      ok: recentImages.count > 0,
      count: recentImages.count,
      started: recentImages.count > 0,
      error: recentImages.error || null
    },
    generate: {
      ok: images.count > 0,
      count: images.count,
      started: images.count > 0,
      error: images.error || null
    },
    video: {
      ok: videos.count > 0,
      count: videos.count,
      started: videos.count > 0,
      error: videos.error || null
    },
    upload: {
      ok: videos.count > 0, // Se há vídeos, foram upados
      count: videos.count,
      started: videos.count > 0,
      error: null
    },
    schedule: {
      ok: logData.scheduled > 0 || logData.confirmed > 0,
      count: logData.scheduled + logData.confirmed,
      scheduled: logData.scheduled,
      confirmed: logData.confirmed,
      failed: logData.failed,
      started: logData.total > 0,
      errors: logData.errors
    }
  };

  // Determinar status geral
  const status = calculatePipelineStatus(steps);

  // Calcular expected (6 posts por dia)
  const expectedToday = logData.scheduled + logData.confirmed + logData.posted + 
    logData.in_progress + logData.failed;

  return {
    profile,
    status,
    lastRun: logData.lastRun,
    hasRecentVideo,
    expectedPerDay: 6,
    generatedToday: expectedToday,
    steps,
    logData,
    checkedAt: new Date().toISOString()
  };
}

/**
 * Salva resultado no Supabase
 */
async function saveToSupabase(profileHealth) {
  if (!supabase) {
    return;
  }

  try {
    const { error } = await supabase
      .from('pipeline_runs')
      .upsert({
        product: profileHealth.profile,
        run_at: new Date().toISOString(),
        status: profileHealth.status,
        step_download_imgs: profileHealth.steps.download.count,
        step_generate: profileHealth.steps.generate.count,
        step_video: profileHealth.steps.video.count,
        step_upload: profileHealth.steps.upload.count,
        step_schedule: profileHealth.steps.schedule.count,
        errors: profileHealth.steps.schedule.errors,
        duration_ms: null
      }, {
        onConflict: 'product,run_at'
      });

    if (error) throw error;
    console.log(`✅ Saved ${profileHealth.profile} to Supabase`);
  } catch (e) {
    console.log(`❌ Error saving ${profileHealth.profile}:`, e.message);
  }
}

/**
 * Gera relatório JSON
 */
function generateReport(allHealth) {
  const summary = {
    generatedAt: new Date().toISOString(),
    products: allHealth,
    summary: {
      total: allHealth.length,
      healthy: allHealth.filter(p => p.status === 'completed').length,
      running: allHealth.filter(p => p.status === 'running').length,
      failed: allHealth.filter(p => p.status === 'failed').length,
      pending: allHealth.filter(p => p.status === 'pending').length
    }
  };
  return summary;
}

/**
 * Formata output para console
 */
function printConsoleReport(allHealth, summary) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 PIPELINE HEALTH REPORT');
  console.log('='.repeat(60) + '\n');

  allHealth.forEach(health => {
    const statusEmoji = {
      completed: '✅',
      running: '🔄',
      failed: '❌',
      pending: '⏳'
    }[health.status] || '❓';

    console.log(`${statusEmoji} ${health.profile.toUpperCase()}`);
    console.log(`   Status: ${health.status}`);
    console.log(`   Vídeos hoje: ${health.generatedToday}/${health.expectedPerDay}`);
    console.log(`   Última execução: ${health.lastRun ? new Date(health.lastRun).toLocaleString('pt-BR') : 'N/A'}`);
    
    console.log('   Steps:');
    console.log(`     📥 Imagens: ${health.steps.download.count}`);
    console.log(`     🎨 Gerados: ${health.steps.generate.count}`);
    console.log(`     🎬 Vídeos: ${health.steps.video.count}`);
    console.log(`     ☁️  Agendados: ${health.steps.schedule.count}`);
    
    if (health.steps.schedule.errors.length > 0) {
      console.log(`     ⚠️  Erros: ${health.steps.schedule.errors.length}`);
      health.steps.schedule.errors.slice(0, 2).forEach(e => console.log(`       - ${e.substring(0, 80)}`));
    }
    
    console.log('');
  });

  console.log('-'.repeat(60));
  console.log(`📈 Resumo: ${summary.healthy} OK | ${summary.running} Rodando | ${summary.failed} Falhou | ${summary.pending} Pendente`);
  console.log('='.repeat(60));
}

async function main() {
  console.log('🔍 Verificando saúde dos pipelines...\n');

  const allHealth = [];
  
  for (const profile of CONFIG.profiles) {
    console.log(`Verificando ${profile}...`);
    const health = checkProfileHealth(profile);
    allHealth.push(health);
    
    // Salvar no Supabase
    await saveToSupabase(health);
  }

  // Gerar e mostrar relatório
  const summary = generateReport(allHealth);
  printConsoleReport(allHealth, summary);

  // Salvar JSON para API
  const reportPath = path.join(CONFIG.resultsDir, 'pipeline-health.json');
  fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2));
  console.log(`\n📁 Relatório salvo em: ${reportPath}`);
}

main().catch(e => {
  console.error('❌ Error:', e);
  process.exit(1);
});
