---
name: release-post
description: Produce the X announcement for an npm release of @robr0/design-system — a bento release card rendered to a paste-ready PNG, plus post copy in the project's voice. Use when asked for a release post, a release image, or announcement copy for a version.
icon: campaign
displayDescription: "Turns a shipped release into its X announcement: a bento-grid release card drawn in the system's own dark theme, every colour and type value lifted from the live token CSS rather than remembered, rendered headlessly to a paste-ready PNG at twice the post size. The copy comes from the tag and the commits, not from memory, and holds to the content guide: sentence case, no emoji, neutral, and inside the character limit."
invoke: ["make the release post","release image for [version]","announcement copy for the release"]
---

# release-post

Produce the X announcement for a release: a bento release card as a paste-ready PNG, plus post copy.

## When invoked

Use this skill when asked for a release announcement, a release image or card, or post copy for a version — phrases like "image for an X post about the release", "announce 0.x", "release card".

Two principles govern everything below: **facts come from the repo, never from memory** (the tag, the commits, the token CSS), and **the card is drawn in the system's own visual language** — it should look like a screen from the site, not a generic promo graphic.

## Instructions

### 1. Gather the release facts

Work from the tag, not recollection:

```bash
git log --oneline $(git describe --tags --abbrev=0 <previous-tag>^)..v<version>
git show v<version> --no-patch --format='%s%n%b'
```

The tag message names the headline features; the commit list fills in the rest. The release-history sentence in `CLAUDE.md` (CI & Local Verify section) is the one-line summary of record — the card and copy must agree with it. Pick the strongest feature as the hero and a handful of others as supporting tiles; a release with more features than tiles drops features rather than shrinking them.

### 2. Lift the real design values

Read the token files before drawing — never write a colour or type value from memory:

- `src/tokens/tokens-primitives.css` — the hex values behind the semantic roles
- `src/tokens/tokens-dark.css` — which primitive each dark-theme role resolves to (the card is dark-theme; it reads best in a feed and matches the earlier cards)
- `src/tokens/tokens-typography.css` — the display sizes, weights and letter-spacing

The values to resolve: the page and container greys, the container border, the text ramp, the dark-theme action teal and its on-teal ink, and — if a tile shows status colours — the dark-theme status *icon* hues. Radii follow the system's rules: pill for buttons and chips, the card radius for tiles, the composer radius if a tile draws the composer. `design.md` owns those; check it when unsure rather than guessing.

### 3. Draw the card

Author a plain HTML file in the scratchpad (never in the repo tree) at **1200×675** — X's landscape card ratio. The established layout, matching the earlier release cards:

- **Header row**: the package name as an uppercase overline in the action teal; the version large in the light display weight with its tracking; the release date beside it; an `npm i` pill and the site domain on the right.
- **Bento grid** below: four columns by two rows. The hero feature takes a 2×2 tile with a title, one sentence, a few pill chips, and a small abstract drawing of the feature (panels, glyphs, a miniature control — drawn with divs and inline stroke SVG, never emoji or screenshots). Each remaining feature gets a 1×1 tile: bold title, a tiny visual or code chip, one caption sentence.
- A faint teal radial glow or two behind everything — the site's ambient background in still form. Subtle; the ground stays near-black.

Nunito Sans loads from Google Fonts via a `<link>` in the head. All copy on the card follows `content-design.md`: sentence case, neutral, no emoji, no em dashes, one idea per line. Tile captions are one short sentence each.

### 4. Render to PNG

Render headlessly with the Playwright already in the repo's dependencies — no browser pane, no manual export. Two Windows-checkout gotchas from the first run: ESM ignores `NODE_PATH`, so import Playwright by an absolute `file://` URL into its package inside the repo's `node_modules` (derive the repo root with `git rev-parse --show-toplevel`); and strip the leading slash a `file://` pathname puts before the drive letter.

The render script: chromium headless, viewport 1200×675 with `deviceScaleFactor: 2`, `goto` the card file with `waitUntil: 'networkidle'`, then `await page.evaluate(() => document.fonts.ready)` plus a short settle before screenshotting the card element — without the fonts wait, the PNG ships in the fallback face. The result is 2400×1350: crisp at twice the post size.

**Look at the PNG before handing it over.** Read the image and judge it like a design-QA pass: nothing clipped, the hero drawing balanced in its tile (the first render of the first card left it sunk in a corner), captions unwrapped where they should be, glyph colours right. Fix and re-render until it holds up.

### 5. Write the copy

Post copy is shipped prose in spirit — `content-design.md` governs it. Additionally:

- **Fit the standard character limit** (280). Count it. Offer one primary version that fits, and optionally a longer alternate.
- Lead with the package and version, or with the hero feature — either works; hype never does.
- Name real things: components, exports, subpaths. "FilterMenu joins the shared overlay behavior layer" beats "big improvements to overlays" (FilterMenu is fictional — pull the real names and counts from the release's own diff and registries, never from this file).
- No emoji, no exclamation marks, no hashtag stuffing.

The copy and the card must tell the same story: the hero feature on the card is the hero feature in the copy.

### 6. Deliver

Send the PNG with SendUserFile so it lands as a file Rob can copy straight into the post, and put the copy in the reply as a quoted block. If he wants to hand-tweak the card, the `design` canvas flow (publish the card as an editable artifact) is the follow-up to offer — not the default, since the ask is a paste-ready image.

## Guardrails

- Never restate release facts from memory — the tag, the commits, and `CLAUDE.md`'s release-history sentence are the sources, and they must agree with what the card claims
- Never write a hex value or font size the token CSS didn't supply this session; the card is a picture of the system, so a drifted colour is a wrong picture
- Working files live in the scratchpad, never the repo tree; nothing this skill produces is committed
- The card carries no screenshots and no third-party marks — abstract drawings only
- Posting is Rob's move: this skill ends at a PNG and copy, never at anything published
