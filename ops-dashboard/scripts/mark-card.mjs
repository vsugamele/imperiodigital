import path from 'node:path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.OPS_ADMIN_EMAIL;

const titleContains = process.argv[2];
const toColumnTitle = process.argv[3] || 'Done';
const note = process.argv[4] || '';

if (!titleContains) {
  console.error('Usage: node scripts/mark-card.mjs <titleContains> [toColumnTitle] [note]');
  process.exit(1);
}

const supabase = createClient(url, service, { auth: { persistSession: false } });

const { data: users, error: uErr } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
if (uErr) throw uErr;
const owner = users.users.find((u) => (u.email || '').toLowerCase() === email.toLowerCase());
if (!owner) throw new Error('Owner not found');

const { data: boards } = await supabase.from('boards').select('id,title').eq('owner_id', owner.id);
const master = boards.find((b) => b.title === 'Master') || boards[0];
if (!master) throw new Error('Master board not found');

const { data: cols } = await supabase.from('columns').select('id,title').eq('board_id', master.id);
const toCol = cols.find((c) => c.title === toColumnTitle) || cols[0];

const { data: cards } = await supabase.from('cards').select('id,title,description,column_id').eq('board_id', master.id);
const card = cards.find((c) => (c.title || '').includes(titleContains));
if (!card) {
  console.log('Card not found');
  process.exit(0);
}

const newDesc = note ? `${card.description || ''}\n\n[auto] ${note}`.trim() : card.description;

await supabase.from('cards').update({ column_id: toCol.id, description: newDesc }).eq('id', card.id);
console.log('OK', { id: card.id, movedTo: toColumnTitle });
