import { spawn, ChildProcess } from "child_process";
import http from "http";
import fs from "fs";
import path from "path";

const PROJECT_DIR = "/home/z/my-project";
const NEXT_PORT = 3000;
const WRAPPER_PORT = 3099;
const LOG_FILE = path.join(PROJECT_DIR, "dev-wrapper.log");
const RESTART_DELAY_MS = 2000;

let serverProcess: ChildProcess | null = null;
let startTime = Date.now();
let restartCount = 0;

function log(msg: string) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${msg}\n`;
  fs.appendFileSync(LOG_FILE, line);
  console.log(line.trimEnd());
}

function startNextDev(): void {
  log(`Starting Next.js dev server (attempt #${restartCount + 1})...`);

  serverProcess = spawn(
    "npx",
    ["next", "dev", "-p", String(NEXT_PORT)],
    {
      cwd: PROJECT_DIR,
      env: { ...process.env },
      stdio: ["ignore", "pipe", "pipe"],
    }
  );

  // Pipe stdout/stderr to dev.log as well
  const devLog = fs.openSync(path.join(PROJECT_DIR, "dev.log"), "a");

  if (serverProcess.stdout) {
    serverProcess.stdout.on("data", (data: Buffer) => {
      fs.writeSync(devLog, data);
    });
  }
  if (serverProcess.stderr) {
    serverProcess.stderr.on("data", (data: Buffer) => {
      fs.writeSync(devLog, data);
    });
  }

  serverProcess.on("exit", (code, signal) => {
    log(
      `Next.js exited (code=${code}, signal=${signal}). Restarting in ${RESTART_DELAY_MS}ms...`
    );
    restartCount++;
    fs.closeSync(devLog);
    setTimeout(() => startNextDev(), RESTART_DELAY_MS);
  });

  serverProcess.on("error", (err) => {
    log(`Next.js spawn error: ${err.message}`);
  });
}

// Health-check HTTP server
const healthServer = http.createServer((req, res) => {
  if (req.url === "/health" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: "ok",
        uptime: Math.floor((Date.now() - startTime) / 1000),
        restartCount,
        serverPid: serverProcess?.pid ?? null,
        nextPort: NEXT_PORT,
      })
    );
  } else if (req.url === "/restart" && req.method === "POST") {
    log("Manual restart requested via /restart");
    if (serverProcess) {
      serverProcess.kill("SIGTERM");
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "restarting" }));
  } else {
    res.writeHead(404);
    res.end("Not Found");
  }
});

// Graceful shutdown
function shutdown(signal: string) {
  log(`Received ${signal}, shutting down...`);
  if (serverProcess) {
    serverProcess.kill("SIGTERM");
  }
  healthServer.close(() => {
    log("Wrapper shut down cleanly.");
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 5000);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Boot
log(`Dev Wrapper starting on port ${WRAPPER_PORT}`);
log(`Managing Next.js on port ${NEXT_PORT}`);
log(`Health check: http://localhost:${WRAPPER_PORT}/health`);

healthServer.listen(WRAPPER_PORT, () => {
  log(`Health server listening on ${WRAPPER_PORT}`);
  startNextDev();
});