/**
 * Reads the two breakpoint modules' documented lists — `BREAKPOINTS` in
 * src/tokens/breakpoints.ts and `SITE_BREAKPOINTS` in
 * website/src/config/breakpoints.ts — for build scripts that cannot import
 * TypeScript. The shape is the modules' `Breakpoint` interface;
 * scripts/validate-breakpoints.mjs holds each list to its constants, so a
 * reader here can trust every entry resolves.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const BREAKPOINT_MODULES = [
  { rel: 'src/tokens/breakpoints.ts', list: 'BREAKPOINTS', scope: 'library' },
  { rel: 'website/src/config/breakpoints.ts', list: 'SITE_BREAKPOINTS', scope: 'site' },
];

const field = (block, name) => block.match(new RegExp(`${name}:\\s*(['"])([\\s\\S]*?)\\1\\s*,`))?.[2];

/** Every documented breakpoint, library then site, each with its query. */
export function readBreakpoints(repoRoot) {
  const out = [];
  for (const { rel, list, scope } of BREAKPOINT_MODULES) {
    const source = readFileSync(join(repoRoot, rel), 'utf8').replace(/\r\n/g, '\n');
    const constants = new Map(
      [...source.matchAll(/export const BREAKPOINT_([A-Z0-9_]+)_PX\s*=\s*(\d+)\s*;/g)].map((m) => [m[1], Number(m[2])])
    );
    const start = source.indexOf(`export const ${list}`);
    if (start < 0) throw new Error(`${rel}: no ${list} list`);
    for (const m of source.slice(start).matchAll(/\{[^{}]*px:\s*BREAKPOINT_([A-Z0-9_]+)_PX[^{}]*\}/g)) {
      const px = constants.get(m[1]);
      const axis = field(m[0], 'axis');
      const side = field(m[0], 'side');
      const label = field(m[0], 'label');
      const role = field(m[0], 'role');
      if (px === undefined || !axis || !side || !label || !role) {
        throw new Error(`${rel}: could not read the ${list} entry for BREAKPOINT_${m[1]}_PX`);
      }
      const query = side === 'below' ? `(max-${axis}: ${px}px)` : `(min-${axis}: ${px + 1}px)`;
      out.push({ label, px, axis, side, role, scope, query });
    }
  }
  return out;
}
