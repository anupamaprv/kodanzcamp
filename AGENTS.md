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

- Camp sharing uses the reusable ShareButton and public /camps?camp= links; share only public camp information so recipients never see private family plans.
- Private planner coordination uses revocable token invitations and authenticated database RPCs that return only selected children's names, ages, and camp plans to accepted recipients; keep this separate from public camp sharing and never expose household locations or personal activities.
- Planner exports are generated in the browser from selected children; PDF renders the whole summer with separate-page or grouped landscape columns, while ICS contains scheduled events and available provider URLs.
- Camp evidence is maintained separately from raw directory records; normalized camps expose only supported facts, with tentative planning weeks distinct from confirmed provider availability, so older data cannot masquerade as a new season.
- Corrections and provider submissions stay in an owner-readable pending queue; publication requires reviewed source changes, never automatic user edits to the public directory.
- Commute server functions resolve owner-scoped saved places, validate bounded camp IDs, and cache road-route results per owner; addresses and route caches never enter public sharing or planner invitation payloads.
