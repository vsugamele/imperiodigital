import { NextResponse } from "next/server";
import fs from "node:fs";

// Local-only endpoint: reads Clawdbot cron jobs store.
// NOTE: This dashboard runs on the same machine, so we can read the file directly.

const JOBS_PATH = "C:/Users/vsuga/.clawdbot/cron/jobs.json";

type CronJob = {
  id: string;
  name?: string;
  description?: string;
  enabled?: boolean;
  schedule?: { kind?: string; expr?: string; tz?: string };
  state?: {
    nextRunAtMs?: number;
    lastRunAtMs?: number;
    lastStatus?: string;
    lastDurationMs?: number;
  };
};

function safeReadJson(p: string): any {
  try {
    const raw = fs.readFileSync(p, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function GET() {
  const store = safeReadJson(JOBS_PATH);
  const jobs: CronJob[] = Array.isArray(store?.jobs) ? store.jobs : [];

  const normalized = jobs
    .map((j) => ({
      id: j.id,
      name: j.name || j.id,
      description: j.description || "",
      enabled: !!j.enabled,
      schedule: {
        kind: j.schedule?.kind || "cron",
        expr: j.schedule?.expr || "",
        tz: j.schedule?.tz || "",
      },
      state: {
        nextRunAtMs: j.state?.nextRunAtMs ?? null,
        lastRunAtMs: j.state?.lastRunAtMs ?? null,
        lastStatus: j.state?.lastStatus ?? null,
        lastDurationMs: j.state?.lastDurationMs ?? null,
      },
    }))
    .sort((a, b) => (a.name || "").localeCompare(b.name || ""));

  return NextResponse.json({
    ok: true,
    source: { path: JOBS_PATH, exists: fs.existsSync(JOBS_PATH) },
    jobs: normalized,
  });
}
