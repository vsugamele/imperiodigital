import path from 'node:path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.OPS_ADMIN_EMAIL;

if (!url || !service || !adminEmail) {
  console.error('Missing env vars', { url: !!url, service: !!service, adminEmail: !!adminEmail });
  process.exit(1);
}

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

  const items = [
    {
      title: '(Ops/Data) Centralizar “planilhas do Drive” como fonte de dados (mapeamento + sync + leitura no dashboard)',
      labels: ['Ops', 'Data'],
      description:
        'Definir padrão: Drive → CSV/Sheets como source of truth. Criar config/drive-datasets.json (nome, folderId/path, schema). Sync local p/ results/ e expor no dashboard.',
    },
    {
      title: '(Ops) Kanban: tela de “Boards” + visão de atividades (não só Master)',
      labels: ['Ops'],
      description:
        'Hoje o dashboard assume board Master. Criar tela pra listar boards existentes, abrir board selecionado e ver cards/colunas.',
    },
    {
      title: '(Ops) Dashboard: página “Automações” com horários + últimas execuções + status',
      labels: ['Ops', 'Data'],
      description:
        'Mostrar: cron jobs (Clawdbot), Task Scheduler watchdogs, e rotinas (poll, D+1, backup). Exibir: schedule, lastRun, lastResult, nextRun, logs.',
    },
    {
      title: '(Ops) PetSelectUK: automatizar D+1 diário (petselect-schedule-next-day.js)',
      labels: ['Ops', 'Marketing'],
      description:
        'Adicionar na rotina diária, com resumo no Telegram + log no posting-log-v2.csv.',
    },
    {
      title: '(Ops) iGaming: modo no_cost + fallback (usar Drive/no_cost/images; se vazio, gera do zero)',
      labels: ['Ops', 'Marketing'],
      description:
        'Criar pasta no_cost/images por perfil e alterar pipeline: usar imagem pronta → FFmpeg+áudio; fallback: Gemini/refs.',
    },
    {
      title: '(Ops) iGaming: referência fixa por perfil (eliminar randômico)',
      labels: ['Ops', 'Marketing'],
      description:
        'Padronizar Drive/reference/<profile>_ref.png e cache local. Nunca escolher aleatório na raiz da pasta.',
    },
  ];

  const { data: existing, error: eErr } = await supabase
    .from('cards')
    .select('id,title')
    .eq('board_id', master.id);
  if (eErr) throw eErr;
  const existingTitles = new Set((existing || []).map((c) => c.title));

  const toInsert = items
    .filter((x) => !existingTitles.has(x.title))
    .map((x, i) => ({
      board_id: master.id,
      column_id: backlogCol,
      owner_id: owner.id,
      title: x.title,
      description: x.description,
      position: -1 * (i + 100),
      labels: x.labels,
    }));

  if (!toInsert.length) {
    console.log('OK: no new backlog items');
    return;
  }

  const { error: insErr } = await supabase.from('cards').insert(toInsert);
  if (insErr) throw insErr;

  console.log(`OK: inserted ${toInsert.length} backlog items`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
