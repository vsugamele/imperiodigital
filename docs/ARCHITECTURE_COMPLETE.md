# Empire Architecture: Macro & Micro Views

This document outlines the architectural structure of the Empire Command Center and the specific "Vertical iGaming" content generation flow.

## 1. Macro Architecture (Higher Level)

The macro architecture shows the integration between the orchestrator (Clawdbot/Alex), the AI engines, asset storage, and the final distribution channels.

```mermaid
graph TD
    subgraph "Control Plane"
        User([Vinicius / Admin]) --- Alex[Clawdbot Agent]
        Alex --- PM2[PM2 Runtime]
    end

    subgraph "Compute & AI"
        Alex -->|Trigger| Scripts[iGaming / PetSelect / VaaS Scripts]
        Scripts -->|Image Gen| Gemini[Gemini 1.5 Pro / 3 Pro]
        Scripts -->|Narrative| Claude[Claude 3.5 Sonnet]
    end

    subgraph "Storage & Assets"
        Scripts <-->|Check/Load| GDrive[Google Drive / Rclone]
        Scripts --- LocalDB[./results/ CSV & JSON]
        Alex --- Supabase[(Supabase DB)]
    end

    subgraph "Production & Post"
        Scripts -->|Composite| FFmpeg[FFmpeg Engine]
        Scripts -->|Audio| Audios[Trending Audio Assets]
        Scripts -->|Social| PostAPI[Upload-Post API]
    end

    Alex -->|Status| Dashboard[Ops Dashboard]
    Supabase --> Dashboard
```

## 2. Micro Architecture: Vertical iGaming Flow

Detailed logic for the daily generation of Reels for profiles: **Teo, Laise, Pedro, Jonathan**.

```mermaid
sequenceDiagram
    autonumber
    participant S as iGaming Script
    participant G as GDrive (/no_cost/images)
    participant J as Gemini 3 Pro Image
    participant F as FFmpeg
    participant P as Social Media API

    Note over S: Triggered at 07:00 (v1)
    S->>G: Vigilância: Monitora pasta /no_cost/images
    
    alt Images Found
        G-->>S: Use Base Images (Manual Curation)
    else Folder Empty
        S->>G: Load Identidade (reference/[perfil]_ref.png)
        S->>G: Load Estilo (Layout References)
        S->>J: Prompt: Luxo/Conquista Hyper-Realistic
        J-->>S: Generated High-End Image
    end

    S->>G: Get Trending Audio (Audios em Alta)
    S->>F: FFmpeg: Apply Ken Burns Effect (15s Zoom)
    F-->>S: Ready Video Asset

    S->>P: Schedule Postings (10h, 13h, 16h, 19h, 21h, 23h)
    P-->>S: 200 OK & Log in posting-log.csv
```

## 3. Deployment & Scalability
- **Process Manager**: All core agents run under `pm2` for auto-restart and log rotation.
- **Data Sync**: Local logs are periodically synced to Supabase for global visibility in the Ops Dashboard.
- **Multitenancy**: The script handles multiple profiles by switching context paths (`/no_cost/images`, `reference/`, etc.) based on the profile owner.

## 4. Guia Operacional do Time (Operational Guide)

Para que o império funcione em escala, as responsabilidades estão divididas da seguinte forma:

| Papel | Responsabilidade | Ferramenta Principal |
| :--- | :--- | :--- |
| **Curadoria (Teo/Laise/etc)** | Alimentar GDrive `/no_cost/images` com fotos reais | Google Drive |
| **Operador de IA (Alex)** | Monitorar PM2 e logs de erro do Clawdbot | CLI / Dashboard |
| **Head de Marketing** | Analisar métricas em `MarketingSummary` e ajustar agenda | Ops Dashboard |
| **Desenvolvedor** | Criar novas skills e otimizar scripts de vídeo | VS Code / GitHub |

### Ação Necessária por Status:
- **`queued`**: Aguardando processamento. Nenhuma ação necessária.
- **`scheduled`**: Post pronto e agendado. Monitorar se entra em `pending`.
- **`status_check_failed`**: Erro de comunicação. Operador deve conferir no Instagram.

## 5. Catálogo de Skills & Capacidades (OpenClaw)

O OpenClaw (evolução do Clawdbot) possui as seguintes capacidades integradas:

### Nucleares (Core)
- **`goplaces`**: Integração com Google Places para busca de localizações e inteligência geográfica.
- **`openai-image-gen`**: Geração de imagens via DALL-E 3 para assets complementares.
- **`openai-whisper-api`**: Transcrição de áudio ultra-precisa para legendagem.
- **`nano-banana-pro`**: Motor proprietário de análise rápida de tendências.

### Verticais (Empire)
- **iGaming Engine**: Motor de vídeo 4K focado em estética de luxo e apostas.
- **PetSelect UK**: Curadoria e tradução estratégica de conteúdo viral pet.
- **VaaS (Posting)**: Sistema de agendamento e postagem multicanal (Instagram/TikTok).
- **ElevenLabs TTS**: Narração humanizada para vídeos narrados.

---
> [!NOTE]
> Todos os logs de execução são consolidados em `results/` e sincronizados via Supabase para transparência total.

## 6. Arquitetura Detalhada por Projeto (Project-Specific Flows)

Para maior clareza operacional, abaixo estão os fluxos isolados de cada vertical do Império.

### A. iGaming Empire (VaaS)
Focado em volume e estética de alto padrão.
```mermaid
graph LR
    A[GDrive /no_cost] -->|Curadoria| B(iGaming Script)
    C[Fallback Gemini 3 Pro] -->|Gen Image| B
    B --> D{FFmpeg Composite}
    D -->|Ken Burns| E[Audio Trending]
    E --> F[VaaS API]
    F --> G[Social: Teo/Laise/Pedro/Jonathan]
```

### B. PetSelect UK (Dropship)
Focado em curadoria viral e arbitragem de conteúdo.
```mermaid
graph LR
    A[TikTok Scraping UK] -->|Trends| B(PetSelect Script)
    B --> C{Rclone Download}
    C --> D[Claude 3.5 Sonnet]
    D -->|Legendagem/AD| E[Auto-Scheduler]
    E --> F[Instagram: PetSelectUK]
```

### C. VaaS (Software & Tenancy)
A camada de produto que escala a infraestrutura.
```mermaid
graph TD
    A[Next.js Frontend] --> B[Supabase Auth]
    B --> C[Tenancy Manager]
    C --> D[Job Queue]
    D --> E[Internal OpenClaw Node]
    E --> F[Stripe Subscription]
```

---
> [!IMPORTANT]
> A manutenção da **identidade visual** de cada perfil (Teo, Laise, etc.) é garantida pelo uso de pastas `/reference` específicas que o script consulta antes de gerar qualquer imagem via IA.
