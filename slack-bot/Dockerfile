# =============================================================================
# GSD Slack Bot — Production Dockerfile
# Node 20 · Socket Mode · SQLite · dumb-init for graceful shutdown
# =============================================================================

FROM node:20-slim AS base

# dumb-init: proper PID-1 signal handling (prevents zombie processes)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    sqlite3 \
    dumb-init \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ── Dependencies (cached layer) ───────────────────────────────────────────────
COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

# ── Application source ────────────────────────────────────────────────────────
COPY . .

# Ensure persistent storage directory exists
RUN mkdir -p storage/db storage/logs

# Non-root user for security
RUN groupadd --system botuser && useradd --system --gid botuser botuser
RUN chown -R botuser:botuser /app
USER botuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD curl -f http://localhost:3000/healthz || exit 1

# dumb-init wraps node so SIGTERM is forwarded correctly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]
