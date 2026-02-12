import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const COPY_OUTPUT_DIR = path.join(process.cwd(), '..', 'projects', 'copy-output');

function normalize(s: string) {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .toLowerCase()
    .trim();
}

function pickCandidateDirs(projeto: string) {
  if (!fs.existsSync(COPY_OUTPUT_DIR)) return [];
  const target = normalize(projeto);
  const tokens = target.split(' ').filter(t => t.length >= 4);

  const dirs = fs.readdirSync(COPY_OUTPUT_DIR)
    .map(name => ({
      name,
      full: path.join(COPY_OUTPUT_DIR, name),
      stat: fs.statSync(path.join(COPY_OUTPUT_DIR, name))
    }))
    .filter(d => d.stat.isDirectory())
    .map(d => ({ ...d, n: normalize(d.name) }))
    .filter(d => {
      if (!tokens.length) return d.n.includes(target);
      return tokens.some(t => d.n.includes(t));
    })
    .sort((a, b) => b.stat.mtimeMs - a.stat.mtimeMs);

  return dirs;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projeto = searchParams.get('projeto');

    if (!projeto) {
      return NextResponse.json({ error: 'Projeto é obrigatório' }, { status: 400 });
    }

    const candidates = pickCandidateDirs(projeto);
    if (!candidates.length) {
      return NextResponse.json({ found: false, projeto, arquivos: [] });
    }

    const selected = candidates[0];
    const files = fs.readdirSync(selected.full)
      .filter(f => f.endsWith('.json'))
      .map(f => {
        const p = path.join(selected.full, f);
        const st = fs.statSync(p);
        return {
          nome: f,
          caminho: p,
          tamanho: st.size,
          modificado: st.mtime.toISOString()
        };
      })
      .sort((a, b) => a.nome.localeCompare(b.nome));

    return NextResponse.json({
      found: true,
      projeto,
      pasta: selected.name,
      pastaPath: selected.full,
      arquivos: files,
      candidatos: candidates.slice(0, 5).map(c => c.name)
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
