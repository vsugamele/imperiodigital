const fs = require('fs');
const path = require('path');

function getUploadPostApiKey() {
  const envKey = process.env.UPLOAD_POST_API_KEY;
  if (envKey && String(envKey).trim()) return String(envKey).trim();

  // Fallback: local secret file (gitignored)
  const localPath = path.join(__dirname, '..', 'config', 'upload-post.local.json');
  if (fs.existsSync(localPath)) {
    const j = JSON.parse(fs.readFileSync(localPath, 'utf8'));
    if (j.apiKey && String(j.apiKey).trim()) return String(j.apiKey).trim();
  }

  return '';
}

module.exports = { getUploadPostApiKey };
