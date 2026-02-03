# BOLO - Arquitetura Técnica

## 🏗️ Stack Tecnológica

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn UI
- **Charts:** Recharts
- **State:** Zustand

### Backend
- **API:** Next.js Server Actions + Route Handlers
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (Email + Social)
- **Queue:** Supabase Postgres Functions / Cron

### IA & Conteúdo
- **Geração de texto:** Gemini 2.0 Flash
- **Geração de imagem:** Gemini 3 Pro Image
- **Processamento:** FFmpeg (vídeos)

### Pagamentos
- **Processor:** Mercado Pago SDK
- **PIX:** Instantâneo
- **Cartão:** split payments

---

## 📊 Schema do Banco (Supabase)

```sql
-- Users (via Supabase Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  company_name TEXT,
  brand_voice TEXT, -- contexto para IA
  credits INTEGER DEFAULT 100,
  plan TEXT DEFAULT 'starter',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Templates (pré-criados)
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  niche TEXT, -- igaming, ecommerce, saude, etc
  platform TEXT, -- instagram, facebook, tiktok
  prompt_template TEXT,
  example_copy TEXT,
  active BOOLEAN DEFAULT true
);

-- Generated Content
CREATE TABLE generated_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  type TEXT, -- post, ad, carousel, story
  platform TEXT,
  prompt_used TEXT,
  image_url TEXT,
  video_url TEXT,
  copy TEXT,
  credits_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaigns
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  name TEXT,
  status TEXT DEFAULT 'draft', -- draft, scheduled, posted
  scheduled_at TIMESTAMPTZ,
  platforms TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  amount DECIMAL(10,2),
  credits_added INTEGER,
  payment_id TEXT, -- Mercado Pago ID
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔐 APIs & Integrações

### Instagram/Facebook
- **Provider:** Upload-Post API (já utilizamos)
- **Endpoint:** `https://api.upload-post.com/v1/posts`

### TikTok
- **Provider:** TikTok Marketing API
- **Documentação:** https://developers.tiktok.com/doc/

### Mercado Pago
- **SDK:** `mercadopago` (npm)
- **Checkout:** PIX + Cartão
- **Webhook:** Receber confirmações de pagamento

### Gemini API
- **Provider:** Google Generative Language API
- **Models:** 
  - `gemini-2.0-flash-exp` (texto)
  - `gemini-3-pro-image-preview` (imagem)

---

## 📁 Estrutura de Pastas

```
bolo/
├── src/
│   ├── app/
│   │   ├── (auth)/          ← Login/Register
│   │   ├── (dashboard)/     ← App principal
│   │   │   ├── generate/    ← Página de geração
│   │   │   ├── campaigns/   ← Lista de campanhas
│   │   │   ├── billing/     ← Crédito e planos
│   │   │   └── settings/    ← Configurações
│   │   └── api/
│   │       ├── generate/    ← POST - gerar conteúdo
│   │       ├── upload/      ← POST - publicar
│   │       └── webhooks/    ← Mercado Pago, etc
│   ├── components/
│   │   ├── ui/              ← Shadcn components
│   │   ├── generate/        ← Stepper, preview, etc
│   │   └── billing/         ← Plans, credits display
│   ├── lib/
│   │   ├── supabase/        ← Client & server
│   │   ├── gemini/          ← Text & image generation
│   │   ├── integrations/    ← Instagram, TikTok, etc
│   │   └── mercado-pago/    ← Pagamentos
│   └── styles/
│       └── globals.css
├── scripts/
│   └── seed-templates.js    ← Popula templates iniciais
├── bolo.config.json
└── next.config.js
```

---

## 🚀 Fluxo de Geração de Post

```
1. Usuário entra em /generate
2. Seleciona:
   - Plataforma (Instagram/TikTok)
   - Tipo (Post/Reels/Carrossel)
   - Nicho (iGaming/E-commerce/Saúde)
   - Tom (Formal/Casual/Urgente)
3. Input: "Quero vender curso de trader"
4. Backend:
   - Busca template do nicho
   - Preenche com Gemini (tom aplicado)
   - Gera imagem com Gemini (se necessário)
5. Preview mostra resultado
6. Usuário clica "Gerar Variação" (2-3 opções)
7. Seleciona melhor opção → Publica ou Agenda
8. Desconta credits → Salva em generated_content
```

---

## 💰 Fluxo de Pagamento

```
1. Usuário vê "Saldo: 50 credits"
2. Clica "Comprar mais"
3. Seleciona pacote (R$ 97 = 100 credits)
4. Pagamento via Mercado Pago (PIX/Cartão)
5. Webhook recebe confirmação
6. Supabase atualiza credits do usuário
7. Email de confirmação (Resend)
```

---

## 🔒 Segurança

- Row Level Security (RLS) no Supabase
- Rate limiting por usuário
- Credits validation server-side
- Webhook signature verification (Mercado Pago)
- API keys em variáveis de ambiente (.env.local)
