import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');

    if (!filePath) {
      return NextResponse.json({ error: 'Path é obrigatório' }, { status: 400 });
    }

    // Verificar se o arquivo existe
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 });
    }

    const stat = fs.statSync(filePath);
    
    // Se for diretório, listar arquivos
    if (stat.isDirectory()) {
      const items = fs.readdirSync(filePath).map(item => {
        const fullPath = path.join(filePath, item);
        const itemStat = fs.statSync(fullPath);
        return {
          nome: item,
          caminho: fullPath,
          tipo: itemStat.isDirectory() ? 'pasta' : 'arquivo',
          tamanho: itemStat.size,
          modificado: itemStat.mtime.toISOString()
        };
      });
      return NextResponse.json({ tipo: 'pasta', itens: items });
    }

    // Se for arquivo, ler conteúdo
    const content = fs.readFileSync(filePath, 'utf8');
    const extensao = path.extname(filePath).toLowerCase();
    
    let tipo = 'outro';
    if (extensao === '.md') tipo = 'markdown';
    else if (extensao === '.json') tipo = 'json';
    else if (extensao === '.txt') tipo = 'texto';
    else if (extensao === '.js' || extensao === '.ts') tipo = 'codigo';

    return NextResponse.json({
      tipo,
      caminho: filePath,
      nome: path.basename(filePath),
      tamanho: stat.size,
      modificado: stat.mtime.toISOString(),
      conteudo: content
    });

  } catch (error: any) {
    console.error('Error reading file:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
