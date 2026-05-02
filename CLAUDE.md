# Conventions for Claude (and humans)

This file is read automatically by Claude Code (locally) and by the Claude Code Review GitHub Action (on PRs). Keep it tight and current — too long and it gets ignored.

## Stack

- **Next.js 16** App Router, **React 19**, **TypeScript** strict
- **Supabase**: Postgres + Auth + Storage + RLS via `@supabase/ssr`
- **Stripe**: subscriptions + Connect destination charges
- **Resend** for transactional email
- **next-intl** for i18n (10 locales, `en` is the source of truth)
- A standalone Node **audio worker** under `worker/` (FFmpeg, polls Supabase)
- Deployed on **Vercel**

## Component model

- **Server Components by default.** Only add `"use client"` when the file has interactivity (`useState`/`useEffect`/`useReducer`/event handlers/refs that touch the DOM).
- A pure presentational component imported only by client components can still be a Server Component — it just renders to RSC payload.
- Heavy client-only libs (`wavesurfer.js`, `recharts`, `fuse.js`, `archiver`) must be **dynamically imported** or kept on the server. See `src/lib/wavesurfer-loader.ts` for the pattern.
- Never import server-only modules (`createSupabaseServiceClient`, `Resend`, FS) into a client component.

## Supabase clients

Three variants, used in distinct contexts:

| Client | File | Where to use |
|---|---|---|
| **Server** (RLS-bound, cookie auth) | `src/lib/supabaseServerClient.ts` | RSC pages, server actions, API route handlers |
| **Browser** (RLS-bound, cookie auth) | `src/lib/supabaseBrowserClient.ts` | Client components |
| **Service role** (bypasses RLS) | `src/lib/supabaseServiceClient.ts` | Webhooks, cron, admin-only ops behind `requireAdmin()` |

**Treat new call sites of `createSupabaseServiceClient` as suspicious** — call them out unless they're in:
- `src/app/api/stripe/webhook/route.ts`
- `src/app/api/cron/**`
- `src/app/api/admin/**` (after `requireAdmin()`)
- A clearly documented narrow path

A public unauthenticated read should use the anon client + RLS policies, not the service-role client.

## Auth & access control

- Middleware (`src/middleware.ts`) gates `/app/**` and sets the CSP.
- `/admin/**` gates via `requireAdmin()` in `src/app/admin/layout.tsx`.
- API routes that mutate state (admin POSTs, etc.) MUST use `requireSameOrigin(req)` from `src/lib/origin-check.ts`.
- Sensitive admin POSTs also rate-limit via `rateLimit(...)` from `src/lib/rate-limit.ts`.
- Never accept user-mutating IDs from the request body without a server-side ownership check. The pattern: derive the target id from `getUser()` or query the user-scoped client and let RLS deny non-owners.

## RLS

- Every new table MUST `ENABLE ROW LEVEL SECURITY` and have at least one policy.
- Public reads → use a policy with the appropriate filter, not `service_role`.
- `SECURITY DEFINER` functions MUST `SET search_path = pg_catalog, public` and `REVOKE EXECUTE FROM public` unless they're intentionally callable.
- Migrations live in `supabase/migrations/NNN_name.sql` — pick the next available `NNN`.

## Worker

- `worker/` must not import from `src/`. App ↔ worker communication is via Supabase rows only.
- The polling loop reclaims rows stuck in `processing` / `analyzing` for >15 min before picking up new work — keep that recovery path intact when refactoring.
- FFmpeg buffer caps and timeouts are intentional; don't grow them without a reason.

## Audio pipeline

- The audio element is **persistent** (lives for the session) on `AudioContext`. `currentTime` is NOT in context — it's exposed via `useAudioCurrentTime()` so non-time consumers don't re-render 4×/sec.
- Audio is streamed **losslessly** (WAV). Don't introduce a lossy proxy; the buffering chip on the player explains the brief wait.
- Waveform peaks are computed by the worker at upload time and cached on `track_audio_versions.waveform_peaks`. Browser-side computation is a fallback only.

## Error tracking

- Sentry is wired in via `instrumentation.ts` (server/edge) and `instrumentation-client.ts` (browser). Both are no-ops when `NEXT_PUBLIC_SENTRY_DSN` is unset.
- `src/app/error.tsx` and `src/app/global-error.tsx` call `Sentry.captureException`. Don't replace those with `console.error`-only patterns.
- Server-action errors and route-handler throws are forwarded automatically via `onRequestError` in `instrumentation.ts`. New code should `throw` rather than swallowing — the boundary picks it up.
- `next.config.ts` is wrapped with `withSentryConfig`. New build-time wrappers must compose with it (Sentry stays outermost).

## Stripe

- Webhook handler at `src/app/api/stripe/webhook/route.ts`:
  - Verifies signature before any side effect.
  - Records `event.id` in `stripe_processed_events` and returns 200 on duplicate retries.
- Don't add new fire-and-forget `.catch(console.error)` calls for important workflows — failures need to be visible.

## Performance discipline

- Don't add `currentTime` (or any 4Hz value) to `AudioContext`.
- Don't statically import `wavesurfer.js`, `recharts`, `archiver`, or `fuse.js` from a route's initial bundle.
- Avoid `JSON.stringify` on the render path as a dirty-check.
- Big lists need `React.memo` boundaries.

## Code style

- File names are kebab-case under `src/` (a few `featured/` and `admin/traffic/` are PascalCase legacy — fine to leave, but new files are kebab-case).
- Component names are PascalCase. Hook files start with `use-` (kebab-case).
- TypeScript `strict` is on. Avoid `any` / `as any`. `Record<string, unknown>` is OK for upsert payloads, not for query results — generated `Database` types exist for that.
- No comments stating *what* the code does; reserve comments for *why* something non-obvious is the way it is.

## i18n

- All user-facing strings on big leaf components go through `useTranslations`. Locale files are in `src/i18n/messages/*.ts`. The biggest oversights today are documented in the audit; new code shouldn't add to them.

## What review SHOULD push back on

- Service-role client in client code (or in any new place not listed above)
- New tables without RLS
- Missing Origin / rate-limit checks on admin POSTs
- Static imports of heavy client-only libs
- Adding fields to `AudioContext` that change at >1 Hz
- Hard-coded strings in `src/components/**` user-facing UI
- New tests with `process.env.STRIPE_*` mocked (prefer real test keys + ngrok)

## What review should NOT block on

- Existing oversize components (`screen-mockup.tsx`, `audio-player.tsx`, `track-detail-client.tsx`, `settings/page.tsx`, `portal-audio-player.tsx`) — refactors are tracked separately
- Pre-existing `eslint-disable` directives unless the reviewed change interacts with them
- Style debates (formatting, naming nits)
