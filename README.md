# CustomArc

B2C platform: customize a mug or phone case in a 3D browser customizer (manual placement + AI text→texture), pay, and a print partner fulfills it. Phase 1.

- **Spec & roadmap:** `docs/phase-1/spec.md`, implementation issues `docs/phase-1/issues/`.
- **Decisions log:** `docs/wayfinder/` (tickets 01–24) + `CONTEXT.md` (ubiquitous language).

## Stack

TS monorepo (pnpm). `apps/web` (Next.js) + `apps/api` (Bun + Elysia) + `packages/{db,shared,design}`. Postgres via Prisma. Three.js / react-three-fiber customizer. See spec §3.

## Quick start

```bash
pnpm install
cp .env.example .env         # fill secrets
pnpm db:up                   # local postgres
pnpm db:generate             # prisma client
pnpm db:migrate              # initial migration
pnpm dev                     # api + web in parallel
```

- API: http://localhost:3001/health
- Web: http://localhost:3000

## Modules

`catalog · designer · orders · credits · fulfillment · moderation · ai · auth · billing` — thin routes over services over repositories over Prisma. Dependency direction: `routes → services → repos → prisma`.
