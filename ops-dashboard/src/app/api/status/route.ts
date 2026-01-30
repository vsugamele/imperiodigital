import { NextResponse } from "next/server";
import fs from "node:fs";

// Local-only status endpoint (works in server-local mode).
// Heuristic based on last local activity timestamp.
// - < 2m  => working
// - < 30m => standby
// - else  => offline
//
// NOTE: Keep paths dynamic; hardcoding dates makes the badge drift to offline.

function isoLocalDate(d = new Date()) {
  // YYYY-MM-DD in local time
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function statMtimeMs(p: string) {
  try {
    return fs.statSync(p).mtimeMs;
  } catch {
    return 0;
  }
}

export async function GET() {
  const today = isoLocalDate();
  const base = "C:/Users/vsuga/clawd";

  const paths = [
    `${base}/memory/heartbeat-state.json`,
    `${base}/memory/${today}.md`,
    `${base}/memory/${today}-daily-intelligence.md`,
    `${base}/results/posting-log-v2.csv`,
  ];

  // Also include last 2 days as fallback (in case today's file doesn't exist yet)
  const d1 = new Date();
  d1.setDate(d1.getDate() - 1);
  const d2 = new Date();
  d2.setDate(d2.getDate() - 2);
  paths.push(`${base}/memory/${isoLocalDate(d1)}.md`);
  paths.push(`${base}/memory/${isoLocalDate(d2)}.md`);

  let lastMs = 0;
  for (const p of paths) lastMs = Math.max(lastMs, statMtimeMs(p));

  const now = Date.now();
  const ageMs = lastMs ? now - lastMs : Infinity;

  let state: "working" | "standby" | "offline" = "offline";
  if (ageMs < 2 * 60_000) state = "working";
  else if (ageMs < 30 * 60_000) state = "standby";

  return NextResponse.json({
    state,
    lastActivityMs: lastMs || null,
    ageMs: isFinite(ageMs) ? ageMs : null,
    nowMs: now,
  });
}
