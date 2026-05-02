# Mix Architect

Production tool for music engineers and producers: track-by-track briefs, mix references, audio versioning with timeline comments, lossless waveform playback, distribution checklists, and Stripe-powered quotes.

Stack: **Next.js 16 App Router** + **React 19** + **Supabase** (Postgres + Auth + Storage + RLS) + **Stripe** + a **Node audio worker** (FFmpeg). Deploys to Vercel; database hosted on Supabase.

---

## Repo layout

```
src/
  app/                Next.js App Router routes (RSC by default)
    api/              Route handlers (Stripe webhooks, cron, admin)
  actions/            Server actions ("use server")
  components/         UI components (kebab-case files; PascalCase exports)
  lib/                Utilities, Supabase clients, integrations
  middleware.ts       CSP + auth gate for /app/*
worker/               Standalone Node audio worker (Docker)
  src/
    index.ts          Polling loop: conversion + analysis
    converter.ts      FFmpeg wrappers
    loudness.ts       ITU-R BS.1770 LUFS / true peak / DC offset / clip
    peaks.ts          Waveform peaks (cached on track_audio_versions)
supabase/migrations/  SQL migrations applied in lexicographic order
scripts/              Smoke tests, RLS audit
```

The worker is intentionally decoupled from `src/`. It talks to the app only via Supabase rows (`conversion_jobs`, `track_audio_versions`).

---

## Getting started

### Prerequisites

- **Node 20+** (Next 16 minimum)
- **npm** (lockfile is npm; don't switch to pnpm without converting)
- A **Supabase project** (free tier is fine for dev)
- A **Stripe** test account (only required for billing flows)
- For the worker: **Docker** (recommended) or **FFmpeg** + **Node** locally

### Install + env

```bash
npm install
cp .env.example .env.local
# Fill in at minimum:
#   NEXT_PUBLIC_SUPABASE_URL
#   NEXT_PUBLIC_SUPABASE_ANON_KEY
#   SUPABASE_SERVICE_ROLE_KEY
#   NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Apply migrations

```bash
# Using the Supabase CLI (preferred)
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
# Or apply each .sql file under supabase/migrations/ in order via the
# Supabase SQL editor.
```

### Run the app

```bash
npm run dev          # http://localhost:3000
npm run lint
npx tsc --noEmit
```

### Run the worker (optional for dev)

The worker handles audio conversion (WAV → MP3/AAC/etc.) and uploads' loudness analysis + peak generation. The app works without it — uploads just stay in `pending` analysis state. To run it:

```bash
cd worker
cp ../.env.local .env  # worker uses SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
npm install
npm run dev
```

Or via Docker:

```bash
cd worker
docker build -t mix-architect-worker .
docker run --env-file ../.env.local mix-architect-worker
```

Worker output `♻️ Reclaimed N stuck job(s)` lines indicate the self-healing sweep ran (15-minute TTL on stuck `processing`/`analyzing` rows).

---

## Conventions

These are repeated for the GitHub Code Review action in `CLAUDE.md` — see it for the full list. Highlights:

- **Server Components by default.** `"use client"` only when the file has interactivity (state, effects, event handlers).
- **Three Supabase clients**: `createSupabaseServerClient` (RSC + actions), `createSupabaseBrowserClient` (client components), `createSupabaseServiceClient` (server-only privileged ops). Never import the service-role client into a client component.
- **RLS is the source of truth** for access control. Every new table must `ENABLE ROW LEVEL SECURITY` and have at least one policy. The `requireAdmin()` helper + admin layout guard are belt-and-suspenders.
- **Worker boundary**: `worker/` must not import from `src/`. App ↔ worker communication is rows only.

---

## Performance

The codebase has a built-in performance reporter (`src/lib/perf.ts`) that emits metrics to `/api/perf/ingest` and the admin dashboard at `/admin/performance`. Key budgets:

| Metric | Budget |
|---|---|
| `wavesurfer:init` | 150ms |
| `waveform:render` | 500ms |
| `waveform:resize` | 100ms |
| `waveform:seek` | 50ms |
| `playback:start:warm` | 100ms |
| `playback:start:cold` | 2500ms |

Audio is streamed losslessly (no MP3/AAC proxy) so producers hear what they uploaded. The buffering chip on the player explains the brief wait on cold starts.

---

## Deploy

The repo deploys to Vercel automatically on push to `main`. Preview deployments fire on every PR. Configure environment variables via:

```bash
vercel env pull .env.local       # pull current set
vercel env add VAR_NAME           # add a new one
```

CI (the Claude Code Review action in `.github/workflows/claude-review.yml`) runs on every PR.

---

## Common tasks

| Task | Command |
|---|---|
| Add a migration | Create `supabase/migrations/NNN_name.sql` with the next number |
| Run the perf smoke test | `npx tsx scripts/perf-smoke-test.ts` |
| Audit RLS policies | `npx tsx scripts/rls-audit/run.ts` (see `scripts/rls-audit/`) |
| Pull prod env to local | `vercel env pull .env.local` |
| Sign in with the dev account | `GET /api/dev-login` (only when `NODE_ENV !== "production"`) |
