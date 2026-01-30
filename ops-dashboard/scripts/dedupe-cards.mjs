import path from 'node:path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.OPS_ADMIN_EMAIL;

const supabase = createClient(url, service, { auth: { persistSession: false } });

const { data: users, error: uErr } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
if (uErr) throw uErr;
const owner = users.users.find((u) => (u.email || '').toLowerCase() === email.toLowerCase());
if (!owner) throw new Error('Owner not found');

const { data: boards, error: bErr } = await supabase.from('boards').select('id,title').eq('owner_id', owner.id);
if (bErr) throw bErr;
const master = boards.find((b) => b.title === 'Master') || boards[0];
if (!master) throw new Error('Master board not found');

const { data: cards, error: cErr } = await supabase
  .from('cards')
  .select('id,title,column_id,created_at')
  .eq('board_id', master.id)
  .order('created_at', { ascending: true });
if (cErr) throw cErr;

// Dedupe by title only: keep oldest occurrence (single-board view uses labels/columns)
const seen = new Map();
const toDelete = [];
for (const card of cards) {
  const key = `${card.title}`;
  if (seen.has(key)) toDelete.push(card.id);
  else seen.set(key, card.id);
}

const deleteCount = toDelete.length;
if (deleteCount) {
  // delete in chunks
  while (toDelete.length) {
    const chunk = toDelete.splice(0, 50);
    const { error } = await supabase.from('cards').delete().in('id', chunk);
    if (error) throw error;
  }
}

console.log('OK', { deleted: deleteCount });
