import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const res = await fetch(`${url}/rest/v1/cards?select=id,labels&limit=1`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` },
});

console.log('status', res.status);
console.log(await res.text());
