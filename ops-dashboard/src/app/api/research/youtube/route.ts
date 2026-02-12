import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const { project } = await request.json();

    if (!project) {
      return NextResponse.json({ error: 'Project is required' }, { status: 400 });
    }

    // Executar o script de YouTube Research
    const command = `node scripts/research/youtube-research-simple.js --project=${project}`;
    const { stdout, stderr } = await execAsync(command, { cwd: 'C:/Users/vsuga/clawd' });

    // Ler o arquivo de resultados gerado
    const resultsPath = `C:/Users/vsuga/clawd/outputs/research/${project}_research.json`;

    if (fs.existsSync(resultsPath)) {
      const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
      return NextResponse.json({ success: true, results });
    }

    return NextResponse.json({
      success: true,
      message: 'Research completed',
      output: stdout
    });

  } catch (error: unknown) {
    console.error('YouTube Research error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Research failed';
    return NextResponse.json({
      error: errorMessage
    }, { status: 500 });
  }
}

export async function GET() {
  // Listar projetos disponíveis
  const projects = [
    { id: 'religiao', name: '📿 Religião', keywords: ['salmos', 'fé cristã', 'oração'] },
    { id: 'igaming', name: '🎰 iGaming', keywords: ['cassino', 'jogos'] },
    { id: 'petselectuk', name: '🐕 PetSelectUK', keywords: ['pet care', 'dog'] }
  ];

  return NextResponse.json({ projects });
}
