---
name: figma-release-notes
description: Write a dated entry on the Rift DS Figma kit's Release notes page for what changed in the kit, newest first, with every component it names linked to that component's frame in the kit. Reads the change from the kit work since the last entry (the node map's history, the session's own Figma work) and moves the page's "Latest" pill. Use after a run of new-figma-component, figma-parity, figma-tokens or new-figma-template, or when asked to write the Figma release notes, log a kit change, or update the release notes page in Figma.
icon: campaign
displayDescription: "Writes the next dated entry on the Figma kit's Release notes page: a title, a one-line summary and a card per change, newest first. Every component it names links to that component's frame in the kit, taken from the same node map the docs pages use, and the page's Latest pill moves to the new date. Optional, like all the Figma work: nothing waits on it."
invoke: ["write the Figma release notes","log this in the kit's release notes","update the release notes page in Figma"]
category: figma
metadata:
  internal: true
---

# figma-release-notes

Record what changed in the Rift DS Figma kit on the kit's own Release notes page, and link every component the entry names to its frame. The page is the kit's changelog for designers; the library's npm releases have their own log (`website/src/data/release-log.json`, owned by the `release` skill), and this skill never writes to it.

## When invoked

Use after Figma work has landed in the kit (a `new-figma-component`, `figma-parity`, `figma-tokens` or `new-figma-template` run), or when asked to write or update the Figma release notes. Those skills offer it when they finish; the owner decides whether and when. Like every Figma task it is optional: no check reads this page, and nothing waits on it.

It records kit changes only. A library change the kit has not caught up with yet is not news on this page.

## Before the first Figma call

- **Load the Figma connector's `figma-use` skill** before any `use_figma` call. It owns the plugin API and its traps.
- **Open a session on the kit**: the file key is the path segment of `FIGMA_FILE_URL` in `scripts/brand.mjs`. Call `create_session` with it and a one-line task, and reuse the session id on every later call.
- **Never write a node id from memory.** Find the page and its entries by name with a read-only `use_figma` script, and take every component's frame id from `website/src/data/figma-nodes.json`.

## The page

The kit's conventions (variables, never pinning a Theme or Mode, the page background) live in the `new-figma-component` skill; this page follows them. Its own recipe:

- **The page** is named `Release notes` and sits after `About / Get started`, before the first divider. One auto-layout wrapper frame, also named `Release notes`, holds everything.
- **The header card** comes first: the top bar (the Rift DS mark and the meta links, as on a component page), the title, an intro paragraph, and a status pill whose text reads `Latest: <date>`.
- **One card per entry**, newest directly under the header. A card is named `<date> · <title>` and holds:
  1. **Heading**: the date (`Paragraph/Small`, secondary text), the title (`Heading/2`, primary text) and a one or two sentence summary (`Paragraph/Default`, secondary text).
  2. **Changes**: a wrapping two-column row of change cards, each a frame named after its title, holding the title (`Title/Body`) and a sentence or three (`Paragraph/Small`, secondary text).
- **Dates** are written `17 Nov 2026`: day, short month, year, never a weekday.

Build an entry by **cloning the newest entry card** and replacing its text, never by drawing a new one: the clone keeps the fills, strokes, radius and text bound to the kit's variables and text styles. Add or remove change cards by cloning or deleting one inside the clone. Follow the canonical text-edit recipe (load each node's current fonts, then edit).

## Instructions

### 1. Find what changed

Read the newest entry's date and titles off the page. Then gather what the kit gained since that date:

- **New and rebuilt frames**: `git log -p --since=<date> -- website/src/data/figma-nodes.json` shows every component or page mapped (a new frame) or remapped (a rebuilt one) since the last entry. A key added is a new component in the kit; a changed id is a rebuild.
- **This session's Figma work**: what the Figma skills that ran reported (components drawn, variables added or renamed, themes added, pages refreshed, templates recreated).
- **Anything else the owner names.**

If nothing changed since the last entry, say so and stop. Never write an entry for nothing, and never restate an entry already on the page. If the kit changed today and today already has an entry, extend that entry rather than adding a second card with the same date.

### 2. Draft the entry and get a yes

Write the draft in chat first: the title, the summary and each change card. Then ask the owner to approve or edit it before anything is written to the file.

- **Group it**: one change card per component or pair of related components (`Stack and Grid`, `Checklist and Wizard`), one per token or variable change, one per page refreshed, and one `Small corrections` card for the rest. A component's addition to an existing set is titled `<Component>: <what>` (`Button: Glass`).
- **The title** says what a designer gains, not what the agent did. The summary is one sentence on the whole entry.
- **The copy** follows `content-design.md`: plain sentences, no em dashes, components named by their registry `label`, roles rather than theme values ("the action colour", never a hex). Counts come from the registries or the page, never from memory.

### 3. Write it

In one script per step, on the Release notes page:

1. Clone the newest entry card, insert it directly under the header, and rename it `<date> · <title>`.
2. Replace the heading's date, title and summary.
3. Clone or delete change cards until there is one per change, then set each card's name, title and body.
4. Set the header pill to `Latest: <date>`.

### 4. Link every component

Every component the entry's change titles name gets a link to its frame in the kit. For each, take its slug from `src/components/registry.json` (or `src/chat/registry.json` for a chat widget), read its id from `components` in `website/src/data/figma-nodes.json`, write it with a colon (`49-118` becomes `49:118`), and set a node hyperlink on exactly the characters of its label in the title:

```js
title.setRangeHyperlink(start, end, { type: 'NODE', value: '49:118' });
title.setRangeTextDecoration(start, end, 'UNDERLINE');
```

The rest of the title stays unlinked and undecorated: in `Button: Glass`, only `Button` is a link. Confirm each id resolves with `figma.getNodeByIdAsync` before linking. A component with no entry in the map has no frame yet, so its name stays plain text and the report says so (the `new-figma-component` skill draws it). Body copy carries no links.

### 5. Check it

Screenshot the new card. Check that no text is clipped, the change cards sit two to a row, and the new card is the first under the header. Read the title segments back with `getStyledTextSegments(['hyperlink', 'textDecoration'])` to confirm each link points where the map says.

### 6. Report

The entry as written, each link and the frame it points to, any component left unlinked for want of a frame, and a screenshot. No repo file changes. Nothing is committed.
