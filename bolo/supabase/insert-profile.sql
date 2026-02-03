-- BOLO - Insert profile for existing user
-- Execute no SQL Editor do Supabase

-- Primeiro, encontra o ID do usuário
SELECT id, email FROM auth.users WHERE email = 'vinaum123@gmail.com';

-- Depois, insere o profile manualmente
INSERT INTO public.bolo_profiles (id, email, company_name, credits, plan)
SELECT 
  id,
  email,
  'Viniccius',  -- company_name do metadata
  100,
  'starter'
FROM auth.users 
WHERE email = 'vinaum123@gmail.com'
ON CONFLICT (id) DO NOTHING;

-- Verifica se foi criado
SELECT * FROM public.bolo_profiles WHERE email = 'vinaum123@gmail.com';
