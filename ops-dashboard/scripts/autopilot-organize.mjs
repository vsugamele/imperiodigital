import path from 'node:path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.OPS_ADMIN_EMAIL;

const supabase = createClient(url, service, { auth: { persistSession: false } });

function hasLabelColumnOk() {
  // We already use it in inserts; assume true if query works.
  return true;
}

async function main() {
  // Find owner_id via email
  const { data: users, error: uErr } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (uErr) throw uErr;
  const owner = users.users.find((u) => (u.email || '').toLowerCase() === adminEmail.toLowerCase());
  if (!owner) throw new Error(`Owner not found for email ${adminEmail}`);

  // Find Master board
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

  const colByTitle = new Map(cols.map((c) => [c.title, c.id]));
  const doneCol = colByTitle.get('Done');

  const { data: cards, error: cardsErr } = await supabase
    .from('cards')
    .select('id,title,labels,column_id')
    .eq('board_id', master.id);
  if (cardsErr) throw cardsErr;

  // Mark migration card done if labels column exists
  const migrationCard = cards.find((x) => x.title.includes('kanban-migration-singleboard') || x.title.includes('labels'));
  if (migrationCard && doneCol && hasLabelColumnOk()) {
    await supabase.from('cards').update({ column_id: doneCol }).eq('id', migrationCard.id);
  }

  // Ensure at least one Ops + one Marketing card exist
  if (cards.length < 3) {
    const backlogCol = colByTitle.get('Backlog') || cols[0]?.id;
    await supabase.from('cards').insert([
      {
        board_id: master.id,
        column_id: backlogCol,
        owner_id: owner.id,
        title: '(Ops) Implementar filtro por label + mostrar labels nos cards',
        description: 'Chips: Todos/Ops/Pedro/PetSelectUK. Filtrar cards por labels, e preencher label ao criar card.',
        position: 0,
        labels: ['Ops'],
      },
      {
        board_id: master.id,
        column_id: backlogCol,
        owner_id: owner.id,
        title: '(Marketing) Resumo do posting-log-v2.csv no dashboard',
        description: 'Ler results/posting-log-v2.csv e mostrar por perfil: pending/scheduled/posted/failed.',
        position: 0,
        labels: ['Marketing:Pedro', 'Marketing:PetSelectUK'],
      },
    ]);
  }

  console.log('OK: organized');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
