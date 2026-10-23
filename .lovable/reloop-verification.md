# ReLoop verification — 23 Oct 2026

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
