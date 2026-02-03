#!/usr/bin/env node
/**
 * Projeto JP (simple scheduler)
 *
 * Flow:
 * 1) Check Drive folder (videos) for available mp4.
 * 2) Pick one eligible video (newest by modified time).
 * 3) Caption = video filename without extension ("title" from file name).
 * 4) Schedule on Upload-Post for tomorrow.
 *    - Main account: TikTok + YouTube + Facebook + Instagram
 *    - Fan account: Instagram only
 * 5) If both schedules succeed, move video to /Usados on Drive.
 *
 * Notes:
 * - Upload-Post time quirk: Vinicius said to post 19:00 Brazil, schedule 22:00.
 *   This script uses scheduled time 22:00 with timezone America/Sao_Paulo by default.
 *   Adjust via env JP_UPLOADPOST_HOUR if needed.
 */

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const { getTomorrowDateParts, localDateTimeString } = require('./time-utils');
const { appendLog } = require('./logging');

const RCLONE = 'C:/Users/vsuga/clawd/rclone.exe';

const JP = {
  // Drive folderId where the MP4 files live
  videosFolderId: '1QfbkZUZMn6SICYQwovnyuQITlj95wYPw',
  usedFolderName: 'Usados',

  // Upload-Post users (must exist in config/posting-map.json)
  profileMain: 'jp_main',
  profileFan: 'jp_fan',
};

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function rclone(cmd) {
  return execSync(`"${RCLONE}" ${cmd}`, { encoding: 'utf8' });
}

function listFilesWithTime(remote) {
  // rclone lsjson gives modTime and name
  const out = rclone(`lsjson "${remote}" --files-only`);
  const arr = JSON.parse(out);
  return (arr || []).map((x) => ({
    name: x.Name,
    modTime: x.ModTime ? new Date(x.ModTime).getTime() : 0,
    size: x.Size || 0,
  }));
}

function pickVideo(files) {
  const vids = files.filter((f) => f.name && f.name.match(/\.(mp4|mov)$/i));
  vids.sort((a, b) => (b.modTime || 0) - (a.modTime || 0));
  return vids[0] || null;
}

function captionFromFilename(name) {
  return String(name || '')
    .replace(/\.(mp4|mov)$/i, '')
    .replace(/[_\-]+/g, ' ')
    .trim();
}

