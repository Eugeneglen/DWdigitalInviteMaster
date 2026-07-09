#!/bin/bash
# Route warmer — pre-compiles critical routes after server starts
# Designed to run alongside the dev server

BASE="http://localhost:3000"
MAX_WAIT=30

echo "[$(date +%H:%M:%S)] 🔥 Waiting for server..."

# Wait for server
for i in $(seq 1 $MAX_WAIT); do
  if curl -s -o /dev/null -w '%{http_code}' "$BASE/" 2>/dev/null | grep -q "200"; then
    break
  fi
  sleep 1
done

sleep 3  # Let initial compilation settle

# Pre-compile API routes
for route in \
  "/api/auth/session" \
  "/api/auth/csrf" \
  "/api/auth/providers" \
  "/api/wedding/public" \
  "/api/site-settings" \
  "/api/cms/wedding" \
  "/api/cms/overview" \
  "/api/cms/content" \
  "/api/cms/schedule" \
  "/api/cms/features" \
  "/api/cms/stories" \
  "/api/cms/faqs" \
  "/api/cms/media" \
  "/api/cms/rsvps" \
  "/api/cms/wishes" \
  "/api/cms/guests" \
  "/api/cms/audit-logs" \
  "/api/auth/login"; do
  curl -s -o /dev/null "$route" 2>/dev/null
  sleep 0.5
done

# Pre-compile auth callback (the heaviest route)
CSRF=$(curl -s -c /tmp/_warmup.txt "$BASE/api/auth/csrf" 2>/dev/null | grep -o '"csrfToken":"[^"]*"' | cut -d'"' -f4)
if [ -n "$CSRF" ]; then
  curl -s -o /dev/null -b /tmp/_warmup.txt \
    -X POST "$BASE/api/auth/callback/credentials" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    --data-urlencode "email=admin@dreamweavers.sg" \
    --data-urlencode "password=Admin@2024" \
    --data-urlencode "csrfToken=$CSRF" 2>/dev/null
  rm -f /tmp/_warmup.txt
fi

echo "[$(date +%H:%M:%S)] ✅ Warmup complete. Memory: $(free -m | awk '/Mem:/{print $3}')MB used"