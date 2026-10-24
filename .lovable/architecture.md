# ReLoop architecture and file map (23 Oct 2026, 11:50 UTC)
Legend: [I] implemented, [T] tested this session, [P] proposed, [B] blocked.

```text
Browser
 |- Sign-in dialog (AccountButton) -- Google [I] / email+password+first/last name+terms [I,T: form validation]
 |      -> Cloud Auth -> trigger reloop_on_auth_user_created -> profiles row [I,T: exists, backfilled]
 |- My ReLoop (/account): consent banner, private profile (names, display, area, private phone),
 |      notification prefs, push toggle, attention/incoming/outgoing, handover history, own items [I,T: render en/ar 1280/390]
 |- Admin (/admin): evidence approve/reject, report review+note, close item, restrict/unrestrict poster, audit log [I,T: render]
 |- Public pages -> reloop_records (shared listings/needs, validated evidence)
Server functions (requireSupabaseAuth)
 |- executeCommand: restriction + terms check -> ownership derivation -> reloop_commit/reloop_workflow [I]
 |- account.functions: profile, acceptTerms, reports, moderation RPCs [I]
 |- push.server: Firebase push honouring notify prefs [I; delivery B: real device]
Database: profiles (owner RLS), user_roles (no client writes), reports, moderation_log (admin read),
          member_restrictions (own/admin read), push_tokens, contact_messages (validated insert), reloop_records
Proposed [P]: in-app notification inbox, participant-only request messages, bookmarks, user blocks,
          account deletion request, email notifications [B: sender domain], phone verification [B: SMS service].
```

## 24 October 2026 — marketplace and admin console

- [I,T] `/admin` now mounts `AdminConsole`: 13 working sections, live counts, member search/detail, capped/paginated tables, reports/resolved history, evidence review, recorded handovers, verified-unit analytics, actual contact submissions, audit actors and timestamps, and truthful settings limitations.
- [I,T] `admin.functions.ts`: authenticated role check fails closed before dynamic privileged-client import. Reads minimal profile projection (ID/display name/general area/date), real non-sample records, support messages without email, RLS-protected reports/restrictions/log. No permissions, roles or schema changed.
- [I,T] Mutations use existing admin-checked, audit-writing database RPCs. Member/close/report actions require a reason and confirmation. Evidence RPC has no note field, so evidence confirmation does not pretend to store a review note.
- [I,T] `admin-model.ts` derives impact using immutable service keys; four additional tests cover role denial, sample exclusion, deduplication and forged verification.
- [I,T] Homepage full-width photo, working post dialog, compact material photo library, real source-linked Pexels video library (not an embedded player). New verified Unsplash cardboard photo is served by an asset pointer. Stock images never stand in for actual listed items.
- [I,T] New `i18n-console.ts` covers seven languages; `SitePhoto.tsx` supplies graceful failures. Existing longer English content shows fallback notice; no claim of complete site translation.
- [B] Hide/restore/global settings writes, support replies/assignment and separate dispute workflow are not implemented: existing schema does not support them. No pretend controls.
- [B] Full non-admin session and two-party handover QA still require a second real account. No fake users created.

File map additions: `src/components/reloop/{AdminConsole,SitePhoto}.tsx`, `src/lib/reloop/{admin.functions,admin-model}.ts`, `src/lib/i18n-console.ts`, `src/test/admin-model.test.ts`, `src/assets/reuse-cardboard.jpg.asset.json`. Presentation updates: `/`, `/exchange`, `/needs`, `/admin`, shared cards/styles. Privacy/leaf metadata updated.

Files: src/components/reloop/AccountButton.tsx, src/routes/account.tsx, src/routes/admin.tsx,
src/lib/reloop/{account.functions,cloud.functions,moderation,push.server}.ts, src/lib/i18n-dash.ts,
drizzle/migrations/0010_profiles_signup_moderation_log_restrictions.sql, src/test/signup-profile.test.ts
