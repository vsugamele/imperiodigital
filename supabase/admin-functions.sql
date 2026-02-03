-- OpenClaw Admin Functions
-- Execute este SQL no Supabase SQL Editor para habilitar administração pela Alex

-- 1. Função para executar SQL dinamicamente (para a Alex/admin)
CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
RETURNS SETOF TEXT AS $$
BEGIN
  EXECUTE sql_query;
  RETURN QUERY SELECT 'Executado: ' || sql_query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Função para listar tabelas
CREATE OR REPLACE FUNCTION list_tables()
RETURNS TABLE (table_name TEXT) AS $$
  SELECT table_name FROM information_schema.tables 
  WHERE table_schema = 'public'
  ORDER BY table_name;
$$ LANGUAGE sql SECURITY DEFINER;

-- 3. Função para verificar se tabela existe
CREATE OR REPLACE FUNCTION table_exists(table_name TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = $1
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Teste
-- SELECT exec_sql('SELECT 1 as test');
-- SELECT * FROM list_tables();
-- SELECT table_exists('users');
