-- Run this in your Supabase SQL Editor

-- 1. Create the table
CREATE TABLE IF NOT EXISTS synthetic_minds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'Expert',
  apex_score FLOAT DEFAULT 0.0,
  neural_data_files INTEGER DEFAULT 0,
  top_skill TEXT DEFAULT 'Generalist',
  dna JSONB DEFAULT '{}'::jsonb,
  proficiencies JSONB DEFAULT '[]'::jsonb,
  about TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create index
CREATE INDEX IF NOT EXISTS idx_minds_apex_score ON synthetic_minds(apex_score DESC);

-- 3. Enable RLS
ALTER TABLE synthetic_minds ENABLE ROW LEVEL SECURITY;

-- 4. Policy
DROP POLICY IF EXISTS "Allow authenticated access" ON synthetic_minds;
CREATE POLICY "Allow authenticated access" ON synthetic_minds
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. Seed Data
INSERT INTO synthetic_minds (name, role, apex_score, neural_data_files, top_skill, dna, proficiencies, about) VALUES
  (
    'ALAN NICOLAS', 
    'Product Strategy', 
    7.0, 
    142, 
    'Product Strategy',
    '{
      "mbti": {"type": "ISTP", "stats": {"I": 75, "E": 25, "S": 65, "N": 35, "F": 15, "T": 85, "P": 60, "J": 40}},
      "enneagram": {"type": "5", "wing": "4", "subtype": "sp/sx/so", "label": "O Investigador"},
      "disc": {"D": 85, "I": 35, "S": 20, "C": 80, "label": "Perfeccionista Orientado a Resultados"},
      "specific_behaviors": [
        "Toma decisões rápidas baseadas em lógica e dados, sem necessidade de consenso social",
        "Cria frameworks e sistemas complexos para garantir clareza e eficiência operacional",
        "Demonstra impaciência explícita com lentidão"
      ]
    }'::jsonb,
    '[
      {"name": "Product Architecture", "level": 5},
      {"name": "Synthetical Knowledge", "level": 4},
      {"name": "Operational Efficiency", "level": 5}
    ]'::jsonb,
    'O Virtuoso Pragmático com profundidade emocional de O Investigador. Focado em amplificar a mente através da IA.'
  ),
  (
    'TEO', 
    'Sales Guru', 
    8.5, 
    320, 
    'Viral Persuasion',
    '{
      "mbti": {"type": "ENTP", "stats": {"I": 20, "E": 80, "S": 30, "N": 70, "F": 40, "T": 60, "P": 75, "J": 25}},
      "enneagram": {"type": "7", "wing": "8", "subtype": "sx/so", "label": "O Entusiasta"},
      "disc": {"D": 90, "I": 95, "S": 30, "C": 10, "label": "Promotor Influenciador"},
      "specific_behaviors": [
        "Gera ideias em massa e conecta pontos improváveis",
        "Alta capacidade de persuasão e quebra de objeções",
        "Foco em crescimento explosivo e viralidade"
      ]
    }'::jsonb,
    '[
      {"name": "Viral Marketing", "level": 5},
      {"name": "Direct Response", "level": 5},
      {"name": "Audience Psychology", "level": 4}
    ]'::jsonb,
    'Mestre da persuasão e crescimento viral. TEO é a base da estratégia de dominação de mercado.'
  )
ON CONFLICT DO NOTHING;
