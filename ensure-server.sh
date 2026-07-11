#!/bin/bash
# ensure-server.sh — Call this at the start of every Bash command
# Starts the dev server if it's not already running, then returns immediately.
# Usage: source /home/z/my-project/ensure-server.sh

ensure_server() {
  if curl -s -o /dev/null -w "%{http_code}" --max-time 2 http://localhost:3000/ 2>/dev/null | grep -q "200"; then
    return 0
  fi
  # Server not responding — start it in background
  cd /home/z/my-project
  npx next dev -p 3000 >> /home/z/my-project/dev.log 2>&1 &
  sleep 15
}
ensure_server