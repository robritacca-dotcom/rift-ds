/**
 * validate-gestures.mjs
 *
 * Drives every drag grip on the served site with a real pointer flood and
 * fails if the page breaks under it. A served-site check in the manner of
 * smoke-hydration.mjs: boots `next start` against the existing website
 * build, loads each gesture's route in headless Chromium, performs any
 * setup (open the chat, pick a dock, send the prompt that opens an
 * artifact), then presses the grip and sweeps the pointer for about eight
 * seconds at 250Hz through a raw CDP stream that never waits for the page,
 * under 4x CPU throttling. Runs in `verify` and in CI's website job after
 * the hydration smoke, with the page-level axe pass behind it.
 *
 * Why it exists: on 2026-10-20 the playground's stage card blanked the whole
 * live site when a visitor dragged its resize grip. Each pointer move set
 * React state, the welcome board's chart replayed its entrance animation
 * after every width change, and React 19.2 counts a commit that ends with
 * the next move already queued as a nested update, the same way it counts
 * a setState loop. A real drag kept one queued through every commit, the
 * count reached 50 and React threw error #185, unmounting the root. It
 * shipped twice, because nothing in `verify` or CI drove a gesture: a
 * green build, a rendered page and a passing hydration smoke all hold
 * while the grip is a trap. This is the check that was missing.
 *
 * What fails a gesture:
 *   - any uncaught page error during or after the drag (error #185 is one);
 *   - an empty <body> afterwards (the root unmounted);
 *   - the commit budget: a React DevTools hook injected before the page's
 *     scripts (window.__REACT_DEVTOOLS_GLOBAL_HOOK__, which production
 *     React reports every commit to) reads root.pendingLanes one microtask
 *     after each commit, once the commit's synchronous tail has run, which
 *     is where React reads them for its own counter (the hook's comment
 *     owns why the timing matters), and more than COMMIT_BUDGET consecutive
 *     commits ending with sync, continuous or default work still pending
 *     (lanes & 42, the mask that counter uses) fails the gesture. The
 *     budget is half React's limit of 50, so a regression fails here
 *     before it crashes there. The crash needs two streams feeding each
 *     other: a drag that re-renders per frame, and a component whose
 *     effects answer every commit with another update (the welcome
 *     chart's entrance animation replaying on resize was the live one),
 *     so the check holds the page as a whole, not one grip's code;
 *   - a drag that never took: no style attribute changed anywhere in the
 *     document during the sweep, which means the pointer missed the grip or
 *     the selector went stale, and a check that drove nothing proves
 *     nothing. The same goes for a page the hook saw no commits on.
 *
 * The gestures come from scripts/gestures.json (its $comment owns the entry
 * shape); a new grip on the site is a new entry there, with the setup that
 * reaches it; `node scripts/validate-gestures.mjs <label substring>` runs a
 * subset while working on one. Each gesture gets a fresh browser context, so a seat chosen
 * for one never leaks into the next. One line is printed per gesture.
 */
/* global window, document -- page.evaluate() callbacks execute in the browser; the probe itself is a string the browser runs */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { repoRoot, startServer } from './served-site.mjs';

const registry = JSON.parse(readFileSync(join(repoRoot, 'scripts', 'gestures.json'), 'utf8'));

/** Consecutive commits that may end with work still pending before the
 *  gesture fails: half of React's nested-update limit (50). */
const COMMIT_BUDGET = 25;
/** React's own mask for the lanes its nested-update counter reads at the
 *  end of a commit: sync (2), input-continuous (8) and default (32). */
const PENDING_LANES_MASK = 42;
/** The pointer stream: one move every 4ms, a sine sweep of this amplitude
 *  on each dragged axis, for this long. The sweep is slow and modest on
 *  purpose, the way a visitor drags: a wider one spends its peaks past the
 *  grip's clamp, where a move changes nothing and the chain React counts
 *  resets, and a faster one resets it at every reversal. Measured against
 *  the live crash on 2026-10-21, a two-second period peaked at a streak of
 *  24 where this shape reached React's limit. The duration ends three
 *  quarters through the period, so the last move sits at the negative
 *  peak: a grip resting at its maximum still has somewhere to go, and the
 *  final position is never the resting one. */
const MOVE_INTERVAL_MS = 4;
const SWEEP_AMPLITUDE_PX = 200;
const SWEEP_PERIOD_MS = 10_000;
const SWEEP_DURATION_MS = SWEEP_PERIOD_MS * 0.75;
const CPU_THROTTLE_RATE = 4;
/** How long the page gets after the release for a late throw to surface. */
const SETTLE_MS = 1500;
const STEP_TIMEOUT_MS = 30_000;

/** Errors that mean a browser feature was denied, not that the page broke
 *  (smoke-hydration.mjs owns the record of the first one seen). */
const BENIGN_PATTERNS = [/permissions policy violation/i];

