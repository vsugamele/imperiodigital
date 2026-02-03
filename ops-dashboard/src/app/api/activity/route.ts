import { NextResponse } from "next/server";
import fs from "node:fs";

// Local-only activity log (append-only text file).
// Format: one line per event, ideally ISO + message.

function tailLines(p: string, maxLines = 50) {
  try {
    const raw = fs.readFileSync(p, "utf8");
    const lines = raw.split(/\r?\n/).filter((x) => x.trim().length);
    return lines.slice(-maxLines);
  } catch {
    return [] as string[];
  }
}

export async function GET() {
  const base = "C:/Users/vsuga/clawd";
  const logPath = `${base}/memory/alex-activity.log`;

  const lines = tailLines(logPath, 80);

  return NextResponse.json({
    lines,
    path: logPath,
    nowMs: Date.now(),
  });
}
