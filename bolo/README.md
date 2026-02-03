# BOLO - Automação de Conteúdo com IA 🇧🇻

## Status Atual

### ✅ Concluído (7/12 tarefas)

| ID | Tarefa | Status |
|----|--------|--------|
| B1 | Nome definido: BOLO | ✅ |
| B2 | Estrutura de arquivos | ✅ |
| B3 | Setup Next.js + Build | ✅ |
| B4 | Auth (Supabase) | ⚠️ Aguardando config |
| B5 | Dashboard UI | ✅ |
| B6 | Fluxo de Geração (Gemini) | ✅ |
| B11 | Billing Page | ✅ |
| B12 | API de Credits | ✅ |

### 🔄 Aguardando

| ID | Tarefa | Descrição |
|----|--------|-----------|
| B7 | Mercado Pago | Pagamentos PIX/Cartão |
| B8 | TikTok API | Publicação automática |
| B9 | Brand Voice Engine | Tom da marca |
| B10 | Templates Marketplace | Templates por nicho |

---

## Como Rodar

```bash
cd bolo
npm run dev
```

Acesso: **http://localhost:3001**

---

## Configuração do Supabase

Para ativar o Auth, configure o arquivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
```

Depois, execute o schema em `supabase/schema.sql` no painel do Supabase.

---

## APIs Implementadas

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/generate` | POST | Gera conteúdo com Gemini |
| `/api/templates` | GET | Lista templates por nicho |
| `/api/credits` | GET/POST | Gerencia créditos |
| `/api/debug` | - | Debug de configuração |

---

## Páginas

| Rota | Descrição |
|------|-----------|
| `/` | Landing page |
| `/login` | Login (em manutenção) |
| `/register` | Cadastro (em manutenção) |
| `/dashboard` | Painel principal |
| `/dashboard/generate` | Gerar conteúdo |
| `/dashboard/billing` | Comprar créditos |

---

## Próximos Passos

1. Configurar Supabase novo ou corrigir chaves
2. Ativar Auth
3. Integrar Mercado Pago (B7)
4. TikTok API (B8)
