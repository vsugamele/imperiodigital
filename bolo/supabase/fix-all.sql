-- BOLO - Drop e recriar trigger de profile
-- Execute isso no SQL Editor

-- Drop trigger antigo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Criar função para criar profile automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.bolo_profiles (id, email, company_name, credits, plan)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'company_name',
    100,
    'starter'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Criar profile para usuário existente
INSERT INTO public.bolo_profiles (id, email, company_name, credits, plan)
SELECT 
  id,
  email,
  'Viniccius',
  100,
  'starter'
FROM auth.users 
WHERE email = 'vinaum123@gmail.com'
ON CONFLICT (id) DO NOTHING;

-- Verificar
SELECT 'Trigger recriado!' as status;
SELECT * FROM public.bolo_profiles WHERE email = 'vinaum123@gmail.com';
