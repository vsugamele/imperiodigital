import path from 'node:path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.OPS_ADMIN_EMAIL;

const supabase = createClient(url, service, { auth: { persistSession: false } });

const { data: users } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
const owner = users.users.find((u) => (u.email || '').toLowerCase() === email.toLowerCase());

const { data: boards } = await supabase.from('boards').select('id,title').eq('owner_id', owner.id);
const master = boards.find((b) => b.title === 'Master') || boards[0];

const { data: cols } = await supabase.from('columns').select('id,title,position').eq('board_id', master.id);
const byId = new Map(cols.map((c)=>[c.id,c.title]));

const { data: cards } = await supabase.from('cards').select('id,title,labels,column_id,created_at').eq('board_id', master.id).order('created_at',{ascending:true});

for (const c of cards) {
  console.log(`[${byId.get(c.column_id)}] ${c.id} ${c.title} :: ${(c.labels||[]).join(',')}`);
}
