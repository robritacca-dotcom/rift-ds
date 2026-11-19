# External skills: published copies

No external skill is registered today (`external` in `.claude/skills/registry.json` is empty). When one is, this folder holds its published copy, as follows.

Published copies of skills that live *outside* this repo (Rob's personal
`~/.claude/skills/` folder) but are shown on `/skills`. They're registered
under `external` in `.claude/skills/registry.json`, and
`scripts/generate-skills-content.mjs` builds the page data from these files.

**These copies are deliberately redacted** — the GA property id is masked and
absolute home paths are generalized. Do NOT auto-sync them from the personal
originals; `scripts/validate-skills-registry.mjs` fails the build if a local
path or GA property id leaks in. When the personal skill changes materially,
update the copy here by hand and re-apply the redactions.
