/**
 * Verificar APIs disponíveis no projeto
 */

const fs = require('fs');
const https = require('https');

const credentials = JSON.parse(
  fs.readFileSync('C:\\Users\\vsuga\\AppData\\Roaming\\gcloud\\application_default_credentials.json')
);

let cachedToken = null;

async function getAccessToken() {
  if (cachedToken) return cachedToken;
  
  const tokenUrl = 'https://oauth2.googleapis.com/token';
  const params = new URLSearchParams({
    client_id: credentials.client_id,
    client_secret: credentials.client_secret,
    refresh_token: credentials.refresh_token,
    grant_type: 'refresh_token'
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  });

  const data = await response.json();
  cachedToken = data.access_token;
  return cachedToken;
}

async function makeRequest(url, method = 'GET', body = null) {
  const token = await getAccessToken();
  
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function checkAPIs() {
  console.log('Verificando APIs disponiveis...\n');

  const endpoints = [
    { name: 'Gemini API - List Models', url: 'https://generativelanguage.googleapis.com/v1beta/models' },
    { name: 'Vertex AI - Model Garden', url: 'https://us-central1-aiplatform.googleapis.com/v1/projects/gen-lang-client-0361434742/locations/us-central1/modelGarden' },
  ];

  for (const endpoint of endpoints) {
    console.log(endpoint.name + ':');
    try {
      const result = await makeRequest(endpoint.url);
      
      if (typeof result.data === 'object') {
        console.log('  Status: ' + result.status);
        if (result.data.models) {
          result.data.models.slice(0, 10).forEach(m => console.log('  - ' + (m.name || m.id || m)));
        }
      } else {
        console.log('  Status: ' + result.status);
      }
    } catch (e) {
      console.log('  Erro: ' + e.message);
    }
    console.log('');
  }
}

checkAPIs();
