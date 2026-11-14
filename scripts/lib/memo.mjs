/**
 * lib/memo.mjs
 *
 * Builds that are expensive and pure (the docgen parse of the library, the
 * prop API assembled from it, the site corpus) are computed once per
 * process and shared by every step that asks. The source files do not
 * change while the chain runs, so the second answer would be the first.
 *
 * Run alone, a script still builds what it needs once, as before. The gain
 * is inside scripts/run-chain.mjs, where the validators share a process.
 *
 * `clearMemos` forgets everything, for a caller that wants a true second
 * build (a check that a generator is deterministic).
 *
 * A helper module, not a chain script: it checks nothing by itself.
 */
const clears = new Set();

const deepFreeze = (value) => {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
};

/**
 * A zero-argument function that runs once and then returns the same value.
 * With `freeze`, the value is frozen all the way down, so a caller that
 * tried to change what the next caller reads would throw instead. Leave it
 * off for values that hold live objects (TypeScript's own nodes).
 */
export function memo(build, { freeze = false } = {}) {
  let has = false;
  let value;
  clears.add(() => {
    has = false;
    value = undefined;
  });
  return () => {
    if (!has) {
      value = freeze ? deepFreeze(build()) : build();
      has = true;
    }
    return value;
  };
}

/** Register a module's own cache to be dropped by clearMemos. */
export const onClearMemos = (clear) => clears.add(clear);

/** Forget every memoised build. */
export function clearMemos() {
  for (const clear of clears) clear();
}
