# syntax=docker/dockerfile:1.7
# CustomArc API — light multi-stage Bun image (monorepo root context)
# Deploy: set Root/Context = repo root, Dockerfile = Dockerfile

FROM oven/bun:1.3-debian AS deps
WORKDIR /app
ENV CI=1 \
    PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates python3 make g++ \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable \
  && corepack prepare pnpm@11.13.0 --activate

# Manifests only — max layer cache
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/
COPY packages/db/package.json packages/db/
COPY packages/design/package.json packages/design/

# API workspace + deps only (skips Next.js / web install work)
RUN --mount=type=cache,id=customarc-pnpm,target=/pnpm/store \
    pnpm config set store-dir /pnpm/store \
    && pnpm install --frozen-lockfile --filter @customarc/api...

FROM deps AS build
COPY apps/api apps/api
COPY packages packages
RUN pnpm --filter @customarc/db generate

FROM oven/bun:1.3-debian AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    CI=1 \
    API_PORT=3001 \
    PORT=3001

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --system --gid 1001 app \
  && useradd --system --uid 1001 --gid app --create-home app

COPY --from=build --chown=app:app /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=build --chown=app:app /app/node_modules ./node_modules
COPY --from=build --chown=app:app /app/apps/api ./apps/api
COPY --from=build --chown=app:app /app/packages ./packages

USER app
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=3 \
  CMD bun -e "const p=process.env.PORT||process.env.API_PORT||'3001';fetch('http://127.0.0.1:'+p+'/health').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["bun", "apps/api/src/index.ts"]
