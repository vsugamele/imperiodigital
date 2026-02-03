/**
 * Kill Terminal Noise
 * 
 * Mata processos que abrem janelas de terminal desnecessárias.
 * Use: node scripts/kill-noise.js --list (lista)
 *      node scripts/kill-noise.js --kill-all (mata todos)
 */

const { execSync } = require('child_process');
const { spawn } = require('child_process');

function listNoisyProcesses() {
  try {
    // Listar processos node com janela
    const output = execSync('powershell -Command "Get-Process node | Where-Object {$_.MainWindowTitle -ne \'\'} | Select-Object Id, ProcessName, MainWindowTitle"', {
      encoding: 'utf8'
    });
    console.log('📋 Processos com janela aberta:');
    console.log(output);
    return output;
  } catch (e) {
    console.log('ℹ️  Nenhum processo node com janela aberta encontrado');
    return null;
  }
}

function killProcess(pid, name) {
  try {
    execSync(`taskkill /PID ${pid} /F /T`, { encoding: 'utf8' });
    console.log(`✅ Matou processo ${pid} (${name})`);
    return true;
  } catch (e) {
    console.log(`❌ Não conseguiu matar ${pid}: ${e.message}`);
    return false;
  }
}

function killAllNoisy() {
  console.log('🔍 Procurando processos barulhentos...\n');
  
  try {
    const output = execSync('powershell -Command "Get-Process node | Select-Object Id, ProcessName"', {
      encoding: 'utf8'
    });
    
    const lines = output.split('\n').slice(3); // Pular headers
    let killed = 0;
    
    for (const line of lines) {
      const match = line.trim().match(/^\s*(\d+)\s+node\s*$/);
      if (match) {
        const pid = match[1];
        // Não matar processos importantes
        if (shouldKeepProcess(pid)) {
          console.log(`ℹ️  Mantendo processo ${pid} (importante)`);
        } else {
          killProcess(pid, 'node');
          killed++;
        }
      }
    }
    
    console.log(`\n✅ Matou ${killed} processos`);
  } catch (e) {
    console.log('Erro:', e.message);
  }
}

function shouldKeepProcess(pid) {
  // Lista de PIDs importantes (esses são do OpenClaw/dashboard)
  // Em produção, você adicionaria os PIDs que quer manter
  const importantPatterns = [
    'clawdbot',
    'ops-dashboard',
    'next-server'
  ];
  
  try {
    const cmdline = execSync(`wmic process where "ProcessId=${pid}" get CommandLine`, { encoding: 'utf8' });
    return importantPatterns.some(p => cmdline.toLowerCase().includes(p));
  } catch {
    return false;
  }
}

function runSilent(scriptPath, args = '') {
  // Wrapper para rodar script silenciosamente
  const vbs = `
Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd /c node \\"${scriptPath}\\" ${args}", 0, False
`;
  
  const vbsPath = `${process.env.TEMP}\\silent_run_${Date.now()}.vbs`;
  require('fs').writeFileSync(vbsPath, vbs);
  
  console.log(`🔇 Executando silenciosamente: ${scriptPath}`);
  
  const { execSync } = require('child_process');
  execSync(`wscript //B "${vbsPath}"`, { stdio: 'inherit' });
  
  require('fs').unlinkSync(vbsPath);
  console.log('✅ Concluído');
}

// Main
const args = process.argv.slice(2);

if (args.includes('--list')) {
  listNoisyProcesses();
} else if (args.includes('--kill-all')) {
  killAllNoisy();
} else if (args.includes('--run')) {
  const scriptIdx = args.indexOf('--run') + 1;
  runSilent(args[scriptIdx], args[scriptIdx + 1] || '');
} else {
  console.log(`
🎯 Kill Terminal Noise

用法:
  --list      Lista processos com janela aberta
  --kill-all  Mata todos os processos node (use com cuidado!)
  --run <script> [args]  Roda script silenciosamente

Exemplo:
  node scripts/kill-noise.js --run "scripts/schedule-next-day.js" "teo"
`);
}
