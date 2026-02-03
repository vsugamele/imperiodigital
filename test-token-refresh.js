// Teste de renovação automática do token Google Drive
const https = require('https');
const querystring = require('querystring');
const fs = require('fs');

async function refreshGoogleToken() {
    try {
        console.log('🔄 Tentando renovar token Google Drive...');
        
        const tokenData = JSON.parse(fs.readFileSync('config/token.json', 'utf8'));
        
        console.log('📅 Token expirou em:', new Date(tokenData.expiry).toLocaleString());
        console.log('⏰ Agora são:', new Date().toLocaleString());
        
        if (!tokenData.refresh_token) {
            console.log('❌ Nenhum refresh_token disponível');
            return false;
        }
        
        console.log('🔑 Usando refresh_token para renovar...');
        
        const postData = querystring.stringify({
            client_id: tokenData.client_id,
            client_secret: tokenData.client_secret,
            refresh_token: tokenData.refresh_token,
            grant_type: 'refresh_token'
        });
        
        const options = {
            hostname: 'oauth2.googleapis.com',
            path: '/token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        
        return new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                let body = '';
                res.on('data', (chunk) => body += chunk);
                res.on('end', () => {
                    try {
                        const result = JSON.parse(body);
                        
                        if (result.error) {
                            console.log('❌ Erro na renovação:', result.error_description || result.error);
                            resolve(false);
                            return;
                        }
                        
                        if (result.access_token) {
                            console.log('✅ Novo token obtido!');
                            
                            // Atualizar token file
                            const newExpiry = new Date(Date.now() + (result.expires_in * 1000));
                            tokenData.token = result.access_token;
                            tokenData.expiry = newExpiry.toISOString();
                            
                            fs.writeFileSync('config/token.json', JSON.stringify(tokenData, null, 2));
                            
                            console.log('💾 Token salvo! Válido até:', newExpiry.toLocaleString());
                            console.log('⏰ Tempo restante:', Math.round(result.expires_in / 60), 'minutos');
                            
                            resolve(true);
                        } else {
                            console.log('❌ Resposta inválida:', result);
                            resolve(false);
                        }
                        
                    } catch (e) {
                        console.log('❌ Erro ao processar resposta:', e.message);
                        console.log('📄 Body:', body);
                        resolve(false);
                    }
                });
            });
            
            req.on('error', (err) => {
                console.log('❌ Erro na requisição:', err.message);
                resolve(false);
            });
            
            req.write(postData);
            req.end();
        });
        
    } catch (error) {
        console.log('❌ Erro geral:', error.message);
        return false;
    }
}

refreshGoogleToken().then(success => {
    if (success) {
        console.log('');
        console.log('🎉 TOKEN RENOVADO COM SUCESSO!');
        console.log('✅ Sistema Google Drive restaurado');
        console.log('🎯 Pode testar: node laise-final.js');
    } else {
        console.log('');
        console.log('⚠️ Renovação automática falhou');
        console.log('💡 Solução: clawdbot configure (novo login)');
        console.log('🎯 Alternativa: usar Service Account (já funciona)');
    }
});