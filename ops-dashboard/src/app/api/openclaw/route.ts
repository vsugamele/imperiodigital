import { NextResponse } from "next/server";
import fs from "node:fs";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

// API endpoint to check OpenClaw gateway health and configuration
// Returns: gateway status, active models, skills count

async function checkGatewayHealth(): Promise<{ healthy: boolean; version?: string; error?: string }> {
    try {
        const { stdout, stderr } = await execAsync("openclaw health", { timeout: 5000 });
        const output = stdout + stderr;
        const versionMatch = output.match(/OpenClaw\s+([\d.]+)/i);
        return {
            healthy: true,
            version: versionMatch ? versionMatch[1] : "unknown"
        };
    } catch (e: any) {
        return {
            healthy: false,
            error: e.message || "Gateway unreachable"
        };
    }
}

function readOpenClawConfig() {
    const configPath = "C:/Users/vsuga/.openclaw/openclaw.json";
    try {
        const raw = fs.readFileSync(configPath, "utf8");
        const config = JSON.parse(raw);

        // Extract key information
        const primaryModel = config.agents?.defaults?.model?.primary || "unknown";
        const fallbacks = config.agents?.defaults?.model?.fallbacks || [];
        const providers = Object.keys(config.models?.providers || {});
        const workspace = config.agents?.defaults?.workspace || "unknown";
        const maxConcurrent = config.agents?.defaults?.maxConcurrent || 1;

        return {
            primaryModel,
            fallbackCount: fallbacks.length,
            fallbacks: fallbacks.slice(0, 3), // First 3 for display
            providers,
            workspace,
            maxConcurrent,
            lastTouched: config.meta?.lastTouchedAt || null
        };
    } catch (e) {
        return null;
    }
}

function countActiveSkills() {
    const skillsRoot = "C:/Users/vsuga/AppData/Roaming/npm/node_modules/clawdbot/skills";
    try {
        const skills = fs.readdirSync(skillsRoot).filter(name => {
            const stat = fs.statSync(`${skillsRoot}/${name}`);
            return stat.isDirectory();
        });
        return skills.length;
    } catch {
        return 0;
    }
}

export async function GET() {
    const [gateway, config] = await Promise.all([
        checkGatewayHealth(),
        Promise.resolve(readOpenClawConfig())
    ]);

    const skillsCount = countActiveSkills();

    return NextResponse.json({
        gateway,
        config,
        skillsCount,
        timestamp: Date.now()
    });
}
