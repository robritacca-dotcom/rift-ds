#!/usr/bin/env node
/**
 * compare-screens.mjs
 *
 * Proves a change left the pixels alone. It photographs every static page
 * of the built website, and later compares two sets of photographs pixel
 * by pixel, so a performance or refactoring change that claims no visual
 * difference can show it. Chromatic would be the usual proof and this repo
 * has no Chromatic project, so this is the local one.
 *
 * Two commands:
 *   shoot <dir>             photograph the current build into <dir>: each
 *                           route, full page, in light and dark, at a
 *                           desktop width (and a phone width with --phone)
 *   compare <before> <after> diff two such folders and list every picture
 *                           that differs, with the share of pixels that
 *                           moved; --diffs <dir> saves a marked picture of
 *                           each difference
 *
 * The workflow: shoot the build of `main`, make the change, rebuild, shoot
 * again, compare. A picture that differs is either a regression to fix or
 * an intended change to name in the commit; zero is the claim "no visual
 * change" made good.
 *
 * What makes two shoots of the same build identical, so a difference means
 * something: reduced motion (entry animations settle, the ambient shader
 * holds one frame), a fixed clock and a seeded Math.random (dates and
 * shuffled demos do not move), animations and transitions ended and the
 * caret hidden, lazy images loaded, fonts awaited, and the page walked top
 * to bottom so everything that waits to be seen has been. What still moves
 * (a canvas, a looping demo, a blur the compositor tiles differently on
 * each load) is found by loading and photographing each page twice: a
 * second take that differs is kept beside the first, and `compare` leaves
 * out the pixels that moved between takes, reporting any picture where
 * that is more than a sliver, so an unverified page is named, never passed
 * in silence. A route no shoot can hold still goes in UNSTABLE with why.
 *
 * A by-hand tool, in neither `verify` nor CI: it needs two builds, and a
 * difference needs a person to judge it. The `perf-audit` skill is its
 * caller. Exit 1 from `compare` when any picture differs or is missing.
 *
 * Options:
 *   --origin <url>        shoot a running site instead of booting the build
 *   --routes <a,b,...>    shoot only these routes (prefix match)
 *   --phone               also shoot at a phone width
 *   --concurrency <n>     pages shot in parallel (default 4)
 */
/* global document, window, Image -- evaluate() callbacks and the init script run in the browser */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { startServer } from './served-site.mjs';
import { staticSiteRoutes } from './site-routes.mjs';

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const option = (name) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? undefined : args[i + 1];
};
const [command, first, second] = args;

/** Routes whose picture is not the same twice from one build, each with why. */
const UNSTABLE = {};

const THEMES = ['light', 'dark'];
const WIDTHS = [{ name: 'desktop', viewport: { width: 1440, height: 900 } }];
if (flag('phone'))
  WIDTHS.push({
    name: 'phone',
    viewport: { width: 375, height: 812 },
    isMobile: true,
    hasTouch: true,
  });
/** The instant every shoot believes it is, so dates and countdowns hold still. */
const FIXED_TIME = new Date('2026-01-15T10:00:00Z');
/** How long a page gets to come to rest, and the gap after the throwaway capture. */
const SETTLE_MS = 1500;
const REST_TIMEOUT_MS = 15_000;
const RETAKE_MS = 700;
/** The suffix of a second take, kept only when it differs from the first. */
const AGAIN = '.again.png';
/** Past this share of a picture moving by itself, the comparison of it proves little. */
const VOLATILE_WARNING = 0.02;
/** A channel may move this much before a pixel counts as changed: the noise of text antialiasing. */
const CHANNEL_TOLERANCE = 4;

const fileFor = (route, theme, width) =>
  `${route === '/' ? 'home' : route.slice(1).replaceAll('/', '__')}.${width}.${theme}.png`;

async function shootRoute(browser, origin, route, dir) {
  for (const width of WIDTHS) {
    for (const theme of THEMES) {
      // Two separate loads: what differs between them is the page's own
      // motion and load-to-load noise, which `compare` then leaves out.
      const one = await shootOnce(browser, origin, route, width, theme);
      const two = await shootOnce(browser, origin, route, width, theme);
      const file = join(dir, fileFor(route, theme, width.name));
      writeFileSync(file, one);
      if (!one.equals(two)) writeFileSync(file.replace(/\.png$/, AGAIN), two);
    }
  }
}

