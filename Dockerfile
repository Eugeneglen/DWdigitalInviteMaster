# DWdigitalInvite - Production Dockerfile
# Build: oven/bun | Runner: node:22-alpine

# ── Build stage ──────────────────────────────────────────────────────────────
FROM oven/bun:1 AS builder
WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

COPY . .

# Patch Prisma provider for Railway Postgres (local dev uses sqlite)
RUN sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma

# Generate Prisma client (binaryTargets set in schema for cross-arch engines)
RUN bunx prisma generate

RUN bun run build

# Validate standalone output
RUN test -f ".next/standalone/server.js" || (echo "ERROR: standalone server.js missing" && exit 1)

# ── Production runner ────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# NOTE: NEXTAUTH_SECRET, NEXTAUTH_URL, DATABASE_URL must be injected
# by the hosting environment (Railway). No fallback literals here.

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Preserve .next/standalone/ directory so CMD path resolves correctly
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./.next/standalone

# Static assets — placed where the standalone server expects them
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/standalone/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./.next/standalone/public

# Prisma schema + CLI for runtime db push
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["sh", "-c", "npx prisma db push && node .next/standalone/server.js"]