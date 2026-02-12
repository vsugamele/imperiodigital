import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

// Usar caminho absoluto do workspace
const WORKSPACE_ROOT = 'C:\\Users\\vsuga\\clawd';
const SCRIPT_PATH = path.join(WORKSPACE_ROOT, 'scripts', 'copy-generator.js');
const OUTPUT_DIR = path.join(WORKSPACE_ROOT, 'projects', 'copy-output');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tema, produto, etapas } = body;

    if (!tema || !produto) {
      return NextResponse.json({
        success: false,
        error: 'tema e produto são obrigatórios'
      }, { status: 400 });
    }

    // Construir comando
    const etapaMin = Math.min(...etapas);
    const etapaMax = Math.max(...etapas);

    // Se todas as etapas de 1-14 estão selecionadas, executa todas
    const todasEtapas = etapas.length === 14 && etapas.includes(1) && etapas.includes(14);

    // Executar o script
    let command = `node "${SCRIPT_PATH}" --tema="${tema}" --produto="${produto}"`;

    if (!todasEtapas) {
      command += ` --step=${etapaMin}`;
    }

    console.log('Executando:', command);

    const output = execSync(command, {
      encoding: 'utf8',
      timeout: 300000, // 5 minutos
      cwd: WORKSPACE_ROOT,
    });

    console.log('Output:', output);

    // Extrair o diretório de saída do output
    const outputDirMatch = output.match(/Output:\s*(.+?)$/m);
    const outputDir = outputDirMatch ? outputDirMatch[1].trim() : null;

    return NextResponse.json({
      success: true,
      tema,
      produto,
      etapasCount: etapas.length,
      outputDir: outputDir || `projects/copy-output/${tema.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`,
      message: 'Copy gerado com sucesso!'
    });

  } catch (error: unknown) {
    console.error('Erro ao gerar copy:', error);

    const errorMessage = error instanceof Error ? error.message : 'Erro ao executar copy generator';
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}

export async function GET() {
  // Listar projetos existentes
  try {

    if (!fs.existsSync(OUTPUT_DIR)) {
      return NextResponse.json({ success: true, projetos: [] });
    }

    const dirs = fs.readdirSync(OUTPUT_DIR).filter((d: string) =>
      fs.statSync(path.join(OUTPUT_DIR, d)).isDirectory()
    );

    const projetos = dirs.map((dir: string) => {
      const dirPath = path.join(OUTPUT_DIR, dir);
      const files = fs.readdirSync(dirPath);
      return {
        nome: dir,
        arquivos: files.length,
        data: fs.statSync(dirPath).birthtime
      };
    }).sort((a, b) => b.data.getTime() - a.data.getTime());

    return NextResponse.json({
      success: true,
      projetos
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}
