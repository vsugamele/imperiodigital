import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

// API endpoint to list all automation scripts with categorization

const SCRIPTS_DIR = "C:/Users/vsuga/clawd/scripts";

function categorizeScript(name: string): string {
    const lower = name.toLowerCase();
    if (lower.includes("igaming") || lower.includes("teo") || lower.includes("jonathan") || lower.includes("laise") || lower.includes("pedro")) return "igaming";
    if (lower.includes("petselect")) return "petselect";
    if (lower.includes("vanessa") || lower.includes("equilibre") || lower.includes("carrossel")) return "vanessa";
    if (lower.includes("image") || lower.includes("gen-") || lower.includes("flux")) return "image-gen";
    if (lower.includes("transcribe") || lower.includes("whisper")) return "transcribe";
    if (lower.includes("upload") || lower.includes("backup") || lower.includes("health") || lower.includes("monitor") || lower.includes("watchdog")) return "infrastructure";
    return "other";
}

function getScriptType(name: string): "js" | "py" | "ps1" | "other" {
    if (name.endsWith(".js")) return "js";
    if (name.endsWith(".py")) return "py";
    if (name.endsWith(".ps1")) return "ps1";
    return "other";
}

function getScriptDescription(name: string): string | undefined {
    const descriptions: Record<string, string> = {
        "igaming-video.js": "Gera vídeos iGaming com Ken Burns",
        "schedule-next-day.js": "Agenda posts para D+1",
        "pipeline-health-check.js": "Verifica saúde do pipeline",
        "youtube-generator.js": "Gera conteúdo para YouTube",
        "transcribe-gemini.py": "Transcreve áudio com Gemini",
        "carrossel-master.js": "Gera carrosséis de imagens",
        "backup-ops-to-drive.js": "Backup para Google Drive",
        "poll-upload-status.js": "Monitora status de uploads"
    };
    return descriptions[name];
}

export async function GET() {
    try {
        if (!fs.existsSync(SCRIPTS_DIR)) {
            return NextResponse.json({ scripts: [], total: 0 });
        }

        const files = fs.readdirSync(SCRIPTS_DIR);
        const scripts = files
            .filter(f => [".js", ".py", ".ps1", ".sh", ".bat"].some(ext => f.endsWith(ext)))
            .map(name => ({
                name,
                path: path.join(SCRIPTS_DIR, name),
                type: getScriptType(name),
                category: categorizeScript(name),
                description: getScriptDescription(name)
            }))
            .sort((a, b) => {
                // Sort by category first, then by name
                if (a.category !== b.category) return a.category.localeCompare(b.category);
                return a.name.localeCompare(b.name);
            });

        return NextResponse.json({
            scripts,
            total: scripts.length
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
