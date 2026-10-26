/**
 * The shortcut grammar and how a shortcut is drawn, with no React and no
 * browser API, so a component that renders from a Server Component can
 * draw or announce a shortcut too. The listener and the hooks are
 * shortcuts.ts, which owns the grammar's description.
 */

/** A shortcut in the grammar above, such as `mod+k`, `shift+?` or `g i`. */
export type Shortcut = string;

/** The platform a shortcut is read and drawn for: `apple` maps `mod` to ⌘, `other` to Ctrl. */
export type ShortcutPlatform = 'apple' | 'other';

/** The legends a shortcut is drawn with, by modifier or key name. Merged over the platform's defaults. */
export type ShortcutKeyLabels = Partial<Record<string, string>>;

/** One step of a shortcut: its key and the modifiers held with it. */
export type Step = { key: string; mod: boolean; ctrl: boolean; meta: boolean; alt: boolean; shift: boolean };

export const KEY_ALIASES: Record<string, string> = {
  esc: 'escape',
  return: 'enter',
  up: 'arrowup',
  down: 'arrowdown',
  left: 'arrowleft',
  right: 'arrowright',
  del: 'delete',
  plus: '+',
  ' ': 'space',
  cmd: 'meta',
  command: 'meta',
  option: 'alt',
  control: 'ctrl',
};

const MODIFIERS = new Set(['mod', 'ctrl', 'meta', 'alt', 'shift']);

const parseStep = (text: string): Step => {
  const step: Step = { key: '', mod: false, ctrl: false, meta: false, alt: false, shift: false };
  for (const raw of text.toLowerCase().split('+')) {
    const part = KEY_ALIASES[raw] ?? raw;
    if (MODIFIERS.has(part)) step[part as 'mod' | 'ctrl' | 'meta' | 'alt' | 'shift'] = true;
    else step.key = part;
  }
  return step;
};

/** A shortcut's steps, parsed once. A step written `ctrl++` would be ambiguous, so `plus` names the key. */
export const parseShortcut = (shortcut: Shortcut): Step[] =>
  shortcut.trim().split(/\s+/).filter(Boolean).map(parseStep);

/** The platform this code runs on, read from the browser. `other` on the server. */
export const detectPlatform = (): ShortcutPlatform => {
  if (typeof navigator === 'undefined') return 'other';
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  const name = nav.userAgentData?.platform || nav.platform || nav.userAgent || '';
  return /mac|iphone|ipad|ipod/i.test(name) ? 'apple' : 'other';
};

const APPLE_LABELS: Record<string, string> = {
  mod: '⌘',
  meta: '⌘',
  ctrl: '⌃',
  alt: '⌥',
  shift: '⇧',
  enter: '↩',
  escape: 'Esc',
  backspace: '⌫',
  delete: '⌦',
  tab: '⇥',
  space: 'Space',
};

const OTHER_LABELS: Record<string, string> = {
  mod: 'Ctrl',
  meta: 'Meta',
  ctrl: 'Ctrl',
  alt: 'Alt',
  shift: 'Shift',
  enter: 'Enter',
  escape: 'Esc',
  backspace: 'Backspace',
  delete: 'Del',
  tab: 'Tab',
  space: 'Space',
};

const SHARED_LABELS: Record<string, string> = {
  arrowup: '↑',
  arrowdown: '↓',
  arrowleft: '←',
  arrowright: '→',
  home: 'Home',
  end: 'End',
  pageup: 'PgUp',
  pagedown: 'PgDn',
};

/* Apple draws modifiers in this order (⌃⌥⇧⌘); Windows and Linux write Ctrl, Alt, Shift. */
const APPLE_ORDER = ['ctrl', 'alt', 'shift', 'mod', 'meta'] as const;
const OTHER_ORDER = ['mod', 'ctrl', 'meta', 'alt', 'shift'] as const;

/**
 * A shortcut as keycap legends, one array per step: `mod+shift+p` is
 * `[['⇧', '⌘', 'P']]` on a Mac and `[['Ctrl', 'Shift', 'P']]` elsewhere.
 * `labels` replaces any legend, such as `{ ctrl: 'Strg' }` for a German
 * keyboard.
 */
export function shortcutKeys(
  shortcut: Shortcut,
  platform: ShortcutPlatform,
  labels: ShortcutKeyLabels = {},
): string[][] {
  const table = { ...SHARED_LABELS, ...(platform === 'apple' ? APPLE_LABELS : OTHER_LABELS) };
  const legend = (name: string) =>
    labels[name] ?? table[name] ?? (/^f\d+$/.test(name) ? name.toUpperCase() : name.length === 1 ? name.toUpperCase() : name);
  return parseShortcut(shortcut).map((step) => {
    const order = platform === 'apple' ? APPLE_ORDER : OTHER_ORDER;
    const mods = order.filter((mod) => step[mod]);
    // mod and its platform twin draw the same key once.
    const unique = mods.filter((mod, i) => !mods.slice(0, i).some((m) => legend(m) === legend(mod)));
    return [...unique.map(legend), legend(step.key)];
  });
}

/**
 * A shortcut as one line of text, for a menu row: `⇧⌘P` on a Mac and
 * `Ctrl+Shift+P` elsewhere, the steps of a sequence spaced apart.
 */
export function formatShortcut(
  shortcut: Shortcut,
  platform: ShortcutPlatform,
  labels: ShortcutKeyLabels = {},
): string {
  return shortcutKeys(shortcut, platform, labels)
    .map((keys) => keys.join(platform === 'apple' ? '' : '+'))
    .join(' ');
}

const ARIA_KEYS: Record<string, string> = {
  ctrl: 'Control',
  meta: 'Meta',
  alt: 'Alt',
  shift: 'Shift',
  escape: 'Escape',
  enter: 'Enter',
  space: 'Space',
  tab: 'Tab',
  backspace: 'Backspace',
  delete: 'Delete',
  arrowup: 'ArrowUp',
  arrowdown: 'ArrowDown',
  arrowleft: 'ArrowLeft',
  arrowright: 'ArrowRight',
  home: 'Home',
  end: 'End',
  pageup: 'PageUp',
  pagedown: 'PageDown',
};

/**
 * A single-step shortcut as an `aria-keyshortcuts` value (`Meta+K` on a Mac,
 * `Control+K` elsewhere). A sequence has no ARIA form, so it gives undefined.
 */
export function shortcutAria(shortcut: Shortcut, platform: ShortcutPlatform): string | undefined {
  const steps = parseShortcut(shortcut);
  if (steps.length !== 1) return undefined;
  const [step] = steps;
  const names = [
    step.ctrl || (step.mod && platform === 'other') ? 'Control' : null,
    step.meta || (step.mod && platform === 'apple') ? 'Meta' : null,
    step.alt ? 'Alt' : null,
    step.shift ? 'Shift' : null,
    ARIA_KEYS[step.key] ?? (step.key.length === 1 ? step.key.toUpperCase() : step.key),
  ].filter(Boolean);
  return names.join('+');
}

/**
 * A shortcut as an `aria-keyshortcuts` value for both platforms at once
 * (`Meta+K Control+K` for `mod+k`), for markup that renders on the server or
 * before the platform is known. Undefined for a sequence.
 */
export function shortcutAriaAnyPlatform(shortcut: Shortcut): string | undefined {
  const forms = [shortcutAria(shortcut, 'apple'), shortcutAria(shortcut, 'other')].filter(Boolean);
  return forms.length > 0 ? [...new Set(forms)].join(' ') : undefined;
}
