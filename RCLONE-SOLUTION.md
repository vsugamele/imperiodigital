# Solução rclone para Google Drive Upload

## Vantagens do rclone
- ✅ Autenticação OAuth2 robusta 
- ✅ Suporte nativo a Shared Drives
- ✅ Sem problemas de multipart/boundary
- ✅ Mais simples que API manual
- ✅ Resolve problemas de permissão automaticamente

## Setup

### 1. Instalar rclone
```powershell
# Via chocolatey
choco install rclone

# Ou baixar direto: https://rclone.org/downloads/
```

### 2. Configurar Google Drive
```bash
rclone config
# Escolher: Google Drive
# Nome: "drive"
# Autorizar no browser
```

### 3. Testar conexão
```bash
rclone lsd drive:
```

## Implementação

### Upload simples
```bash
rclone copy "arquivo.png" "drive:PASTA_ID/"
```

### Upload com rename
```bash
rclone copyto "local.png" "drive:PASTA_ID/nome_final.png"
```