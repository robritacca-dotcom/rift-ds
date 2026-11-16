#!/usr/bin/env node
/**
 * validate-shader-contract.mjs
 *
 * Holds src/components/ShaderScene/contract.json, the one home of what a
 * scene's GLSL is handed and must define, to the engine that hands it. The
 * docs guide and the consumer skill print their tables from that file, and
 * a consumer writes GLSL against them, so a uniform the engine renamed or a
 * helper it dropped would be taught to every author as fact and fail only
 * in their compiler.
 *
 * Checks, each in both directions where there are two sides:
 *  1. the uniforms: every `uniform <type> u_<name>` the assembler declares
 *     for every scene (src/components/ShaderScene/assemble.ts) is a row,
 *     with its type, and every row is declared; a row marked
 *     `when: "glyphs"` is one the assembler declares only for a scene with
 *     a ramp, and no other row is
 *  2. the helpers: every function in src/components/ShaderScene/common.glsl.ts
 *     is a row with its exact signature, and every row is a function there
 *  3. `maxColours` is `MAX_COLOURS` in src/components/ShaderScene/types.ts
 *  4. the entry point: the assembler's `main` calls `scene(uv, u_time)`,
 *     the contract's `entry` is that function's signature, and the
 *     `ShaderSceneSource` doc comment in types.ts, which ships in the
 *     published schema, states the same signature
 *  5. the uniform patterns for a scene's params and the passes' settings
 *     are the ones the assembler builds
 *  6. every description is a sentence: present, ending in a full stop, with
 *     no em dash, since each is printed as shipped copy
 *
 * Runs in the validate-registry chain because it reads only source files.
 */
import { fromRoot, readJson, read as readText } from './lib/fs.mjs';
import { failStep, finish } from './lib/report.mjs';

const dir = ['src', 'components', 'ShaderScene'];
const errors = [];
const read = (name) => {
  try {
    return readText(fromRoot(...dir, name));
  } catch (err) {
    console.error(`✗ Could not read ${name}: ${err.message}`);
    failStep();
  }
};

let contract;
try {
  contract = readJson(fromRoot(...dir, 'contract.json'));
} catch (err) {
  console.error(`✗ Could not read contract.json: ${err.message}`);
  failStep();
}
const assembler = read('assemble.ts');
const common = read('common.glsl.ts');
const types = read('types.ts');
const home = 'src/components/ShaderScene/contract.json';

/* 1. The uniforms every scene gets. The per-scene floats are written
   `uniform float ${name}`, which this pattern skips: a name is a literal. */
const declared = new Map();
for (const line of assembler.split('\n')) {
  for (const m of line.matchAll(/uniform (\w+) (u_[A-Za-z]\w*)(\[)?/g)) {
    declared.set(m[2], { type: m[3] ? `${m[1]}[]` : m[1], glyphs: line.includes('scene.glyphs') });
  }
}
if (declared.size === 0) errors.push('found no uniform declarations in assemble.ts');
const rows = Array.isArray(contract.uniforms) ? contract.uniforms : [];
const rowNames = new Set(rows.map((row) => row.name));
for (const [name, { type, glyphs }] of declared) {
  const row = rows.find((r) => r.name === name);
  if (!row) {
    errors.push(`assemble.ts declares ${name}, which ${home} does not list: add a "uniforms" row for it`);
    continue;
  }
  if (row.type !== type) errors.push(`${name} is "${row.type}" in ${home} but ${type} in assemble.ts`);
  if ((row.when === 'glyphs') !== glyphs) {
    errors.push(
      glyphs
        ? `${name} is declared only for a scene with glyphs: mark its row "when": "glyphs"`
        : `${name} is declared for every scene: remove "when" from its row`
    );
  }
}
for (const name of rowNames) {
  if (!declared.has(name)) errors.push(`${home} lists ${name}, which assemble.ts does not declare: remove the row`);
}

/* 2. The helpers: a function is a line `<type> <name>(<args>) {` at column 0. */
const functions = [...common.matchAll(/^(\w+) (\w+)\(([^)]*)\) \{$/gm)].map((m) => `${m[1]} ${m[2]}(${m[3]})`);
if (functions.length === 0) errors.push('found no functions in common.glsl.ts');
const helpers = Array.isArray(contract.helpers) ? contract.helpers : [];
const signatures = new Set(helpers.map((helper) => helper.signature));
for (const signature of functions) {
  if (!signatures.has(signature)) errors.push(`common.glsl.ts defines "${signature}", which ${home} does not list: add a "helpers" row`);
}
for (const signature of signatures) {
  if (!functions.includes(signature)) errors.push(`${home} lists the helper "${signature}", which common.glsl.ts does not define`);
}

/* 3. The colour ceiling. */
const max = Number(types.match(/export const MAX_COLOURS = (\d+)/)?.[1]);
if (contract.maxColours !== max) errors.push(`"maxColours" is ${contract.maxColours} but MAX_COLOURS in types.ts is ${max}`);

/* 4. The entry point. */
if (!assembler.includes('scene(uv, u_time)')) errors.push('assemble.ts no longer calls scene(uv, u_time) from main: update "entry" and this check together');
if (!/^vec3 scene\(vec2 \w+, float \w+\)$/.test(contract.entry ?? '')) {
  errors.push(`"entry" must be the signature main calls, vec3 scene(vec2 <name>, float <name>); found "${contract.entry}"`);
} else if (!types.includes(`\`${contract.entry}\``)) {
  errors.push(`the ShaderSceneSource doc comment in types.ts must state the entry point as \`${contract.entry}\``);
}

/* 5. The patterns the assembler builds its per-scene uniforms from. */
const patterns = [
  [contract.paramUniform, 'uniform float u_<key>', 'u_${param.key}', '"paramUniform"'],
  [contract.passUniforms?.[0], 'uniform float u_<pass>_on', 'u_${pass.id}_on', '"passUniforms"[0]'],
  [contract.passUniforms?.[1], 'uniform float u_<pass>_<key>', 'u_${pass.id}_${param.key}', '"passUniforms"[1]'],
];
for (const [value, expected, built, label] of patterns) {
  if (value !== expected) errors.push(`${label} must be "${expected}"; found "${value}"`);
  if (!assembler.includes(built)) errors.push(`assemble.ts no longer builds \`${built}\`: update ${label} and this check together`);
}

/* 6. The descriptions are shipped copy. */
const described = [
  ['"entryDescription"', contract.entryDescription],
  ...rows.map((row) => [`the uniform ${row.name}`, row.description]),
  ...helpers.map((helper) => [`the helper "${helper.signature}"`, helper.description]),
];
for (const [what, text] of described) {
  if (typeof text !== 'string' || text.trim() === '') errors.push(`${what} needs a description`);
  else if (!text.endsWith('.')) errors.push(`${what}: the description must end in a full stop`);
  else if (text.includes('—')) errors.push(`${what}: the description contains an em dash`);
}

finish(
  '✗ Shader contract validation failed:',
  errors,
  `✓ The shader contract matches the engine: ${rows.length} uniforms, ${helpers.length} helpers.`
);
