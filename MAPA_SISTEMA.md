# 🗺️ MAPA DO SISTEMA IGAMING GEMINI (VERSÃO PERSISTENTE)

Este arquivo serve como guia mestre para qualquer IA ou humano que precise operar ou dar manutenção neste sistema.

## 🛠️ Ferramentas
- **IA Geração**: Gemini 3 Pro Image (Modelo: `gemini-3-pro-image-preview`)
- **IA Orquestração**: Clawdbot (Modelo: `google/gemini-2.0-flash`)
- **Cloud/File Manager**: RClone (Configurado como `gdrive:`)
- **Edição de Vídeo**: FFmpeg (Zoom efeito + Mixagem de áudio)

---

## 📐 Fluxo de Execução
1.  **Refs Personagem**: Baixa fotos da pasta do perfil no Drive (Ex: Teo, Jonathan).
2.  **Refs Estilo de Texto**: Baixa fotos da pasta do Vinicius para inspiração de **Layout e Tipografia** das copys.
3.  **Áudio**: Baixa um MP3 aleatório da pasta `2026/Audios em Alta`.
4.  **Geração Vertical**: O Gemini gera uma imagem 9:16 seguindo:
    - **Personagem**: Fotos de referência.
    - **Estilo**: Inspiração visual nos textos/vibes das fotos do Vinicius.
    - **Cenário/Roupa**: Aleatório baseado em "Lifestyle Real" (Contextual: sem camisa se for água).
5.  **Vídeo**: O FFmpeg cria um .mp4 de 15 segundos com efeito de zoom lento.
6.  **Upload**: O RClone sobe o arquivo final para a pasta correta do perfil.

---

## 📂 Localização dos Arquivos
- **Pasta Raiz**: `C:\Users\vsuga\clawd\`
- **Scripts**: `./scripts/igaming-video.js` (O principal para Reels)
- **Imagens Temporárias**: `./images/generated/`
- **Referências Local**: `./images/references/` e `./images/style_ref/`
- **Vídeos Prontos**: `./videos/`
- **Configuração de Perfis**: `./config/igaming-profiles.json`

---

## 🚀 Como Executar via CLI

### Gerar 1 vídeo (teste)
```powershell
node scripts/igaming-video.js [nome_do_perfil]
```
Perfis configurados: `teo`, `jonathan`, `laise`, `pedro`.

### Agendar D+1 (gera 6 vídeos + agenda para amanhã)
```powershell
node scripts/schedule-next-day.js [nome_do_perfil]
```

### Logs (Excel)
- `./results/posting-log-v2.csv`

### Backup central (Drive)
- Pasta OPS: `IGAMING_OPS` (ver `./config/drive-ops.json`)
- Script: `node scripts/backup-ops-to-drive.js`

### Status (Upload-Post)
- Consultar status: `node scripts/upload-status.js --request_id <id>`
- Poll automático: `node scripts/poll-upload-status.js`

---

## 🆔 IDs Importantes do Google Drive
*   **Pasta Estilo (Vini)**: `19w3WefIuH18POsomvRpEhAZZzyrjqj50`
*   **Pasta Áudios em Alta**: `1YWvoRgdzDWLyTzbCYAJqsE8paatIc-rH`
*   **Pasta Teo**: `1jDY5HSjJOtZw2yCxXzuEy_gTt9uRTObP`
*   **Pasta Jonathan**: `1-pRp7UtxfBVBNw1-5WJPCtzF5PnTmNUZ`
*   **Pasta Laise**: `18vm4Fv1hYM8B89m-qhr-eUeZjxKmm9Zm`
*   **Pasta Pedro**: `16Mhy_ydDXeq2RuvWq3F1FQ9Ehei5tsa7`
