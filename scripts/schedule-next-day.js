const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { appendLog } = require('./logging');
const { getTomorrowDateParts, localDateTimeString } = require('./time-utils');

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function newestMatching(dir, re) {
  const files = fs.readdirSync(dir)
    .filter(f => re.test(f))
    .map(f => ({ f, t: fs.statSync(path.join(dir, f)).mtimeMs }))
    .sort((a, b) => b.t - a.t);
  return files[0]?.f;
}

function run(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { encoding: 'utf8', stdio: ['inherit', 'pipe', 'pipe'], ...opts });
}

function scheduleOne({ profile, title, caption, scheduled_date, timezone, uploadPostUser, videoPath, videoFile }) {
  const args = [
    path.join(__dirname, 'upload-post.js'),
    '--video', videoPath,
    '--user', uploadPostUser,
    '--title', title,
    '--caption', caption || '',
    '--platform', 'instagram',
    '--scheduled_date', scheduled_date,
    '--timezone', timezone,
    '--async_upload', 'true'
  ];

  try {
    const out = run('node', args);
    let json = null;
    try { json = JSON.parse(out); } catch { }

    appendLog({
      date_time: new Date().toISOString(),
      profile,
      run_id: videoFile.match(/_(\d+)\.mp4$/)?.[1] || '',
      video_file: videoFile,
      image_file: '',
      drive_video_path: `/videos/${videoFile}`,
      drive_image_path: '',
      uploadpost_user: uploadPostUser,
      platform: 'instagram',
      status: 'scheduled',
      caption: caption || '',
      scheduled_date,
      timezone,
      job_id: json?.job_id || '',
      request_id: json?.request_id || '',
      uploadpost_response: out.trim(),
      error: ''
    });

    return { ok: true, json };
  } catch (e) {
    appendLog({
      date_time: new Date().toISOString(),
      profile,
      run_id: videoFile.match(/_(\d+)\.mp4$/)?.[1] || '',
      video_file: videoFile,
      image_file: '',
      drive_video_path: `/videos/${videoFile}`,
      drive_image_path: '',
      uploadpost_user: uploadPostUser,
      platform: 'instagram',
      status: 'failed',
      caption: caption || '',
      scheduled_date,
      timezone,
      job_id: '',
      request_id: '',
      uploadpost_response: '',
      error: (e?.stderr?.toString?.() || e?.message || String(e))
    });
    return { ok: false, error: e };
  }
}

function main() {
  const tz = 'America/Sao_Paulo';
  const times = [
    { hh: 10, mm: 0 },
    { hh: 13, mm: 0 },
    { hh: 16, mm: 0 },
    { hh: 19, mm: 0 },
    { hh: 21, mm: 0 },
    { hh: 23, mm: 0 }
  ];

  const profile = (process.argv[2] || '').toLowerCase();
  if (!profile) {
    console.error('Usage: node scripts/schedule-next-day.js <profile>');
    process.exit(2);
  }

  const map = loadJson(path.join(__dirname, '..', 'config', 'posting-map.json'));
  const cfg = map.profiles?.[profile];
  if (!cfg?.uploadPostUser) {
    console.error('Missing mapping for profile:', profile);
    process.exit(2);
  }

  const dateParts = getTomorrowDateParts(tz);

  // generate 6 videos for the profile
  for (let i = 0; i < times.length; i++) {
    console.log(`\n=== GENERATE ${profile} (${i + 1}/${times.length}) ===`);
    execFileSync('node', [path.join(__dirname, 'igaming-video.js'), profile], { stdio: 'inherit' });
  }

  // schedule the latest 6 videos (by mtime) - simplest approach: schedule newest first
  const videosDir = path.join(__dirname, '..', 'videos');
  const prefix = profile.toUpperCase() + '_REEL_';
  const re = new RegExp('^' + prefix.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&') + '.*\\.mp4$', 'i');

  const files = fs.readdirSync(videosDir)
    .filter(f => re.test(f))
    .map(f => ({ f, t: fs.statSync(path.join(videosDir, f)).mtimeMs }))
    .sort((a, b) => b.t - a.t)
    .slice(0, times.length)
    .reverse(); // oldest->newest so schedule in chronological order

  if (files.length < times.length) {
    console.error('Not enough videos found to schedule. Found:', files.length);
    process.exit(1);
  }

  console.log(`\n=== SCHEDULING ${profile} for ${dateParts.year}-${dateParts.month}-${dateParts.day} (${tz}) ===`);

  for (let i = 0; i < times.length; i++) {
    const t = times[i];
    const scheduled_date = localDateTimeString(dateParts, t.hh, t.mm);
    const videoFile = files[i].f;
    const videoPath = path.join(videosDir, videoFile);
    const title = `Reels ${profile.toUpperCase()} - ${t.hh}:${String(t.mm).padStart(2, '0')}`;

    console.log(`Scheduling ${videoFile} -> ${scheduled_date} (${tz})`);

    // Tenta carregar o 'copy' da imagem do metadado da run
    let imageCopy = '';
    try {
      const runId = videoFile.match(/_(\d+)\.mp4$/)?.[1];
      if (runId) {
        const metaPath = path.join(__dirname, '..', 'results', 'runs', profile, `${runId}.json`);
        if (fs.existsSync(metaPath)) {
          const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
          imageCopy = meta.copy || '';
        }
      }
    } catch (e) {
      console.log(`⚠️  Could not load meta for ${videoFile}`);
    }

    const { buildCaption } = require('./igaming-captions');
    const cap = buildCaption({ profile, imageCopy });

    scheduleOne({
      profile,
      title,
      caption: cap.caption,
      scheduled_date,
      timezone: tz,
      uploadPostUser: cfg.uploadPostUser,
      videoPath,
      videoFile
    });
  }

  console.log('\nDone. Check results/posting-log.csv');

  // Run pipeline health check to update status
  console.log('\n🔄 Atualizando status do pipeline...');
  try {
    execFileSync('node', [path.join(__dirname, 'pipeline-health-check.js')], { 
      encoding: 'utf8',
      stdio: ['inherit', 'pipe', 'pipe']
    });
  } catch (e) {
    console.log('⚠️  Pipeline health check falhou (não crítico)');
  }
}

main();
