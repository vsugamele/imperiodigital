/**
 * Verificar APIs e testar Gemini
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

async function testGemini() {
  console.log('Testando Gemini API...\n');
  
  const token = await getAccessToken();
  console.log('Token: ' + token.substring(0, 20) + '...\n');

  // Listar modelos Gemini
  console.log('1. Listando modelos:');
  const modelsResponse = await fetch(
    'https://generativelanguage.googleapis.com/v1/models?key=AIzaSyAFNao4NetweEVgz8DtnUruUWDgBTe8u9Y',
    { headers: { 'Content-Type': 'application/json' } }
  );
  console.log('   Status: ' + modelsResponse.status);
  const modelsData = await modelsResponse.json();
  if (modelsData.models) {
    modelsData.models.forEach(m => console.log('   - ' + m.name));
  } else if (modelsData.error) {
    console.log('   Erro: ' + modelsData.error.message);
  }
}

testGemini();
