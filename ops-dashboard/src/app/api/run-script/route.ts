import { NextRequest, NextResponse } from "next/server";
import { exec } from "node:child_process";
import path from "node:path";
import fs from "node:fs";

const ALLOWED_DIR = "C:/Users/vsuga/clawd/scripts";
const CLAWD_DIR = "C:/Users/vsuga/clawd";
const LOGS_DIR = path.join(CLAWD_DIR, "logs", "script-runs");

// Ensure logs directory exists
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

// Store running executions
const runningExecutions: Record<string, { startTime: number; script: string; pid?: number }> = {};

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

    // ClawdStrike Pre-flight Security Check
    const isForbidden = script.includes(".ssh") || script.includes(".aws") || script.includes(".env");
    if (isForbidden) {
      return NextResponse.json({
        error: "Blocked by ClawdStrike Security Policy: Restricted path access.",
        code: "POLICY_VIOLATION"
      }, { status: 403 });
    }

    // Generate execution ID
    const executionId = `${path.basename(script)}-${Date.now()}`;
    const logPath = path.join(LOGS_DIR, `${executionId}.log`);

    // Determine execution command
    let command: string;
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

    // Create log file
    fs.writeFileSync(logPath, `[${new Date().toISOString()}] Starting: ${command}\n`);

    // Track execution
    runningExecutions[executionId] = {
      startTime: Date.now(),
      script: path.basename(script)
    };

    // Execute script in background
    const child = exec(command, { cwd: CLAWD_DIR }, (error, stdout, stderr) => {
      const endTime = Date.now();
      const duration = ((endTime - runningExecutions[executionId].startTime) / 1000).toFixed(2);

      // Append output to log file
      const logContent = [
        ``,
        `[${new Date().toISOString()}] === Script Finished ===`,
        `Duration: ${duration}s`,
        error ? `Error: ${error.message}` : ``,
        `=== STDOUT ===`,
        stdout || ``,
        `=== STDERR ===`,
        stderr || ``
      ].join(`\n`);

      fs.appendFileSync(logPath, logContent);

      // Mark as completed (keep for 1 hour then cleanup)
      setTimeout(() => {
        delete runningExecutions[executionId];
        // Cleanup log after 1 hour
        setTimeout(() => {
          if (fs.existsSync(logPath)) {
            fs.unlinkSync(logPath);
          }
        }, 3600000);
      }, 60000);
    });

    // Store PID for monitoring
    if (child.pid) {
      runningExecutions[executionId].pid = child.pid;
    }

    // Write stdout/stderr to log file in real-time
    child.stdout?.on('data', (data) => {
      fs.appendFileSync(logPath, data);
    });
    child.stderr?.on('data', (data) => {
      fs.appendFileSync(logPath, data);
    });

    return NextResponse.json({
      success: true,
      executionId,
      script: path.basename(script),
      logPath: `/api/run-script/log/${executionId}`,
      status: `/api/run-script/status/${executionId}`
    });

  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// GET: Check status or get log content
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const executionId = searchParams.get("executionId");

  if (action === "status" && executionId) {
    // Check single execution status
    const execution = runningExecutions[executionId];
    const logPath = path.join(LOGS_DIR, `${executionId}.log`);

    if (execution) {
      const elapsed = ((Date.now() - execution.startTime) / 1000).toFixed(1);
      return NextResponse.json({
        status: "running",
        executionId,
        script: execution.script,
        elapsedSeconds: parseFloat(elapsed),
        pid: execution.pid
      });
    } else if (fs.existsSync(logPath)) {
      // Check if completed recently
      const stats = fs.statSync(logPath);
      const content = fs.readFileSync(logPath, "utf8");
      const completed = content.includes("=== Script Finished ===");

      return NextResponse.json({
        status: completed ? "completed" : "unknown",
        executionId,
        logPath: `/api/run-script?action=log&executionId=${executionId}`,
        completedAt: stats.mtime.toISOString()
      });
    }

    return NextResponse.json({ status: "not_found", executionId });
  }

  if (action === "status" && !executionId) {
    // List all currently running executions (for polling UI)
    const runningExecutionsList = Object.entries(runningExecutions).map(([id, exec]) => ({
      executionId: id,
      script: exec.script,
      elapsedSeconds: parseFloat(((Date.now() - exec.startTime) / 1000).toFixed(1)),
      pid: exec.pid
    }));

    return NextResponse.json({
      running: runningExecutionsList.length,
      runningExecutions: runningExecutionsList
    });
  }

  if (action === "log" && executionId) {
    // Get log content
    const logPath = path.join(LOGS_DIR, `${executionId}.log`);

    if (fs.existsSync(logPath)) {
      const content = fs.readFileSync(logPath, "utf8");
      const lines = content.split("\n").length;

      return NextResponse.json({
        success: true,
        executionId,
        log: content,
        lines,
        truncated: lines > 500 ? content.split("\n").slice(-500).join("\n") : undefined
      });
    }

    return NextResponse.json({ error: "Log not found" }, { status: 404 });
  }

  // List recent executions
  const logs = fs.readdirSync(LOGS_DIR)
    .filter(f => f.endsWith(".log"))
    .map(f => {
      const stats = fs.statSync(path.join(LOGS_DIR, f));
      return {
        executionId: f.replace(".log", ""),
        createdAt: stats.birthtime,
        size: stats.size
      };
    })
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 20);

  return NextResponse.json({
    running: Object.keys(runningExecutions).length,
    recent: logs
  });
}
