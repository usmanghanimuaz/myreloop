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
