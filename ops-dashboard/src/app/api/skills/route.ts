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

  // Combine with some featured "Available" skills from ClawHub
  const availableSkills = [
    {
      name: "Twitter Automator",
      description: "Postagem e monitoramento de engajamento no X.",
      author: "ClawHub",
      installed: false,
      category: "Social",
      icon: "🐦"
    },
    {
      name: "Flux Image Gen",
      description: "Geração de imagens realistas via Stable Diffusion/Flux.",
      author: "ClawHub",
      installed: false,
      category: "Creative",
      icon: "🎨"
    }
  ];

  return NextResponse.json({
    ok: true,
    skillsRoot,
    count: skills.length + availableSkills.length,
    installed: skills.map(s => ({ ...s, installed: true, author: "Local", icon: "🛠️", category: "System" })),
    available: availableSkills
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, skillName } = body;

    if (action === "install") {
      console.log(`Simulating installation of skill: ${skillName}`);
      // In real world: execSync(`openclaw skills install ${skillName}`)
      return NextResponse.json({ ok: true, message: `Skill ${skillName} instalada com sucesso!` });
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

