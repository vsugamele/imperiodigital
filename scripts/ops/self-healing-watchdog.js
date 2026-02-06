/**
 * 🛡️ SELF-HEALING WATCHDOG
 * 
 * Sistema avançado de auto-recuperação com:
 * - Detecção inteligente de falhas
 * - Múltiplas estratégias de recovery
 * - Escalação progressiva
 * - Alertas via Telegram
 * - Telemetria e aprendizado
 * 
 * Parte do Phase 3 do Squad Enhancement.
 */

const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const net = require('net');

// Tenta carregar env do Next.js
try {
    const { loadOpsEnv } = require('../_load-ops-env');
    loadOpsEnv();
} catch (e) { /* ignore */ }

// ==================== CONFIGURAÇÃO ====================

const CONFIG = {
    SERVICES: {
        CLAWDBOT_GATEWAY: {
            name: 'Clawdbot Gateway',
            port: 18789,
            host: '127.0.0.1',
            startCommand: 'clawdbot gateway',
            processPattern: 'clawdbot.*entry.js.*gateway',
            maxRetries: 3,
            retryDelayMs: 2000,
            healthEndpoint: null,
            critical: true
        },
        OPS_DASHBOARD: {
            name: 'Ops Dashboard',
            port: 3000,
            host: '127.0.0.1',
            startCommand: 'npm run dev',
            workDir: 'C:\\Users\\vsuga\\clawd\\ops-dashboard',
            processPattern: 'ops-dashboard.*next.*dev',
            maxRetries: 3,
            retryDelayMs: 3000,
            healthEndpoint: '/api/health',
            critical: false
        },
        WORKER_BRAIN: {
            name: 'Worker Brain Server',
            port: 3001,
            host: '127.0.0.1',
            startCommand: 'node worker-brain-server.js',
            workDir: 'C:\\Users\\vsuga\\clawd\\scripts\\ops',
            processPattern: 'worker-brain-server',
            maxRetries: 2,
            retryDelayMs: 1500,
            healthEndpoint: null,
            critical: false
        },
        GDRIVE_SYNC: {
            name: 'Google Drive Connectivity',
            checkCommand: 'rclone lsf gdrive,root_folder_id=1YWvoRgdzDWLyTzbCYAJqsE8paatIc-rH: --max-depth 1',
            maxRetries: 2,
            retryDelayMs: 5000,
            critical: true
        }
    },

    ESCALATION: {
        LEVELS: ['restart', 'kill_restart', 'reboot_service', 'alert_human'],
        COOLDOWN_MS: 60000,  // 1 min entre tentativas do mesmo nível
        MAX_FAILURES_BEFORE_ALERT: 3
    },

    TELEGRAM: {
        enabled: true,
        chatId: process.env.TELEGRAM_CHAT_ID || null,
        botToken: process.env.TELEGRAM_BOT_TOKEN || null
    },

    LOG_FILE: './logs/self-healing-watchdog.json',
    STATE_FILE: './tmp/watchdog-state.json'
};

// ==================== WATCHDOG ====================

class SelfHealingWatchdog {
    constructor() {
        this.state = this.loadState();
        this.isRunning = false;
    }

    loadState() {
        const stateFile = path.join(__dirname, CONFIG.STATE_FILE);
        if (fs.existsSync(stateFile)) {
            try {
                return JSON.parse(fs.readFileSync(stateFile, 'utf8'));
            } catch (e) {
                return this.getDefaultState();
            }
        }
        return this.getDefaultState();
    }

    getDefaultState() {
        const state = {
            lastCheck: null,
            services: {},
            incidents: [],
            totalRecoveries: 0,
            totalFailures: 0
        };

        for (const serviceId of Object.keys(CONFIG.SERVICES)) {
            state.services[serviceId] = {
                status: 'unknown',
                lastSeen: null,
                failureCount: 0,
                recoveryCount: 0,
                currentEscalationLevel: 0,
                lastEscalation: null
            };
        }

        return state;
    }

    saveState() {
        const stateFile = path.join(__dirname, CONFIG.STATE_FILE);
        const dir = path.dirname(stateFile);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(stateFile, JSON.stringify(this.state, null, 2));
    }

