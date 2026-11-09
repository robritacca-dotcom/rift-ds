#!/usr/bin/env node
/**
 * validate-site-backgrounds.mjs
 *
 * Validates website/src/data/site-backgrounds.json, the registry of the
 * site's backgrounds: one row per pick the header's background menu offers,
 * painted on every page by BlurBackground and kept in localStorage like the
 * theme pick. A bad row is a site-wide failure a visitor carries from page
 * to page, so it fails the build rather than reaching a deploy.
 *
 * Checks:
 *  1. ids are unique, and exactly one row has no scene: that row is the field
 *     (the served default, which an absent attribute means), and the menu
 *     needs exactly one of it
 *  2. every scene names one the library ships (the scene ids declared in
 *     src/components/ShaderScene/scenes.ts), since a row is handed straight
 *     to ShaderScene's `scene` prop
 *  3. every param key in a row's `home` and `page` tuning is one the scene
 *     declares, with its value inside the declared range; a key the scene
 *     does not read would be silently ignored, and a value outside the range
 *     is what the playground's sliders can never dial in
 *  4. every pass key is a finishing pass in src/components/ShaderScene/passes.ts
 *     with its params and ranges, and `on` is a boolean where given
 *  5. every colour role a scene reads (its `colours` list in scenes.ts) is a
 *     token in src/tokens/registry.json, so the scene half of the site's
 *     background palette is a real consumer of the registry, as the field's
 *     blobs are through validate-shader-background.mjs
 *  6. the menu copy holds to its register row in content-design.md: a
 *     one-word label, a short verbless description with no full stop and no
 *     em dash, and a Material Symbol name for the icon
 *
 * Runs in the validate-registry chain, after validate-shader-background.mjs,
 * because it reads only source files and the registry.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const dataPath = join(repoRoot, 'website', 'src', 'data', 'site-backgrounds.json');
const scenesPath = join(repoRoot, 'src', 'components', 'ShaderScene', 'scenes.ts');
const passesPath = join(repoRoot, 'src', 'components', 'ShaderScene', 'passes.ts');
const tokenRegistryPath = join(repoRoot, 'src', 'tokens', 'registry.json');

const DESCRIPTION_MAX = 40;

const errors = [];
const read = (path, label) => {
  try {
    return readFileSync(path, 'utf8');
  } catch (err) {
    console.error(`✗ Could not read ${label}: ${err.message}`);
    process.exit(1);
  }
};

const data = JSON.parse(read(dataPath, 'site-backgrounds.json'));
const rows = Array.isArray(data.backgrounds) ? data.backgrounds : [];
if (rows.length === 0) errors.push('"backgrounds" must be a non-empty array');

/* The scenes, read from the source the library ships: each `export const
   <name>: Scene = { id: "...", ..., colours: [...], params: [{ key, min, max }] }`
   block. A regex over the declared shape, so a new scene is picked up
   with no change here. */
const scenesSource = read(scenesPath, 'scenes.ts');
const scenes = new Map();
for (const block of scenesSource.split(/export const \w+: Scene = \{/).slice(1)) {
  const id = block.match(/\bid:\s*"([^"]+)"/)?.[1];
  if (!id) continue;
  const coloursText = block.match(/colours:\s*\[([^\]]*)\]/)?.[1] ?? '';
  const colours = [...coloursText.matchAll(/"(--[a-z0-9-]+)"/g)].map((m) => m[1]);
  const paramsText = block.match(/params:\s*\[([\s\S]*?)\n\s*\],/)?.[1] ?? '';
  const params = new Map();
  for (const m of paramsText.matchAll(/key:\s*"([^"]+)"[^}]*?min:\s*(-?[\d.]+)[^}]*?max:\s*(-?[\d.]+)/g)) {
    params.set(m[1], { min: Number(m[2]), max: Number(m[3]) });
  }
  scenes.set(id, { colours, params });
}
if (scenes.size === 0) errors.push(`found no scene declarations in ${scenesPath}`);

/* The passes, the same way: `{ id: "...", ..., params: [{ key, min, max }] }`. */
const passesSource = read(passesPath, 'passes.ts');
const passes = new Map();
for (const block of passesSource.split(/\n\s*\{\s*\n\s*id:/).slice(1)) {
  const id = block.match(/^\s*"([^"]+)"/)?.[1];
  if (!id) continue;
  const params = new Map();
  for (const m of block.matchAll(/key:\s*"([^"]+)"[^}]*?min:\s*(-?[\d.]+)[^}]*?max:\s*(-?[\d.]+)/g)) {
    params.set(m[1], { min: Number(m[2]), max: Number(m[3]) });
  }
  passes.set(id, params);
}
if (passes.size === 0) errors.push(`found no pass declarations in ${passesPath}`);

