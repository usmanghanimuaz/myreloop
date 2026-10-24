# Latest reconciliation — 24 Oct 2026

See requirements-checklist.md for current statuses and exact evidence; it supersedes historical counts and blockers below. 66 tests passed, lint 0 errors/10 existing warnings, managed build OK 04:22:58 UTC. Mission popup/owner-scoped persistence and 13 admin views verified; no deployment or role changes. Two profiles now exist, one admin unchanged, no domain/sample records. Sitemap is now implemented; delivery/legal/mutation checks remain limited as detailed there.

# ReLoop verification — 23 Oct 2026

## Latest: 24 October 2026, marketplace/admin console

This section supersedes older contradictory notes below.

**Implemented and tested**
- Real-data 13-section admin console. Owner-signed-in browser opened every section; member search returned the one existing profile and its detail dialog opened. Counts: 1 member; 0 real domain records; 0 support messages. No fabricated rows.
- Confirmation dialog opened for restriction and Confirm was disabled without a reason; cancelled without executing. Real close/restrict/report/evidence writes remain untested because there is no safe real target.
- Full `bunx vitest run`: 60/60 tests, 6 files passed. `bun run lint`: exit 0, 0 errors/10 existing refresh warnings. Automatic preview compilation: newest inspected entry `build OK` at 03:55:13 UTC. No manual build/typecheck command was run (managed harness handles those); no independent typecheck result claimed.
- Browser `/`, `/exchange`, `/needs`, `/admin`: HTTP 200; no page errors. After explicitly loading/decode-waiting all images: homepage 9, marketplace 1, needs 1 images; zero broken images. Earlier unloaded lazy image signal was checked again and resolved by loading.
- Desktop 1280px and mobile 390px: no horizontal overflow on core pages. Owner admin checked all seven languages at both widths; Urdu/Arabic RTL, other languages LTR. Screenshots visually reviewed for homepage, console, Arabic mobile, marketplace mobile.
- Homepage Share an item opens the actual listing form. Did not create any listing or accept terms for the owner.
- Signed-out `/admin`: sign-in heading, no private tables. Unit tests deny false/missing/error role results. No real non-admin account available for end-to-end denial.
- Live DB policy inventory inspected: owner-only profiles/roles, admin-only log, own/admin restrictions, validated evidence visibility. Role count remains one owner admin. No migration, role change or access-policy change.
- Official OLIO listing guide fetched and confirms clear photos/accurate descriptions/categories/quantity/pickup. Supplied Unsplash cardboard page says Free to use under Unsplash License; photo downloaded, visually reviewed and asset-hosted. Pexels recycling video search fetched through website gateway (direct HEAD bot-blocked 403): real library link, not a claimed tested video player.
- Every content route inspected for unique title/description/OG; nine missing leaf OG descriptions/Twitter cards completed. No publication.

**Remaining / limitations**
- No actual second-user/non-admin session, new signup delivery, uploads or two-party handover was tested this turn.
- No real record moderation executed and no fake records seeded. Evidence review outcome uses existing RPC; review notes for evidence are unsupported (no false note control).
- Admin loads at most 1,000 profiles/reports, 2,000 domain rows, 200 support messages, 100 audit rows. Cap warning displays when relevant; global counts exact, activity analytics limited to loaded rows. Not claimed production-scale pagination.
- Photos stay private for owners/accepted handover participants; public browsing uses honest category placeholders, not substituted stock listing photos.
- Existing long-form English content remains fallback; new console controls translated, stored statuses/reasons remain actual record values.
- No hide/restore actions, global settings editor, email support replies, case assignment, separate dispute system, traffic tracking or n8n integration added.
- Push/email delivery not retested; email sender domain, second-account QA, sitemap public URL and legal review remain blockers. No deployment.

## Done (checked this turn)
- Badges on Waste & Evidence: screenshots at 1280px and 390px. Every "Awaiting validation" badge lines up with its label (0px offset) and nothing overlaps. Pages are 390px wide with no sideways scroll.
- New database parts: `profiles` (only the owner can read or edit), `app_role` + `user_roles` + `has_role()` (users can read only their own role; nobody can write roles from the app), and `reports` (signed-in users can file reports; only the reporter and admins can read them).
- Admin checks happen in the database: `reloop_admin_pending_evidence`, `reloop_admin_validate_evidence` and `reloop_admin_review_report` each check `has_role(auth.uid(),'admin')` themselves. Signed-out visitors can't run them, and the write function `reloop_commit` can only be run by the server.
- New pages: /account (My ReLoop: profile, needs-attention inbox, incoming and outgoing requests with accept/decline/confirm/cancel, own listings and needs) and /admin (non-admins see "Access denied").
- Report buttons on listings, needs and reviewed evidence.
- Contact and report forms: honeypot field, plus length limits enforced in the database.
- `bunx vitest run`: 46/46 passed. `bun run lint`: 0 errors, 10 warnings. `tsgo`: clean.
- Browser: /about, /account, /admin, /exchange, /needs, /stories and /contact all return HTTP 200 with no page errors at 1280px and 390px. Urdu switches the page to right-to-left.

## Not done or not verified
- Nothing signed-in has been tested (no registered accounts): profile saving, reports, moderation, handovers, photo uploads.
- No admin exists yet. To create the first one once the owner has signed in, run this once (replace with the confirmed email):
  `insert into public.user_roles(user_id, role) select id, 'admin' from auth.users where email = '<owner email>';`
