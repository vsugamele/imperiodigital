# 📋 OPS DASHBOARDS - DOCUMENTAÇÃO COMPLETA

## 🎯 Visão Geral

Este dashboard foi criado para que **qualquer membro da equipe** consiga:
- Entender cada projeto e seu propósito
- Visualizar a arquitetura completa do sistema
- Acompanhar o fluxo operacional de cada automação
- Saber exatamente o que é necessário para rodar cada projeto
- Diagnosticar problemas rapidamente

---

## 🏢 PROJETOS DO SISTEMA

### 1️⃣ iGaming (4 Perfis)
**Propósito:** Geração automática de Reels para perfis de cassino online

| Perfil | Público | Horários de Post | Drive Folder |
|--------|---------|------------------|--------------|
| TEO | Apostadores VIP | 10h, 13h, 16h, 19h, 21h, 23h | `1jDY5HSjJOtZw2yCxXzuEy_gTt9uRTObP` |
| JONATHAN | Apostadores médios | 10h, 13h, 16h, 19h, 21h, 23h | `1-pRp7UtxfBVBNw1-5WJPCtzF5PnTmNUZ` |
| LAISE | Mulheres apostadoras | 10h, 13h, 16h, 19h, 21h, 23h | `18vm4Fv1hYM8B89m-qhr-eUeZjxKmm9Zm` |
| PEDRO | Apostadores casuais | 10h, 13h, 16h, 19h, 21h, 23h | `16Mhy_ydDXeq2RuvWq3F1FQ9Ehei5tsa7` |

**Tecnologias:**
- Gemini 3 Pro Image → Gera imagem 9:16
- FFmpeg → Cria vídeo com zoom lento (15s)
- RClone → Upload para Drive
- Upload-Post → Agendamento Instagram

**Inputs necessários:**
- 📁 Pasta de referências do personagem (fotos reais)
- 📁 Pasta de referências de estilo (vibe/layout)
- 📁 Pasta de áudios em alta (`1YWvoRgdzDWLyTzbCYAJqsE8paatIc-rH`)
- 🔑 Gemini API Key (`ops-dashboard/.env.local`)

**Custo por post:** ~R$0.003 (gemini image) + R$0 (ffmpeg local)

**Arquivos:**
- Script principal: `scripts/igaming-video.js`
- Agendamento: `scripts/schedule-next-day.js`
- Configuração: `config/igaming-profiles.json`
- Output: `videos/<perfil>/`

---

### 2️⃣ PetSelectUK
**Propósito:** Geração de conteúdo para loja de pet food premium UK

**Conteúdo gerado por ciclo:**
- 1 imagem 4:5 (feed)
- 5 slides para carrossel
- 1 Reels 9:16 (cover + MP4)

**Horários de post (UK):**
- Carrossel: 09:00
- Imagem: 13:00
- Reels: 19:00

**Tecnologias:**
- Gemini 3 Pro Image → Gera todos os assets visuais
- FFmpeg → Cria vídeo do Reels (zoom)
- Upload-Post → Agendamento Instagram

**Inputs necessários:**
- 📁 Pasta de produtos (`petselectuk/products/`)
- 📁 Pasta de referências de estilo (`petselectuk/style_refs/`)
- 🔑 Gemini API Key (`ops-dashboard/.env.local`)

**Custo por ciclo:** ~R$0.0025 (7 requisições Gemini)

**Arquivos:**
- Geração: `scripts/petselect-generate.js`
- Agendamento: `scripts/petselect-schedule-next-day.js`
- Legendas: `scripts/petselect-captions.js`
- Output: `petselectuk/outputs/{images,carousels,reels}/`

**⚠️ Limitações atuais:**
- Rate limit: 1 request/5s (delay configurado no script)
- Warning do Instagram: "post similar" em posts consecutivos

---

### 3️⃣ JP (Projeto Japonês)
**Propósito:** Conteúdo japonês para nicho específico

**Configuração:**
- Drive Source: `1QfbkZUZMn6SICYQwovnyuQITlj95wYPw`
- Horário: 22:00 (America/Sao_Paulo)
- Plataformas: TikTok, YouTube, Facebook, Instagram (main) + Instagram (fan)

**Tecnologias:**
- Vídeos pré-gravados no Drive
- Upload-Post → Agendamento automático

**Inputs necessários:**
- 📁 Vídeos na pasta do Drive
- 🔑 Credenciais Upload-Post

