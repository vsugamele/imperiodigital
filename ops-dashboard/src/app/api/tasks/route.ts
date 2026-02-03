import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const TASKS_FILE = path.join(process.cwd(), 'tasks.json');

export async function GET() {
  try {
    if (fs.existsSync(TASKS_FILE)) {
      const data = fs.readFileSync(TASKS_FILE, 'utf8');
      return NextResponse.json(JSON.parse(data));
    }
    return NextResponse.json({ tasks: [], error: 'File not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read tasks' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    fs.writeFileSync(TASKS_FILE, JSON.stringify(body, null, 2));
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save tasks' }, { status: 500 });
  }
}