- The inbox is built from request records. There is no separate notifications table and no email or push alerts.
- No direct messages; the short request note blocks emails and phone numbers.
- Bookmarks are deferred.
- Contact form rate limiting is not in place: there's no reliable free per-sender limit without storing IP addresses. Only the honeypot and length limits apply.
- My ReLoop and Moderation text is English only for now. The menu label is translated into all 7 languages.
- No sitemap yet: it needs a public web address. Policy pages have not had legal review.

## Update 08:05 UTC
- The owner account (usmanghanimuaz@gmail.com) now has the admin role. No other accounts exist, and new accounts are ordinary users.
- Checked while signed in as the owner: the profile saved "Usman / Lahore" and still showed it after a page refresh; the My ReLoop menu link appears; /admin opened the moderation queue (empty), with no page errors.
- Phone home-screen install: added the app manifest, 192/512 icons, an Apple touch icon and the theme colour. No offline mode or service worker.
- Email notifications are blocked: there is no sender domain yet.
- Push notifications are deferred: they need a free Firebase account connected.

## Update 11:35 UTC — translations, privacy, security
Passed (actually run):
- My ReLoop, notifications box and Moderation now use translated text in all 7 languages (en, ur, hi, ar, es, fr, zh). Browser check signed in as the owner: both pages loaded in every language at 1280px and 390px; `dir=rtl` for Urdu/Arabic, `ltr` for the rest; no horizontal overflow; no page errors.
- 11 public routes at 1280px and 390px: no horizontal overflow, no page errors.
- Security scan: 0 findings after fix. Contact/report insert rule now requires valid kind, name/email/subject/message lengths and email format (was "anyone can insert anything"). Role-check function no longer callable by signed-out visitors.
- Admin-only database functions refuse non-admins internally (checked function definitions). Only one admin exists (owner); no role assigned this turn.
- Tests 46/46; lint clean after formatting; preview build OK.
Remaining / blocked:
- Remaining linter warnings: signed-in users can call admin functions (they reject non-admins inside — intentional), and the listing-owner lookup is callable publicly (needed by the read rule; owner IDs of public listings are already visible).
- Sign-in dialog and sitewide long-form pages still English-only in other languages (honest fallback note shown).
- Not tested: second real account for two-party handover, non-admin "Access denied" view with a real non-admin, email code delivery, push delivery on a real device, contact form rate limiting (no reliable server-side limiter).
- Legal review of policies; no deployment.

## Update 11:50 UTC — signup, dashboard, moderation
Passed (run this turn): 56/56 tests (10 new signup/phone/profile rules); typecheck clean; lint 0 errors; build OK; security scan 0 findings.
DB: profile trigger present; 1 user = 1 profile (backfilled); roles unchanged (1 admin, the owner); anon REST reads of profiles/moderation_log return nothing.
Browser (owner session): /account and /admin render in English and Arabic at 1280px and 390px, no overflow, no page errors; signup form blocks empty submit.
Not verified: real email signup + trigger with a new account (no fake users created); non-admin denied view with a real second account; close/restrict actions (no reports exist); two-party handover; push delivery.
Owner action: the owner's profile has not accepted the current Terms version, so posting is blocked until "I accept" is pressed in My ReLoop (left for the owner; not clicked on their behalf).
Blocked: phone verification (needs paid SMS service + approval); email notifications (needs sender domain); legal review; sitemap (no public URL).

## 24 Oct 2026 — About Us correction
Implemented: dedicated photographic About Us at /about, a visible main navigation and footer link, and a short translated homepage introduction. Explains the cardboard-shop/moving example (explicitly hypothetical), mission, three-step community flow, safe handovers, honest photos, reuse-first and FREE/EXCHANGE-only principles. Post CTAs open the existing listing dialog; browse CTAs use /exchange. Full About copy and photo alt text translated in all seven languages in src/lib/i18n-about.ts. Existing supplied origin/builder story remains at /about-us; Waste & Evidence, its sources and private evidence form are preserved at /waste-evidence, with every known evidence link updated. About metadata and absolute canonical added; no placeholder social image.
Actually tested: bunx vitest run — 61/61 tests across six files, including route matching for /about, /about-us and /waste-evidence. bun run lint — exit 0, 0 errors, 10 existing refresh warnings. Managed build/typecheck pipeline reports build OK (latest 04:07:39 UTC); no separate manual build/typecheck invoked. Browser: /about in en/ur/hi/ar/es/fr/zh at 1280x1800 and 390x1800, Urdu/Arabic RTL and other languages LTR, photo decode succeeds, no horizontal overflow. Browse, post dialog, homepage link, main navigation/footer targets, language persistence, preserved evidence and builder pages all checked at both widths. Photo fallback verified by substituting a deliberately missing image in the browser; initial network-block simulation did not trigger fallback, so it was replaced with this direct error reproduction. Final run: no page errors, correct About title/canonical. Desktop English and mobile Arabic screenshots visually reviewed.
Scope limits: existing listing dialog/auth unchanged; checks opened the signed-out post dialog, did not create listings or retest authenticated persistence/handovers. No DB, roles, security, services or live deployment changed. These preview changes reach the published site only on a future authorized publish.