async function shootOnce(browser, origin, route, width, theme) {
  const contextOptions = { ...width };
  delete contextOptions.name;
  const context = await browser.newContext({
    ...contextOptions,
    reducedMotion: 'reduce',
    colorScheme: theme,
  });
  await context.addInitScript((mode) => {
    let seed = 1;
    Math.random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    try {
      window.localStorage.setItem('theme', mode);
    } catch {
      /* a page with no storage shoots its default */
    }
  }, theme);
  const page = await context.newPage();
  await page.clock.setFixedTime(FIXED_TIME);
  try {
    await page.goto(origin + route, { waitUntil: 'load', timeout: 120_000 });
    await page.evaluate(async (mode) => {
      document.documentElement.setAttribute('data-theme', mode);
      document.documentElement.setAttribute('data-theme-setting', mode);
      for (const image of document.querySelectorAll('img[loading="lazy"]')) image.loading = 'eager';
      await document.fonts.ready;
      await Promise.all(
        [...document.images].map((image) =>
          image.complete
            ? null
            : new Promise((done) => {
                image.addEventListener('load', done, { once: true });
                image.addEventListener('error', done, { once: true });
              }),
        ),
      );
    }, theme);
    // Walk the page once so everything that waits to be seen has been.
    await page.evaluate(async () => {
      const step = window.innerHeight;
      for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((done) => setTimeout(done, 60));
      }
      window.scrollTo(0, 0);
    });
    // At rest means the page has kept one height for a whole settle window.
    let height = -1;
    for (const deadline = Date.now() + REST_TIMEOUT_MS; Date.now() < deadline;) {
      await page.waitForTimeout(SETTLE_MS);
      const now = await page.evaluate(() => document.documentElement.scrollHeight);
      if (now === height) break;
      height = now;
    }
    const take = () =>
      page.screenshot({
        fullPage: true,
        animations: 'disabled',
        caret: 'hide',
      });
    // A full-page capture can itself nudge the layout (measured: the page
    // comes out a few pixels taller afterwards), so the first is thrown
    // away and the one that is kept sees the page it leaves.
    await take();
    await page.waitForTimeout(RETAKE_MS);
    return await take();
  } finally {
    await context.close();
  }
}

async function shoot(dir) {
  mkdirSync(dir, { recursive: true });
  const only = option('routes')
    ?.split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const routes = staticSiteRoutes().filter(
    (route) =>
      !(route in UNSTABLE) && (!only || only.some((prefix) => route === prefix || route.startsWith(`${prefix}/`))),
  );
  const external = option('origin');
  const server = external ? { origin: external.replace(/\/$/, ''), stop: () => {} } : await startServer();
  const browser = await chromium.launch();
  const failed = [];
  try {
    const queue = [...routes];
    const worker = async () => {
      for (let route = queue.shift(); route !== undefined; route = queue.shift()) {
        try {
          await shootRoute(browser, server.origin, route, dir);
        } catch (error) {
          failed.push(`${route}: ${error.message.split('\n')[0]}`);
        }
      }
    };
    await Promise.all(Array.from({ length: Number(option('concurrency') ?? 4) }, worker));
  } finally {
    await browser.close();
    server.stop();
  }
  for (const line of failed) console.error(`  - ${line}`);
  console.log(
    `${failed.length ? '✗' : '✓'} Shot ${routes.length - failed.length} of ${routes.length} routes into ${dir}`,
  );
  if (failed.length) process.exit(1);
}