/* Every token name in the registry, whatever its shape: the names are the
   strings that look like custom properties. */
const tokenNames = new Set();
const collect = (node) => {
  if (typeof node === 'string') {
    if (/^--[a-z]/.test(node)) tokenNames.add(node);
  } else if (Array.isArray(node)) node.forEach(collect);
  else if (node && typeof node === 'object') Object.values(node).forEach(collect);
};
collect(JSON.parse(read(tokenRegistryPath, 'src/tokens/registry.json')));

const inRange = (value, range) =>
  typeof value === 'number' && Number.isFinite(value) && value >= range.min && value <= range.max;

const checkTuning = (rowId, band, tuning, scene) => {
  if (tuning === undefined) return;
  if (!tuning || typeof tuning !== 'object') {
    errors.push(`"${rowId}".${band} must be an object with optional "params" and "passes"`);
    return;
  }
  for (const [key, value] of Object.entries(tuning.params ?? {})) {
    const range = scene.params.get(key);
    if (!range) errors.push(`"${rowId}".${band}.params.${key} is not a param the scene declares (scenes.ts)`);
    else if (!inRange(value, range))
      errors.push(`"${rowId}".${band}.params.${key} = ${value} is outside the scene's range ${range.min}..${range.max}`);
  }
  for (const [passId, setting] of Object.entries(tuning.passes ?? {})) {
    const pass = passes.get(passId);
    if (!pass) {
      errors.push(`"${rowId}".${band}.passes.${passId} is not a finishing pass (passes.ts)`);
      continue;
    }
    if (setting.on !== undefined && typeof setting.on !== 'boolean')
      errors.push(`"${rowId}".${band}.passes.${passId}.on must be a boolean`);
    for (const [key, value] of Object.entries(setting.params ?? {})) {
      const range = pass.get(key);
      if (!range) errors.push(`"${rowId}".${band}.passes.${passId}.params.${key} is not a param the pass declares`);
      else if (!inRange(value, range))
        errors.push(`"${rowId}".${band}.passes.${passId}.params.${key} = ${value} is outside the pass's range ${range.min}..${range.max}`);
    }
  }
};

const ids = new Set();
let defaults = 0;
for (const row of rows) {
  const id = typeof row.id === 'string' ? row.id : '(no id)';
  if (ids.has(id)) errors.push(`duplicate id "${id}"`);
  ids.add(id);
  if (!/^[a-z][a-z0-9-]*$/.test(id)) errors.push(`id "${id}" must be a lower-case slug`);
  if (typeof row.label !== 'string' || !/^\S+$/.test(row.label))
    errors.push(`"${id}".label must be a one-word name (content-design.md's register row)`);
  if (typeof row.description !== 'string' || row.description.length === 0)
    errors.push(`"${id}".description is required`);
  else {
    if (row.description.length > DESCRIPTION_MAX)
      errors.push(`"${id}".description is ${row.description.length} characters; keep it under ${DESCRIPTION_MAX}`);
    if (/[.!?]$/.test(row.description)) errors.push(`"${id}".description ends in a full stop; the register row says none`);
    if (row.description.includes('—')) errors.push(`"${id}".description contains an em dash`);
  }
  if (typeof row.icon !== 'string' || !/^[a-z0-9_]+$/.test(row.icon))
    errors.push(`"${id}".icon must be a Material Symbol name (snake_case)`);
  if (row.scene === undefined) {
    defaults += 1;
    if (row.home !== undefined || row.page !== undefined)
      errors.push(`"${id}" has no scene, so it takes no tuning; "home" and "page" belong on a scene row`);
    continue;
  }
  const scene = scenes.get(row.scene);
  if (!scene) {
    errors.push(`"${id}".scene "${row.scene}" is not a scene the library ships (${[...scenes.keys()].join(', ')})`);
    continue;
  }
  checkTuning(id, 'home', row.home, scene);
  checkTuning(id, 'page', row.page, scene);
}
if (rows.length > 0 && defaults !== 1)
  errors.push(`exactly one row must have no scene (the field, the served default); found ${defaults}`);

for (const [sceneId, scene] of scenes) {
  for (const role of scene.colours) {
    if (!tokenNames.has(role))
      errors.push(`scene "${sceneId}" reads ${role}, which is not a token in src/tokens/registry.json`);
  }
}

if (errors.length > 0) {
  console.error('✗ Site backgrounds validation failed:\n');
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(
  `✓ Site backgrounds valid — ${rows.length} rows, ${rows.length - 1} on ${scenes.size} library scenes, every param, pass and colour role resolves.`,
);
