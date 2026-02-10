-- Migration: Create dashboard_projects table
-- Run this in your Supabase SQL Editor
-- Using different name to avoid conflicts with existing 'projects' table

-- Create dashboard_projects table
CREATE TABLE IF NOT EXISTS dashboard_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  emoji TEXT DEFAULT '🚀',
  description TEXT DEFAULT '',
  color TEXT DEFAULT '#4edc88',
  status TEXT DEFAULT 'active',
  tasks_total INTEGER DEFAULT 0,
  tasks_done INTEGER DEFAULT 0,
  team TEXT[] DEFAULT ARRAY[]::TEXT[],
  workspace_path TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add constraint
ALTER TABLE dashboard_projects DROP CONSTRAINT IF EXISTS dashboard_projects_status_check;
ALTER TABLE dashboard_projects ADD CONSTRAINT dashboard_projects_status_check 
  CHECK (status IN ('active', 'paused', 'completed'));

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_dashboard_projects_status ON dashboard_projects(status);
CREATE INDEX IF NOT EXISTS idx_dashboard_projects_created_at ON dashboard_projects(created_at DESC);

-- Enable RLS
ALTER TABLE dashboard_projects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users
DROP POLICY IF EXISTS "Allow authenticated access" ON dashboard_projects;
CREATE POLICY "Allow authenticated access" ON dashboard_projects
  FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- Optional: Allow public read access
DROP POLICY IF EXISTS "Allow public read" ON dashboard_projects;
CREATE POLICY "Allow public read" ON dashboard_projects
  FOR SELECT 
  TO anon 
  USING (true);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_dashboard_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_dashboard_projects_updated_at ON dashboard_projects;
CREATE TRIGGER update_dashboard_projects_updated_at
  BEFORE UPDATE ON dashboard_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_dashboard_projects_updated_at();

-- Insert default projects
INSERT INTO dashboard_projects (name, emoji, description, color, status, tasks_total, tasks_done, team) VALUES
  ('iGaming Empire', '🎰', 'Automação de conteúdo para marcas de iGaming', '#ff6b6b', 'active', 12, 8, ARRAY['TEO', 'JONATHAN', 'LAISE', 'PEDRO']),
  ('PetSelect UK', '🐕', 'Geração de vídeos para e-commerce de pets', '#4ecdc4', 'active', 8, 5, ARRAY['PETSELECT']),
  ('VaaS Platform', '🎬', 'Video as a Service - plataforma SaaS', '#a78bfa', 'paused', 20, 4, ARRAY[]::TEXT[]),
  ('Infraestrutura', '🏗️', 'Dashboard, automações e monitoramento', '#ffd93d', 'active', 15, 10, ARRAY['ALEX'])
ON CONFLICT DO NOTHING;
