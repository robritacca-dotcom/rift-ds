#!/usr/bin/env node
/**
 * check-animation-jumps.mjs
 *
 * Plays one page in headless Chromium and records the box of every visible
 * element on every animation frame, then reports the motion faults a still
 * screenshot cannot show. It is the instrument of the animation-jump-check
 * skill (`.claude/skills/animation-jump-check`), which judges what it reports.
 *
 * What each line means:
 *   jump          an element moves or resizes by more than 2px in one frame,
 *                 at least three times as far as it moved in the frames
 *                 around it. A snap, not a glide.
 *   drift         in-flow neighbours keep their size but not their gap while
 *                 moving: they run on different curves.
 *   anchor drift  an open popover, dropdown or menu moves its top edge while
 *                 its height changes.
 *   manual        text or a drawing changes inside a box that holds still.
 *                 Geometry cannot judge this, so it is listed for a look and
 *                 never fails the run.
 *
 * What it skips: elements smaller than 16 square pixels, off-screen or
 * invisible, wrappers that paint nothing, anything inside `[data-snap]` or
 * `[data-typing]` (meant to step), and frames around a stall, which carry
 * several frames of motion at once and cannot tell a snap from a glide. An
 * appearing or vanishing element is not a jump.
 *
 * Deliberately NOT part of `verify` or CI: a finding is a lead until someone
 * has watched the motion. Exit 0 when clean, 1 on any jump or drift, and 2
 * when the recording is incomplete or too stalled to trust.
 *
 * Usage:
 *   node scripts/check-animation-jumps.mjs [route] [options]
 *     --origin <url>      a running site; without it, boots the existing build
 *     --select <css>      record only inside this element (default: body)
 *     --click <css>       click during the recording (repeatable, in order)
 *     --hover <css>       hover during the recording (repeatable, in order)
 *     --ms <n>            how long to record (default 8000)
 *     --width <n>         viewport width (default 1280)
 *     --json <file>       write the result as JSON
 *
 * Adapted from `scripts/jumps-core.mjs` in Stageshow
 * (https://github.com/benjitaylor/skills), MIT licensed:
 *
 *   Copyright (c) 2026 Benji Taylor
 *
 *   Permission is hereby granted, free of charge, to any person obtaining a
 *   copy of this software and associated documentation files (the "Software"),
 *   to deal in the Software without restriction, including without limitation
 *   the rights to use, copy, modify, merge, publish, distribute, sublicense,
 *   and/or sell copies of the Software, and to permit persons to whom the
 *   Software is furnished to do so, subject to the following conditions:
 *
 *   The above copyright notice and this permission notice shall be included
 *   in all copies or substantial portions of the Software.
 *
 *   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 *   THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 *   FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 *   DEALINGS IN THE SOFTWARE.
 */
/* global document, getComputedStyle, innerHeight, innerWidth, requestAnimationFrame, window -- record() runs in the browser */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { chromium } from 'playwright';
import { startServer } from './served-site.mjs';

/** Below this many frames, or above this share of stalled ones, the recording proves nothing. */
const MIN_FRAMES = 30;
const MAX_LATE_SHARE = 0.25;

function parseArgs(argv) {
  const options = { route: '/', origin: null, select: 'body', ms: 8000, width: 1280, json: null, actions: [] };
  let routeSet = false;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) {
      if (routeSet) throw new Error(`unexpected argument: ${arg}`);
      options.route = arg;
      routeSet = true;
      continue;
    }
    const name = arg.slice(2);
    if (!['origin', 'select', 'click', 'hover', 'ms', 'width', 'json'].includes(name)) {
      throw new Error(`unknown option: ${arg}`);
    }
    const value = argv[++i];
    if (value === undefined || value.startsWith('--')) throw new Error(`${arg} requires a value`);
    if (name === 'click' || name === 'hover') options.actions.push({ kind: name, selector: value });
    else if (name === 'ms' || name === 'width') {
      options[name] = Number(value);
      if (!Number.isInteger(options[name]) || options[name] <= 0) throw new Error(`${arg} must be a positive integer`);
    } else options[name] = value;
  }
  return options;
}