    log(message, level = 'info') {
        const logFile = path.join(__dirname, CONFIG.LOG_FILE);
        const dir = path.dirname(logFile);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        const entry = {
            timestamp: new Date().toISOString(),
            level,
            message
        };

        console.log(`[${level.toUpperCase()}] ${message}`);

        // Append to log file
        let logs = [];
        if (fs.existsSync(logFile)) {
            try {
                logs = JSON.parse(fs.readFileSync(logFile, 'utf8'));
            } catch (e) {
                logs = [];
            }
        }
        logs.push(entry);

        // Keep last 500 entries
        if (logs.length > 500) {
            logs = logs.slice(-500);
        }

        fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
    }

    /**
     * Check if a port is reachable
     */
    async checkPort(host, port, timeoutMs = 500) {
        return new Promise((resolve) => {
            const socket = new net.Socket();
            let resolved = false;

            socket.setTimeout(timeoutMs);

            socket.on('connect', () => {
                resolved = true;
                socket.destroy();
                resolve(true);
            });

            socket.on('timeout', () => {
                if (!resolved) {
                    resolved = true;
                    socket.destroy();
                    resolve(false);
                }
            });

            socket.on('error', () => {
                if (!resolved) {
                    resolved = true;
                    socket.destroy();
                    resolve(false);
                }
            });

            socket.connect(port, host);
        });
    }

    /**
     * Check health of a service
     */
    async checkService(serviceId) {
        const service = CONFIG.SERVICES[serviceId];
        if (!service) return { healthy: false, error: 'Unknown service' };

        // Command check (e.g. rclone)
        if (service.checkCommand) {
            return new Promise((resolve) => {
                exec(service.checkCommand, (error) => {
                    if (error) {
                        resolve({ healthy: false, error: `Command failed: ${error.message.substring(0, 50)}` });
                    } else {
                        resolve({ healthy: true });
                    }
                });
            });
        }

        // Port check
        const portReachable = await this.checkPort(service.host, service.port);

        if (!portReachable) {
            return { healthy: false, error: 'Port not reachable' };
        }

        // Optional HTTP health check
        if (service.healthEndpoint) {
            try {
                const url = `http://${service.host}:${service.port}${service.healthEndpoint}`;
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 2000);

                const response = await fetch(url, { signal: controller.signal });
                clearTimeout(timeout);

                if (!response.ok) {
                    return { healthy: false, error: `Health endpoint returned ${response.status}` };
                }
            } catch (e) {
                return { healthy: false, error: `Health check failed: ${e.message}` };
            }
        }

