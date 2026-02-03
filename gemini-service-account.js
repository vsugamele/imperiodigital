// Sistema Gemini + Service Account (sem Python)
const https = require('https');
const fs = require('fs');

// Carregar Service Account
const serviceAccount = JSON.parse(fs.readFileSync('config/imperio-service-account.json', 'utf8'));

console.log('🔐 Testando Service Account para Gemini...');
console.log('Project ID:', serviceAccount.project_id);

// Função para gerar JWT token
function createJWT() {
    // Simplificado - em produção usaria biblioteca JWT
    const now = Math.floor(Date.now() / 1000);
    const header = {
        "alg": "RS256",
        "typ": "JWT"
    };
    
    const payload = {
        "iss": serviceAccount.client_email,
        "scope": "https://www.googleapis.com/auth/cloud-platform",
        "aud": "https://oauth2.googleapis.com/token", 
        "exp": now + 3600,
        "iat": now
    };
    
    console.log('⚠️  JWT generation needs crypto library');
    console.log('💡 Sistema original Python é mais simples');
    return null;
}

console.log('');
console.log('🎯 SOLUÇÃO RECOMENDADA:');
console.log('======================');
console.log('');
console.log('1. INSTALAR PYTHON:');
console.log('   • Download: https://python.org');
console.log('   • Ou: Windows Store → Python');
console.log('');
console.log('2. EXECUTAR SISTEMA ORIGINAL:');
console.log('   python scripts/image-transform-vertex.py "praia" "biquini elegante"');
console.log('');
console.log('3. ALTERNATIVA RÁPIDA:');  
console.log('   node laise-final.js "prompt" (FLUX 2.0 Pro)');
console.log('');

// Verificar se Service Account está válido
if (serviceAccount.project_id && serviceAccount.private_key && serviceAccount.client_email) {
    console.log('✅ Service Account válido');
    console.log('📧 Email:', serviceAccount.client_email);
    console.log('🆔 Project:', serviceAccount.project_id);
} else {
    console.log('❌ Service Account inválido');
}