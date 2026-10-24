<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## ReLoop architecture
- Preserve the six existing public pages and the semantic design system; this continuation upgrades persistence rather than replacing the UI.
- Store typed domain records in Cloud with row-level ownership; public listings and reuse needs are shared, while plans, evidence, completions and interest notes remain scoped to participants.
- Execute writes through authenticated server functions and a transactional, revision-checked database patch; this prevents partial impact updates and lost concurrent edits.
- Keep recommendation rules and impact calculations client-safe and deterministic; no external AI or paid services are required.
- Derive handover verification from service-created record keys, not editable payload flags; preserve those keys in patches so ordinary edits cannot recreate completion records.
- Curated environmental source metadata lives separately from private observation notes; source media is linked rather than copied without confirmed reuse rights.
- Keep correctness linting on Cloud-managed integrations but exclude their generated formatting from Prettier enforcement, because regeneration owns those files.
- Profiles are created by a database trigger on signup (email or Google) that copies only name and terms-version metadata, never roles; this keeps profile creation consistent across sign-in methods without trusting metadata for privileges.
- Posting writes are refused server-side when the member is restricted or has not accepted the current terms version; moderation actions run only through admin-checked database functions that write to an append-only moderation log.
- The admin console uses an authenticated, default-deny role check and explicit item/handover DTOs; reconstructed private plans, evidence observations and participant notes never leave the summary helper. Dedicated report/evidence/support/audit projections retain only their review fields, and existing moderation RPCs remain the sole write path.
- Stock photographs illustrate guidance, never user listings; downloaded media uses asset pointers and all new console copy uses the seven-language dictionary.

- About Us lives at `/about`, with complete seven-language copy in `i18n-about`; Waste & Evidence lives at `/waste-evidence`, while `/about-us` preserves the supplied builder story, so informational purposes are not conflated.

- Mission dismissal is a private owner-scoped profile preference written through an RLS-respecting invoker RPC and authenticated server functions, not a role or public field; per-identity browser storage and session memory avoid interruptions when account sync is unavailable.