/** Runs in the page. Items are [id, name, x, y, width, height, parent, next sibling, content]. */
function record({ select, ms }) {
  const root = document.querySelector(select);
  const ids = new WeakMap();
  let n = 0;
  const label = (el) => {
    const cls = (el.getAttribute('class') || el.tagName.toLowerCase()).split(' ')[0];
    const text = (el.textContent || '').trim().slice(0, 18);
    return `${cls}${text ? ` "${text}"` : ''}`;
  };
  const id = (el) => {
    if (!ids.has(el)) ids.set(el, { n: n++, name: label(el) });
    return ids.get(el);
  };
  const inFlow = (el) => !/absolute|fixed/.test(getComputedStyle(el).position);
  const frames = [];
  window.__jumpFrames = frames;
  const t0 = performance.now();
  const tick = () => {
    if (!root.isConnected) return;
    const box = root.getBoundingClientRect();
    const items = [];
    for (const el of root.querySelectorAll('*')) {
      const r = el.getBoundingClientRect();
      if (r.width * r.height < 16) continue;
      if (r.bottom <= 0 || r.right <= 0 || r.top >= innerHeight || r.left >= innerWidth) continue;
      if (el.closest('[data-snap], [data-typing]')) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden') continue;
      // A wrapper that paints and clips nothing can't be seen to jump: only
      // what it holds can, and that is checked on its own.
      const paints =
        (cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent') ||
        cs.backgroundImage !== 'none' ||
        parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth) + parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth) > 0 ||
        cs.boxShadow !== 'none' ||
        cs.overflowX !== 'visible' ||
        cs.overflowY !== 'visible';
      const ownText = [...el.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim());
      if (!paints && !ownText && el.children.length && el.tagName.toLowerCase() !== 'svg') continue;
      // Invisible through an ancestor's opacity counts as invisible: a reset
      // inside a faded-out parent is not a jump anyone sees.
      let alpha = 1;
      for (let p = el; p && p !== root && alpha > 0.02; p = p.parentElement) alpha *= +getComputedStyle(p).opacity;
      if (alpha <= 0.02) continue;
      const { n: elId, name } = id(el);
      const parent = el.parentElement ? id(el.parentElement).n : -1;
      const sib = el.nextElementSibling;
      const next = sib && inFlow(el) && inFlow(sib) ? id(sib).n : -1;
      const words = [...el.childNodes].filter((c) => c.nodeType === 3).map((c) => c.textContent).join('');
      const drawing = el.tagName.toLowerCase() === 'svg' ? el.innerHTML : '';
      items.push([elId, name, r.left - box.left, r.top - box.top, r.width, r.height, parent, next, `${words}|${drawing}`]);
    }
    frames.push({ t: performance.now() - t0, items });
    if (performance.now() - t0 < ms) requestAnimationFrame(tick);
    else window.__jumpDone = true;
  };
  requestAnimationFrame(tick);
}

const typicalFrameMs = (frames) => {
  const dts = frames.slice(1).map((fr, i) => fr.t - frames[i].t).sort((a, b) => a - b);
  return dts[Math.floor(dts.length / 2)] || 16.7;
};

function analyse(frames) {
  const at = frames.map((f) => new Map(f.items.map((i) => [i[0], i])));
  // A late frame carries several frames of gliding at once, so frames around
  // a stall are not judged.
  const frameMs = typicalFrameMs(frames);
  const late = (f) => f > 0 && frames[f].t - frames[f - 1].t > frameMs * 1.6;
  const found = new Map();
  for (let f = 2; f < frames.length - 1; f++) {
    if (late(f - 1) || late(f) || late(f + 1)) continue;
    for (const [n, it] of at[f]) {
      const a = at[f - 2].get(n);
      const b = at[f - 1].get(n);
      const c = at[f + 1].get(n);
      if (!a || !b || !c) continue;
      for (const [k, ax] of [['x', 2], ['y', 3], ['width', 4], ['height', 5]]) {
        const d = it[ax] - b[ax];
        const calm = Math.max(Math.abs(b[ax] - a[ax]), Math.abs(c[ax] - it[ax]), 0.4);
        if (Math.abs(d) > 2 && Math.abs(d) > 3 * calm) {
          const key = `${n}:${k}`;
          const prev = found.get(key);
          if (prev) prev.count++;
          else found.set(key, { id: n, parent: it[6], t: frames[f].t, name: it[1], k, d, count: 1 });
        }
      }
    }
  }
  // Drift: new arrivals are left out, since they are meant to move differently
  // while they come in.
  const born = new Map();
  frames.forEach((fr, f) => fr.items.forEach((i) => born.has(i[0]) || born.set(i[0], f)));
  const drift = new Map();
  for (let f = 1; f < frames.length; f++) {
    if (late(f)) continue;
    for (const [n, it] of at[f]) {
      const nx = it[7] >= 0 ? at[f].get(it[7]) : null;
      const pa = at[f - 1].get(n);
      const pb = nx && at[f - 1].get(nx[0]);
      if (!nx || !pa || !pb) continue;
      if (f - born.get(n) < 45 || f - born.get(nx[0]) < 45) continue;
      const held = Math.abs(it[5] - pa[5]) < 0.3 && Math.abs(nx[5] - pb[5]) < 0.3;
      const gapChange = nx[3] - (it[3] + it[5]) - (pb[3] - (pa[3] + pa[5]));
      if (!held || Math.abs(gapChange) <= 1) continue;
      const key = `${n}>${nx[0]}`;
      const entry = drift.get(key) ?? { t: frames[f].t, a: it[1], b: nx[1], max: 0, count: 0 };
      entry.max = Math.max(entry.max, Math.abs(gapChange));
      entry.count++;
      drift.set(key, entry);
    }
  }
  // Anchor drift: an open surface holds its top edge and grows downward.
  const anchored = new Map();
  for (let f = 1; f < frames.length; f++) {
    if (late(f)) continue;
    for (const [n, it] of at[f]) {
      if (!/^ds-[a-z-]*(popover|dropdown|menu)\b/.test(it[1]) || f - born.get(n) < 30) continue;
      const p = at[f - 1].get(n);
      if (!p) continue;
      const dy = it[3] - p[3];
      const dh = it[5] - p[5];
      if (Math.abs(dy) < 0.3 || Math.abs(dh) < 0.3) continue;
      const entry = anchored.get(n) ?? { t: frames[f].t, name: it[1], y: 0, h: 0 };
      entry.y += dy;
      entry.h += dh;
      anchored.set(n, entry);
    }
  }
  // A parent's snap drags its children with it: report the outermost only.
  const kept = [];
  for (const l of [...found.values()].sort((p, q) => p.t - q.t)) {
    if (kept.some((s) => s.id === l.parent && Math.abs(s.t - l.t) < 40 && s.k === l.k && Math.abs(s.d - l.d) < 0.6)) continue;
    kept.push(l);
  }
  const secs = (ms) => (ms / 1000).toFixed(2);
  return [
    ...[...anchored.values()]
      .filter((a) => Math.abs(a.y) >= 1)
      .map((a) => `anchor drift: ${a.name} moves ${a.y > 0 ? 'down' : 'up'} ${Math.abs(a.y).toFixed(1)}px while its height changes by ${a.h.toFixed(0)}px (from ${secs(a.t)}s)`),
    ...[...drift.values()]
      .filter((d) => d.count >= 4)
      .map((d) => `drift: ${d.a} and ${d.b} glide out of step (gap changes up to ${d.max.toFixed(1)}px a frame, ${d.count} frames from ${secs(d.t)}s)`),
    ...kept.map((l) => `jump: ${l.name} ${l.k} ${l.d > 0 ? '+' : ''}${l.d.toFixed(1)}px in one frame at ${secs(l.t)}s${l.count > 1 ? `, ${l.count} times` : ''}`),
  ];
}

