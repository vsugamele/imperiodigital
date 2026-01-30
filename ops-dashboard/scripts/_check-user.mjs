import path from 'node:path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.OPS_ADMIN_EMAIL;

if (!url || !service || !email) {
  console.error('Missing env vars', { url: !!url, service: !!service, email: !!email });
  process.exit(1);
}

const supabase = createClient(url, service, { auth: { persistSession: false } });

const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
if (error) throw error;

const u = data.users.find((x) => (x.email || '').toLowerCase() === email.toLowerCase());
console.log('found', !!u);
if (u) {
  console.log({
    id: u.id,
    email: u.email,
    email_confirmed_at: u.email_confirmed_at,
    last_sign_in_at: u.last_sign_in_at,
  });
}