**Custo por post:** R$0 (vídeos já existem, só upload)

**Arquivos:**
- Script: `scripts/jp-schedule-next-day.js`
- Status: `results/posting-log-v2.csv`

---

### 4️⃣ Vanessa Equilibre
**Propósito:** Conteúdo luxury health/wellness para público alto ticket

**Estrutura semanal:**
| Dia | Horário | Tipo | Status |
|-----|---------|------|--------|
| Segunda | 19:00 | Foto + Texto | Manual |
| Terça | 12:00 | Carrossel (9 slides) | Manual |
| Quinta | 12:00 | Carrossel (9 slides) | Manual |
| Sexta | 19:00 | Foto + Texto | Manual |

**Tecnologias:**
- Copy manual (base: `docs/vanessa-equilibreon/SEMANA-01-pack-editorial.md`)
- Design manual (base: `config/vanessa-equilibre.json`)
- Upload manual ou via script

**Style Guide:**
- Cores: `#3D6B58` (accent), `#C8B2A7` (secondary)
- Fontes: Playfair Display + Montserrat
- Tom: Autoridade clínica, "irmã mais velha rica"

**Inputs necessários:**
- 📄 Docs de copy aprovados
- 🎨 Assets visuais criados
- 🔑 Credenciais Instagram

**Custo por semana:** R$0 (manual)

**Arquivos:**
- Docs: `docs/vanessa-equilibreon/`
- Config: `config/vanessa-equilibre.json`
- Memo: `tmp/vanessa-semana-YYYY-MM-DD.md`

---

## 🏗️ ARQUITETURA DO SISTEMA

```
┌─────────────────────────────────────────────────────────────────────┐
│                         GATEWAY / OPENCLAW                           │
│                    (Orquestração principal)                          │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│   CRON JOBS   │  │   MANUAL      │  │   HEARTBEAT   │
│ (Automations) │  │   TRIGGERS    │  │   (Monit.)    │
└───────┬───────┘  └───────┬───────┘  └───────────────┘
        │                  │
        ▼                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          SCRIPTS EXECUTORES                           │
├────────────────┬────────────────┬────────────────┬──────────────────┤
│ iGaming        │ PetSelect      │ JP             │ Vanessa          │
│ schedule-next- │ generate +     │ schedule-next- │ (Manual)         │
│ day.js         │ schedule.js    │ day.js         │                  │
└───────┬────────┴───────┬────────┴───────┬────────┴────────┬─────────┘
        │                │                │                 │
        ▼                ▼                ▼                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         APIS EXTERNAS                                 │
├────────────────┬────────────────┬────────────────┬──────────────────┤
│ Gemini API     │ Upload-Post    │ RClone         │ FFmpeg           │
│ (Imagens)      │ (Agendamento)  │ (Drive Sync)   │ (Vídeo Local)    │
└───────┬────────┴───────┬────────┴───────┬────────┴────────┬─────────┘
        │                │                │                 │
        ▼                ▼                ▼                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         GOOGLE DRIVE                                  │
│              (Armazenamento de assets e backup)                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 FLUXO DE EXECUÇÃO TÍPICO

### iGaming (D+1 Automation)
```
1. CRON dispara às 02:00
   ↓
2. schedule-next-day.js executa para cada perfil (TEO, JONATHAN, LAISE, PEDRO)
   ↓
3. Para cada perfil:
   a. Baixa refs do Drive (personagem + estilo)
   b. Baixa áudio aleatório
   c. Gera 6 imagens (uma para cada cenário)
   d. FFmpeg cria 6 vídeos com zoom
   e. Upload-Post agenda para horários de amanhã
   f. Registra no posting-log-v2.csv
   ↓
4. RClone faz backup às 07:00
   ↓
5. Daily Summary gerado às 07:35
```

### PetSelectUK (D+1 Automation)
```
1. CRON dispara às 02:00
   ↓
2. petselect-generate.js executa
   ↓
3. Gera assets (com delays de 5s entre requisições):
   a. Imagem 4:5 (produto)
   b. 5 slides de carrossel
   c. Cover 9:16 para Reels
   d. MP4 do Reels (zoom effect)
   ↓
4. petselect-schedule-next-day.js agenda:
   - Carrossel: 09:00 UK
   - Imagem: 13:00 UK
   - Reels: 19:00 UK
   ↓
