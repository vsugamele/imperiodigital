# Catálogo de Skills & Capacidades OpenClaw

Este documento detalha todas as habilidades técnicas e funcionais do sistema OpenClaw (anteriormente Clawdbot).

## 1. Skills de Inteligência (Modelos & Lógica)

### 🧠 Alex Core (Orquestrador)
O cérebro central que decide qual script rodar baseado no backlog do Kanban.
- **Capacidade**: Gerenciamento de estado, roteamento de prompts e fallback de modelos.
- **Modelos**: Gemini 3 Flash, GPT-5.2 Codex, Claude 3.5 Sonnet.

### 🍌 Nano-Banana Pro
Motor otimizado para análise de alta velocidade de grandes volumes de texto/dados.
- **Uso**: Filtragem de comentários, categorização de tendências e limpeza de datasets.

### 📍 GoPlaces & Local-Places
Integração com APIs de geolocalização.
- **Uso**: Enriquecimento de conteúdo com dados reais de locais (luxo, cassinos, pontos turísticos).

## 2. Skills de Produção (Mídia)

### 🎬 iGaming Video Engine
Especializado em vídeos curtos (Reels/TikTok) de alto padrão.
- **Efeitos**: Zoom Ken Burns, legendagem dinâmica, sincronização de áudio trending.
- **Nicho**: Luxo, Apostas, Lifestyle.

### 🎙️ ElevenLabs TTS
Síntese de voz neural ultra-realista.
- **Capacidade**: Clonagem de voz e narração em 29+ idiomas com tom emocional.

### 🎨 OpenAI Image-Gen (DALL-E 3)
Geração de imagens fotorrealistas.
- **Uso**: Fallback quando não há fotos reais na curadoria.

## 3. Skills de Distribuição (VaaS)

### 🚀 Upload-Post API
Integração direta com APIs de redes sociais.
- **Capacidade**: Upload de metadados, scheduling por timezone e retry automático.

### 📊 Marketing Ledger
Sistema de rastreabilidade via CSV/Dashboard.
- **Capacidade**: Logs detalhados de cada post, ID de transação e status de aprovação.

---

## Como o Time Usa as Skills?
1. **Curadores**: Usam a skill de "Curadoria Humana" alimentando o Drive.
2. **Alex**: Usa as skills de "Lógica IA" para decidir se gera imagem ou usa a curadoria.
3. **Dashboard**: Usa as skills de "Marketing Ledger" para mostrar os agendamentos.
