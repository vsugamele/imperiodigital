import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const PIPELINE_HEALTH_PATH = path.join(process.cwd(), '..', 'results', 'pipeline-health.json');

export async function GET() {
  try {
    if (!fs.existsSync(PIPELINE_HEALTH_PATH)) {
      return NextResponse.json({
        ok: false,
        error: 'Pipeline health data not found. Run: node scripts/pipeline-health-check.js'
      }, { status: 404 });
    }

    const data = JSON.parse(fs.readFileSync(PIPELINE_HEALTH_PATH, 'utf8'));
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({
      ok: false,
      error: (e as Error).message
    }, { status: 500 });
  }
}
