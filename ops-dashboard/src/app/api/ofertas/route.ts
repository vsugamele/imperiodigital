import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { spawn, execSync } from 'child_process';

const OUTPUT_DIR = path.join(process.cwd(), '..', 'projects', 'ofertas', 'outputs');
const MAX_RUNNING_MINUTES = 20;

function nowIso() {
  return new Date().toISOString();
}

interface Dashboard {
  createdAt?: string;
  updatedAt?: string;
  nome?: string;
  safeName?: string;
  ideia?: string;
  status: {
    fase: number;
    progresso: string;
    executando: boolean;
    mensagem: string;
    proximo: string;
    erro?: string;
    logs: { data: string; msg: string }[];
    imperiusInsight?: { acaoSugerida: string };
  };
  fases: Record<string, { status: string; completo: boolean; arquivo?: string }>;
  metricas?: Record<string, number>;
}

function appendLog(dashboard: Dashboard, msg: string) {
  dashboard.status.logs = dashboard.status.logs || [];
  dashboard.status.logs.push({ data: nowIso(), msg });
  if (dashboard.status.logs.length > 120) {
    dashboard.status.logs = dashboard.status.logs.slice(-120);
  }
}

function saveDashboard(safeName: string, dashboard: Dashboard) {
  dashboard.updatedAt = nowIso();
  const p = path.join(OUTPUT_DIR, safeName, 'dashboard.json');
  fs.writeFileSync(p, JSON.stringify(dashboard, null, 2));
}

function markStaleIfNeeded(safeName: string, dashboard: Dashboard) {
  if (!dashboard?.status?.executando) return dashboard;
  const ref = dashboard.updatedAt || dashboard.createdAt || nowIso();
  const ageMs = Date.now() - new Date(ref).getTime();
  if (ageMs > MAX_RUNNING_MINUTES * 60 * 1000) {
    dashboard.status.executando = false;
    dashboard.status.mensagem = 'Falhou por timeout';
    dashboard.status.proximo = 'Reprocessar projeto';
    dashboard.status.erro = `Timeout > ${MAX_RUNNING_MINUTES} min`;
    appendLog(dashboard, `❌ Timeout de execução (> ${MAX_RUNNING_MINUTES} min). Marcado como failed.`);
    saveDashboard(safeName, dashboard);
  }
  return dashboard;
}

function getOfertas(): Dashboard[] {
  if (!fs.existsSync(OUTPUT_DIR)) return [];

  const ofertas: Dashboard[] = [];
  const dirs = fs.readdirSync(OUTPUT_DIR);

  dirs.forEach(dir => {
    const dashboardPath = path.join(OUTPUT_DIR, dir, 'dashboard.json');
    if (fs.existsSync(dashboardPath)) {
      try {
        const dashboard = JSON.parse(fs.readFileSync(dashboardPath, 'utf8')) as Dashboard;
        ofertas.push(markStaleIfNeeded(dir, dashboard));
      } catch (e) {
        // Ignore invalid JSON
      }
    }
  });

  return ofertas;
}

function jsonToMarkdown(title: string, obj: unknown) {
  return '# ' + title + '\n\n'
    + 'Gerado em: ' + nowIso() + '\n\n'
    + '`json\n' + JSON.stringify(obj, null, 2) + '\n`\n';
}

function runHackerversoAndMaterialize(dash: Dashboard, projectDir: string) {
  const workspaceRoot = path.join(process.cwd(), '..');
  const script = path.join(workspaceRoot, 'scripts', 'copy-generator.js');
  const tema = (dash.ideia && String(dash.ideia).trim()) || dash.nome || dash.safeName;
  const produto = 'curso_online';

  const cmd = `node "${script}" --tema=${JSON.stringify(tema)} --produto=${produto}`;
  const output = execSync(cmd, {
    encoding: 'utf8',
    timeout: 300000,
    cwd: workspaceRoot,
    env: { ...process.env } as NodeJS.ProcessEnv // Pass all env vars including GEMINI_API_KEY
  });
  const m = output.match(/Output:\s*(.+?)$/m);
  const outputRel = m ? m[1].trim() : '';
  if (!outputRel) throw new Error('copy-generator não retornou pasta de output');

  const outDir = path.isAbsolute(outputRel) ? outputRel : path.join(workspaceRoot, outputRel);
  if (!fs.existsSync(outDir)) throw new Error(`Output não encontrado: ${outDir}`);

  const map: Array<{ json: string; pasta: string; md: string; title: string; faseKey: string; metrica?: (v: unknown, dash: Dashboard) => void }> = [
    { json: '01-multidao-faminta.json', pasta: '01-pesquisa', md: 'pesquisa_avatar.md', title: 'Pesquisa & Avatar', faseKey: '1-pesquisa' },
    { json: '02-problemas.json', pasta: '02-avatar', md: 'problemas_avatar.md', title: 'Problemas do Avatar', faseKey: '2-avatar', metrica: (v, d) => { const val = v as { top15?: string[] }; d.metricas = d.metricas || {}; d.metricas.doresIdentificadas = (val?.top15 || []).length || 0; } },
    { json: '03-lago.json', pasta: '03-mercado', md: 'lago_submercado.md', title: 'O Lago', faseKey: '3-mercado' },
    { json: '05-mecanismo.json', pasta: '04-mecanismo', md: 'mecanismo_unico.md', title: 'Mecanismo Único', faseKey: '4-mecanismo' },
    { json: '06-escada.json', pasta: '05-oferta', md: 'escada_valor.md', title: 'Escada de Valor', faseKey: '5-oferta' },
    { json: '09-vsl.json', pasta: '06-copy', md: 'copy_vsl.md', title: 'Copy (VSL)', faseKey: '6-copy', metrica: (v, d) => { const val = v as { blocos?: unknown[] }; d.metricas = d.metricas || {}; d.metricas.headlinesCriadas = (val?.blocos || []).length || 0; } },
    { json: '10-pagina.json', pasta: '07-validacao', md: 'validacao_pagina_ab.md', title: 'Validação (Página A/B)', faseKey: '7-validacao' }
  ];

  const generated: Record<string, string> = {};
  for (const item of map) {
    const jsonPath = path.join(outDir, item.json);
    if (!fs.existsSync(jsonPath)) continue;
    const parsed = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const mdPath = path.join(projectDir, item.pasta, item.md);
    fs.writeFileSync(mdPath, jsonToMarkdown(item.title, parsed), 'utf8');
    generated[item.faseKey] = mdPath;
    if (item.metrica) item.metrica(parsed, dash);
  }

  return { outDir, generated };
}