        return { healthy: true };
    }

    /**
     * Attempt to recover a failed service
     */
    async recoverService(serviceId) {
        const service = CONFIG.SERVICES[serviceId];
        const serviceState = this.state.services[serviceId];

        // Check cooldown
        if (serviceState.lastEscalation) {
            const elapsed = Date.now() - new Date(serviceState.lastEscalation).getTime();
            if (elapsed < CONFIG.ESCALATION.COOLDOWN_MS) {
                this.log(`[${serviceId}] In cooldown, skipping recovery attempt`, 'warn');
                return { success: false, reason: 'cooldown' };
            }
        }

        const level = serviceState.currentEscalationLevel;
        const action = CONFIG.ESCALATION.LEVELS[level] || 'alert_human';

        this.log(`[${serviceId}] Attempting recovery at level ${level}: ${action}`, 'warn');

        let success = false;

        switch (action) {
            case 'restart':
                success = await this.attemptRestart(serviceId, service);
                break;

            case 'kill_restart':
                await this.killProcess(service.processPattern);
                await this.sleep(500);
                success = await this.attemptRestart(serviceId, service);
                break;

            case 'reboot_service':
                await this.killProcess(service.processPattern);
                await this.sleep(1000);
                success = await this.attemptRestart(serviceId, service);
                break;

            case 'alert_human':
                await this.sendAlert(serviceId, service, 'Service requires manual intervention');
                success = false;
                break;
        }

        // Update state
        serviceState.lastEscalation = new Date().toISOString();

        if (success) {
            serviceState.status = 'healthy';
            serviceState.recoveryCount++;
            serviceState.failureCount = 0;
            serviceState.currentEscalationLevel = 0;
            this.state.totalRecoveries++;
            this.log(`[${serviceId}] ✅ Recovery successful!`, 'info');
        } else {
            serviceState.currentEscalationLevel = Math.min(
                level + 1,
                CONFIG.ESCALATION.LEVELS.length - 1
            );
            this.log(`[${serviceId}] ❌ Recovery failed, escalating to level ${serviceState.currentEscalationLevel}`, 'error');
        }

        this.saveState();
        return { success, action, level };
    }

    async attemptRestart(serviceId, service) {
        return new Promise((resolve) => {
            const command = service.startCommand;
            const options = {
                cwd: service.workDir || process.cwd(),
                shell: true,
                detached: true,
                stdio: 'ignore'
            };

            try {
                const child = spawn(command, [], options);
                child.unref();

                // Wait for service to come up
                setTimeout(async () => {
                    const health = await this.checkService(serviceId);
                    resolve(health.healthy);
                }, service.retryDelayMs);

            } catch (e) {
                this.log(`[${serviceId}] Restart error: ${e.message}`, 'error');
                resolve(false);
            }
        });
    }

    async killProcess(pattern) {
        return new Promise((resolve) => {
            // Windows-specific kill
            const cmd = `powershell -Command "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*${pattern}*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"`;

            exec(cmd, (error) => {
                if (error) {
                    this.log(`Kill process error: ${error.message}`, 'warn');
                }
                resolve();
            });
        });
    }

    async sendAlert(serviceId, service, message) {
        if (!CONFIG.TELEGRAM.enabled || !CONFIG.TELEGRAM.botToken || !CONFIG.TELEGRAM.chatId) {
            this.log(`[${serviceId}] Alert: ${message} (Telegram not configured)`, 'error');
            return;
        }

        const text = `🚨 *WATCHDOG ALERT*\n\n` +
            `**Service:** ${service.name}\n` +
            `**Status:** ❌ DOWN\n` +
            `**Message:** ${message}\n` +
            `**Time:** ${new Date().toLocaleString('pt-BR')}\n\n` +
            `_Requires manual intervention_`;

        try {
            const url = `https://api.telegram.org/bot${CONFIG.TELEGRAM.botToken}/sendMessage`;
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: CONFIG.TELEGRAM.chatId,
                    text,
                    parse_mode: 'Markdown'
                })
            });
            this.log(`[${serviceId}] Alert sent to Telegram`, 'info');
        } catch (e) {
            this.log(`[${serviceId}] Failed to send Telegram alert: ${e.message}`, 'error');
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Run a single check cycle
     */
    async runCycle() {
        this.state.lastCheck = new Date().toISOString();
        const results = {};

        for (const [serviceId, service] of Object.entries(CONFIG.SERVICES)) {
            const health = await this.checkService(serviceId);
            const serviceState = this.state.services[serviceId];

            results[serviceId] = {
                name: service.name,
                healthy: health.healthy,
                error: health.error
            };

            if (health.healthy) {
                serviceState.status = 'healthy';
                serviceState.lastSeen = new Date().toISOString();
                serviceState.failureCount = 0;
                serviceState.currentEscalationLevel = 0;
            } else {
                serviceState.status = 'unhealthy';
                serviceState.failureCount++;
                this.state.totalFailures++;

                // Record incident
                this.state.incidents.push({
                    timestamp: new Date().toISOString(),
                    serviceId,
                    error: health.error
                });

                // Keep last 100 incidents
                if (this.state.incidents.length > 100) {
                    this.state.incidents.shift();
                }

                // Attempt recovery
                await this.recoverService(serviceId);
            }
        }

        this.saveState();
        return results;
    }

    /**
     * Start continuous monitoring
     */
    async start(intervalMs = 30000) {
        if (this.isRunning) {
            this.log('Watchdog already running', 'warn');
            return;
        }

        this.isRunning = true;
        this.log('🛡️ Self-Healing Watchdog started', 'info');

        while (this.isRunning) {
            await this.runCycle();

            // Verificação horária de workers
            if (!this.lastWorkerCheck || (Date.now() - this.lastWorkerCheck > 3600000)) {
                await this.checkAllWorkersRegistered();
                this.lastWorkerCheck = Date.now();
            }

            await this.sleep(intervalMs);
        }
    }

    async checkAllWorkersRegistered() {
        this.log('🔍 Verificando registro de todos os 10 workers no API Hub...', 'info');
        try {
            // Caminho para o API Hub ou consulta via HTTP se disponível
            // Por enquanto, simulamos via monitoramento de porta/processo dos workers conhecidos
            // ou verificamos o arquivo de registro do api-hub.js
            const hubPath = path.join(__dirname, '..', '..', 'tmp', 'api-hub-registry.json');
            if (fs.existsSync(hubPath)) {
                const registry = JSON.parse(fs.readFileSync(hubPath, 'utf8'));
                const workers = Object.keys(registry.workers || {});
                if (workers.length < 10) {
                    await this.sendAlert('SYSTEM_WARNING',
                        `Apenas ${workers.length}/10 workers registrados no Hub`,
                        'Verifique o status dos workers no Dashboard.'
                    );
                }
            }
        } catch (e) {
            this.log(`Erro ao verificar workers: ${e.message}`, 'error');
        }
    }

    stop() {
        this.isRunning = false;
        this.log('Watchdog stopped', 'info');
    }

    /**
     * Generate status report
     */
    generateReport() {
        let report = `
🛡️ **SELF-HEALING WATCHDOG REPORT**
📅 ${new Date().toLocaleString('pt-BR')}

---

**📊 ESTATÍSTICAS**
- Total de recuperações: ${this.state.totalRecoveries}
- Total de falhas: ${this.state.totalFailures}
- Incidentes registrados: ${this.state.incidents.length}
- Última verificação: ${this.state.lastCheck || 'Nunca'}

---

**🔌 SERVIÇOS**
`;

        for (const [serviceId, serviceState] of Object.entries(this.state.services)) {
            const service = CONFIG.SERVICES[serviceId];
            const emoji = serviceState.status === 'healthy' ? '✅' :
                serviceState.status === 'unhealthy' ? '❌' : '❓';

            report += `
${emoji} **${service.name}**
   Status: ${serviceState.status}
   Última vez online: ${serviceState.lastSeen || 'Desconhecido'}
   Recuperações: ${serviceState.recoveryCount}
   Falhas recentes: ${serviceState.failureCount}
   Nível de escalação: ${serviceState.currentEscalationLevel}
`;
        }

        // Recent incidents
        const recentIncidents = this.state.incidents.slice(-5);
        if (recentIncidents.length > 0) {
            report += `
---

**🚨 INCIDENTES RECENTES**
`;
            for (const incident of recentIncidents.reverse()) {
                report += `- ${new Date(incident.timestamp).toLocaleString('pt-BR')}: ${incident.serviceId} - ${incident.error}\n`;
            }
        }

        report += `
---
*🤖 Generated by Self-Healing Watchdog*
`;

        return report;
    }
}

