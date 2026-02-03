import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createReadStream } from 'fs';
import csv from 'csv-parser';

const AI_USAGE_PATH = path.join(process.cwd(), '..', 'results', 'ai-usage.jsonl');
const DEFAULT_THRESHOLDS = {
  dailyLimit: 1000000, // 1M tokens/day
  monthlyLimit: 30000000, // 30M tokens/month
  dailyWarning: 0.8, // 80%
  monthlyWarning: 0.8 // 80%
};

interface UsageRecord {
  timestamp: string;
  model: string;
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  cost?: number;
  project?: string;
}

interface ModelUsage {
  tokens: number;
  cost: number;
}

async function parseUsageFile(): Promise<UsageRecord[]> {
  const records: UsageRecord[] = [];
  
  if (!fs.existsSync(AI_USAGE_PATH)) {
    return records;
  }

  const content = fs.readFileSync(AI_USAGE_PATH, 'utf8');
  const lines = content.split('\n').filter(l => l.trim());
  
  for (const line of lines) {
    try {
      records.push(JSON.parse(line));
    } catch {}
  }
  
  return records;
}

function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

function getMonthString() {
  return new Date().toISOString().slice(0, 7); // YYYY-MM
}

function filterByPeriod(records: UsageRecord[], period: 'today' | 'month') {
  const today = getTodayString();
  const month = getMonthString();
  
  return records.filter(r => {
    const date = r.timestamp.split('T')[0];
    if (period === 'today') return date === today;
    return date.startsWith(month);
  });
}

function calculateUsage(records: UsageRecord[]) {
  const byModel: Record<string, ModelUsage> = {};
  let totalTokens = 0;
  let totalCost = 0;

  for (const r of records) {
    const tokens = r.prompt_tokens + (r.completion_tokens || 0);
    const cost = r.cost || 0;
    const model = r.model || 'unknown';
    
    if (!byModel[model]) {
      byModel[model] = { tokens: 0, cost: 0 };
    }
    
    byModel[model].tokens += tokens;
    byModel[model].cost += cost;
    totalTokens += tokens;
    totalCost += cost;
  }

  return { byModel, totalTokens, totalCost };
}

export async function GET() {
  try {
    const records = await parseUsageFile();
    
    // Today's usage
    const todayRecords = filterByPeriod(records, 'today');
    const todayUsage = calculateUsage(todayRecords);
    
    // Month's usage
    const monthRecords = filterByPeriod(records, 'month');
    const monthUsage = calculateUsage(monthRecords);
    
    return NextResponse.json({
      ok: true,
      today: getTodayString(),
      month: getMonthString(),
      todayTokens: todayUsage.totalTokens,
      monthTokens: monthUsage.totalTokens,
      todayCost: todayUsage.totalCost,
      monthCost: monthUsage.totalCost,
      byModel: todayUsage.byModel,
      thresholds: DEFAULT_THRESHOLDS
    });
  } catch (e) {
    return NextResponse.json({
      ok: false,
      error: (e as Error).message
    }, { status: 500 });
  }
}
