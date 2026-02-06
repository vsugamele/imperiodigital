# 🌐 Auditoria de Redes Sociais - Potencial de Expansão

Atualmente, o ecossistema OpenClaw está focado em **Instagram** (Feed e Reels). Para "aprimorar o cérebro" e explorar novas redes, aqui está o mapeamento de potencial:

## 1. Plataformas Identificadas

| Rede Social | Status Atual | Potencial de Uso | Esforço de Adaptação |
|-------------|--------------|-------------------|----------------------|
| **Instagram** | 🟢 ATIVO | Máximo (Reels/Feed) | Nenhum (Já integrado) |
| **TikTok** | 🔴 PENDENTE | Altíssimo (Viralidade) | Baixo (Mesmo formato 9:16) |
| **YouTube Shorts** | 🔴 PENDENTE | Alto (Long-term SEO) | Baixo (Mesmo formato 9:16) |
| **Threads** | 🔴 PENDENTE | Médio (Text-based) | Médio (Mudar criativo p/ texto) |
| **Twitter (X)** | 🔴 PENDENTE | Médio (Nicho iGaming) | Médio (Foco em copy rápida) |
| **Facebook Reels** | 🔴 PENDENTE | Médio (Público Religioso) | Baixo (Mesmo formato 9:16) |

## 2. Lacunas no Cérebro (Dados Faltantes)

Para expandir para essas redes, o sistema precisa:
- **API Keys / Cookies**: Credenciais específicas no `upload-post.js` para TikTok e YT.
- **Métricas Compartilhadas**: O `daily-reporter.js` precisa ser atualizado para somar visualizações cross-platform.
- **Adaptação de Copy**: O `eugene` (worker de copy) precisa de instruções para "Short Descriptions" (YT) e "Hashtags Virais" (TikTok).

## 3. Próximas Ações Recomendadas

1. **Ativar TikTok**: Usar o mesmo pipeline de `igaming-video.js` e `religion-scheduler.js`.
2. **Ativar YouTube Shorts**: Focar em aumentar a "Authority Score" da marca.
3. **Cérebro Multicanal**: Criar uma tabela de "Cross-Posting" no Command Center para evitar duplicidade manual.
