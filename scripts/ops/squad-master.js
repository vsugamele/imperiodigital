/**
 * 🎖️ SQUAD MASTER CONTROLLER
 * 
 * O Maestro do Ecossistema OpenClaw.
 * Responsável por:
 * 1. Boot infra (API Hub, Watchdog)
 * 2. Sincronia de Inteligência (Funil, A/B)
 * 3. Orquestração de Workers
 */

const { exec, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const SCRIPTS_DIR = path.join(__dirname, '..');
const OPS_DIR = __dirname;

const SERVICES = [
    { name: 'API HUB', script: path.join(OPS_DIR, 'api-hub.js'), port: 3001 },
    { name: 'WATCHDOG', script: path.join(OPS_DIR, 'self-healing-watchdog.js') }
];

const WORKERS = [
    { name: 'RELIGION_SCHEDULER', script: path.join(SCRIPTS_DIR, 'religion-scheduler.js') },
    { name: 'IGAMING_TEO', script: path.join(SCRIPTS_DIR, 'igaming-video.js'), args: ['teo'] },
    { name: 'IGAMING_LAISE', script: path.join(SCRIPTS_DIR, 'igaming-video.js'), args: ['laise'] }
];

async function boot() {
    console.log('\n🎖️  INICIANDO SQUAD MASTER CONTROLLER\n');

    // 1. Iniciar Serviços de Infra
    for (const service of SERVICES) {
        console.log(`🚀 [INFRA] Iniciando ${service.name}...`);
        const proc = spawn('node', [service.script], {
            detached: true,
            stdio: 'ignore'
        });
        proc.unref();
        await sleep(2000);
    }

    // 2. Inicializar Inteligência (Fases e A/B)
    console.log('🧠 [INTEL] Sincronizando Motores de Inteligência...');
    try {
        exec(`node ${path.join(OPS_DIR, 'init-ab-test.js')}`);
        exec(`node ${path.join(OPS_DIR, 'init-religion-ab-test.js')}`);
        exec(`node ${path.join(OPS_DIR, 'init-funnel-phases.js')}`);
        console.log('✅ Matrizes de inteligência prontas.');
    } catch (e) {
        console.error('❌ Falha na inicialização da inteligência:', e.message);
    }

    // 3. Orquestrar Workers (Modo Sequencial para teste)
    console.log('\n🤖 [WORKERS] Iniciando rodada de produção...\n');
    for (const worker of WORKERS) {
        console.log(`📡 [WORKER] Executando ${worker.name}...`);
        try {
            const args = worker.args || [];
            const result = execSync(`node "${worker.script}" ${args.join(' ')}`, {
                encoding: 'utf8',
                stdio: 'inherit'
            });
        } catch (e) {
            console.error(`⚠️  Falha no worker ${worker.name}:`, e.message);
        }
    }

    console.log('\n🏁 SQUAD MASTER: Rodada finalizada. Serviços em background continuam ativos.');
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const { execSync } = require('child_process');

// Boot
boot().catch(console.error);
