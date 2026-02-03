import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

// API endpoint having to read the backlog data

export async function GET() {
    const backlogPath = path.join(process.cwd(), "src/lib/data/backlog.json");

    try {
        if (!fs.existsSync(backlogPath)) {
            return NextResponse.json({
                projects: []
            });
        }

        const raw = fs.readFileSync(backlogPath, "utf8");
        const data = JSON.parse(raw);

        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json(
            { error: e.message },
            { status: 500 }
        );
    }
}
