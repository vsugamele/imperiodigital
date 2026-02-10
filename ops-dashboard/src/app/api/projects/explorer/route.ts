import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ALLOWED_EXTENSIONS = [
    '.js', '.ts', '.tsx', '.jsx', '.json', '.md', '.txt', '.css', '.html', '.sql', '.yaml', '.yml'
];

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const folderPath = searchParams.get('path');
        const readFile = searchParams.get('file');

        if (!folderPath) {
            return NextResponse.json({ ok: false, error: "Path is required" }, { status: 400 });
        }

        // Security check: simple path traversal prevention
        if (folderPath.includes('..')) {
            return NextResponse.json({ ok: false, error: "Invalid path" }, { status: 403 });
        }

        // If 'file' param is present, read the file content
        if (readFile) {
            const filePath = path.join(folderPath, readFile);
            const ext = path.extname(filePath).toLowerCase();

            if (!ALLOWED_EXTENSIONS.includes(ext)) {
                return NextResponse.json({ ok: false, error: "File type not supported for reading" }, { status: 403 });
            }

            if (!fs.existsSync(filePath)) {
                return NextResponse.json({ ok: false, error: "File not found" }, { status: 404 });
            }

            const content = fs.readFileSync(filePath, 'utf-8');
            return NextResponse.json({ ok: true, content, fileName: readFile });
        }

        // Otherwise list directory contents
        if (!fs.existsSync(folderPath)) {
            return NextResponse.json({ ok: false, error: "Directory not found" }, { status: 404 });
        }

        const items = fs.readdirSync(folderPath, { withFileTypes: true });

        const contents = items
            .filter(item => !item.name.startsWith('.')) // Hide hidden files
            .map(item => ({
                name: item.name,
                isDirectory: item.isDirectory(),
                size: item.isFile() ? fs.statSync(path.join(folderPath, item.name)).size : 0,
                extension: item.isFile() ? path.extname(item.name).toLowerCase() : null
            }))
            .sort((a, b) => {
                // Directories first, then alphabetical
                if (a.isDirectory && !b.isDirectory) return -1;
                if (!a.isDirectory && b.isDirectory) return 1;
                return a.name.localeCompare(b.name);
            });

        return NextResponse.json({
            ok: true,
            path: folderPath,
            contents
        });

    } catch (err: any) {
        return NextResponse.json({
            ok: false,
            error: err.message
        }, { status: 500 });
    }
}
