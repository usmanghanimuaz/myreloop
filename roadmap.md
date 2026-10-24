# ReLoop confirmed model

- [x] Fix known code errors and connect existing Cloud provider/sign-in controls.
- [x] Add FREE/EXCHANGE forms, photos, needs and participant handover controls.
- [x] Add ownership checks and separate two-party verified metrics from self-reported records.
- [x] Add curated reliable source-linked evidence inside existing pages.
- [x] Run 15 rule tests and verify six public pages, filters, form controls and mobile sign-in dialog.
- [ ] Verify authenticated uploads, refresh persistence, cross-user access and full two-party handovers — blocked by no registered account. (still needs a second real account)
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
- [ ] Verify authenticated uploads, refresh persistence, cross-user access and full two-party handovers — blocked by no registered account. (still needs a second real account)

# Enhancement pass (23 Oct 2026, 07:27 brief)
- [x] Fix Waste & Evidence "Awaiting validation" badges: field cards, aligned label/status row, neutral small badge, 2-col desktop / 1-col mobile, no 390px overlap.
- [x] Community Activity: real visual feed w/ filters (item offered, need posted, confirmed exchange, evidence submitted), newest first, honest empty state + CTAs.
- [x] /impact: 1-2 licensed images, methodology, metric cards only with real data, honest empty state.
- [x] Material Guidance: expand to 18+ categories, quick tool w/ searchable item + units (kg/g/lb/items/litre) + action; hazardous items blocked from exchange.
- [x] Verify /exchange & /needs real-data rendering + filters.
- [x] New /stories page: official videos (UNEP/WHO/EPA/UN-Habitat links, attribution), user field evidence (photo/external video URL, consent, validation status, private until validated).
- [x] Logo: circular reuse arrows + leaf SVG, favicon.
- [x] QA: tests/lint/build + browser (badges, feed, impact, guidance, stories, RTL, 390px).

## Launch readiness (Oct 23)
- [x] Badge visual check desktop/390px
- [x] Profiles + My ReLoop /account
- [x] Roles, reports, admin moderation /admin (no admin auto-grant)
- [x] Report/flag flow + private inbox
- [x] Public query review, contact/report honeypot + limits
- [x] Tests/lint/build/browser QA
- [x] Update plan.md + reloop-verification.md
- [x] Owner admin role assigned
- [x] Installable app (manifest + icons)
- [ ] Email notifications — blocked: needs owner's email domain
- [ ] Push notifications — needs Firebase connection decision

# 11:39 brief — signup/dashboard/moderation (no n8n)
- [x] Signup first/last name + terms; trigger-created profiles for email and Google; optional private unverified phone.
- [x] My ReLoop: profile, notification prefs, consent, restriction notice, handover history, manage links.
- [x] Moderation: review notes, close item, restrict/unrestrict poster, audit log, DB-checked.
- [x] Server checks: restricted / no-consent members cannot post.
- [ ] Two-account end-to-end tests — blocked: needs a second real account.
- [ ] Phone verification — blocked: SMS service approval. Email alerts — blocked: sender domain.

# 24 Oct marketplace and comprehensive admin
- [x] Polish photographic homepage and marketplace without fake listings.
- [x] Add admin navigation, real member/record/support views, counts and protected member controls.
- [x] Translate new controls in seven languages and check desktop/mobile/RTL.
- [x] Run tests/lint and update architecture/file map/verification notes.

# About Us correction
- [x] Add translated photographic /about, visible navigation/footer links and homepage introduction; preserve evidence and existing story.
- [x] Verify routes, CTAs, photo/fallback, all languages and desktop/390px; 61 tests pass, lint 0 errors/10 existing warnings, managed build OK.
