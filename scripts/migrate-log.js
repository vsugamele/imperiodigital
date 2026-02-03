const fs = require('fs');
const path = require('path');
const { LOG_PATH } = require('./logging');

const NEW_HEADER = 'date_time,profile,run_id,video_file,image_file,drive_video_path,drive_image_path,uploadpost_user,platform,status,scheduled_date,timezone,job_id,request_id,uploadpost_response,error';

function main() {
  if (!fs.existsSync(LOG_PATH)) return;
  const text = fs.readFileSync(LOG_PATH, 'utf8');
  const lines = text.split(/\r?\n/);
  const header = (lines[0] || '').trim();
  if (!header) return;
  if (header === NEW_HEADER) return;

  const legacyPath = path.join(path.dirname(LOG_PATH), 'posting-log-legacy.csv');
  if (!fs.existsSync(legacyPath)) fs.writeFileSync(legacyPath, text);

  // rewrite main log with new header; keep legacy lines, padding missing columns
  const out = [NEW_HEADER];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    // count commas to guess cols
    const cols = line.split(',');
    // legacy had 12 columns; new has 16
    if (cols.length < 16) {
      out.push(line + ',,,,');
    } else {
      out.push(line);
    }
  }
  fs.writeFileSync(LOG_PATH, out.join('\n') + '\n');
  console.log('Migrated posting-log.csv. Legacy saved to:', legacyPath);
}

main();
