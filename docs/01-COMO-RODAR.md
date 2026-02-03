# Como rodar (manual)

## Pré-requisitos
- Node.js instalado
- `rclone.exe` configurado com remote `gdrive:`
- Variável de ambiente: `UPLOAD_POST_API_KEY`

## 1) Gerar 1 vídeo (teste)
```powershell
cd C:\Users\vsuga\clawd
node .\scripts\igaming-video.js teo
```

## 2) Postar o último vídeo (imediato)
```powershell
cd C:\Users\vsuga\clawd
node .\scripts\post-latest.js teo --title "Teste Reel - Teo"
```

## 3) Gerar + agendar D+1 (6 posts) para um perfil
```powershell
cd C:\Users\vsuga\clawd
node .\scripts\schedule-next-day.js teo
```

## 4) Abrir o log no Excel
Arquivo:
- `C:\Users\vsuga\clawd\results\posting-log-v2.csv`

Dica: no Excel, use **Dados → De Texto/CSV** e depois **Formatar como Tabela**.

## 5) Backup do OPS para o Drive
```powershell
cd C:\Users\vsuga\clawd
node .\scripts\backup-ops-to-drive.js
```