5. Registra no posting-log-v2.csv
```

---

## 📊 MONITORAMENTO E MÉTRICAS

### Command Center (`/dashboard/command-center`)
- **Status em tempo real:** Alex Online/Offline
- **Pipeline visual:** Posts em cada estágio
- **System Metrics:** CPU, Memory, Tokens gastos hoje
- **Cronograma:** Próximas automações

### Kanban (`/dashboard/ops-enhanced/kanban`)
- **Backlog:** Tasks aguardando execução
- **Doing:** Tasks em progresso
- **Blocked:** Tasks bloqueadas (com motivo)
- **Done:** Tasks concluídas

### Custos (`/dashboard/costs`)
- **ai-usage.jsonl:** Log de todas as chamadas de IA
- **Cálculo automático:** Baseado em `config/ai-pricing.json`
- **Por projeto:** iGaming, PetSelect, etc.

---

## 🛠️ DIAGNÓSTICO DE PROBLEMAS

### Problema: iGaming não gera vídeos
```
CHECKLIST:
□ Gemini API Key configurada? (ops-dashboard/.env.local)
□ Pasta de referências populada? (Drive)
□ Pasta de áudios com arquivos? (Drive)
□ Credits disponíveis na Gemini?
□ posting-log-v2.csv mostra erros?
```

### Problema: PetSelect falha no carousel
```
CHECKLIST:
□ Delay configurado? (5s entre requests)
□ Assets existentes em petselectuk/outputs/?
□ Pasta de produtos populada?
□ Pasta de style_refs populada?
```

### Problema: JP não agenda
```
CHECKLIST:
□ Vídeo existe na pasta Drive?
□ Formato correto? (.mp4)
□ Drive folder ID correto? (1QfbkZUZMn6SICYQwovnyuQITlj95wYPw)
```

---

## 📁 ESTRUTURA DE ARQUIVOS

```
C:\Users\vsuga\clawd\
├── scripts/                    # Scripts de automação
│   ├── igaming-video.js       # Gera 1 vídeo iGaming
│   ├── schedule-next-day.js   # D+1 iGaming (6 vídeos)
│   ├── petselect-generate.js  # Gera assets PetSelect
│   ├── petselect-schedule-*.js # Agenda PetSelect
│   ├── jp-schedule-next-day.js# Agenda JP
│   └── backup-ops-to-drive.js # Backup IGAMING_OPS
│
├── config/                    # Configurações
│   ├── igaming-profiles.json  # Perfis iGaming
│   ├── vanessa-equilibre.json # Style guide Vanessa
│   ├── drive-ops.json         # Pasta OPS no Drive
│   └── ai-pricing.json        # Preços de IA (2026-02-02)
│
├── results/                   # Outputs e logs
│   ├── posting-log-v2.csv     # Log de todos os posts
│   ├── ai-usage.jsonl         # Uso de IA por chamada
│   └── runs/                  # Metadados de execuções
│
├── videos/                    # Vídeos iGaming gerados
│   ├── TEO/
│   ├── JONATHAN/
│   ├── LAISE/
│   └── PEDRO/
│
├── petselectuk/               # Projeto PetSelect
│   ├── products/              # Imagens de produtos
│   ├── style_refs/            # Referências de estilo
│   └── outputs/               # Assets gerados
│       ├── images/
│       ├── carousels/
│       └── reels/
│
├── docs/                      # Documentação
│   ├── vanessa-equilibreon/   # Docs Vanessa
│   └── (outros docs)
│
└── ops-dashboard/             # Dashboard web
    ├── src/app/dashboard/     # Páginas do dashboard
    └── .env.local             # API Keys (LOCAL)
```

---

## 🔗 LINKS ÚTEIS

- **Dashboard Local:** http://localhost:3000/dashboard
- **Command Center:** http://localhost:3000/dashboard/command-center
- **OPS Enhanced:** http://localhost:3000/dashboard/ops-enhanced
- **Drive OPS:** IGAMING_OPS folder
- **Posting Log:** `results/posting-log-v2.csv`

---

## 📋 CHANGELOG

**2026-02-02**
- ✅ Adicionado pricing real no `config/ai-pricing.json`
- ✅ Documentação completa de todos os projetos
- ✅ Fluxos de execução documentados
- ✅ Checklist de diagnóstico
- ✅ Estrutura de arquivos detalhada

---

**Atualizado:** 2026-02-02 09:00
