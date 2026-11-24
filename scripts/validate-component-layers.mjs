#!/usr/bin/env node
/**
 * validate-component-layers.mjs
 *
 * Holds the library's stylesheets to the cascade-layer contract that lets a
 * consumer's own CSS beat component styles whatever its selector and
 * wherever its sheet loads. Component styles sit in the rift.components
 * layer, after rift.tokens and rift.preset; a rule outside any layer
 * outranks all three. Without the layer, a consumer's override of equal
 * specificity won or lost by stylesheet order, and that order can differ
 * between a development server and a production build, so an override that
 * worked in development vanished in production.
 *
 * The contract has a second half that is easy to miss: once components are
 * layered, any library rule left outside a layer outranks every one of
 * them. The base reset (src/tokens/base.css) and the icon sheet's class
 * rules (src/fonts/material-symbols.css) therefore sit in rift.tokens, or
 * base.css's `margin: 0; padding: 0` would strip every component's padding.
 *
 * Four checks:
 *   1. Every stylesheet under src/components, src/behaviors and src/chat
 *      (stories excluded) holds, at its top level, nothing but comments,
 *      the layer order statement ORDER (before any rule, so the order is
 *      fixed whichever sheet a consumer's bundler loads first), @property
 *      registrations, and exactly one `@layer rift.components { }` block.
 *   2. src/tokens/base.css holds the same shape with one `@layer
 *      rift.tokens { }` block instead.
 *   3. src/fonts/material-symbols.css holds the same, plus its @font-face,
 *      which stays outside any layer.
 *   4. Every layer order statement in src/ and website/src/ lists a prefix
 *      of ORDER, so no sheet can declare the three layers in another order.
 *      (The token files state only the first two names; components are
 *      appended after them whichever sheet is read first.)
 *
 * The token files' own layering is validate-token-layers.mjs's job. Runs in
 * the validate-registry chain: it reads source CSS only.
 */
import postcss from 'postcss';
import { display, fromRoot, read, walk } from './lib/fs.mjs';
import { finish } from './lib/report.mjs';

const ORDER_NAMES = ['rift.tokens', 'rift.preset', 'rift.components'];
const ORDER = `@layer ${ORDER_NAMES.join(', ')};`;

const errors = [];

const isCss = (path) => path.endsWith('.css') && !path.includes('.stories.');

/** Check one sheet's top level against the contract (checks 1 to 3). */
function checkShape(path, layer, { allowFontFace = false } = {}) {
  const name = display(path);
  let root;
  try {
    root = postcss.parse(read(path), { from: path });
  } catch (error) {
    errors.push(`${name} does not parse: ${error.message}`);
    return;
  }
  let orderSeen = false;
  let blocks = 0;
  for (const node of root.nodes) {
    if (node.type === 'comment') continue;
    const line = node.source?.start?.line ?? '?';
    if (node.type === 'atrule' && node.name === 'layer' && !node.nodes) {
      if (`@layer ${node.params};` !== ORDER) {
        errors.push(`${name}:${line} states "@layer ${node.params};"; state exactly "${ORDER}"`);
      }
      orderSeen = true;
      continue;
    }
    if (!orderSeen) {
      errors.push(`${name}:${line} has a rule before the layer order: put "${ORDER}" first`);
      orderSeen = true;
    }
    if (node.type === 'atrule' && node.name === 'property') continue;
    if (allowFontFace && node.type === 'atrule' && node.name === 'font-face') continue;
    if (node.type === 'atrule' && node.name === 'layer' && node.params === layer) {
      blocks += 1;
      continue;
    }
    const what = node.type === 'rule' ? `rule "${node.selector}"` : `@${node.name} ${node.params}`.trim();
    errors.push(
      `${name}:${line} has ${what} outside @layer ${layer}: move it inside the layer block, ` +
        `or it outranks every layered component rule`
    );
  }
  if (!orderSeen) errors.push(`${name} does not state the layer order "${ORDER}"`);
  if (blocks !== 1) {
    errors.push(`${name} has ${blocks} "@layer ${layer} { }" blocks at its top level; keep every rule in exactly one`);
  }
}

// Check 1: the library's component, behaviour and chat sheets.
const librarySheets = ['src/components', 'src/behaviors', 'src/chat'].flatMap((dir) =>
  walk(fromRoot(dir), isCss)
);
for (const path of librarySheets) checkShape(path, 'rift.components');

// Checks 2 and 3: the reset and the icon sheet sit under the components.
checkShape(fromRoot('src/tokens/base.css'), 'rift.tokens');
checkShape(fromRoot('src/fonts/material-symbols.css'), 'rift.tokens', { allowFontFace: true });

// Check 4: every order statement anywhere agrees with ORDER.
const allSheets = [
  ...walk(fromRoot('src'), isCss, (dir) => dir.endsWith('/cli') || dir.endsWith('\\cli')),
  ...walk(fromRoot('website/src'), isCss),
];
let statements = 0;
for (const path of allSheets) {
  const css = read(path);
  for (const match of css.matchAll(/@layer\s+([^{;]+);/g)) {
    statements += 1;
    const names = match[1].split(',').map((n) => n.trim());
    const prefix = ORDER_NAMES.slice(0, names.length);
    if (names.join() !== prefix.join()) {
      const line = css.slice(0, match.index).split('\n').length;
      errors.push(
        `${display(path)}:${line} states "@layer ${names.join(', ')};", which is not a prefix of "${ORDER}"`
      );
    }
  }
}

finish(
  '✗ Component layer validation failed:',
  errors,
  `✓ Component layers valid: ${librarySheets.length} library stylesheets in rift.components, ` +
    `the reset and the icon rules in rift.tokens, ${statements} layer order statements agree.`
);