function contentChanges(frames) {
  const seen = new Map();
  const found = new Map();
  for (const frame of frames) {
    for (const item of frame.items) {
      const old = seen.get(item[0]);
      if (old && item[8] !== old[8] && item.slice(2, 6).every((v, i) => Math.abs(v - old[i + 2]) < 0.5) && !found.has(item[0])) {
        found.set(item[0], `${item[1]} changes text or drawing in place at ${(frame.t / 1000).toFixed(2)}s`);
      }
      seen.set(item[0], item);
    }
  }
  return [...found.values()];
}

function coverage(frames) {
  const frameMs = typicalFrameMs(frames);
  const late = frames.slice(1).filter((fr, i) => fr.t - frames[i].t > frameMs * 1.6).length;
  return { frames: frames.length, frameMs: Number(frameMs.toFixed(1)), lateShare: frames.length > 1 ? Number((late / (frames.length - 1)).toFixed(3)) : 1 };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const server = options.origin ? { origin: options.origin.replace(/\/$/, ''), stop: () => {} } : await startServer();
  const browser = await chromium.launch();
  const errors = [];
  let frames = [];
  try {
    const page = await browser.newPage({ viewport: { width: options.width, height: 900 } });
    page.on('pageerror', (error) => errors.push(`page: ${error.message}`));
    await page.goto(`${server.origin}${options.route}`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector(options.select, { state: 'attached' });
    await page.evaluate(record, { select: options.select, ms: options.ms });
    const gap = Math.floor(options.ms / (options.actions.length + 1));
    for (const { kind, selector } of options.actions) {
      await page.waitForTimeout(gap);
      await page[kind](selector, { timeout: gap });
    }
    await page.waitForFunction(() => window.__jumpDone === true, null, { timeout: options.ms + 30_000 });
    frames = await page.evaluate(() => window.__jumpFrames);
  } catch (error) {
    errors.push(error.message);
  } finally {
    await browser.close();
    server.stop();
  }

  const cover = coverage(frames);
  if (cover.frames < MIN_FRAMES) errors.push(`only ${cover.frames} frames recorded`);
  else if (cover.lateShare > MAX_LATE_SHARE) errors.push(`${Math.round(cover.lateShare * 100)}% of frames stalled; narrow the recording with --select`);
  const findings = frames.length ? analyse(frames) : [];
  const manual = frames.length ? contentChanges(frames) : [];
  const status = errors.length ? 'incomplete' : findings.length ? 'findings' : 'clean';

  console.log(`${options.route}: ${cover.frames} frames, typically ${cover.frameMs}ms, ${Math.round(cover.lateShare * 100)}% stalled`);
  for (const line of findings) console.log(line);
  for (const line of manual) console.log(`manual: ${line}`);
  for (const line of errors) console.error(`incomplete: ${line}`);
  console.log(`${status}; watching the motion is still required`);
  if (options.json) {
    const path = resolve(options.json);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, `${JSON.stringify({ route: options.route, status, coverage: cover, findings, manual, errors }, null, 2)}\n`);
  }
  process.exitCode = errors.length ? 2 : findings.length ? 1 : 0;
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 2;
});
