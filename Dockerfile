# CustomArc API — build from monorepo root (packages/db lives outside apps/api)
FROM oven/bun:1.3-debian AS base
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates python3 make g++ \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/
COPY packages/db/package.json packages/db/
COPY packages/design/package.json packages/design/

RUN pnpm install --frozen-lockfile

COPY . .

# Prisma client — must run from workspace (schema is in packages/db, not apps/api)
RUN pnpm --filter @customarc/db generate

ENV NODE_ENV=production
ENV API_PORT=3001
EXPOSE 3001

CMD ["bun", "apps/api/src/index.ts"]
