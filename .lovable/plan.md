# ReLoop launch-readiness plan

No publishing, no new project, no sample data. Every change keeps FREE/EXCHANGE only, no trees, no fake impact.

## What exists today (checked)
- 23 pages, including `/stories`, `/needs`, the policy pages and the blog.
- The database has two tables: `reloop_records`, which holds every listing, need, request, evidence item and handover as one data blob with an owner, and `contact_messages`, which accepts inserts only. There are **no profiles, no roles and no reports** tables.
- Read rules: anyone can read listings and needs. Owners and the other party can read requests. Field evidence is public only when it is marked validated. All writes go through checked, revision-safe database functions.
- Photos live in a private bucket. Photo reads are limited to the owner and people whose request on that listing was accepted.
- The "Awaiting validation" badge is on Waste & Evidence (around line 198) and was restyled last turn. I have not yet checked it in a fresh screenshot.

## High-risk blockers
1. **There's no way for an admin to validate evidence.** Today evidence can only be validated by editing the database by hand. This needs proper roles (step 3).
2. **Public listings expose the whole data blob.** Anyone can read every field of a listing or need. Before launch, I'll check that no exact address or contact detail can be saved in it. If anything can, public reads will move to a view that returns only safe fields.
3. **The contact and report forms have no spam protection.** Anyone can send without limits. I'll add basic server-side checks: a honeypot field, length limits and a per-sender rate limit, all free.
4. **Nothing signed-in has been tested.** There are no accounts, so uploads, requests, handovers and moderation can't be checked end to end. I'll need you to create one test account (or allow me to use one) and give it admin access.
5. **UNEP links block automated checks (403).** They stay listed as official links. They are not dead.

## Comparison with OLIO, Freecycle and Buy Nothing (from public help docs)
| Feature | Them | ReLoop now | Plan |
|---|---|---|---|
| Profile (name, general area, joined) | yes | none | add a minimal profile |
| My listings and needs page | yes | partial (inline) | add a "My ReLoop" page |
| Incoming and outgoing requests | yes | per item | gather them on My ReLoop |
| Two-party handover | pickup confirmation | exists | show it on My ReLoop |
| Notifications | push/email | none | in-app inbox only (no paid email) |
| Report or flag a listing | yes | contact form only | add a proper report flow |
| Safe messaging | in-app chat, address hidden | requests carry a note | short request thread, no addresses or phone numbers shown |
| Bookmarks | OLIO has them | none | optional, private to each user |

## Database changes (smallest set, all protected by access rules)
- `profiles`: display name, general area, created date. Users can read or edit only their own profile. Others see only the display name, through a safe lookup.
- `app_role` plus `user_roles`, and a `has_role()` check that runs safely on the server. Users can only read their own role row, and nobody can write roles from the app. The first admin will be set up once by me, after you confirm the email.
- `reports`: what is being reported, the reason, the reporter and the status. Anyone signed in can create a report. Only the reporter and admins can read it. Only admins can update it.
- `notifications`: one row per user, written only by the server. Users can read their own and mark them read.
- `bookmarks` (optional): owner only.
- Moderation server functions check `has_role('admin')` on the server through the signed-in session. The page hides admin controls for non-admins, but that is cosmetic only.
- Evidence validation becomes a checked database function, and the `validated` flag can no longer be set through ordinary edits.

## Production audit checklist
Sign-in and sessions, database rules (run a security scan and lint), private uploads (check paths and orphaned files), contact messages (validation and rate limits), empty states and data correctness, error and loading states, SEO (titles, canonical links, sitemap waiting on a public web address), accessibility (alt text, contrast, headings, keyboard use), all 7 languages including right-to-left, 390px mobile, forms, and every internal link.

## Order of work
1. Screenshot the badge on desktop and at 390px, and fix it if anything is still off.
2. Check that public listings and needs carry no exact address or contact details.
3. Add roles, reports, the admin evidence-validation function and an admin review page.
4. Add profiles and the My ReLoop page (my listings and needs, incoming and outgoing requests, handover status).
5. Add notifications, the request thread and bookmarks.
6. Add spam protection to the contact and report forms.
7. Run the full audit, a security scan and browser checks.
8. Test the signed-in flows with a real test account: post, request, accept, both parties confirm, validate, report.

## Tests (one per rule)
- Hazardous categories are rejected from listings.
- Only FREE and EXCHANGE are accepted.
- Unvalidated evidence is hidden from signed-out visitors.
- A non-admin can't validate evidence or resolve a report.
- A user can't set their own role.
- A request alone doesn't count as a completed exchange; only two-party confirmation does.
- Public listings never include exact-address fields.
- Contact form rules (length limits, honeypot).
- Plus the existing route and impact tests.

## Your decisions
- The email address to make the first admin.
- Permission to create one test account for signed-in checks.
- Whether to include bookmarks.

## Status (23 Oct)
Steps 1–6 are implemented. Step 8 (signed-in end-to-end testing) is blocked until there's a registered account and the first admin is set up. See the verification file.
