#!/usr/bin/env node
/**
 * The ambient background must be mounted exactly once, in the root layout.
 *
 * It used to be rendered by every page, which meant each client-side
 * navigation destroyed the canvas and with it the WebGL context — a context
 * cannot outlive the canvas it was created from, so every route change paid
 * for a fresh context, shader compile, link and reveal fade. Hoisting it into
 * `website/src/app/layout.tsx` made navigation free, and that only holds while
 * there is one mount: a page that renders its own would build a second
 * container, canvas and GL context stacked on the first, doubling the fallback
 * blobs and quietly wasting a context.
 *
 * Nothing else can catch that. It type-checks, it lints, it renders — it just
 * looks subtly wrong and costs more than it should. So it is checked here.
 *
 * Checks:
 *  - `<BlurBackground` appears in exactly one file under website/src/app, and
 *    that file is the root layout
 *  - the root layout actually mounts it (the hoist is not silently undone)
 *  - every `<FullBleedBackground />` marker sits in a page, never the layout —
 *    in the layout it would make the whole site full-bleed
 */
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { display, fromRoot, readRel } from './lib/fs.mjs';
import { finish } from './lib/report.mjs';

const appDir = fromRoot('website', 'src', 'app');
const layoutRel = 'website/src/app/layout.tsx';

const errors = [];

const tsxFiles = readdirSync(appDir, { withFileTypes: true, recursive: true })
  .filter((e) => e.isFile() && e.name.endsWith('.tsx'))
  .map((e) => display(join(e.parentPath ?? e.path, e.name)));

const mounts = [];
const markers = [];

for (const file of tsxFiles) {
  const source = readRel(file);
  // Strip comments so prose mentioning the component is not counted as a mount.
  const code = source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
  if (/<BlurBackground[\s/>]/.test(code)) mounts.push(file);
  if (/<FullBleedBackground[\s/>]/.test(code)) markers.push(file);
}

if (mounts.length === 0) {
  errors.push(
    `no <BlurBackground /> mount found under website/src/app — the site has no ` +
      `background; it belongs in ${layoutRel}`
  );
} else if (mounts.length > 1) {
  errors.push(
    `<BlurBackground /> is mounted in ${mounts.length} files, but it must be ` +
      `mounted exactly once (in ${layoutRel}):\n` +
      mounts.map((f) => `      ${f}`).join('\n') +
      `\n    Every extra mount builds its own canvas and WebGL context on top ` +
      `of the first. Pages need no background of their own; a page that wants ` +
      `the full-viewport variant renders <FullBleedBackground /> instead.`
  );
} else if (mounts[0] !== layoutRel) {
  errors.push(
    `<BlurBackground /> is mounted in ${mounts[0]}, not ${layoutRel}. Mounted ` +
      `anywhere but the root layout it remounts on every client-side ` +
      `navigation, rebuilding the WebGL context each time.`
  );
}

const markerInLayout = markers.filter((f) => /\/layout\.tsx$/.test(f));
if (markerInLayout.length > 0) {
  errors.push(
    `<FullBleedBackground /> belongs in a page, not a layout — in ${markerInLayout.join(
      ', '
    )} it would make every route below it full-bleed`
  );
}

finish(
  '✗ Background mount validation failed:',
  errors,
  `✓ Background mounted once — <BlurBackground /> in ${layoutRel} only, ` +
    `${markers.length} page(s) opting into the full-bleed variant.`
);
