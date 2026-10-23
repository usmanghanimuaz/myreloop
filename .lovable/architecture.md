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

Files: src/components/reloop/AccountButton.tsx, src/routes/account.tsx, src/routes/admin.tsx,
src/lib/reloop/{account.functions,cloud.functions,moderation,push.server}.ts, src/lib/i18n-dash.ts,
drizzle/migrations/0010_profiles_signup_moderation_log_restrictions.sql, src/test/signup-profile.test.ts
