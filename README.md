# ReLoop — Turn Local Waste Into Local Resources

Built for the Environment & Sustainability track of Neighborhood Hacks 2026. ReLoop is a frontend-only app that helps communities reuse household materials through a local exchange board, practical waste guidance, community actions and transparent impact tracking.

## Run, test, build
```bash
bun install        # or npm install
bun run dev        # http://localhost:8080
bunx vitest run    # unit tests for impact rules and safety guidance
bun run build      # production build
```

## Architecture
- **TanStack Start + React 19 + TypeScript + Tailwind v4.** Each page lives in `src/routes/` (`index`, `finder`, `exchange`, `actions`, `impact`, `about`).
- **Data layer** in `src/lib/reloop/`:
  - `types.ts` – domain types · `schema.ts` – zod schemas, form validation and a contact-detail check
  - `seed.ts` – fictional demo dataset (every record is `origin: "sample"`)
  - `guidance.ts` – editable local guidance dataset and recommendation rules
  - `impact.ts` – impact summary and insights (never adds different units together; de-duplicates per source record)
  - `store.ts` – a small external store kept in LocalStorage, with schema validation, recovery from bad data and reset
- **UI** in `src/components/reloop/` plus shadcn primitives in `src/components/ui/`.

## Features
- Overview with metrics split into your records and sample records, recent activity, suggested actions, and a "Find a Better Use" button.
- Waste-to-Value Finder with reuse and recycling paths shown separately; hazardous or damaged electronics get safety advice only.
- Reuse Exchange: create, edit, delete (your own listings), search, filter, view details, send simulated interest, mark reserved/exchanged.
- Community Actions with explicit confirmation before completion, optional quantity, and undo.
- Impact Tracker: totals per unit, by category, reuse vs recycling, a chart, an activity log, planned entries kept separate from recorded ones.
- Community Insights calculated from local records, with a form to post reuse needs.
- About page with an evidence template (empty fields show "Awaiting validation") and a pilot plan.
- Reset Demo Data (sidebar) with a confirmation dialog.

## Known limitations
- Data lives only in one browser. There is no syncing between users, and interest requests contact no one.
- Guidance is general advice, not live local recycling rules. There is no image recognition.
- No CO₂ or landfill estimates.

## Manual QA checklist
1. Clear site data → reload → sample records appear with "Sample data" labels.
2. Exchange → List an item → it appears right away; check that invalid input shows errors.
3. Search and filter by category and availability; check the empty state.
4. Open your listing → edit → mark exchanged → Impact totals go up once; set to reserved → totals go back down.
5. Delete your listing (a confirmation appears).
6. Send interest on a listing → interest count goes up.
7. Actions → Record completion (requires the confirm box) → shows as completed; Undo removes its impact.
8. Finder → Save as plan → shows as "Planned — unverified"; Mark done → counted.
9. Reload → everything is still there. Reset demo data → back to the starting state.
10. Check mobile (menu button), tablet and desktop; check Tab navigation and visible focus.

## Publish to GitHub
In Lovable: **GitHub → Connect** to push this code to a new public repository. Or, from a local copy: `git init && git add . && git commit -m "ReLoop" && git remote add origin <url> && git push -u origin main`.

## Deploy
Click **Publish** in Lovable for a hosted URL. To host it yourself, run `bun run build` and deploy the output to a host that supports TanStack Start (for example Cloudflare Workers via the included Vite config).