/** Installed before any page script runs. Production React hands every
 *  commit to a global hook that declares fiber support; the hook counts the
 *  commits and the longest run of them that ended with pending work, and a
 *  MutationObserver counts style writes while a gesture runs, the evidence
 *  the drag reached the DOM at all. */
const PROBE_SCRIPT = `(() => {
  const probe = {
    commits: 0,
    streak: 0,
    maxStreak: 0,
    styleWrites: 0,
    observer: null,
    begin() {
      this.commits = 0;
      this.streak = 0;
      this.maxStreak = 0;
      this.styleWrites = 0;
      this.observer = new MutationObserver((records) => {
        this.styleWrites += records.length;
      });
      this.observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['style'],
        subtree: true,
      });
    },
    end() {
      this.observer?.disconnect();
      this.observer = null;
      return {
        commits: this.commits,
        maxStreak: this.maxStreak,
        styleWrites: this.styleWrites,
        bodyText: document.body ? document.body.innerText.trim().length : 0,
      };
    },
  };
  window.__riftGestureProbe = probe;
  let nextRendererId = 0;
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
    isDisabled: false,
    supportsFiber: true,
    renderers: new Map(),
    inject(renderer) {
      const id = ++nextRendererId;
      this.renderers.set(id, renderer);
      return id;
    },
    checkDCE() {},
    onScheduleFiberRoot() {},
    onCommitFiberUnmount() {},
    onPostCommitFiberRoot() {},
    onCommitFiberRoot(_id, root) {
      probe.commits += 1;
      /* Read a microtask later, not now. React hands the root over before
         the commit's synchronous tail: for a sync commit that tail flushes
         the passive effects at Default priority, so a setState in a
         useEffect leaves a DefaultLane update pending at the moment React
         reads the lanes for its counter, and reading here would miss it.
         On 2026-10-21 that gap hid the live crash from the probe: every
         second commit in the chain read as clean, and the streak never
         passed 3 while React's own count reached 50. */
      queueMicrotask(() => {
        if ((root.pendingLanes & ${PENDING_LANES_MASK}) !== 0) {
          probe.streak += 1;
          if (probe.streak > probe.maxStreak) probe.maxStreak = probe.streak;
        } else {
          probe.streak = 0;
        }
      });
    },
  };
})();`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function runSetup(page, steps) {
  for (const step of steps) {
    if (step.click) {
      await page.locator(step.click).first().click({ timeout: STEP_TIMEOUT_MS });
    } else if (step.fill) {
      const [selector, text] = step.fill;
      await page.locator(selector).first().fill(text, { timeout: STEP_TIMEOUT_MS });
    } else if (step.press) {
      await page.keyboard.press(step.press);
    } else if (step.drag) {
      /* A plain, awaited drag through Playwright's mouse, the opposite of
         the flood: setup that moves a grip to put the page in the state the
         gesture needs (a floating card at its resting fit has no room to
         move until it is sized down). */
      const [selector, dx, dy] = step.drag;
      const box = await page.locator(selector).first().boundingBox();
      if (!box) throw new Error(`setup drag: ${selector} has no box`);
      const x = box.x + box.width / 2;
      const y = box.y + box.height / 2;
      await page.mouse.move(x, y);
      await page.mouse.down();
      await page.mouse.move(x + dx, y + dy, { steps: 10 });
      await page.mouse.up();
      await page.waitForTimeout(250);
    } else if (step.waitFor) {
      /* Attached, not visible: the artifact grip is a zero-width seat whose
         grab zone is drawn by its pseudo-elements, so it never has a box. */
      await page.locator(step.waitFor).first().waitFor({ state: 'attached', timeout: STEP_TIMEOUT_MS });
    } else {
      throw new Error(`unknown setup step ${JSON.stringify(step)}`);
    }
  }
}

/** The pointer flood. Every event is sent without awaiting its reply, so
 *  the stream runs at wall-clock rate however slowly the throttled page
 *  drains it; the release is awaited, which returns once the page has
 *  consumed everything queued before it. */
async function sweep(session, origin, axis) {
  const moveX = axis !== 'y';
  const moveY = axis !== 'x';
  const send = (type, x, y) =>
    session
      .send('Input.dispatchMouseEvent', {
        type,
        x,
        y,
        button: 'left',
        buttons: 1,
        clickCount: type === 'mouseMoved' ? 0 : 1,
      })
      .catch(() => {});
  send('mousePressed', origin.x, origin.y);
  const started = Date.now();
  let sent = 0;
  let last = origin;
  while (true) {
    const elapsed = Date.now() - started;
    const due = Math.min(Math.floor(elapsed / MOVE_INTERVAL_MS), Math.floor(SWEEP_DURATION_MS / MOVE_INTERVAL_MS));
    while (sent < due) {
      const t = sent * MOVE_INTERVAL_MS;
      const offset = Math.sin((2 * Math.PI * t) / SWEEP_PERIOD_MS) * SWEEP_AMPLITUDE_PX;
      last = {
        x: origin.x + (moveX ? offset : 0),
        y: origin.y + (moveY ? offset : 0),
      };
      send('mouseMoved', last.x, last.y);
      sent += 1;
    }
    if (elapsed >= SWEEP_DURATION_MS) break;
    await sleep(1);
  }
  await session.send('Input.dispatchMouseEvent', {
    type: 'mouseReleased',
    x: last.x,
    y: last.y,
    button: 'left',
    buttons: 0,
    clickCount: 1,
  });
  return sent;
}

