import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

// Local-only endpoint: exposes last datasets sync status.

const BASE = "C:/Users/vsuga/clawd";

function statSafe(p: string) {
  try {
    const st = fs.statSync(p);
    return { exists: true, size: st.size, mtimeMs: st.mtimeMs };
  } catch {
    return { exists: false, size: null, mtimeMs: null };
  }
}

export async function GET() {
  const syncPath = path.join(BASE, "results", "datasets-sync.json");
  const syncStat = statSafe(syncPath);

  let payload: any = null;
  if (syncStat.exists) {
    try {
      payload = JSON.parse(fs.readFileSync(syncPath, "utf8"));
    } catch {
      payload = null;
    }
  }

  return NextResponse.json({
    ok: true,
    sync: {
      path: syncPath,
      ...syncStat,
      payload,
    },
  });
}
