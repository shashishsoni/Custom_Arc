# CustomArc API — Node installs deps, Bun runs the server
# Build context = repo root

FROM node:24-bookworm-slim AS deps
WORKDIR /app
ENV CI=1

RUN corepack enable && corepack prepare pnpm@11.13.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/
COPY packages/db/package.json packages/db/
COPY packages/design/package.json packages/design/

RUN pnpm install --frozen-lockfile --filter @customarc/api...

COPY apps/api apps/api
COPY packages packages
RUN pnpm --filter @customarc/db generate

FROM oven/bun:1.3-debian
WORKDIR /app
ENV CI=1 \
    NODE_ENV=production \
    API_PORT=3001 \
    PORT=3001

COPY --from=deps /app /app

EXPOSE 3001
CMD ["bun", "apps/api/src/index.ts"]
