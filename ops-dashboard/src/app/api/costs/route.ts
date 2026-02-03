import { NextResponse } from "next/server";
import fs from "node:fs";

// Local-only endpoint.
// Reads results/ai-usage.jsonl and aggregates costs by project for:
// - today (local date)
// - current month (local)
//
// If file doesn't exist yet, returns zeros.

function isoLocalDate(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isoLocalMonth(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

type UsageRow = {
  ts: string;
  provider?: string;
  model?: string;
  project: string;
  inputTokens?: number;
  outputTokens?: number;
  costUsd?: number;
  costBrl?: number;
  meta?: Record<string, unknown>;
};

export async function GET() {
  const base = "C:/Users/vsuga/clawd";
  const p = `${base}/results/ai-usage.jsonl`;

  const today = isoLocalDate();
  const month = isoLocalMonth();

  const byProjectToday: Record<string, number> = {};
  const byProjectMonth: Record<string, number> = {};
  let rows = 0;

  if (fs.existsSync(p)) {
    const txt = fs.readFileSync(p, "utf8");
    const lines = txt.split(/\r?\n/).filter(Boolean);
    for (const line of lines) {
      let obj: UsageRow | null = null;
      try {
        obj = JSON.parse(line) as UsageRow;
      } catch {
        continue;
      }
      if (!obj?.project || !obj.ts) continue;
      const cost = Number(obj.costUsd ?? 0) || 0;
      if (!cost) continue;

      // Compare using local date derived from timestamp.
      const d = new Date(obj.ts);
      const localDay = isoLocalDate(d);
      const localMonth = isoLocalMonth(d);

      if (localDay === today) {
        byProjectToday[obj.project] = (byProjectToday[obj.project] || 0) + cost;
      }
      if (localMonth === month) {
        byProjectMonth[obj.project] = (byProjectMonth[obj.project] || 0) + cost;
      }
      rows += 1;
    }
  }

  function total(x: Record<string, number>) {
    return Object.values(x).reduce((a, b) => a + b, 0);
  }

  return NextResponse.json({
    ok: true,
    currency: "USD",
    today,
    month,
    rows,
    totals: {
      today: total(byProjectToday),
      month: total(byProjectMonth),
    },
    byProject: {
      today: byProjectToday,
      month: byProjectMonth,
    },
    note:
      fs.existsSync(p)
        ? undefined
        : "Ledger not found yet: results/ai-usage.jsonl (costs will show zero until we start logging calls).",
  });
}
