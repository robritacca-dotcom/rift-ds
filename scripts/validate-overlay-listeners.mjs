#!/usr/bin/env node
/**
 * validate-overlay-listeners.mjs
 *
 * Holds the library to "one owner per press": the dismissal layer stack in
 * src/behaviors/useLayer.ts is the only code that listens for Escape and for
 * outside presses on the document. Until 2026-10-21 fourteen non-modal
 * overlays (Popover, Tooltip, HoverCard, SourceChip, the dropdowns, the
 * menus, the pickers) each kept their own document listener, so a popover
 * open inside a Dialog closed together with it on one Escape, and a press on
 * the Dialog's backdrop closed the menu and the Dialog at once. They now
 * register on the stack; this script is what keeps the next one from
 * quietly adding a listener of its own.
 *
 * Checks every non-story .ts/.tsx file under src/components and src/chat:
 *
 *   1. No `document.` or `window.` listener for a key or press event
 *      (keydown, keyup, pointerdown, pointerup, mousedown, mouseup, click,
 *      focusin, focusout, touchstart), unless SANCTIONED names the file and
 *      the event with a reason. Use `useLayer` (light dismiss:
 *      `dismissOnOutsidePress` + `getElements`) instead.
 *   2. Every SANCTIONED entry still matches a listener in its file, so the
 *      table never outlives the code it excuses.
 *
 * Out of scope by design: scroll, resize, wheel, pointermove and
 * visibilitychange listeners (scroll spies, drag tracking, the shader's
 * visibility pause), which dismiss nothing; src/behaviors/, which is the
 * owner; and React handlers on a component's own elements. A component that
 * handles Escape in its own keydown handler marks it handled with
 * `preventDefault()`, which the stack respects (design.md's Components intro
 * owns that contract); that part is a review rule, not checked here.
 *
 * Runs in the `validate-registry` chain: it reads source only.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
// Normalize CRLF so Windows checkouts validate identically to CI.
const read = (path) => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
const display = (path) => relative(repoRoot, path).replaceAll('\\', '/');

const EVENTS = ['keydown', 'keyup', 'pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click', 'focusin', 'focusout', 'touchstart'];
const LISTENER = new RegExp(`\\b(document|window)\\.addEventListener\\(\\s*['"\`](${EVENTS.join('|')})['"\`]`, 'g');

/** File (repo-relative) → event → why a document listener is the right tool there. */
const SANCTIONED = {
  'src/components/CommandPalette/CommandPalette.tsx': {
    keydown: 'the global Cmd+K / Ctrl+K hotkey must hear the keyboard while the palette is closed, when no layer exists',
  },
  'src/components/Lightbox/Lightbox.tsx': {
    keydown: 'the gallery arrows step images from anywhere while the lightbox is open; Escape still goes through its layer',
  },
  'src/components/Attachment/AttachmentViewer.tsx': {
    keydown: 'the arrows step between files from anywhere while the viewer is open; Escape still goes through its layer',
  },
};

const stripComments = (src) => src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' ')).replace(/\/\/.*$/gm, (m) => ' '.repeat(m.length));

function walk(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.tsx?$/.test(entry.name) && !/\.(stories|test)\.tsx?$/.test(entry.name)) files.push(full);
  }
  return files;
}

const errors = [];
const matched = new Set();
let scanned = 0;

for (const file of [...walk(join(repoRoot, 'src', 'components')), ...walk(join(repoRoot, 'src', 'chat'))]) {
  scanned += 1;
  const path = display(file);
  const src = stripComments(read(file));
  for (const m of src.matchAll(LISTENER)) {
    const event = m[2];
    const line = src.slice(0, m.index).split('\n').length;
    if (SANCTIONED[path]?.[event]) {
      matched.add(`${path}#${event}`);
      continue;
    }
    errors.push(
      `${path}:${line} adds a ${m[1]} "${event}" listener. Dismissal belongs to the layer stack: use ` +
        `useLayer from src/behaviors/useLayer (dismissOnOutsidePress + getElements for light dismiss), ` +
        `or, if a document listener is genuinely the right tool, sanction it in SANCTIONED in ` +
        `scripts/validate-overlay-listeners.mjs with the reason.`
    );
  }
}

for (const [path, events] of Object.entries(SANCTIONED)) {
  for (const event of Object.keys(events)) {
    if (!matched.has(`${path}#${event}`)) {
      errors.push(`SANCTIONED lists a "${event}" listener in ${path}, but the file has none: remove the entry.`);
    }
  }
}

if (errors.length > 0) {
  console.error('✗ Overlay listener validation failed:');
  for (const error of errors) console.error(`    - ${error}`);
  process.exit(1);
}

console.log(
  `✓ Overlay listeners owned by the layer stack — ${scanned} files scanned, ${matched.size} sanctioned document listeners`
);
