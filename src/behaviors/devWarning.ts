/**
 * Development-only console warnings, the way React writes its own: the
 * check reads `process.env.NODE_ENV`, which every bundler replaces at build
 * time, so a production bundle drops the warning and a page with no
 * bundler (and no `process`) stays silent rather than throwing. Each
 * message prints once per page load, however many instances trip it.
 */

declare const process: { env: { NODE_ENV?: string } };

const isDevelopment = (() => {
  try {
    return process.env.NODE_ENV !== 'production';
  } catch {
    return false;
  }
})();

const warned = new Set<string>();

/** Warns once, in development only. */
export function warnOnce(message: string): void {
  if (!isDevelopment || warned.has(message)) return;
  warned.add(message);
  console.warn(`[rift-ds] ${message}`);
}
