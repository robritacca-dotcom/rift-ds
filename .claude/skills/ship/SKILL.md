---
name: ship
description: Make finished work live on the deployed site (SITE_URL in scripts/brand.mjs is the authority). Commit, run the full verify, merge branch work into main when needed, push, watch CI go green, then prove the deployed site actually renders with the live hydration smoke. Use when asked to ship it, make it live, push to main, or deploy this. If asked to "merge and push" (a retired skill name), confirm the intended end state — ship, checkpoint, or land — before acting.
icon: publish
displayDescription: "Makes finished work live on the deployed site. Surveys the tree so unrelated files never get swept into a commit, runs the full local verify (the single script mirroring CI) before anything is committed, merges branch work into main when needed, pushes, confirms the CI run goes green, then loads the deployed site in a real browser to prove it renders (a deploy is not done at HTTP 200), and reports exactly what deployed."
invoke: ["ship it","make it live","push to main","deploy this"]
---

# ship

Make finished work live on the live site (`SITE_URL` in `scripts/brand.mjs` is the authority for where that is) — builds green first, no unrelated files swept in, a clear report after. The end state is always the same: the work is on `main`, pushed, and deployed.

## When invoked

Use this skill when asked to make completed work live — phrases like "ship it", "make it live", "push to main", "deploy this". This skill always ends with a deploy; to save progress without deploying, that's `checkpoint` (or `park` to also return to main).

**If asked to "merge and push"**: that's the retired ambiguous skill name, and it now maps onto more than one verb. Confirm the intended end state before doing anything: `ship` (merge into `main`, push, deploy), `checkpoint` (push the branch, keep working), or `land` (combine several pieces of pending work into a local `main`, pushing nothing).

## Instructions

0. **Check the branch**: `git branch --show-current`.
   - **On `main`**: follow steps 1–9 directly. **A push to main deploys the live site** (`SITE_URL` in `scripts/brand.mjs` is the authority).
   - **On any other branch**: the work rides the branch into `main`. Follow steps 1–4 on the branch (commit there), then merge in step 5. Never cherry-pick or copy files across branches to avoid a merge.

1. **Survey the tree before touching anything**: run `git status --short` and classify every entry:
   - **In scope** — files created or modified as part of the work just completed in this session
   - **Out of scope** — anything untracked or modified that predates the session, or that wasn't part of the requested work

   **Never run `git add -A`, `git add .`, or `git add` on a directory** — always add explicit file paths. Out-of-scope files are excluded by default and named in the final report; if it's genuinely unclear whether something belongs, ask before including it.

2. **Run the full verify before committing**:
   ```bash
   npm run verify   # the single local mirror of CI — the script entry in the root package.json is the step list
   ```
   This one script is the single source of truth for local checks and mirrors the CI jobs in `.github/workflows/ci.yml` — if CI gains a check (tests, a11y), it gets added to `verify`, never listed here separately, except the CI-only checks CLAUDE.md's **CI & Local Verify** section records as deliberate exceptions (its list is authoritative). The registry validators run automatically via the builds' `prebuild` hooks.

   **Run it plainly and let its own exit status be the verdict. Never pipe verify through `tail`, `head`, or `grep`** — a pipeline reports the last command's exit code, not verify's, and that exact mistake masked two red builds on 2026-07-26. **If any step fails, stop** — fix the failure if it was caused by this session's work, otherwise report it. Never push red.

   Note: the build regenerates the derived surfaces owned by the `validate-registry` chain — the generator scripts at the front of the `validate-registry` entry in the root `package.json` are the authoritative list of what gets rewritten. If a generated file changed after the builds, it changed because this session's work made it stale — treat it as in scope and commit it in the same push, either alongside the edits that caused it or as its own `chore(generated):` commit when the regeneration is large enough to bury the real change (both are sanctioned; the 0.19.0 and 0.20.0 component drops used the split). CI's drift guard is a `git diff --exit-code` step after the generators run in `.github/workflows/ci.yml`, so what it cares about is that no regeneration is left uncommitted, not which commit carries it.

3. **Delta-scoped prose check** — the step that keeps drift audits boring. For the identifiers this session's diff touched (component names, prop names, script names, moved/deleted paths), grep the prose surfaces — `.claude/skills/`, `README.md`, and every root spec (the doc list in `scripts/validate-doc-refs.mjs` is the authoritative set; it includes tracked specs that are not published to /blueprints, which the `FILES` array in `scripts/sync-blueprints.mjs` deliberately omits) — and judge whether any claim just became false (`README.md` ships in the npm tarball, so a false claim there reaches every consumer). Any prose the session wrote or rewrote also follows `content-design.md` (run its Self-Review Tests on anything longer than a sentence). Fix what did in the same push; `validate-doc-refs` catches dead references mechanically, but only a reader catches a sentence that is now wrong.

4. **Group changes into logical commits** — one commit per concern, not one giant commit. Match the repo's conventional style (`feat(scope):`, `fix(scope):`, `chore(scope):`), with a 1–3 sentence body explaining the why. Check `git log --oneline -5` if unsure of the voice.

5. **Merge (branch case only)**: with the branch committed and verify green:
   ```bash
   git checkout main
   git pull --ff-only
   git merge <branch>
   ```
   A fast-forward or a merge commit are both fine. **If the merge conflicts, stop and report** — never resolve conflicts silently as part of a ship. Never force-push to make a merge "work".

