/**
 * lib/shader-sources.mjs
 *
 * Reads the shader engine's declarations from the source the library ships,
 * for the scripts that hold other files to them or print them: the
 * finishing passes in src/components/ShaderScene/passes.ts. A regex over
 * the declared shape, `{ id: "...", label, stage, on, params: [{ key,
 * label, min, max, step, default }] }`, so a new pass or setting is picked
 * up with no change here.
 *
 * A helper module, not a chain script: it checks nothing by itself.
 */
import { fromRoot, read } from './fs.mjs';

export const passesPath = fromRoot('src', 'components', 'ShaderScene', 'passes.ts');

/**
 * Every finishing pass, in the order they run.
 *
 * @param {string} [source]  passes.ts, when the caller has already read it.
 * @returns {{ id: string, label: string, on: boolean, params: { key: string, label: string, min: number, max: number, default: number }[] }[]}
 */
export function parsePasses(source = read(passesPath)) {
  const passes = [];
  for (const block of source.split(/\n\s*\{\s*\n\s*id:/).slice(1)) {
    const id = block.match(/^\s*"([^"]+)"/)?.[1];
    if (!id) continue;
    const params = [];
    for (const m of block.matchAll(
      /key:\s*"([^"]+)"[^}]*?label:\s*"([^"]+)"[^}]*?min:\s*(-?[\d.]+)[^}]*?max:\s*(-?[\d.]+)[^}]*?default:\s*(-?[\d.]+)/g
    )) {
      params.push({ key: m[1], label: m[2], min: Number(m[3]), max: Number(m[4]), default: Number(m[5]) });
    }
    passes.push({
      id,
      label: block.match(/\blabel:\s*"([^"]+)"/)?.[1] ?? id,
      on: /\bon:\s*true/.test(block.split('params:')[0]),
      params,
    });
  }
  return passes;
}