async function compare(beforeDir, afterDir) {
  const names = (dir) => new Set(readdirSync(dir).filter((name) => name.endsWith('.png') && !name.endsWith(AGAIN)));
  const again = (dir, name) => {
    const file = join(dir, name.replace(/\.png$/, AGAIN));
    return existsSync(file) ? readFileSync(file).toString('base64') : null;
  };
  const notes = [];
  const before = names(beforeDir);
  const after = names(afterDir);
  const diffsDir = option('diffs');
  if (diffsDir) mkdirSync(diffsDir, { recursive: true });
  const problems = [];
  for (const name of before) if (!after.has(name)) problems.push(`${name}: only in ${beforeDir}`);
  for (const name of after) if (!before.has(name)) problems.push(`${name}: only in ${afterDir}`);

  const browser = await chromium.launch();
  const page = await browser.newPage();
  let same = 0;
  try {
    for (const name of [...before].filter((n) => after.has(n)).sort()) {
      const a = readFileSync(join(beforeDir, name));
      const b = readFileSync(join(afterDir, name));
      const retakes = [again(beforeDir, name), again(afterDir, name)];
      if (a.equals(b) && !retakes[0] && !retakes[1]) {
        same += 1;
        continue;
      }
      const result = await page.evaluate(
        async ({ left, right, retakes, tolerance, wantDiff }) => {
          const decode = (data) =>
            new Promise((done, fail) => {
              const image = new Image();
              image.onload = () => done(image);
              image.onerror = fail;
              image.src = `data:image/png;base64,${data}`;
            });
          const [one, two] = await Promise.all([decode(left), decode(right)]);
          if (one.width !== two.width || one.height !== two.height) {
            return {
              sized: `${one.width}x${one.height} became ${two.width}x${two.height}`,
            };
          }
          const pixels = (image) => {
            const canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            const context = canvas.getContext('2d');
            context.drawImage(image, 0, 0);
            return {
              canvas,
              context,
              data: context.getImageData(0, 0, image.width, image.height),
            };
          };
          const p = pixels(one);
          const q = pixels(two);
          const differs = (x, y, i) =>
            Math.abs(x[i] - y[i]) > tolerance ||
            Math.abs(x[i + 1] - y[i + 1]) > tolerance ||
            Math.abs(x[i + 2] - y[i + 2]) > tolerance;
          // What moved between the two takes of one shoot is the page's own
          // motion, widened a little, and says nothing about the change.
          const volatile = new Uint8Array(one.width * one.height);
          const spread = 3;
          for (const [data, first] of [
            [retakes[0], p],
            [retakes[1], q],
          ]) {
            if (!data) continue;
            const retake = await decode(data);
            if (retake.width !== one.width || retake.height !== one.height) {
              volatile.fill(1);
              continue;
            }
            const r = pixels(retake).data.data;
            for (let y = 0; y < one.height; y += 1) {
              for (let x = 0; x < one.width; x += 1) {
                if (!differs(first.data.data, r, (y * one.width + x) * 4)) continue;
                for (let dy = -spread; dy <= spread; dy += 1) {
                  for (let dx = -spread; dx <= spread; dx += 1) {
                    const xx = x + dx;
                    const yy = y + dy;
                    if (xx >= 0 && yy >= 0 && xx < one.width && yy < one.height) volatile[yy * one.width + xx] = 1;
                  }
                }
              }
            }
          }
          let changed = 0;
          let unstable = 0;
          for (let i = 0; i < p.data.data.length; i += 4) {
            if (volatile[i / 4]) {
              unstable += 1;
              continue;
            }
            if (differs(p.data.data, q.data.data, i)) {
              changed += 1;
              q.data.data[i] = 255;
              q.data.data[i + 1] = 0;
              q.data.data[i + 2] = 255;
            }
          }
          let marked = null;
          if (changed > 0 && wantDiff) {
            q.context.putImageData(q.data, 0, 0);
            marked = q.canvas.toDataURL('image/png').split(',')[1];
          }
          return { changed, unstable, total: p.data.data.length / 4, marked };
        },
        {
          left: a.toString('base64'),
          right: b.toString('base64'),
          retakes,
          tolerance: CHANNEL_TOLERANCE,
          wantDiff: Boolean(diffsDir),
        },
      );
      if (result.sized) problems.push(`${name}: the page changed size, ${result.sized}`);
      else if (result.changed > 0) {
        problems.push(
          `${name}: ${result.changed} pixels differ (${((result.changed / result.total) * 100).toFixed(3)}%)`,
        );
        if (result.marked) writeFileSync(join(diffsDir, name), Buffer.from(result.marked, 'base64'));
      } else same += 1;
      if (!result.sized && result.unstable / result.total > VOLATILE_WARNING) {
        notes.push(
          `${name}: ${((result.unstable / result.total) * 100).toFixed(1)}% of it moves by itself and was left out`,
        );
      }
    }
  } finally {
    await browser.close();
  }
  if (notes.length > 0) {
    console.log(`! ${notes.length} picture(s) are only partly compared:`);
    for (const line of notes) console.log(`  - ${line}`);
  }
  if (problems.length > 0) {
    console.error(`✗ ${problems.length} picture(s) differ; ${same} are the same:`);
    for (const line of problems) console.error(`  - ${line}`);
    process.exit(1);
  }
  console.log(`✓ No visual change: all ${same} pictures match.`);
}

if (command === 'shoot' && first) await shoot(first);
else if (command === 'compare' && first && second && existsSync(first) && existsSync(second))
  await compare(first, second);
else {
  console.error(
    'Usage:\n  node scripts/compare-screens.mjs shoot <dir> [--phone] [--routes a,b] [--origin url]\n  node scripts/compare-screens.mjs compare <before> <after> [--diffs dir]',
  );
  process.exit(1);
}