function triggerMesaMentes(dash: Dashboard) {
  try {
    const projeto = dash?.safeName || dash?.nome;
    if (!projeto) return;
    const scriptPath = path.join(process.cwd(), '..', 'scripts', 'ops', 'mesa-mentes.js');
    if (!fs.existsSync(scriptPath)) return;
    const child = spawn('node', [scriptPath, `--projeto=${projeto}`], {
      detached: true,
      stdio: 'ignore'
    });
    child.unref();
  } catch { }
}

function runPipelineAsync(safeName: string) {
  const projectDir = path.join(OUTPUT_DIR, safeName);
  const dashboardPath = path.join(projectDir, 'dashboard.json');

  setTimeout(async () => {
    try {
      if (!fs.existsSync(dashboardPath)) return;
      let dash = JSON.parse(fs.readFileSync(dashboardPath, 'utf8'));

      const steps = [
        { key: '1-pesquisa', nome: 'Pesquisa & Avatar', msg: 'Rodando etapa 01 (multidão faminta)...' },
        { key: '2-avatar', nome: 'Avatar', msg: 'Rodando etapa 02 (problemas do avatar)...' },
        { key: '3-mercado', nome: 'Mercado', msg: 'Rodando etapa 03 (o lago)...' },
        { key: '4-mecanismo', nome: 'Mecanismo', msg: 'Rodando etapa 05 (mecanismo único)...' },
        { key: '5-oferta', nome: 'Oferta', msg: 'Rodando etapa 06 (escada de valor)...' },
        { key: '6-copy', nome: 'Copy', msg: 'Rodando etapa 09 (VSL/copy)...' },
        { key: '7-validacao', nome: 'Validação', msg: 'Rodando etapa 10 (página A/B)...' },
      ];

      appendLog(dash, '🚀 Executando Copy Generator 14 etapas para gerar material real do projeto...');
      saveDashboard(safeName, dash);
      const { outDir, generated } = runHackerversoAndMaterialize(dash, projectDir);
      appendLog(dash, `📦 Output 14 etapas gerado em: ${outDir}`);
      saveDashboard(safeName, dash);

      for (let i = 0; i < steps.length; i++) {
        dash = JSON.parse(fs.readFileSync(dashboardPath, 'utf8'));
        if (!dash.status.executando) return;

        const s = steps[i];
        dash.status.fase = i + 1;
        dash.status.mensagem = s.msg;
        dash.status.proximo = i < steps.length - 1 ? steps[i + 1].nome : 'Finalizando';
        dash.fases[s.key].status = 'active';
        appendLog(dash, `🔄 ${s.nome}: ${s.msg}`);

        const filePath = generated[s.key];
        if (!filePath || !fs.existsSync(filePath)) {
          throw new Error(`Arquivo de fase não gerado para ${s.key}`);
        }

        dash.fases[s.key].status = 'completed';
        dash.fases[s.key].completo = true;
        dash.fases[s.key].arquivo = filePath;
        const pct = Math.round(((i + 1) / steps.length) * 100);
        dash.status.progresso = `${pct}%`;
        appendLog(dash, `✅ ${s.nome} concluída com artefato real`);
        saveDashboard(safeName, dash);
      }

      dash = JSON.parse(fs.readFileSync(dashboardPath, 'utf8'));
      triggerMesaMentes(dash);
      appendLog(dash, '🧠 Mesa de Mentes acionada (crítica em paralelo)');
      dash.status.executando = false;
      dash.status.mensagem = 'Pipeline concluído';
      dash.status.proximo = 'Pronto para revisão';
      dash.status.progresso = '100%';
      appendLog(dash, '🎉 Pipeline concluído com sucesso');
      saveDashboard(safeName, dash);
    } catch (err: unknown) {
      try {
        const errorMsg = err instanceof Error ? err.message : String(err);
        const dash = JSON.parse(fs.readFileSync(dashboardPath, 'utf8')) as Dashboard;
        dash.status.executando = false;
        dash.status.mensagem = 'Falha no pipeline';
        dash.status.proximo = 'Reprocessar';
        dash.status.erro = errorMsg;
        appendLog(dash, `❌ Erro no pipeline: ${dash.status.erro}`);
        saveDashboard(safeName, dash);
      } catch { }
    }
  }, 120);
}