6. **Push**: `git push` on `main`. Remember: **a push to main deploys the live site via Vercel** (`SITE_URL` in `scripts/brand.mjs` is the authority) — pushing is publishing.

   If the pushed work changed component CSS, anything under `src/tokens/`, or `.storybook/`, offer to dispatch Chromatic (`gh workflow run chromatic.yml`) — once a Chromatic project is provisioned for this repo (none exists yet) — `verify` proves nothing about pixels, and this is the decision point pre-deploy's Chromatic rule exists for. It bills cloud snapshots, so it's an offer, not an automatic step.

   Chromatic only snapshots Storybook, so it says nothing about the website. If the pushed work touched a site-wide background surface — the config (`website/src/data/shader-background.json`), the site's composition of it (`website/src/components/BlurBackground/`), the renderer itself (`src/components/ShaderField/`), or the immersive stages' ground (`website/src/components/DotBackground/`) — offer a `visual-review` pass instead: the first three change the background on all of the site's pages at once, the fourth is the whole ground under the stage pages, and no automated gate covers any of them. `verify` proves the config validated and the shader compiled, not that the result looks right. The renderer is the easiest to miss, because it lives in the library rather than the website and Chromatic's Storybook snapshots do not cover a full-viewport site background.

   Same pattern for the chat: if the pushed work changed what the site chat answers from or how it answers — the corpus sources (page prose feeds `site-corpus.generated.ts` by construction), the persona or guardrails in `website/src/app/api/chat/`, the route itself, or the shared lookup implementations in `website/src/lib/site-tools.ts` (which also serve `/api/mcp`, so the same edit deserves an MCP spot-check) — offer to run the answer-quality eval (`npm run eval:chat`, ritual in `evals/chat/README.md`). `verify` proves the corpus regenerated, not that the answers stayed good, and the eval costs real API spend — an offer, not an automatic step.

7. **Confirm CI went green**: after the push, watch the GitHub Actions run to completion:
   ```bash
   gh run watch $(gh run list --workflow=ci.yml --branch main --limit 1 --json databaseId --jq '.[0].databaseId') --exit-status
   ```
   The `--workflow=ci.yml` filter is load-bearing: a push to main can trigger other workflows within the same second (CodeQL, if it is enabled for this repo — check rather than assume), and an unfiltered `--limit 1` can hand you one of those runs instead. `--exit-status` makes a red run exit non-zero rather than reporting and returning 0. CI runs in parallel with the Vercel deploy — it gates nothing, but a red run on main means something the local verify missed (or an environment difference) and must be investigated, not left as a red X.

   **Branch case, after CI is green**: delete the merged branch — `git branch -d <branch>`, and `git push origin --delete <branch>` if it was pushed. Its commits are on `main`; the repo stays main-only by default. Name the deletion in the report.

8. **Prove the deployed site renders** — the step the 2026-09-06 outage was missing. A green verify, a green CI run, and an HTTP 200 all held that morning while every JS browser showed a blank page: the failure lived in Vercel's runtime rendering (the root route's ISR regeneration sees an internal pathname no local run can reproduce), so only the live site can prove itself. **Until the first Vercel deployment exists, this whole step is inoperable** — `SITE_URL` in `scripts/brand.mjs` is a placeholder with nothing serving it yet; say so in the report instead of treating the miss as an outage. Read the URL from `scripts/brand.mjs` (the authority), never from memory. First confirm the new deployment is what's serving — the `data-dpl-id` in the homepage HTML changes with every deploy:
   ```bash
   SITE_URL="$(node -e "import('./scripts/brand.mjs').then(b=>console.log(b.SITE_URL))")"
   curl -s "$SITE_URL/" | grep -o 'data-dpl-id="[^"]*"'
   ```
   If it hasn't changed from before the push, wait a moment and re-check — Vercel usually finishes before CI does. Then run the live hydration smoke:
   ```bash
   node scripts/smoke-hydration.mjs "$(node -e "import('./scripts/brand.mjs').then(b=>console.log(b.SITE_URL))")"
   ```
   The script's doc block owns what it asserts (hydration succeeded, the theme guard's ready mark landed, the page is visible with content, at desktop and phone viewports). **A red result means the deploy may have taken the site down — treat it as an active outage, not a report line**: diagnose immediately, and if the cause isn't quickly fixable, revert the deploy (`git revert` the pushed commits and push again) rather than leaving the site dark while investigating. Never skip this step because verify and CI were green — they were green during the outage too.

9. **Report** in the final message:
   - Each pushed commit (hash + subject), confirmation `npm run verify` passed locally, the CI run result, and the live smoke result (step 8)
   - Every file deliberately left out and why
   - Anything the deploy will visibly change on the live site
   - Branch case: the merge and the branch deletion

## Guardrails

- Never force-push, never rewrite pushed history
- Never commit `.env*` or anything credential-shaped — even if explicitly staged by mistake
- If there is nothing in scope to commit and nothing unmerged on the branch, say so and stop — don't invent a commit
- Shipping is the owner's call: only invoke this flow when asked to ship, and never chain into it automatically from other work
