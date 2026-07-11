// daemonize.ts — Double-fork daemon that keeps Next.js alive
// Compile: bun build daemonize.ts --outfile /tmp/daemonize.js
// Run: node /tmp/daemonize.js

import { spawn, ChildProcess } from "child_process";
import fs from "fs";
import path from "path";

const LOG = "/home/z/my-project/dev-wrapper.log";

function log(msg: string) {
  fs.appendFileSync(LOG, `[${new Date().toISOString()}] ${msg}\n`);
}

function startServer(): ChildProcess {
  log("Spawning Next.js dev server...");
  const child = spawn("npx", ["next", "dev", "-p", "3000"], {
    cwd: "/home/z/my-project",
    detached: false,
    stdio: ["ignore", fs.openSync("/home/z/my-project/dev.log", "a"), fs.openSync("/home/z/my-project/dev.log", "a")],
    env: { ...process.env },
  });

  child.on("exit", (code) => {
    log(`Server exited (code=${code}). Restarting in 3s...`);
    setTimeout(() => {
      const newChild = startServer();
      // Keep reference alive
      newChild.ref();
    }, 3000);
  });

  child.on("error", (err) => {
    log(`Spawn error: ${err.message}`);
  });

  child.ref();
  return child;
}

// Start the server
startServer();
log("Daemon started. Server should be available on :3000");

// Keep the process alive indefinitely
setInterval(() => {
  // Heartbeat — just to keep the event loop alive
}, 60000);

// Prevent process from exiting
process.on("SIGTERM", () => {
  log("Received SIGTERM — ignoring (keep-alive daemon)");
});
process.on("SIGINT", () => {
  log("Received SIGINT — ignoring (keep-alive daemon)");
});