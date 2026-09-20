/**
 * served-site.mjs
 *
 * Shared plumbing for the checks that need the website running, not just
 * built: boot `next start` against the existing build on a free port, wait
 * for it, and hand back an origin plus a stop() that kills the process
 * group. Also owns SMOKE_ROUTES, the registry-derived route sample those
 * checks share — `smoke-hydration.mjs` (does the site render at all) and
 * `validate-website-a11y.mjs` (does it render accessibly) deliberately walk
 * the same pages, so a route added here gains both checks at once.
 */
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import net from 'node:net';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

const componentRegistry = JSON.parse(
  readFileSync(join(repoRoot, 'src', 'components', 'registry.json'), 'utf8'),
);

/** The shared route sample: the page that broke on 2026-09-06 (/ is the one
 *  route Vercel regenerates under an internal pathname), one hand-written
 *  summary page, one page from the derived-summary collection, and one
 *  index. Derived from the registries so the list cannot rot. */
export const SMOKE_ROUTES = [
  '/',
  '/overview',
  '/templates',
  `/components/${componentRegistry.components[0].slug}`,
];

const SERVER_READY_TIMEOUT_MS = 60_000;

const freePort = () =>
  new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.once('error', reject);
    srv.listen(0, () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });

async function waitForServer(origin) {
  const deadline = Date.now() + SERVER_READY_TIMEOUT_MS;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(origin, { redirect: 'follow' });
      if (res.ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`server at ${origin} not ready within ${SERVER_READY_TIMEOUT_MS}ms`);
}

// Windows cannot spawn `npm` (a .cmd shim) without a shell, and has no
// process groups to kill, so there the next bin runs under this node
// directly and stop() goes through taskkill; POSIX keeps the npm +
// process-group path CI runs.
const isWindows = process.platform === 'win32';

const nextBin = () => {
  for (const base of [join(repoRoot, 'website', 'node_modules'), join(repoRoot, 'node_modules')]) {
    const bin = join(base, 'next', 'dist', 'bin', 'next');
    if (existsSync(bin)) return bin;
  }
  throw new Error('next bin not found — run npm install first');
};

/** Boots `next start` on a free port against website/.next. Returns
 *  { origin, stop } — always call stop() (kills the process group). */
export async function startServer() {
  const port = await freePort();
  const child = isWindows
    ? spawn(process.execPath, [nextBin(), 'start', '-p', String(port)], {
        cwd: join(repoRoot, 'website'),
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true,
      })
    : spawn(
        'npm',
        ['--prefix', join(repoRoot, 'website'), 'run', 'start', '--', '-p', String(port)],
        { stdio: ['ignore', 'pipe', 'pipe'], detached: true },
      );
  let output = '';
  child.stdout.on('data', (d) => (output += d));
  child.stderr.on('data', (d) => (output += d));
  const stop = () => {
    try {
      if (isWindows) {
        spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
      } else {
        process.kill(-child.pid, 'SIGTERM');
      }
    } catch {
      /* already gone */
    }
  };
  try {
    await waitForServer(`http://localhost:${port}`);
  } catch (err) {
    stop();
    throw new Error(`${err.message}\nserver output:\n${output.slice(-2000)}`);
  }
  return { origin: `http://localhost:${port}`, stop };
}
