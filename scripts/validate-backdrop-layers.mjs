#!/usr/bin/env node
/**
 * validate-backdrop-layers.mjs
 *
 * Holds every backdrop blur to the size of its own host, with nothing cut
 * out of it.
 *
 * On 2026-11-11 the shaded inset chat flickered over every scene. Its rail
 * and ring were frosted by one layer: a backdrop blur grown past the card
 * by viewport-sized padding, with a hole for the conversation cut out by a
 * composited mask. A scene repaints every frame, so the browser resampled
 * a blur several viewports wide, through a mask, every frame, and dropped
 * frames of it. Each declaration was legal, so no other check saw it. The
 * fix stopped laying a blur over the scene at all (the scene is clipped to
 * the surface instead; website/src/components/StagedShader/ShadedChat.module.css
 * records it), and this script keeps the drawing from coming back in a new
 * shader host.
 *
 * Rules, for every rule that sets a live backdrop-filter, in every
 * stylesheet under src/ and website/src/:
 *   1. No vmax or vmin length in its box: inset, padding, margin, width,
 *      height or border-radius. Those are the units of a layer grown to
 *      outreach whatever holds it, which is the oversize that failed. A
 *      blur fills the box its host gives it; a panel capped to the
 *      viewport with vw or vh is an ordinary box and passes.
 *   2. No composited mask (mask-composite, or `exclude`, `subtract`,
 *      `intersect`, `xor` in a mask shorthand). A hole in a blur is drawn
 *      by clipping what is behind it, never by masking the blur. A plain
 *      gradient mask, the way ProgressiveBlur dissolves its edge, is fine:
 *      it stays inside the layer's own box and cuts nothing out.
 *
 * It reads one rule at a time, so a blur and its oversize split across two
 * rules for the same element pass; the rule is also written in design.md's
 * ShaderScene spec and the new-background skill for that reason. A real
 * exception goes in SANCTIONED with its reason.
 *
 * Runs in the validate-registry chain: it reads source stylesheets only.
 */
import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { read, repoRoot } from './lib/fs.mjs';
import { failStep } from './lib/report.mjs';

const posix = (p) => p.split('\\').join('/');

/** `path — selector` pairs allowed to break a rule, with the reason. */
const SANCTIONED = new Map([]);

const BOX_PROPERTY = /^(inset(-(block|inline)(-(start|end))?)?|top|right|bottom|left|(min-|max-)?(width|height|block-size|inline-size)|padding(-[a-z-]+)?|margin(-[a-z-]+)?|border-radius|border-[a-z]+-[a-z]+-radius)$/;
const OVERSIZE_LENGTH = /\d[sld]?(vmax|vmin)\b/;
const MASK_PROPERTY = /^(-webkit-)?mask$/;
const MASK_COMPOSITE_PROPERTY = /^(-webkit-)?mask-composite$/;
const COMPOSITE_KEYWORD = /\b(exclude|subtract|intersect|xor|source-out|source-in|destination-out)\b/;

const blankComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '));

function cssFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry.startsWith('.')) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...cssFiles(full));
    else if (entry.endsWith('.css')) out.push(full);
  }
  return out;
}

const errors = [];
const files = [...cssFiles(join(repoRoot, 'src')), ...cssFiles(join(repoRoot, 'website', 'src'))];
let checkedRules = 0;

for (const full of files) {
  const rel = posix(relative(repoRoot, full));
  // Normalize CRLF so Windows checkouts validate identically to CI.
  const source = blankComments(read(full));
  for (const match of source.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = match[1].trim().replace(/\s+/g, ' ');
    const declarations = match[2]
      .split(';')
      .map((d) => {
        const colon = d.indexOf(':');
        return colon === -1 ? null : [d.slice(0, colon).trim(), d.slice(colon + 1).trim()];
      })
      .filter(Boolean);
    const blur = declarations.find(([p]) => p === 'backdrop-filter' || p === '-webkit-backdrop-filter');
    if (!blur || blur[1] === 'none') continue;
    checkedRules += 1;
    if (SANCTIONED.has(`${rel} — ${selector}`)) continue;
    const line = source.slice(0, match.index + match[0].indexOf(match[1].trim())).split('\n').length;
    for (const [property, value] of declarations) {
      if (BOX_PROPERTY.test(property) && OVERSIZE_LENGTH.test(value)) {
        errors.push(
          `${rel}:${line} — "${selector}" blurs its backdrop and grows past its host (${property}: ${value}); ` +
            'give the blur its host\'s own box, and clip what is behind it instead of growing the blur',
        );
      }
      if (MASK_COMPOSITE_PROPERTY.test(property) || (MASK_PROPERTY.test(property) && COMPOSITE_KEYWORD.test(value))) {
        errors.push(
          `${rel}:${line} — "${selector}" blurs its backdrop through a composited mask (${property}); ` +
            'a hole in a blur is drawn by clipping what is behind it, never by masking the blur',
        );
      }
    }
  }
}

if (errors.length > 0) {
  console.error('✗ Backdrop layer validation failed:');
  for (const error of errors) console.error(`    - ${error}`);
  console.error('  The rules and the incident behind them are in the doc block of scripts/validate-backdrop-layers.mjs.');
  failStep();
}

console.log(`✓ Backdrop layers — ${checkedRules} blurs across ${files.length} stylesheets, each the size of its host and whole.`);
