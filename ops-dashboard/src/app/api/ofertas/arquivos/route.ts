import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.join(process.cwd(), '..', 'projects', 'ofertas', 'outputs');

interface ArquivoItem {
  nome: string;
  caminho: string;
  tipo: 'pasta' | 'md' | 'json' | 'outro';
  tamanho?: number;
}

function getArquivos(pasta: string, incluirPastas = false): ArquivoItem[] {
  const arquivos: ArquivoItem[] = [];

  if (!fs.existsSync(pasta)) return arquivos;

  const items = fs.readdirSync(pasta);

  items.forEach(item => {
    const fullPath = path.join(pasta, item);
    const stat = fs.statSync(fullPath);

    if (stat.isFile()) {
      arquivos.push({
        nome: item,
        caminho: fullPath,
        tipo: item.endsWith('.md') ? 'md' : item.endsWith('.json') ? 'json' : 'outro',
        tamanho: stat.size
      });
    } else if (stat.isDirectory() && incluirPastas) {
      arquivos.push({
        nome: item,
        caminho: fullPath,
        tipo: 'pasta'
      });
    }
  });

  return arquivos;
}

// Normaliza o nome da fase para o formato correto (01-pesquisa, 02-avatar, etc)
function normalizeFaseName(fase: string, projectDir: string): string {
  // Se já existe diretamente, retorna
  const diretPath = path.join(projectDir, fase);
  if (fs.existsSync(diretPath)) return fase;

  // Tenta adicionar zero à esquerda (1-pesquisa -> 01-pesquisa)
  const match = fase.match(/^(\d+)-(.+)$/);
  if (match) {
    const numPadded = match[1].padStart(2, '0');
    const normalizado = `${numPadded}-${match[2]}`;
    const normalPath = path.join(projectDir, normalizado);
    if (fs.existsSync(normalPath)) return normalizado;
  }

  // Tenta encontrar pasta que comece com o número
  if (match) {
    const items = fs.readdirSync(projectDir);
    const found = items.find(item => {
      const itemMatch = item.match(/^0?(\d+)-/);
      return itemMatch && itemMatch[1] === match[1];
    });
    if (found) return found;
  }

  return fase;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projeto = searchParams.get('projeto');
    const fase = searchParams.get('fase');

    if (!projeto) {
      return NextResponse.json({ error: 'Projeto é obrigatório' }, { status: 400 });
    }

    // Não precisamos sanitizar novamente - o safeName já vem pronto
    const projectDir = path.join(OUTPUT_DIR, projeto);

    if (!fs.existsSync(projectDir)) {
      // Tenta encontrar pasta similar
      const outputItems = fs.existsSync(OUTPUT_DIR) ? fs.readdirSync(OUTPUT_DIR) : [];
      const found = outputItems.find(item =>
        item.toLowerCase().includes(projeto.toLowerCase().slice(0, 10))
      );

      if (found) {
        const foundDir = path.join(OUTPUT_DIR, found);
        return processProjectDir(foundDir, fase);
      }

      return NextResponse.json({
        error: 'Projeto não encontrado',
        projetos_disponiveis: outputItems
      }, { status: 404 });
    }

    return processProjectDir(projectDir, fase);

  } catch (error: any) {
    console.error('Error listing arquivos:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function processProjectDir(projectDir: string, fase: string | null) {
  // Se não especificou fase, retorna estrutura geral (pastas + arquivos raiz)
  if (!fase) {
    const todasFases: Record<string, ArquivoItem[]> = {};
    const todosItens = fs.readdirSync(projectDir);
    const arquivosRaiz = getArquivos(projectDir, false);

    todosItens.forEach(item => {
      const fullPath = path.join(projectDir, item);
      if (fs.statSync(fullPath).isDirectory()) {
        todasFases[item] = getArquivos(fullPath, false);
      }
    });

    return NextResponse.json({
      fases: todasFases,
      arquivosRaiz: arquivosRaiz
    });
  }

  // Normalizar nome da fase
  const faseNormalizada = normalizeFaseName(fase, projectDir);
  const faseDir = path.join(projectDir, faseNormalizada);

  // Buscar arquivos da pasta da fase (RESULTADOS REAIS)
  const arquivos = getArquivos(faseDir, false);

  // Verificação de segurança: se a pasta não existe ou está vazia, 
  // e existe um arquivo com esse número na raiz, mostra o da raiz como fallback
  if (arquivos.length === 0) {
    const arquivosRaiz = getArquivos(projectDir, false);
    const fallbackFile = arquivosRaiz.find(a =>
      a.nome.startsWith(faseNormalizada.slice(0, 2)) && a.nome.endsWith('.md')
    );
    if (fallbackFile) {
      arquivos.push(fallbackFile);
    }
  }

  return NextResponse.json({
    arquivos,
    faseUsada: faseNormalizada,
    faseOriginal: fase,
    total: arquivos.length
  });
}
