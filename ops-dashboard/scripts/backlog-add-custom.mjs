import path from 'node:path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.OPS_ADMIN_EMAIL;

const title = process.argv[2];
const description = process.argv[3] || '';
const labelsRaw = process.argv[4] || '';

if (!url || !service || !adminEmail) {
  console.error('Missing env vars', { url: !!url, service: !!service, adminEmail: !!adminEmail });
  process.exit(1);
}

if (!title) {
  console.error('Usage: node scripts/backlog-add-custom.mjs <title> [description] [labelsCsv]');
  process.exit(2);
}

const labels = labelsRaw
  ? labelsRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  : [];

const supabase = createClient(url, service, { auth: { persistSession: false } });

async function main() {
  const { data: users, error: uErr } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (uErr) throw uErr;
  const owner = users.users.find((u) => (u.email || '').toLowerCase() === adminEmail.toLowerCase());
  if (!owner) throw new Error(`Owner not found for email ${adminEmail}`);

  const { data: boards, error: bErr } = await supabase.from('boards').select('id,title').eq('owner_id', owner.id);
  if (bErr) throw bErr;
  const master = boards.find((b) => b.title === 'Master') || boards[0];
  if (!master) throw new Error('No board found');

  const { data: cols, error: cErr } = await supabase
    .from('columns')
    .select('id,title,position')
    .eq('board_id', master.id)
    .order('position', { ascending: true });
  if (cErr) throw cErr;

  const colByTitle = new Map((cols || []).map((c) => [c.title, c.id]));
  const backlogCol = colByTitle.get('Backlog') || cols?.[0]?.id;
  if (!backlogCol) throw new Error('No columns found');

  const { data: existing, error: eErr } = await supabase.from('cards').select('id,title').eq('board_id', master.id);
  if (eErr) throw eErr;
  const dup = (existing || []).find((c) => c.title === title);
  if (dup) {
    console.log('OK: already exists', dup);
    return;
  }

  const { data: ins, error: insErr } = await supabase
    .from('cards')
    .insert({
      board_id: master.id,
      column_id: backlogCol,
      owner_id: owner.id,
      title,
      description,
      position: -1 * (Date.now() % 1000000),
      labels,
    })
    .select('id,title');
  if (insErr) throw insErr;

  console.log('OK: inserted', ins?.[0]);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
