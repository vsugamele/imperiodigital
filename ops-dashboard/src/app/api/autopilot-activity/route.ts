import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ACTIVITY_FILE = path.join(process.cwd(), 'tmp/autopilot-activity.json');

export async function GET() {
  try {
    if (fs.existsSync(ACTIVITY_FILE)) {
      const data = fs.readFileSync(ACTIVITY_FILE, 'utf8');
      return NextResponse.json(JSON.parse(data));
    }
    return NextResponse.json({ status: "standby", lastAction: "Nenhuma atividade", lastUpdate: new Date().toISOString(), nextRun: "Em breve" });
  } catch (error) {
    return NextResponse.json({ status: "standby", lastAction: "Erro ao carregar", lastUpdate: new Date().toISOString(), nextRun: "N/A" });
  }
}