function scheduleUpload({ uploadPostUser, platforms, videoPath, title, caption, scheduled_date, timezone }) {
  const args = [
    path.join(__dirname, 'upload-post.js'),
    '--video', videoPath,
    '--user', uploadPostUser,
    '--title', title,
    '--caption', caption,
  ];
  for (const p of platforms) args.push('--platform', p);
  args.push('--scheduled_date', scheduled_date, '--timezone', timezone, '--async_upload', 'true');

  const out = execSync(`node "${args[0]}" ${args.slice(1).map((a) => JSON.stringify(a)).join(' ')}`, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let json = null;
  try { json = JSON.parse(out); } catch {}
  return { raw: out.trim(), json };
}

function main() {
  const map = loadJson(path.join(__dirname, '..', 'config', 'posting-map.json'));
  const mainCfg = map.profiles?.[JP.profileMain];
  const fanCfg = map.profiles?.[JP.profileFan];

  if (!mainCfg?.uploadPostUser || !fanCfg?.uploadPostUser) {
    console.error('Missing config/posting-map.json for jp_main/jp_fan (uploadPostUser).');
    process.exit(2);
  }

  const tz = 'America/Sao_Paulo';
  const hour = Number(process.env.JP_UPLOADPOST_HOUR || 22);
  const minute = Number(process.env.JP_UPLOADPOST_MINUTE || 0);

  const remoteBase = `gdrive,root_folder_id=${JP.videosFolderId}:`;

  // Ensure used folder
  try { rclone(`mkdir "${remoteBase}/${JP.usedFolderName}"`); } catch {}

  const files = listFilesWithTime(remoteBase);
  const sel = pickVideo(files);

  if (!sel) {
    console.log('No JP videos found. Nothing to schedule.');
    return;
  }

  const runId = Date.now();
  const { buildJpCaption } = require('./jp-captions');
  const captionBase = captionFromFilename(sel.name);
  const caption = buildJpCaption(captionBase);
  const dateParts = getTomorrowDateParts(tz);
  const scheduled_date = localDateTimeString(dateParts, hour, minute);

  const localDir = path.join('C:/Users/vsuga/clawd', 'videos', 'jp');
  fs.mkdirSync(localDir, { recursive: true });
  const localPath = path.join(localDir, `JP_${runId}.mp4`);

  // Download
  rclone(`copyto "${remoteBase}/${sel.name}" "${localPath}"`);

  // Schedule main
  let mainRes, fanRes;
  try {
    mainRes = scheduleUpload({
      uploadPostUser: mainCfg.uploadPostUser,
      // Upload-Post expects platform[] values; keep using our existing names.
      platforms: (mainCfg.platforms && mainCfg.platforms.length) ? mainCfg.platforms : ['tiktok', 'youtube', 'facebook', 'instagram'],
      videoPath: localPath,
      title: captionBase,
      caption,
      scheduled_date,
      timezone: tz,
    });

    // log v2 (main)
    appendLog({
      date_time: new Date().toISOString(),
      profile: 'jp_main',
      run_id: String(runId),
      video_file: path.basename(localPath),
      image_file: '',
      drive_video_path: `/JP/${sel.name}`,
      drive_image_path: '',
      uploadpost_user: mainCfg.uploadPostUser,
      platform: 'multi',
      status: 'scheduled',
      scheduled_date,
      timezone: tz,
      job_id: mainRes?.json?.job_id || '',
      request_id: mainRes?.json?.request_id || '',
      uploadpost_response: mainRes?.raw || '',
      error: ''
    });

  } catch (e) {
    appendLog({
      date_time: new Date().toISOString(),
      profile: 'jp_main',
      run_id: String(runId),
      video_file: path.basename(localPath),
      image_file: '',
      drive_video_path: `/JP/${sel.name}`,
      drive_image_path: '',
      uploadpost_user: mainCfg.uploadPostUser,
      platform: 'multi',
      status: 'failed',
      scheduled_date,
      timezone: tz,
      job_id: '',
      request_id: '',
      uploadpost_response: '',
      error: (e?.stderr?.toString?.() || e?.message || String(e))
    });
    throw e;
  }

  // Schedule fan (instagram only)
  try {
    fanRes = scheduleUpload({
      uploadPostUser: fanCfg.uploadPostUser,
      platforms: (fanCfg.platforms && fanCfg.platforms.length) ? fanCfg.platforms : ['instagram'],
      videoPath: localPath,
      title: captionBase,
      caption,
      scheduled_date,
      timezone: tz,
    });

    appendLog({
      date_time: new Date().toISOString(),
      profile: 'jp_fan',
      run_id: String(runId),
      video_file: path.basename(localPath),
      image_file: '',
      drive_video_path: `/JP/${sel.name}`,
      drive_image_path: '',
      uploadpost_user: fanCfg.uploadPostUser,
      platform: 'instagram',
      status: 'scheduled',
      scheduled_date,
      timezone: tz,
      job_id: fanRes?.json?.job_id || '',
      request_id: fanRes?.json?.request_id || '',
      uploadpost_response: fanRes?.raw || '',
      error: ''
    });

  } catch (e) {
    appendLog({
      date_time: new Date().toISOString(),
      profile: 'jp_fan',
      run_id: String(runId),
      video_file: path.basename(localPath),
      image_file: '',
      drive_video_path: `/JP/${sel.name}`,
      drive_image_path: '',
      uploadpost_user: fanCfg.uploadPostUser,
      platform: 'instagram',
      status: 'failed',
      scheduled_date,
      timezone: tz,
      job_id: '',
      request_id: '',
      uploadpost_response: '',
      error: (e?.stderr?.toString?.() || e?.message || String(e))
    });
    throw e;
  }

  // Move remote to used
  rclone(`moveto "${remoteBase}/${sel.name}" "${remoteBase}/${JP.usedFolderName}/${sel.name}"`);

  console.log(JSON.stringify({
    ok: true,
    runId,
    picked: sel.name,
    caption,
    scheduled_date,
    timezone: tz,
    main: mainRes?.json || null,
    fan: fanRes?.json || null,
  }, null, 2));
}

main();
