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
      title: '(Ops) Conectar repositório no GitHub + CI básico (lint/build) + checklist de deploy',
      labels: ['Ops'],
      description:
        'Objetivo: versionar e dar rastreabilidade. Definir repo, adicionar .gitignore, commitar workspace, configurar Actions (node + tests).',
    },
    {
      title: '(Data) Telemetria de custos por projeto (Gemini/Replicate/etc) + menu "Gastos" no dashboard',
      labels: ['Data', 'Ops'],
      description:
        'Criar ledger results/ai-usage.jsonl. Registrar project/model/tokens/costUsd por chamada. Página /costs com Hoje + Mês por projeto (Pedro/Jonathan/...).',
    },
    {
      title: '(Ops) Taxonomia de "Projetos/Produtos" + filtros no Kanban (Pedro/Jonathan/...)',
      labels: ['Ops', 'Data'],
      description:
        'Hoje filtros estão hardcoded. Ajustar para projetos como produtos (Pedro/Jonathan/...) e evitar confusão com pessoa/label.',
    },
    {
      title: '(Data) Inventário de sistemas: mapas/arquitetura + catálogo de fontes de dados',
      labels: ['Data', 'Ops'],
      description:
        'Criar docs/ARCHITECTURE.md + docs/DATA_SOURCES.md + docs/PROCESSES.md (Upload-Post, backup, scheduling, etc).',
    },
    {
      title: '(Ops) Catálogo de tools/skills disponíveis + lacunas + plano de melhoria',
      labels: ['Ops'],
      description:
        'No dashboard: seção "Skills" (plugins/skills do Clawdbot) + lista do que temos/precisamos e links p/ docs.',
    },
    {
      title: '(Security) Fechar permissões (ACL) da pasta C:\\Users\\vsuga\\.clawdbot e arquivos críticos',
      labels: ['Ops', 'Security'],
      description:
        'clawdbot status aponta CRITICAL. Aplicar icacls para restringir (mesmo sendo single-user). Validar sem quebrar execução.',
    },
    {
      title: '(Ops) Observabilidade: logs centralizados + health checks (gateway, ops-dashboard, automations)',
      labels: ['Ops', 'Data'],
      description:
        'Padronizar logs e criar /api/health no ops-dashboard + indicadores. Opcional: mandar alerta Telegram quando algo falhar.',
    },
  ];

  // Avoid duplicates by title
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
      position: -1 * (i + 1),
      labels: x.labels,
    }));

  if (!toInsert.length) {
    console.log('OK: no new backlog items (all already exist)');
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
