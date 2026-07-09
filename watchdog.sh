#!/bin/bash
# Dev server watchdog — auto-restarts on crash
# Runs warmup after each restart to pre-compile routes

cd /home/z/my-project

while true; do
  echo "[$(date +%H:%M:%S)] Starting dev server..."
  
  # Clear Turbopack cache to start fresh
  rm -rf .next/cache 2>/dev/null
  
  # Start server (foreground, blocks until it crashes)
  bun run dev >> dev.log 2>&1
  EXIT_CODE=$?
  
  echo "[$(date +%H:%M:%S)] Server exited (code: $EXIT_CODE). Restarting in 3s..."
  sleep 3
done