/**
 * dev-eval.mjs
 *
 * Starts the website's dev server with the chat guardrails open, for the
 * answer-quality eval in evals/chat (its README owns the procedure). Blanking
 * KV_REST_API_URL and KV_REST_API_TOKEN makes the rate limiter and the budget
 * fail open, so a full eval run cannot trip them.
 *
 * It exists because the inline form (`KV_REST_API_URL= ... next dev`) is
 * POSIX shell syntax that cmd.exe cannot run. Zero dependencies: it runs
 * Next's own bin under the current node with the two variables set to empty
 * strings, inherits stdio, and forwards signals and the exit code.
 *
 *   npm run dev:eval -w website            (the website's `dev:eval` script)
 *   npm run dev:eval -w website -- -p 3001 (extra arguments reach next dev)
 */

import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const websiteDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'website');
const require = createRequire(join(websiteDir, 'package.json'));
const nextBin = require.resolve('next/dist/bin/next');

const child = spawn(process.execPath, [nextBin, 'dev', ...process.argv.slice(2)], {
  cwd: websiteDir,
  stdio: 'inherit',
  env: { ...process.env, KV_REST_API_URL: '', KV_REST_API_TOKEN: '' },
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal));
}

// A signal death maps to the shell convention (128 + signal number); the
// handlers above stay registered, so re-raising the signal here would not exit.
const SIGNAL_EXIT = { SIGINT: 130, SIGTERM: 143 };
child.on('exit', (code, signal) => {
  process.exit(signal ? (SIGNAL_EXIT[signal] ?? 1) : (code ?? 1));
});
