# CustomArc API — simple Bun image (build context = repo root)
FROM oven/bun:1.3-debian

WORKDIR /app
ENV CI=1 \
    NODE_ENV=production \
    API_PORT=3001 \
    PORT=3001

RUN corepack enable && corepack prepare pnpm@11.13.0 --activate

# 1) lockfile + package manifests (cache-friendly)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/
COPY packages/db/package.json packages/db/
COPY packages/design/package.json packages/design/

# API + workspace deps only (no Next.js install)
RUN pnpm install --frozen-lockfile --filter @customarc/api...

# 2) source + prisma client
COPY apps/api apps/api
COPY packages packages
RUN pnpm --filter @customarc/db generate \
  && pnpm store prune

EXPOSE 3001
CMD ["bun", "apps/api/src/index.ts"]