// ==================== EXPORTS ====================

module.exports = {
    SelfHealingWatchdog,
    CONFIG,
    createWatchdog: () => new SelfHealingWatchdog()
};

// ==================== CLI ====================

if (require.main === module) {
    const watchdog = new SelfHealingWatchdog();
    const args = process.argv.slice(2);

    if (args[0] === '--check') {
        watchdog.runCycle().then(results => {
            console.log(JSON.stringify(results, null, 2));
        });
    } else if (args[0] === '--report') {
        console.log(watchdog.generateReport());
    } else if (args[0] === '--start') {
        const interval = parseInt(args[1]) || 30000;
        watchdog.start(interval);
    } else {
        console.log(`
🛡️ SELF-HEALING WATCHDOG CLI
=============================

USO:
  node self-healing-watchdog.js --check     Verificar uma vez
  node self-healing-watchdog.js --report    Gerar relatório
  node self-healing-watchdog.js --start [ms] Iniciar monitoramento contínuo

EXEMPLOS:
  node self-healing-watchdog.js --check
  node self-healing-watchdog.js --start 60000  # A cada 60 segundos

INTEGRAÇÃO:
  const { createWatchdog } = require('./self-healing-watchdog');
  
  const watchdog = createWatchdog();
  watchdog.start(30000); // Verificar a cada 30 segundos
`);
    }
}
