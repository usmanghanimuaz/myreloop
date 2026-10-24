# ReLoop — Turn Local Waste Into Local Resources

ReLoop is a community reuse platform built for the Environment & Sustainability track of **Neighborhood Hacks 2026**. It helps neighbours keep usable household materials out of landfill by matching people who **have** items with people who **need** them — for **free or exchange only**. There are no payments, no sales, and no commercial listings.

Live demo: https://myreloop.lovable.app

## What it does

- **I Have (marketplace)** — post items you no longer need, with photos, quantity, condition and a general area (exact addresses stay private).
- **I Need (community requests)** — post what you're looking for; owners of matching items can respond.
- **Handovers** — an exchange only counts as completed when **both participants confirm** it. Nothing is auto-completed.
- **Material Guidance** — practical reuse, repair, recycling and safe-disposal guidance for 21+ material categories, including hazardous items that are blocked from casual exchange.
- **Waste & Evidence** — source-linked education on littering, dumping, burning and plastic pollution, plus a private evidence submission flow reviewed by moderators before anything becomes public.
- **Impact** — honest, data-derived impact: only two-party-confirmed handovers count. No invented CO₂ numbers, no fake testimonials, no sample records shown as real.
- **Moderation console** — an admin-only area with overview, members, listings, needs/requests, trust & safety (reports, evidence, restrictions), handovers, verified impact, support messages and an append-only audit log.

## Principles

- **Reuse first**, then repair, then recycle, then safe disposal.
- **Free or exchange only** — no paid transactions, ever.
- **Honest data** — no fabricated users, listings, impact figures or testimonials.
- **Privacy by default** — exact addresses, private notes, plans and unvalidated evidence are never public.
- **Safe handovers** — hazardous materials get safety guidance, not exchange listings.

## Tech stack

- **TanStack Start v1 + React 19 + TypeScript + Tailwind CSS v4** (Vite 7, edge/worker runtime)
- **Lovable Cloud** backend (Supabase): Postgres with row-level security on every table, email/password + Google auth, private photo storage
- **Server functions** (`createServerFn`) for all authenticated writes; revision-checked updates; moderation only through admin-checked database functions
- **i18n** in seven languages (English default) with Urdu and Arabic RTL support
- **PWA** manifest + install icons; optional push notifications via Firebase Cloud Messaging

## Project layout

```
src/
  routes/            # TanStack Router file routes (public pages + /account + /admin)
  lib/reloop/        # domain types, schemas, guidance, impact rules, server functions
  components/reloop/ # feature UI
  components/ui/     # shadcn primitives
  integrations/      # generated backend clients (do not edit)
supabase/migrations/ # database schema, RLS policies, moderation functions
```

## Run, test, build

```bash
bun install        # or npm install
bun run dev        # http://localhost:8080
bun run test       # vitest suite (rules, authz, i18n, models)
bun run build      # production build
```

## Security notes

- All application tables have RLS enabled; anonymous and ordinary authenticated users cannot execute moderation or privileged RPCs.
- Roles live in a protected `user_roles` table and are never derived from user-editable metadata. New signups are always normal users.
- `.env` files and internal planning notes are git-ignored; no secrets belong in this repository.

## License

Built as a hackathon project. Reuse the code, credit the sources cited in the app's Waste & Evidence section, and keep the honesty principles intact.
