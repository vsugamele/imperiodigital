const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const RCLONE = 'C:\\Users\\vsuga\\clawd\\rclone.exe';

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function run(args) {
  return execFileSync(RCLONE, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

function main() {
  const cfg = loadJson(path.join(__dirname, '..', 'config', 'drive-ops.json'));
  const opsId = cfg.opsFolderId;
  if (!opsId) {
    console.error('Missing opsFolderId in config/drive-ops.json');
    process.exit(2);
  }

  const opsRemote = `gdrive,root_folder_id=${opsId}:`;

  // Ensure structure
  try { run(['mkdir', `${opsRemote}/docs`]); } catch {}
  try { run(['mkdir', `${opsRemote}/results`]); } catch {}
  try { run(['mkdir', `${opsRemote}/results/runs`]); } catch {}

  const root = path.join(__dirname, '..');

  const uploads = [
    { local: path.join(root, 'results', 'posting-log-v2.csv'), remote: `${opsRemote}/results/posting-log-v2.csv` },
    { local: path.join(root, 'MAPA_SISTEMA.md'), remote: `${opsRemote}/docs/MAPA_SISTEMA.md` },
    { local: path.join(root, 'docs'), remote: `${opsRemote}/docs` },
    { local: path.join(root, 'results', 'runs'), remote: `${opsRemote}/results/runs` },
  ];

  for (const u of uploads) {
    if (!fs.existsSync(u.local)) continue;

    const stat = fs.statSync(u.local);
    if (stat.isDirectory()) {
      run(['copy', u.local, u.remote, '--create-empty-src-dirs']);
      console.log('✅ Copied dir:', u.local, '->', u.remote);
    } else {
      run(['copyto', u.local, u.remote]);
      console.log('✅ Copied file:', u.local, '->', u.remote);
    }
  }
}

main();
