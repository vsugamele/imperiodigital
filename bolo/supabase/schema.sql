-- BOLO - Schema Supabase (SAFE - executa sem erros se já existir)
-- Execute no Editor SQL do Supabase

-- ============================================
-- PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS bolo_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  company_name TEXT,
  brand_voice TEXT,
  credits INTEGER DEFAULT 100,
  plan TEXT DEFAULT 'starter',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bolo_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate safely
DROP POLICY IF EXISTS "Users can view own profile" ON bolo_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON bolo_profiles;

CREATE POLICY "Users can view own profile" ON bolo_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON bolo_profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- TEMPLATES
-- ============================================
CREATE TABLE IF NOT EXISTS bolo_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  niche TEXT NOT NULL,
  platform TEXT NOT NULL,
  prompt_template TEXT NOT NULL,
  example_copy TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert templates (ignore if exists)
INSERT INTO bolo_templates (name, niche, platform, prompt_template, example_copy)
VALUES
('Promoção Urgente', 'ecommerce', 'instagram', 'Crie um post para {{produto}} com tom urgente. Inclua: hook de atenção, benefícios, CTA para compra.', '🔥 OFERTA LIMITADA! 🔥\n\n{{produto}} com 50% OFF\n\n⏰ Só hoje!\n\n👉 Comprar agora'),
('Resultados iGaming', 'igaming', 'instagram', 'Crie um post sobre {{topico}} no estilo iGaming. Tom: confiante, descontraído, direto.', '💰 {{topico}}\n\nVocê也想 saber mais?\n\n*Manda aqui 🔥👇*'),
('Saúde Bem-estar', 'saude', 'instagram', 'Crie um post sobre {{topico}} no nicho de saúde. Tom: profissional, acolhedor, motivacional.', '🌿 {{topico}}\n\nTransforme sua saúde hoje!\n\n💬 Comenta que eu te ajudo!')
ON CONFLICT DO NOTHING;

-- ============================================
-- GENERATED CONTENT
-- ============================================
CREATE TABLE IF NOT EXISTS bolo_generated_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES bolo_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  platform TEXT NOT NULL,
  prompt_used TEXT,
  image_url TEXT,
  video_url TEXT,
  copy TEXT,
  credits_used INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bolo_generated_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own content" ON bolo_generated_content;
DROP POLICY IF EXISTS "Users can create content" ON bolo_generated_content;

CREATE POLICY "Users can view own content" ON bolo_generated_content
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create content" ON bolo_generated_content
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- CAMPAIGNS
-- ============================================
CREATE TABLE IF NOT EXISTS bolo_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES bolo_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  platforms TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bolo_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own campaigns" ON bolo_campaigns;
DROP POLICY IF EXISTS "Users can manage campaigns" ON bolo_campaigns;

CREATE POLICY "Users can view own campaigns" ON bolo_campaigns
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage campaigns" ON bolo_campaigns
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- TRANSACTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS bolo_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES bolo_profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  credits_added INTEGER NOT NULL,
  payment_id TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bolo_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own transactions" ON bolo_transactions;
DROP POLICY IF EXISTS "System can update transactions" ON bolo_transactions;

CREATE POLICY "Users can view own transactions" ON bolo_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can update transactions" ON bolo_transactions
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & INDEXES
-- ============================================
CREATE OR REPLACE FUNCTION update_bolo_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_bolo_profiles_updated_at ON bolo_profiles;
CREATE TRIGGER update_bolo_profiles_updated_at
  BEFORE UPDATE ON bolo_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_bolo_profiles_updated_at();

CREATE INDEX IF NOT EXISTS idx_bolo_generated_content_user_id ON bolo_generated_content(user_id);
CREATE INDEX IF NOT EXISTS idx_bolo_campaigns_user_id ON bolo_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_bolo_transactions_user_id ON bolo_transactions(user_id);

-- Result
SELECT 'BOLO schema created successfully!' as status;
