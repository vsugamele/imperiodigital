import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";

const CSV_PATH = "C:/Users/vsuga/clawd/results/posting-log-v2.csv";

type Row = {
  date_time: string;
  profile: string;
  platform: string;
  status: string;
  scheduled_date?: string;
  timezone?: string;
  job_id?: string;
  request_id?: string;
  error?: string;
};

export async function GET() {
  if (!fs.existsSync(CSV_PATH)) {
    return NextResponse.json({ ok: false, error: `CSV not found: ${CSV_PATH}` }, { status: 404 });
  }

  // Read only the tail for speed (approx). If file is small, read all.
  const raw = fs.readFileSync(CSV_PATH, "utf8");

  const records = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
  }) as Row[];

  // Keep last 500 rows
  const rows = records.slice(Math.max(0, records.length - 500));

  const byProfile: Record<string, Record<string, number>> = {};
  const total: Record<string, number> = {};
  const scheduledPosts: Array<{ profile: string; date: string; platform: string }> = [];

  for (const r of rows) {
    const p = (r.profile || "unknown").trim();
    const s = (r.status || "unknown").trim();

    byProfile[p] ||= {};
    byProfile[p][s] = (byProfile[p][s] || 0) + 1;
    total[s] = (total[s] || 0) + 1;

    if (s === "scheduled" && r.scheduled_date) {
      scheduledPosts.push({
        profile: p,
        date: r.scheduled_date,
        platform: r.platform
      });
    }
  }

  const last = rows[rows.length - 1];

  return NextResponse.json({
    ok: true,
    source: path.basename(CSV_PATH),
    window: rows.length,
    lastRow: last || null,
    total,
    byProfile,
    scheduledPosts: scheduledPosts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  });
}
