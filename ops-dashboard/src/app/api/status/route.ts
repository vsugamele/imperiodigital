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

  // Heuristic (fallback) state
  let heuristic: "working" | "standby" | "offline" = "offline";

  // Working: Activity in last 5 mins
  if (ageMs < 5 * 60_000) heuristic = "working";
  // Standby: Activity in last 6 hours (assuming the agent is "On" but idle)
  else if (ageMs < 6 * 60 * 60_000) heuristic = "standby";
  // Offline: More than 6 hours without any file mutation in the core paths
  else heuristic = "offline";

  // Explicit state file (preferred when fresh)
  const statusPath = `${base}/memory/alex-status.json`;
  let explicitState: { state: "working" | "thinking" | "standby"; updatedAtMs: number; note?: string } | null = null;
  try {
    if (fs.existsSync(statusPath)) {
      const raw = fs.readFileSync(statusPath, "utf8");
      const parsed = JSON.parse(raw);

      // Support both "updatedAtMs" and ISO "updated" string
      let updateTime = parsed.updatedAtMs;
      if (!updateTime && parsed.updated) {
        updateTime = new Date(parsed.updated).getTime();
      }

      if (parsed && updateTime) {
        explicitState = {
          state: parsed.state || parsed.status || "standby",
          updatedAtMs: updateTime,
          note: parsed.note || (parsed.activity?.[parsed.activity.length - 1]?.action) || undefined,
        };
      }
    }
  } catch (e) {
    // ignore
  }

  const explicitFresh = explicitState && now - explicitState.updatedAtMs < 60 * 60_000; // 1 hour threshold for explicit note

  const state: "working" | "thinking" | "standby" | "offline" = explicitFresh
    ? explicitState!.state
    : heuristic;

  return NextResponse.json({
    state,
    explicitState,
    lastActivityMs: lastMs || null,
    ageMs: isFinite(ageMs) ? ageMs : null,
    nowMs: now,
  });
}
