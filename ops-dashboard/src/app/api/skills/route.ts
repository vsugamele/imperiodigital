import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

// Local-only endpoint.
// Lists installed Clawdbot skills (based on workspace-known global path).

function safeStat(p: string) {
  try {
    return fs.statSync(p);
  } catch {
    return null;
  }
}

export async function GET() {
  const skillsRoot =
    "C:/Users/vsuga/AppData/Roaming/npm/node_modules/clawdbot/skills";

  const rootStat = safeStat(skillsRoot);
  if (!rootStat || !rootStat.isDirectory()) {
    return NextResponse.json(
      {
        ok: false,
        error: `skills root not found: ${skillsRoot}`,
      },
      { status: 404 }
    );
  }

  const skills: Array<{ name: string; files: string[]; updatedAtMs: number }> = [];

  for (const name of fs.readdirSync(skillsRoot)) {
    const dir = path.join(skillsRoot, name);
    const st = safeStat(dir);
    if (!st || !st.isDirectory()) continue;

    const files = fs
      .readdirSync(dir)
      .filter((f) => f.toLowerCase().endsWith("skill.md"));

    // best-effort mtime
    let updatedAtMs = st.mtimeMs;
    for (const f of files) {
      const fst = safeStat(path.join(dir, f));
      if (fst) updatedAtMs = Math.max(updatedAtMs, fst.mtimeMs);
    }

    skills.push({ name, files, updatedAtMs });
  }

  skills.sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json({ ok: true, skillsRoot, count: skills.length, skills });
}
