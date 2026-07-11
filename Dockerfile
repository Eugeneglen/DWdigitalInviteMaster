# DWdigitalInvite - Production Dockerfile
# Enforces Bun as the build tool, validates standalone output

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

# Install dependencies
FROM base AS deps
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Build stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN bunx prisma generate

# Build the Next.js application
RUN bun run build

# CRITICAL: Validate standalone output exists
RUN if [ ! -f ".next/standalone/server.js" ]; then \
      echo "❌ ERROR: .next/standalone/server.js not generated - build failed"; \
      exit 1; \
    fi && echo "✅ Standalone build validated successfully"

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/.next/standalone ./

# Copy static assets
COPY --from=builder /app/.next/static ./.next/static

# Copy public directory
COPY --from=builder /app/public ./public

# Copy Prisma schema for potential runtime use
COPY --from=builder /app/prisma ./prisma

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", ".next/standalone/server.js"]