import { NextRequest, NextResponse } from "next/server";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";

const execAsync = promisify(exec);

// API endpoint to execute a script
// WARNING: This is a powerful endpoint - use with caution

const ALLOWED_DIR = "C:/Users/vsuga/clawd/scripts";
const CLAWD_DIR = "C:/Users/vsuga/clawd";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { script } = body;

        if (!script) {
            return NextResponse.json({ error: "No script specified" }, { status: 400 });
        }

        // Security: Ensure script is within allowed directory
        const normalizedPath = path.normalize(script);
        if (!normalizedPath.startsWith(ALLOWED_DIR)) {
            return NextResponse.json({ error: "Script path not allowed" }, { status: 403 });
        }

        // Determine execution command based on file type
        let command: string;

        // --- ClawdStrike Pre-flight Security Check ---
        const isForbidden = script.includes(".ssh") || script.includes(".aws") || script.includes(".env");
        if (isForbidden) {
            console.error(`[ClawdStrike] Blocked violation attempt: Access to restricted path in ${script}`);
            return NextResponse.json({
                error: "Blocked by ClawdStrike Security Policy: Restricted path access.",
                code: "POLICY_VIOLATION"
            }, { status: 403 });
        }
        // --------------------------------------------

        if (script.endsWith(".js")) {
            command = `node "${script}"`;
        } else if (script.endsWith(".py")) {
            command = `python "${script}"`;
        } else if (script.endsWith(".ps1")) {
            command = `powershell -ExecutionPolicy Bypass -File "${script}"`;
        } else if (script.endsWith(".sh")) {
            command = `bash "${script}"`;
        } else if (script.endsWith(".bat")) {
            command = `"${script}"`;
        } else {
            return NextResponse.json({ error: "Unsupported script type" }, { status: 400 });
        }

        // Execute script in background (don't wait for completion)
        // This prevents long-running scripts from blocking the response
        exec(command, { cwd: CLAWD_DIR }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Script error: ${error.message}`);
            }
            if (stderr) {
                console.error(`Script stderr: ${stderr}`);
            }
            if (stdout) {
                console.log(`Script stdout: ${stdout}`);
            }
        });

        return NextResponse.json({
            message: `Script ${path.basename(script)} started`,
            script: path.basename(script)
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
