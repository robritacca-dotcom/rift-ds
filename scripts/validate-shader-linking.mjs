#!/usr/bin/env node
/**
 * validate-shader-linking.mjs
 *
 * Holds every WebGL program in the library and the site to the wait that
 * never stops the page: a file that links a program does it through
 * `whenProgramLinked` (src/behaviors/whenProgramLinked.ts).
 *
 * A browser compiles and links a shader away from the main thread, and the
 * first status read after it stops the main thread until that work ends.
 * Both shader components read the status straight after linking, so each
 * scene held the page still for as long as the driver took: about a tenth
 * of a second for each of the two programs behind every page, and over two
 * seconds for the scene previewed on the components index, during which a
 * press on anything did nothing. The audit that found it timed the same
 * programs through `whenProgramLinked` at no blocked time at all. Every
 * call involved was legal and fast in isolation, so nothing else saw it.
 *
 * The rule, for every `.ts` and `.tsx` file under src/ and website/src/
 * that is not a story or a test: a file that calls `linkProgram` also
 * calls `whenProgramLinked`. What it must do with it (ask nothing about the
 * program or its shaders until the callback runs) is the primitive's doc
 * block to state; this check holds only that the wait is there.
 *
 * `src/components/ShaderScene/renderer.ts` keeps a waiting build beside the
 * other, for the thumbnail baker, which must return its pictures in the
 * task that asked for them. It passes, because the file links through the
 * primitive too; a new caller on a page uses `createRendererWhenLinked`.
 *
 * A real exception goes in SANCTIONED with its reason.
 *
 * Runs in the validate-registry chain: it reads source files only.
 */
import { display, fromRoot, read, walk } from './lib/fs.mjs';
import { finish } from './lib/report.mjs';

/** Files allowed to link a program and wait for it, with the reason. */
const SANCTIONED = new Map([
  [
    'website/src/app/labs/horizon/HorizonCanvas.tsx',
    'a hidden lab that kept the first draft of the horizon scene as it was written; the library scene that replaced it links through the primitive',
  ],
]);

const isSource = (path) => /\.tsx?$/.test(path) && !/\.(stories|test)\.tsx?$/.test(path);
const skipDir = (name) => name === 'node_modules' || name.startsWith('.');
const blankComments = (s) => s.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, (c) => c.replace(/[^\n]/g, ' '));

const errors = [];
let linking = 0;
for (const root of [fromRoot('src'), fromRoot('website', 'src')]) {
  for (const full of walk(root, isSource, skipDir)) {
    const source = blankComments(read(full));
    if (!/\.linkProgram\s*\(/.test(source)) continue;
    linking += 1;
    const rel = display(full);
    if (SANCTIONED.has(rel)) continue;
    if (!/\bwhenProgramLinked\s*\(/.test(source)) {
      errors.push(
        `${rel} links a WebGL program and never calls whenProgramLinked, so its first status read stops the page until the driver has compiled the shader. ` +
          `Link, then wait in whenProgramLinked (src/behaviors/whenProgramLinked.ts) and read the statuses in its callback.`
      );
    }
  }
}
for (const rel of SANCTIONED.keys()) {
  let source = '';
  try {
    source = blankComments(read(fromRoot(rel)));
  } catch {
    /* reported below */
  }
  if (!/\.linkProgram\s*\(/.test(source)) {
    errors.push(`${rel} is sanctioned in scripts/validate-shader-linking.mjs but links no program; remove its SANCTIONED row.`);
  }
}

finish(
  '✗ Shader linking validation failed:',
  errors,
  `✓ Shader linking — ${linking} file${linking === 1 ? '' : 's'} link a WebGL program, each through whenProgramLinked or sanctioned.`
);
