# ReLoop confirmed model

- [x] Fix known code errors and connect existing Cloud provider/sign-in controls.
- [x] Add FREE/EXCHANGE forms, photos, needs and participant handover controls.
- [x] Add ownership checks and separate two-party verified metrics from self-reported records.
- [x] Add curated reliable source-linked evidence inside existing pages.
- [x] Run 15 rule tests and verify six public pages, filters, form controls and mobile sign-in dialog.
- [ ] Verify authenticated uploads, refresh persistence, cross-user access and full two-party handovers — blocked by no registered account.
- [x] Resolve application lint formatting without rewriting Cloud-managed generated files; lint exits 0 with eight existing refresh warnings.
- [x] Recheck current tests, preview compilation and six-page public workflows: 20 tests pass, automatic build OK, six routes HTTP 200 and no browser page errors.
- [x] Document verification and blockers; do not publish.
- [x] Apply master brief exchange preferences, need management, participant photo privacy and verified metrics.

# Environmental-first redesign (23 Oct 2026 brief)

- [x] i18n: English-first + Urdu, Hindi, Arabic, Spanish, French, Chinese; RTL for ur/ar; persisted choice; forms/needs/requests/empty states translated; English-fallback note on long-form pages (verified in browser: ur RTL + translated headings, zh LTR, fallback note on /terms).
- [x] Homepage: environmental problem first, mission, CTAs, 4-step How ReLoop Works; no fake stats.
- [x] New routes: /needs, /how-it-works, /about-us, /mission, /contact, /report, /faq, /blog + 3 articles, /terms, /privacy, /cookies, /community-guidelines, /safety, /disclaimer; all 23 routes HTTP 200 verified.
- [x] Footer with Explore/Learn/About/Policies (20 real links).
- [x] About Us: Neighborhood Hacks origin + Meet the Builder; no invented details.
- [x] Sample data removed: 24 sample rows deleted from DB, seed state emptied, sample copy removed; impact only from real verified records.
- [x] SEO: unique head()+canonical per route, WebSite/Article JSON-LD, robots.txt kept; sitemap deferred (no public URL).
- [x] Contact/report forms: zod validation (4 alerts verified), saved to contact_messages table (insert-only RLS).
- [x] 38/38 tests pass, lint 0 errors, build OK, no broken images, no page errors.
- [ ] Verify authenticated uploads, refresh persistence, cross-user access and full two-party handovers — blocked by no registered account.