export async function GET() {
  const ofertas = getOfertas();
  return NextResponse.json({ ofertas });
}

export async function POST(request: Request) {
  try {
    const { nome, ideia } = await request.json();

    if (!nome) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }

    const safeName = nome.replace(/[^a-zA-Z0-9]/g, '_');
    const projectDir = path.join(OUTPUT_DIR, safeName);
    const folders = ['01-pesquisa', '02-avatar', '03-mercado', '04-mecanismo', '05-oferta', '06-copy', '07-validacao'];

    // Criar diretórios
    fs.mkdirSync(projectDir, { recursive: true });
    folders.forEach(f => fs.mkdirSync(path.join(projectDir, f), { recursive: true }));

    // Criar dashboard.json
    const dashboard = {
      nome,
      safeName,
      ideia: ideia || '',
      createdAt: nowIso(),
      updatedAt: nowIso(),
      status: {
        fase: 1,
        progresso: '0%',
        executando: true,
        mensagem: 'Fila recebida. Iniciando pipeline...',
        proximo: 'Pesquisa & Avatar',
        logs: [
          { data: nowIso(), msg: 'Projeto registrado no ecossistema' },
          { data: nowIso(), msg: 'Worker Alex alocado para a tarefa' },
          { data: nowIso(), msg: 'Pipeline iniciado com rastreamento de fases' }
        ]
      },
      fases: {
        '1-pesquisa': { status: 'pending', completo: false },
        '2-avatar': { status: 'pending', completo: false },
        '3-mercado': { status: 'pending', completo: false },
        '4-mecanismo': { status: 'pending', completo: false },
        '5-oferta': { status: 'pending', completo: false },
        '6-copy': { status: 'pending', completo: false },
        '7-validacao': { status: 'pending', completo: false }
      }
    };

    fs.writeFileSync(
      path.join(projectDir, 'dashboard.json'),
      JSON.stringify(dashboard, null, 2)
    );

    // Start async pipeline worker (non-blocking)
    runPipelineAsync(safeName);

    return NextResponse.json({ success: true, oferta: dashboard });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating oferta:', error);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { safeName, fase, completo, tipo } = await request.json();

    if (!safeName) {
      return NextResponse.json({ error: 'safeName é obrigatório' }, { status: 400 });
    }

    const dashboardPath = path.join(OUTPUT_DIR, safeName, 'dashboard.json');

    if (!fs.existsSync(dashboardPath)) {
      return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 });
    }

    const dashboard = JSON.parse(fs.readFileSync(dashboardPath, 'utf8')) as Dashboard;

    if (tipo === 'aplicar_imperius') {
      if (dashboard.status.imperiusInsight) {
        dashboard.status.proximo = `🏛️ AJUSTE: ${dashboard.status.imperiusInsight.acaoSugerida}`;
        dashboard.status.logs.push({
          data: nowIso(),
          msg: `✅ Rota ajustada conforme orientação do Imperius.`
        });
      }
    } else if (tipo === 'retry_pipeline') {
      dashboard.status.executando = true;
      dashboard.status.mensagem = 'Reprocessando pipeline...';
      dashboard.status.proximo = 'Pesquisa & Avatar';
      dashboard.status.erro = undefined;
      dashboard.status.logs = dashboard.status.logs || [];
      dashboard.status.logs.push({ data: nowIso(), msg: '🔁 Retry solicitado manualmente.' });
      saveDashboard(safeName, dashboard);
      runPipelineAsync(safeName);
      return NextResponse.json({ success: true, dashboard });
    } else if (fase) {
      // Atualizar fase
      const faseKey = `${fase}-${Object.keys(dashboard.fases).find(k => k.startsWith(fase + '-'))?.split('-')[1] || ''}`;
      if (dashboard.fases[faseKey]) {
        dashboard.fases[faseKey].completo = completo;
        dashboard.fases[faseKey].status = completo ? 'completed' : 'pending';
      }

      // Recalcular progresso
      const fasesCount = Object.keys(dashboard.fases).length;
      const completas = Object.values(dashboard.fases).filter((f) => f.completo).length;
      dashboard.status.progresso = `${Math.round((completas / fasesCount) * 100)}%`;
      dashboard.status.fase = completo ? fase + 1 : fase;
    }

    fs.writeFileSync(dashboardPath, JSON.stringify(dashboard, null, 2));

    return NextResponse.json({ success: true, dashboard });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error updating oferta:', error);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
