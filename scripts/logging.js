const fs = require('fs');
const path = require('path');

const LOG_PATH = path.join(__dirname, '..', 'results', 'posting-log-v2.csv');

function csvEscape(v) {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (/[\n\r",]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

function ensureLog() {
  const dir = path.dirname(LOG_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(LOG_PATH)) {
    fs.writeFileSync(
      LOG_PATH,
      'date_time,profile,run_id,video_file,image_file,drive_video_path,drive_image_path,uploadpost_user,platform,status,caption,scheduled_date,timezone,job_id,request_id,uploadpost_response,error\n'
    );
  }
}

function appendLog(row) {
  ensureLog();
  const cols = [
    row.date_time,
    row.profile,
    row.run_id,
    row.video_file,
    row.image_file,
    row.drive_video_path,
    row.drive_image_path,
    row.uploadpost_user,
    row.platform,
    row.status,
    row.caption || '',
    row.scheduled_date,
    row.timezone,
    row.job_id,
    row.request_id,
    row.uploadpost_response,
    row.error,
  ].map(csvEscape);
  fs.appendFileSync(LOG_PATH, cols.join(',') + '\n');
}

module.exports = { appendLog, LOG_PATH };
