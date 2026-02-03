import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

const RECEIPTS_DIR = "C:/Users/vsuga/clawd/ops-dashboard/.hush/receipts";

export async function GET() {
    try {
        // Ensure directory exists
        if (!fs.existsSync(RECEIPTS_DIR)) {
            fs.mkdirSync(RECEIPTS_DIR, { recursive: true });
        }

        // For now, return mock receipts if folder is empty
        const files = fs.readdirSync(RECEIPTS_DIR);

        if (files.length === 0) {
            return NextResponse.json({
                receipts: [
                    {
                        id: "rcpt-5521",
                        timestamp: new Date().toISOString(),
                        action: "exec: igaming-video.js",
                        actor: "Alex (Automator)",
                        status: "verified",
                        signature: "0x7f3a...8e2b"
                    },
                    {
                        id: "rcpt-5520",
                        timestamp: new Date(Date.now() - 3600000).toISOString(),
                        action: "read: .env.local",
                        actor: "Clawdbot",
                        status: "warning",
                        signature: "0x1a2b...c3d4"
                    }
                ]
            });
        }

        // In a real scenario, we would parse the signed YAML/JSON receipts
        const receipts = files
            .filter(f => f.endsWith(".json") || f.endsWith(".yaml"))
            .map(f => {
                const content = fs.readFileSync(path.join(RECEIPTS_DIR, f), "utf8");
                // Basic parsing logic...
                return JSON.parse(content);
            });

        return NextResponse.json({ receipts });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