async function checkGesture(browser, origin, gesture) {
  const context = await browser.newContext({ viewport: registry.viewport, hasTouch: false });
  await context.addInitScript(PROBE_SCRIPT);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (err) => errors.push(String(err?.message ?? err)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  const failures = [];
  let stats = null;
  try {
    const response = await page.goto(origin + gesture.route, { waitUntil: 'load', timeout: STEP_TIMEOUT_MS });
    if (!response || !response.ok()) {
      throw new Error(`HTTP ${response ? response.status() : 'no response'}`);
    }
    await page.locator(gesture.ready ?? gesture.grip).first().waitFor({ state: 'attached', timeout: STEP_TIMEOUT_MS });
    await runSetup(page, gesture.setup ?? []);

    const grip = page.locator(gesture.grip).first();
    await grip.waitFor({ state: 'attached', timeout: STEP_TIMEOUT_MS });
    /* A grip below the fold (a component page's demo, the home page's
       compare section) has a box the pointer cannot reach; bring it into
       view with the smooth-scroll rule off, so the box read next is final.
       'nearest' leaves a grip already in view where it is. */
    await grip.evaluate((el) => {
      document.documentElement.style.scrollBehavior = 'auto';
      el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    });
    await page.waitForTimeout(250);
    const box = await grip.boundingBox();
    if (!box) throw new Error(`grip ${gesture.grip} has no box`);
    const [fx, fy] = gesture.at ?? [0.5, 0.5];
    const point = { x: box.x + box.width * fx, y: box.y + box.height * fy };

    const session = await context.newCDPSession(page);
    await session.send('Emulation.setCPUThrottlingRate', { rate: CPU_THROTTLE_RATE });
    await page.evaluate(() => window.__riftGestureProbe.begin());
    const moves = await sweep(session, point, gesture.axis);
    await page.waitForTimeout(SETTLE_MS);
    await session.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    stats = await page.evaluate(() => window.__riftGestureProbe.end());
    stats.moves = moves;

    const pageErrors = errors.filter(
      (e) => !e.startsWith('Failed to load resource') && !BENIGN_PATTERNS.some((p) => p.test(e)),
    );
    for (const e of pageErrors) failures.push(`page error: ${e.slice(0, 200)}`);
    if (stats.bodyText === 0) failures.push('<body> is empty after the drag');
    if (stats.maxStreak > COMMIT_BUDGET) {
      failures.push(
        `${stats.maxStreak} consecutive commits ended with work pending (budget ${COMMIT_BUDGET}, React unmounts at 50)`,
      );
    }
    if (stats.commits === 0) failures.push('the DevTools hook saw no React commits: the probe is not watching this page');
    if (stats.styleWrites === 0) failures.push('no style attribute changed during the sweep: the drag never took');
  } catch (err) {
    failures.push(`could not drive the gesture: ${err.message.split('\n')[0]}`);
  } finally {
    await context.close();
  }
  return { failures, stats };
}

async function main() {
  /* An optional argument narrows the run to the gestures whose label
     contains it, for working on one grip; verify and CI pass none. */
  const only = process.argv[2] ?? null;
  const gestures = only ? registry.gestures.filter((g) => g.label.includes(only)) : registry.gestures;
  if (gestures.length === 0) throw new Error(`no gesture label contains "${only}"`);
  const server = await startServer();
  const browser = await chromium.launch();
  const problems = [];
  try {
    for (const gesture of gestures) {
      const { failures, stats } = await checkGesture(browser, server.origin, gesture);
      const detail = stats
        ? `${stats.moves} moves, ${stats.commits} commits, longest pending run ${stats.maxStreak}`
        : 'not driven';
      if (failures.length > 0) {
        problems.push(`${gesture.label}\n${failures.map((f) => `    - ${f}`).join('\n')}`);
        console.error(`✗ ${gesture.label} (${detail})`);
      } else {
        console.log(`✓ ${gesture.label} (${detail})`);
      }
    }
  } finally {
    await browser.close();
    server.stop();
  }

  if (problems.length > 0) {
    console.error(
      `\nvalidate-gestures: ${problems.length} of ${gestures.length} gestures failed on ${server.origin}:\n\n${problems.join('\n')}\n`,
    );
    process.exit(1);
  }
  console.log(`validate-gestures: all ${gestures.length} gestures survive a pointer flood on ${server.origin}`);
}

main().catch((err) => {
  console.error(`validate-gestures: ${err.message}`);
  process.exit(1);
});
