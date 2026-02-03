# BOLO - Automação de Conteúdo com IA 🇧🇷

## 🎯 Visão

Criar uma plataforma SaaS brasileira de automação de conteúdo com IA, no estilo Holo, que permite businesses criarem anuncios, emails e posts automaticamente.

## 🎯 Diferenciais Competitivos

| Holo (EUA) | BOLO (Brasil) |
|------------|---------------|
| Preço em USD | Preço em BRL (mais acessível) |
| Suporte em inglês | Suporte em português |
| Templates internacionais | Templates focados no mercado brasileiro |
| Integrações EUA | PIX, Mercado Pago, RD Station, Kommo |

## 📦 MVP (v1.0) - 6-8 semanas

### Funcionalidades

| Módulo | Descrição |
|--------|-----------|
| **Dashboard** | Visão geral de campaigns, posts gerados, créditos |
| **Gerador de Posts** | Texto + Imagem para Instagram/Facebook/TikTok |
| **Gerador de Ads** | Criativos para Meta Ads com múltiplas variações |
| **Brand Voice** | IA aprende o tom da marca do cliente |
| **Agendamento** | Publicação direta ou via APIs |
| **Billing** | Credits system + Planos |

### Integrações MVP

| Plataforma | Status |
|------------|--------|
| Instagram | ✅ Upload-Post (já temos) |
| Facebook | ✅ Upload-Post |
| TikTok | 🔄 API TikTok |
| Meta Ads | 🔄 Marketing API |

### Preços MVP (R$)

| Plano | Preço | Credits/mês | Preço/credit |
|-------|-------|-------------|--------------|
| Starter | R$ 97/mês | 100 | R$ 0,97 |
| Pro | R$ 297/mês | 400 | R$ 0,74 |
| Agency | R$ 897/mês | 1500 | R$ 0,60 |

## 🏗️ Arquitetura

```
bolo/
├── docs/
│   ├── VISAO.md           ← Este arquivo
│   ├── ARQUITETURA.md     ← Tech stack, APIs, banco
│   └── MIGRACAO.md        ← Como migrar do Holo
├── src/
│   ├── app/               ← Next.js (Dashboard)
│   ├── components/        ← UI Kit
│   ├── lib/               ← Core (IA, integrações)
│   └── api/               ← Endpoints
├── scripts/
│   ├── generate-post.js   ← CLI para testes
│   └── seed-templates.js  ← Popular templates iniciais
└── bolo.config.json       ← Configurações globais
```

## 🔧 Tech Stack Sugerido

| Camada | Tecnologia |
|--------|------------|
| Frontend | Next.js 15 + Tailwind + Shadcn UI |
| Backend | Next.js API Routes / Server Actions |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| IA | Gemini API (nossa expertise) |
| Pagamentos | Mercado Pago (PIX + cartão) |
| Emails | Resend |

## 📋 Próximos Passos

1. [ ] Validar funcionalidades MVP com Vinicius
2. [ ] Definir nome final do produto
3. [ ] Criar repositório Git
4. [ ] Setup Next.js + Supabase
5. [ ] Implementar Auth
6. [ ] Criar Dashboard base
7. [ ] Implementar gerador de posts (MVP)

## 💡来源 de Receita

| Receita | Estimativa |
|---------|------------|
| Planos mensais | R$ 5.000-50.000/mês (ano 1) |
| Credits avulsos | R$ 500-5.000/mês |
| Agency custom | R$ 2.000-10.000/mês por cliente |

---

**Status:** 🟢 Em desenvolvimento - v1.0.0
**Build:** ✅ OK (10 páginas geradas)
**Próximo:** Auth + API geração real
**Criado:** 2026-02-02
