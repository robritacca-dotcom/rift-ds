import React from 'react';
import { createRoot } from 'react-dom/client';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { composeStories } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';
import registry from '../components/registry.json';
import keyboard from '../components/keyboard-patterns.json';

/**
 * The keyboard contract. A component that follows a WAI-ARIA pattern names
 * it as `pattern` in src/components/registry.json, and one story per
 * pattern here presses every row of that pattern's table in
 * src/components/keyboard-patterns.json against every component that names
 * it, in a left-to-right and a right-to-left layout.
 *
 * The rows are also what the component pages, the per-component markdown
 * and the published schemas print as a component's keys, so a row is never
 * a claim: it is listed because a runner below presses it. Each runner
 * reports the row ids it asserted, and a row with no assertion fails the
 * story the same way a broken key does.
 *
 * Each runner also checks the structure the pattern needs before it presses
 * anything: an accessible name, the states the keys move (`aria-selected`,
 * `aria-expanded`, the `aria-value*` set) and the references between parts
 * (`aria-controls`, `aria-describedby`). A failure there reads
 * `structure: …`.
 *
 * The runners read the DOM by role, never by class, so they hold the
 * accessibility tree a screen reader gets. The highlighted item is the
 * focused element, or the one `aria-activedescendant` names when focus
 * stays on a field.
 *
 * A pattern can also belong to one part of a component (a carousel's
 * dots, a palette's list of results): `partPatterns` in the registry, and
 * a FIXTURES row keyed `Name:pattern`.
 *
 * FIXTURES says how a component is put on the page where its Default story
 * will not do: another story to render and, for a popup, how to open it. A
 * fixture whose component names no such pattern fails. Adding a component
 * to a pattern is its registry field, and a row here when it needs one.
 *
 * Every registered component is classified, so the contract has no gaps to
 * fall through: it names a pattern (or a part of it does), or `keys` in the
 * registry says who owns its keys. `by: "component"` is a widget with keys
 * of its own, which its own stories press; `by: "platform"` leaves them to
 * the browser or the engine underneath; `by: "none"` has nothing to focus.
 * The last two stories here hold the `platform` and `none` claims.
 */

type Row = { id: string; keys: string[]; text: string; inline?: boolean; when?: string };
type PatternId = keyof typeof keyboard.patterns;

type StoryModule = Parameters<typeof composeStories>[0];
const storyModules = import.meta.glob<StoryModule>('../components/**/*.stories.{ts,tsx}', { eager: true });
const storiesFor = (name: string) =>
  Object.entries(storyModules).find(([path]) => /\/(\w+)\.stories\.tsx?$/.exec(path)?.[1] === name)?.[1];

/** Opens the popup and returns the element that opened it, where focus should come back to. */
type Opener = (host: HTMLElement) => Promise<HTMLElement> | HTMLElement;
type Fixture = { story: string; open?: Opener };

const clickFirst = (selector: string): Opener => async (host) => {
  const target = host.querySelector<HTMLElement>(selector);
  if (!target) throw new Error(`nothing matches ${selector} to open it`);
  await userEvent.click(target);
  return target;
};
/** Opens from the keyboard, so the `open` row is the press it describes. */
const enterOn = (selector: string): Opener => async (host) => {
  const target = host.querySelector<HTMLElement>(selector);
  if (!target) throw new Error(`nothing matches ${selector} to open it`);
  target.focus();
  await userEvent.keyboard('{Enter}');
  return target;
};

/** A context menu opens on its target, the way the ContextMenu key does from a focused element. */
const contextMenuOn = (selector: string): Opener => (host) => {
  const target = host.querySelector<HTMLElement>(selector);
  if (!target) throw new Error(`nothing matches ${selector} to open it`);
  target.tabIndex = 0;
  target.focus();
  target.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
  return target;
};

const FIXTURES: Record<string, Fixture> = {
  Tabs: { story: 'Default' },
  SegmentedControl: { story: 'Default' },
  NotificationCenter: { story: 'WithTabs' },
  Toolbar: { story: 'Default' },
  Rating: { story: 'Default' },
  DropdownMenu: { story: 'Default', open: enterOn('button') },
  ContextMenu: { story: 'Default', open: contextMenuOn('.ds-context-menu > *') },
  ThemePicker: { story: 'Default', open: enterOn('button') },
  // The short list: past its search threshold the switcher opens on its
  // search field, an arrow away from the rows, which its own Searchable
  // story holds.
  EntitySwitcher: { story: 'Marks', open: enterOn('button') },
  Combobox: { story: 'Default' },
  Dropdown: { story: 'Default' },
  ModelPicker: { story: 'Default' },
  RichDropdown: { story: 'Default' },
  TimePicker: { story: 'Default' },
  Dialog: { story: 'Default', open: clickFirst('button') },
  AlertDialog: { story: 'Interactive', open: clickFirst('button') },
  'Drawer:dialog': { story: 'Default', open: clickFirst('button') },
  CommandPalette: { story: 'Default', open: clickFirst('button') },
  Lightbox: { story: 'Default', open: clickFirst('button') },
  TreeView: { story: 'Default' },
  ImageCompare: { story: 'Default' },
  SplitPane: { story: 'Default' },
  DatePicker: { story: 'Default' },
  DateRangePicker: { story: 'Default', open: clickFirst('button') },
  AttachmentViewer: { story: 'Gallery', open: clickFirst('button') },
  // A part of a component, keyed `Name:pattern` (partPatterns in the registry).
  'BentoTile:dialog': { story: 'Expandable', open: clickFirst('button[aria-haspopup="dialog"]') },
  'Carousel:tabs': { story: 'Default' },
  // With Undo, a press always leaves a button behind: Undo after a decision, the two choices after Undo.
  'DecisionRow:button': { story: 'WithUndo' },
  'FilterBar:listbox': { story: 'Default', open: enterOn('button[aria-haspopup="listbox"]') },
  'CommandPalette:listbox': { story: 'Default', open: clickFirst('button') },
  Accordion: { story: 'Default' },
  'NavList:disclosure': { story: 'Nested' },
  'SidebarPanel:disclosure': { story: 'Collapsible' },
  'InspectorSection:disclosure': { story: 'Closed' },
  'Reasoning:disclosure': { story: 'Default' },
  'ToolCall:disclosure': { story: 'Default' },
  'CodeBlock:disclosure': { story: 'Collapsible' },
  'CodeBlock:tabs': { story: 'PackageManagerTabs' },
  'AgentPlan:disclosure': { story: 'WithDetails' },
  'SourceTrail:disclosure': { story: 'WithDetails' },
  'Popover:disclosure': { story: 'Default' },
  // Stories that hold their own state, so a key can change it.
  Link: { story: 'Inline' },
  RadioButton: { story: 'GroupUncontrolled' },
  Checkbox: { story: 'Uncontrolled' },
  'SelectionCard:checkbox': { story: 'Uncontrolled' },
  ToggleSwitch: { story: 'Uncontrolled' },
  ArtifactCard: { story: 'Toggle' },
  ToggleGroup: { story: 'Uncontrolled' },
  Swatch: { story: 'Toggle' },
  IconButton: { story: 'PrimaryDefault' },
  'AgentRail:tabs': { story: 'Switching' },
  'SplitButton:menu': { story: 'Default', open: enterOn('button[aria-haspopup="menu"]') },
  'AiButton:disclosure': { story: 'WithRequest' },
  'AttachmentGroup:disclosure': { story: 'Overflow' },
  'SourceChip:tooltip': { story: 'WithPreview' },
  Tooltip: { story: 'Top' },
  HoverCard: { story: 'Default' },
};

const enabled = (elements: Iterable<Element>) =>
  [...elements].filter(
    (el) => !(el as HTMLButtonElement).disabled && el.getAttribute('aria-disabled') !== 'true',
  ) as HTMLElement[];

/** The highlighted item: the focused element, or the one a field points at. */
const current = () => {
  const active = document.activeElement;
  const id = active?.getAttribute('aria-activedescendant');
  return (id && document.getElementById(id)) || active;
};

/** Still there for a screen reader: connected, and not hidden or inert while it leaves. */
const shown = (el: Element) =>
  el.isConnected &&
  !el.closest('[inert], [aria-hidden="true"], [hidden]') &&
  el.checkVisibility({ visibilityProperty: true });

const describe = (el: Element | null) =>
  el ? `<${el.tagName.toLowerCase()}${el.getAttribute('role') ? ` role=${el.getAttribute('role')}` : ''}> "${(el.textContent ?? '').trim().slice(0, 30)}"` : 'nothing';

/** An element's accessible name, as far as the attributes that carry one go. */
const nameOf = (el: Element) => {
  const label = el.getAttribute('aria-label');
  if (label?.trim()) return label.trim();
  const labelled = (el.getAttribute('aria-labelledby') ?? '')
    .split(/\s+/)
    .map((id) => document.getElementById(id)?.textContent?.trim() ?? '')
    .join(' ')
    .trim();
  if (labelled) return labelled;
  const own = (el as HTMLInputElement).labels?.[0]?.textContent?.trim();
  return own || (el.matches('button, a, [role="tab"], [role="option"], [role^="menuitem"]') ? (el.textContent ?? '').trim() : '');
};

/** The structure half of a pattern: the roles, names and references a screen reader reads. */
const structure = (holds: unknown, what: string) => {
  if (!holds) throw new Error(`structure: ${what}`);
};

/** An item's name as it is read out: its text without the decorative glyphs. */
const spoken = (item: Element) => {
  const copy = item.cloneNode(true) as HTMLElement;
  copy.querySelectorAll('[aria-hidden="true"], [role="group"]').forEach((hidden) => hidden.remove());
  return (copy.textContent ?? '').trim().toLowerCase();
};

const press = (key: string) =>
  userEvent.keyboard(key.split('+').map((k) => (k === 'Space' ? ' ' : `{${k}}`)).join(''));

const expectCurrent = async (target: Element, when: string) =>
  waitFor(() => {
    if (current() !== target) throw new Error(`${when}: expected ${describe(target)}, but ${describe(current())} is highlighted`);
  });

type Context = { host: HTMLElement; rtl: boolean; fixture: Fixture; done: (id: string) => void };
type Runner = (ctx: Context) => Promise<void>;

/** The key that means "next" along the inline axis in this direction. */
const inlineKeys = (rtl: boolean, vertical: boolean) =>
  vertical
    ? { next: 'ArrowDown', previous: 'ArrowUp' }
    : rtl
      ? { next: 'ArrowLeft', previous: 'ArrowRight' }
      : { next: 'ArrowRight', previous: 'ArrowLeft' };

/**
 * One tab stop, arrows along the axis, Home and End: the roving set tabs,
 * toolbars and radio groups share. `chosen` names the state the arrows
 * carry with them, where the pattern says they select.
 */
const roving =
  (container: string, item: string, chosen?: 'aria-selected' | 'aria-checked', oneTabStop = true): Runner =>
  async ({ host, rtl, done }) => {
    const root = host.querySelector(container);
    if (!root) throw new Error(`no ${container} rendered`);
    const items = enabled(root.querySelectorAll(item));
    if (items.length < 2) throw new Error(`${container} needs two enabled items to test, found ${items.length}`);
    structure(nameOf(root), `the ${root.getAttribute('role')} has no accessible name`);
    if (chosen) {
      structure(items.every((el) => el.hasAttribute(chosen)), `every item carries ${chosen}`);
      structure(items.filter((el) => el.getAttribute(chosen) === 'true').length <= 1, `at most one item is ${chosen}`);
    }
    for (const el of items) {
      const panel = el.getAttribute('aria-controls');
      if (el.getAttribute('role') === 'tab' && panel && el.getAttribute('aria-selected') === 'true') {
        structure(document.getElementById(panel), `the selected tab's aria-controls names no element (${panel})`);
      }
    }

    let start = 0;
    if (oneTabStop) {
      const stops = items.filter((el) => el.tabIndex === 0);
      if (stops.length !== 1) throw new Error(`tab-stop: expected one tab stop in the set, found ${stops.length}`);
      start = Math.min(items.indexOf(stops[0]), items.length - 2);
      done('tab-stop');
    }

    const moved = async (target: HTMLElement, when: string) => {
      await expectCurrent(target, when);
      if (chosen) {
        await waitFor(() => {
          if (target.getAttribute(chosen) !== 'true') throw new Error(`${when}: ${describe(target)} took focus but not ${chosen}`);
        });
      }
    };

    const keys = inlineKeys(rtl, root.getAttribute('aria-orientation') === 'vertical');
    items[start].focus();
    await press(keys.next);
    await moved(items[start + 1], `next (${keys.next})`);
    done('next');
    await press(keys.previous);
    await moved(items[start], `previous (${keys.previous})`);
    done('previous');
    await press('End');
    await moved(items.at(-1)!, 'last (End)');
    done('last');
    await press('Home');
    await moved(items[0], 'first (Home)');
    done('first');
  };

/**
 * A value on a track: the inline arrows step it, Home and End take it to
 * its ends, read from `aria-valuenow` and its bounds.
 */
const valued =
  (selector: string, followsDirection: boolean): Runner =>
  async ({ host, rtl, done }) => {
    const handle = host.querySelector<HTMLElement>(selector);
    if (!handle) throw new Error(`no ${selector} rendered`);
    const read = (name: 'now' | 'min' | 'max') => Number(handle.getAttribute(`aria-value${name}`));
    structure(nameOf(handle), 'the handle has no accessible name');
    structure(
      (['now', 'min', 'max'] as const).every((name) => handle.hasAttribute(`aria-value${name}`) && !Number.isNaN(read(name))),
      'aria-valuenow, aria-valuemin and aria-valuemax are not all numbers',
    );
    const settles = async (when: string, holds: (value: number) => boolean) =>
      waitFor(() => {
        if (!holds(read('now'))) throw new Error(`${when}: the value is ${read('now')} (between ${read('min')} and ${read('max')})`);
      });

    const keys = inlineKeys(rtl && followsDirection, false);
    handle.focus();
    await press('Home');
    await settles('minimum (Home)', (value) => value === read('min'));
    done('minimum');
    await press(keys.next);
    await settles(`increase (${keys.next})`, (value) => value > read('min'));
    done('increase');
    const raised = read('now');
    await press(keys.previous);
    await settles(`decrease (${keys.previous})`, (value) => value < raised);
    done('decrease');
    await press('End');
    await settles('maximum (End)', (value) => value === read('max'));
    done('maximum');
  };

/** The date a day button names: its accessible name opens with the full date. */
const dayOf = (el: Element | null) => {
  const stamp = Date.parse((el?.getAttribute('aria-label') ?? el?.textContent ?? '').split(/,\s*(?=[a-z])/)[0]);
  return Number.isNaN(stamp) ? null : new Date(stamp);
};
const sameDay = (a: Date | null, b: Date) =>
  !!a && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const shifted = (from: Date, days: number, months = 0) =>
  new Date(from.getFullYear(), from.getMonth() + months, from.getDate() + days);

/** A header that opens and closes its section: Enter and Space both flip `aria-expanded`. */
const toggles: Runner = async ({ host, done }) => {
  // A menu or listbox trigger is another pattern's; a popover's is a disclosure.
  // Found afresh for each press: opening can swap the control for its closing twin.
  const find = () =>
    enabled(host.querySelectorAll('[aria-expanded]:not([aria-haspopup]), [aria-expanded][aria-haspopup="dialog"]'))[0];
  const header = find();
  if (!header) throw new Error('no control with aria-expanded rendered');
  const flips = async (key: string, when: string) => {
    const control = find();
    const before = control.getAttribute('aria-expanded');
    control.focus();
    await press(key);
    await waitFor(() => {
      if (find()?.getAttribute('aria-expanded') === before) throw new Error(`${when}: aria-expanded stayed ${before}`);
    });
  };
  structure(nameOf(header) || (header.textContent ?? '').trim(), 'the control has no accessible name');
  const controls = header.getAttribute('aria-controls');
  if (controls && header.getAttribute('aria-expanded') === 'true') {
    structure(document.getElementById(controls), `aria-controls names no element (${controls})`);
  }
  header.focus();
  await flips('Enter', 'toggle (Enter)');
  done('toggle');
  await flips('Space', 'toggle-space (Space)');
  done('toggle-space');
};

/** The first enabled element in the host that matches, or a failure that says what was missing. */
const first = (host: HTMLElement, selector: string, what: string) => {
  const found = enabled(host.querySelectorAll(selector))[0];
  if (!found) throw new Error(`no ${what} rendered`);
  return found;
};

/** Clicks reaching the host, the way a key that activates a control ends in one. Links are held from navigating. */
const countClicks = (host: HTMLElement) => {
  let clicks = 0;
  const listener = (event: Event) => {
    clicks += 1;
    if ((event.target as Element).closest('a[href]')) event.preventDefault();
  };
  host.addEventListener('click', listener, true);
  return { get: () => clicks, stop: () => host.removeEventListener('click', listener, true) };
};

/** A control whose state a key flips: `aria-pressed`, `aria-checked`, or a native input's own `checked`. */
const flipping =
  (selector: string, what: string, keys: [key: string, row: string][]): Runner =>
  async ({ host, done }) => {
    const stateOf = (el: Element) =>
      el.getAttribute('aria-pressed') ?? el.getAttribute('aria-checked') ?? String((el as HTMLInputElement).checked);
    // One that is off, where there is one: in a set that keeps one member on, the on one cannot be turned off.
    const pick = () =>
      enabled(host.querySelectorAll(selector)).find((el) => stateOf(el) === 'false') ?? first(host, selector, what);
    structure(nameOf(pick()) || (pick().textContent ?? '').trim(), `the ${what} has no accessible name`);
    for (const [key, row] of keys) {
      const control = pick();
      const before = stateOf(control);
      control.focus();
      await press(key);
      await waitFor(() => {
        if (stateOf(control) === before) throw new Error(`${row} (${key}): the ${what} stayed ${before}`);
      });
      done(row);
    }
  };

const RUNNERS: Record<PatternId, Runner> = {
  // A plain button: not one that opens something, and not a toggle.
  button: async ({ host, done }) => {
    const PLAIN = 'button:not([aria-expanded]):not([aria-pressed]):not([role]), [role="button"]';
    const button = first(host, PLAIN, 'button');
    structure(nameOf(button) || (button.textContent ?? '').trim(), 'the button has no accessible name');
    const clicks = countClicks(host);
    try {
      button.focus();
      await press('Enter');
      await waitFor(() => {
        if (clicks.get() < 1) throw new Error('activate (Enter): nothing was activated');
      });
      done('activate');
      const after = clicks.get();
      // Activating can replace the button (a copy button showing its tick), so find it again.
      first(host, PLAIN, 'button after the first press').focus();
      await press('Space');
      await waitFor(() => {
        if (clicks.get() <= after) throw new Error('activate-space (Space): nothing was activated');
      });
      done('activate-space');
    } finally {
      clicks.stop();
    }
  },

  'toggle-button': flipping('[aria-pressed]', 'toggle button', [
    ['Enter', 'toggle'],
    ['Space', 'toggle-space'],
  ]),
  checkbox: flipping('[role="checkbox"], input[type="checkbox"]:not([role])', 'checkbox', [['Space', 'toggle-space']]),
  switch: flipping('[role="switch"]', 'switch', [['Space', 'toggle-space']]),

  link: async ({ host, done }) => {
    const link = first(host, 'a[href]', 'link');
    structure(nameOf(link), 'the link has no accessible name');
    const clicks = countClicks(host);
    try {
      link.focus();
      await press('Enter');
      await waitFor(() => {
        if (clicks.get() < 1) throw new Error('follow (Enter): the link was not followed');
      });
      done('follow');
    } finally {
      clicks.stop();
    }
  },

  textbox: async ({ host, done }) => {
    const field = first(
      host,
      'textarea, input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="file"]):not([type="date"])',
      'text field',
    ) as HTMLInputElement;
    structure(nameOf(field) || field.placeholder, 'the field has no accessible name');
    const before = field.value;
    field.focus();
    await userEvent.keyboard('1');
    await waitFor(() => {
      if (field.value === before) throw new Error('type: typing changed nothing');
    });
    done('type');
  },

  accordion: toggles,
  disclosure: toggles,

  // A hint on a trigger: shown is a visible role="tooltip", or the trigger's
  // own aria-expanded where the hint is a richer card.
  tooltip: async ({ host, done }) => {
    const trigger = enabled(host.querySelectorAll('button, a[href], [tabindex]'))[0];
    if (!trigger) throw new Error('no focusable trigger rendered');
    const showing = () =>
      trigger.getAttribute('aria-expanded') === 'true' || [...document.querySelectorAll('[role="tooltip"]')].some(shown);
    trigger.focus();
    await waitFor(() => {
      if (!showing()) throw new Error('show: focusing the trigger showed nothing');
    });
    done('show');
    const hint = [...document.querySelectorAll('[role="tooltip"]')].find(shown);
    if (hint) {
      structure(
        (trigger.getAttribute('aria-describedby') ?? '').split(/\s+/).includes(hint.id) && hint.id,
        'the trigger does not point at its tooltip with aria-describedby',
      );
    }
    await press('Escape');
    await waitFor(() => {
      if (showing()) throw new Error('dismiss (Escape): it is still showing');
      if (document.activeElement !== trigger) throw new Error(`dismiss (Escape): focus moved to ${describe(document.activeElement)}`);
    });
    done('dismiss');
  },

  // A slider here is a handle over a picture, whose sides belong to the
  // screen, so its arrows do not swap in a right-to-left layout. The native
  // range inputs (Slider, InspectorSlider) are not members: the browser owns
  // their keys, and a synthetic key press cannot drive them.
  slider: valued('[role="slider"]', false),
  splitter: valued('[role="separator"][tabindex]', true),

  // The options of an open list, wherever focus sits: on the options
  // themselves, or on a field or trigger that points at the highlighted one.
  listbox: async ({ host, fixture, done }) => {
    if (fixture.open) await fixture.open(host);
    const list = await waitFor(() => {
      const found = [...document.querySelectorAll('[role="listbox"]')].find(shown);
      if (!found) throw new Error('no role="listbox" appeared');
      return found;
    });
    structure(nameOf(list), 'the listbox has no accessible name');
    const options = enabled(list.querySelectorAll('[role="option"]'));
    if (options.length < 2) throw new Error(`the list needs two enabled options to test, found ${options.length}`);
    structure(options.every((option) => nameOf(option)), 'an option has no accessible name');
    await press('Home');
    await expectCurrent(options[0], 'first (Home)');
    done('first');
    await press('ArrowDown');
    await expectCurrent(options[1], 'next (ArrowDown)');
    done('next');
    await press('ArrowUp');
    await expectCurrent(options[0], 'previous (ArrowUp)');
    done('previous');
    await press('End');
    await expectCurrent(options.at(-1)!, 'last (End)');
    done('last');
    await press('Escape');
  },

  calendar: async ({ host, rtl, fixture, done }) => {
    if (fixture.open) await fixture.open(host);
    const grid = await waitFor(() => {
      const found = [...document.querySelectorAll('[role="grid"]')].find(shown);
      if (!found) throw new Error('no role="grid" appeared');
      return found;
    });
    structure(nameOf(grid), 'the date grid has no accessible name');
    structure(grid.querySelectorAll('[role="columnheader"]').length === 7, 'the grid does not have seven column headers');
    // Mid-month, so a day or a week either way stays in the month shown.
    const start = enabled(grid.querySelectorAll('[role="gridcell"] button')).find((day) => dayOf(day)?.getDate() === 15);
    const from = dayOf(start ?? null);
    if (!start || !from) throw new Error('no day button names the 15th to start from');
    const lands = async (target: Date, when: string) =>
      waitFor(() => {
        const at = dayOf(document.activeElement);
        if (!sameDay(at, target)) throw new Error(`${when}: expected ${target.toDateString()}, but focus is on ${at ? at.toDateString() : describe(document.activeElement)}`);
      });
    const rowEdge = async (edge: 'first' | 'last', when: string) =>
      waitFor(() => {
        const cells = [...(document.activeElement?.closest('[role="row"]')?.querySelectorAll('[role="gridcell"]') ?? [])];
        const cell = edge === 'first' ? cells[0] : cells.at(-1);
        if (!cell?.contains(document.activeElement)) throw new Error(`${when}: focus is on ${describe(document.activeElement)}, not the ${edge} day of its week`);
      });

    const keys = inlineKeys(rtl, false);
    start.focus();
    await press(keys.next);
    await lands(shifted(from, 1), `next-day (${keys.next})`);
    done('next-day');
    await press(keys.previous);
    await lands(from, `previous-day (${keys.previous})`);
    done('previous-day');
    await press('ArrowDown');
    await lands(shifted(from, 7), 'next-week (ArrowDown)');
    done('next-week');
    await press('ArrowUp');
    await lands(from, 'previous-week (ArrowUp)');
    done('previous-week');
    await press('Home');
    await rowEdge('first', 'week-start (Home)');
    done('week-start');
    await press('End');
    await rowEdge('last', 'week-end (End)');
    done('week-end');
    start.focus();
    await lands(from, 'back on the 15th');
    await press('PageDown');
    await lands(shifted(from, 0, 1), 'next-month (PageDown)');
    done('next-month');
    await press('PageUp');
    await lands(from, 'previous-month (PageUp)');
    done('previous-month');
  },

  tabs: roving('[role="tablist"]', '[role="tab"]', 'aria-selected'),
  // Every control of a Toolbar keeps its own tab stop by design (a control
  // inside that owns the arrows would cut the rest off from the keyboard),
  // so the pattern's single tab stop is not a row of its table.
  toolbar: roving('[role="toolbar"]', 'button, a[href], input, select, [tabindex]', undefined, false),
  'radio-group': roving('[role="radiogroup"]', '[role="radio"]', 'aria-checked'),

  // The bar is a roving set of menu names; ArrowDown opens the focused one
  // and Escape brings focus back to its name. The open menu's own keys are
  // the menu pattern's, which its DropdownMenu already holds.
  menubar: async (context) => {
    const triggers = '[role="menuitem"][aria-haspopup]';
    await roving('[role="menubar"]', triggers)(context);
    const { host, done } = context;
    const first = enabled(host.querySelectorAll(`[role="menubar"] ${triggers}`))[0];
    first.focus();
    await press('ArrowDown');
    const menu = await waitFor(() => {
      const found = [...document.querySelectorAll('[role="menu"]')].find(shown);
      if (!found) throw new Error('open (ArrowDown): no role="menu" appeared');
      return found;
    });
    await waitFor(() => {
      if (!menu.contains(current())) throw new Error(`open (ArrowDown): focus did not move into the menu, it is on ${describe(current())}`);
    });
    done('open');
    await press('Escape');
    await waitFor(() => {
      if (shown(menu)) throw new Error('dismiss (Escape): the menu is still open');
      if (document.activeElement !== first) throw new Error(`dismiss (Escape): focus went to ${describe(document.activeElement)}, not back to the menu's name`);
    });
    done('dismiss');
  },

  menu: async ({ host, fixture, done }) => {
    const opener = await fixture.open!(host);
    const menu = await waitFor(() => {
      const found = [...document.querySelectorAll('[role="menu"]')].find(shown);
      if (!found) throw new Error('open: no role="menu" appeared');
      return found;
    });
    await waitFor(() => {
      if (!menu.contains(current())) throw new Error(`open: focus did not move into the menu, it is on ${describe(current())}`);
    });
    done('open');

    structure(nameOf(menu), 'the menu has no accessible name');
    if (opener.matches('button')) {
      structure(opener.getAttribute('aria-expanded') === 'true', 'the open trigger does not say aria-expanded="true"');
      structure(opener.hasAttribute('aria-haspopup'), 'the trigger has no aria-haspopup');
    }
    const items = enabled(menu.querySelectorAll('[role^="menuitem"]'));
    if (items.length < 2) throw new Error(`the menu needs two enabled items to test, found ${items.length}`);
    await press('Home');
    await expectCurrent(items[0], 'first (Home)');
    done('first');
    await press('ArrowDown');
    await expectCurrent(items[1], 'next (ArrowDown)');
    done('next');
    await press('ArrowUp');
    await expectCurrent(items[0], 'previous (ArrowUp)');
    done('previous');
    await press('End');
    await expectCurrent(items.at(-1)!, 'last (End)');
    done('last');

    // Type-to-find, from the first item: the first letter of the last
    // item's name lands on the next item after the first that starts with it.
    const letter = spoken(items.at(-1)!)[0];
    const target = items.slice(1).find((item) => spoken(item).startsWith(letter))!;
    await press('Home');
    await expectCurrent(items[0], 'first (Home)');
    await userEvent.keyboard(letter);
    await expectCurrent(target, `typeahead ("${letter}")`);
    done('typeahead');

    await press('Escape');
    await waitFor(() => {
      if (shown(menu)) throw new Error('dismiss (Escape): the menu is still open');
      if (document.activeElement !== opener) throw new Error(`dismiss (Escape): focus went to ${describe(document.activeElement)}, not back to the trigger`);
    });
    done('dismiss');
  },

  combobox: async ({ host, done }) => {
    const field = host.querySelector<HTMLElement>('[role="combobox"]');
    if (!field) throw new Error('no role="combobox" rendered');
    field.focus();
    await press('ArrowDown');
    const list = await waitFor(() => {
      const found = document.querySelector('[role="listbox"]');
      if (field.getAttribute('aria-expanded') !== 'true' || !found) throw new Error('open (ArrowDown): the list did not open');
      return found;
    });
    done('open');

    structure(nameOf(field), 'the combobox has no accessible name');
    structure(field.getAttribute('aria-controls') === list.id && list.id, 'the open combobox does not point at its list with aria-controls');
    const options = enabled(list.querySelectorAll('[role="option"]'));
    if (options.length < 2) throw new Error(`the list needs two enabled options to test, found ${options.length}`);
    // Opening may or may not highlight the first option; step until one is.
    if (!options.includes(current() as HTMLElement)) await press('ArrowDown');
    const start = await waitFor(() => {
      const index = options.indexOf(current() as HTMLElement);
      if (index === -1) throw new Error(`next (ArrowDown): no option is highlighted, ${describe(current())} is`);
      return index;
    });
    const from = start === options.length - 1 ? start - 1 : start;
    if (from !== start) await press('ArrowUp');
    await expectCurrent(options[from], 'previous (ArrowUp)');
    await press('ArrowDown');
    await expectCurrent(options[from + 1], 'next (ArrowDown)');
    done('next');
    await press('ArrowUp');
    await expectCurrent(options[from], 'previous (ArrowUp)');
    done('previous');

    await press('Escape');
    await waitFor(() => {
      if (field.getAttribute('aria-expanded') === 'true') throw new Error('dismiss (Escape): the list is still open');
      if (document.activeElement !== field) throw new Error(`dismiss (Escape): focus went to ${describe(document.activeElement)}, not the field`);
    });
    done('dismiss');
  },

  dialog: async ({ host, fixture, done }) => {
    const opener = await fixture.open!(host);
    // The topmost dialog that is shown: one still leaving from an earlier
    // pass, or one hidden behind it, is not the one this pass opened.
    const dialog = await waitFor(() => {
      const found = [...document.querySelectorAll('[role="dialog"], [role="alertdialog"]')].filter(shown).at(-1);
      if (!found) throw new Error('no role="dialog" appeared');
      return found;
    });
    await waitFor(() => {
      if (!dialog.contains(document.activeElement)) throw new Error(`enter: focus did not move inside, it is on ${describe(document.activeElement)}`);
    });
    done('enter');
    structure(nameOf(dialog), 'the dialog has no accessible name');
    structure(dialog.getAttribute('aria-modal') === 'true', 'the dialog does not say aria-modal="true"');

    for (let step = 0; step < 8; step += 1) {
      await userEvent.tab();
      if (!dialog.contains(document.activeElement)) throw new Error(`trap (Tab): focus left for ${describe(document.activeElement)}`);
    }
    done('trap');
    for (let step = 0; step < 8; step += 1) {
      await userEvent.tab({ shift: true });
      if (!dialog.contains(document.activeElement)) throw new Error(`trap-back (Shift+Tab): focus left for ${describe(document.activeElement)}`);
    }
    done('trap-back');

    await press('Escape');
    await waitFor(() => {
      if (shown(dialog)) throw new Error('dismiss (Escape): it is still open');
      if (document.activeElement !== opener) throw new Error(`dismiss (Escape): focus went to ${describe(document.activeElement)}, not back to what opened it`);
    });
    done('dismiss');
  },

  tree: async ({ host, rtl, done }) => {
    const tree = host.querySelector('[role="tree"]');
    if (!tree) throw new Error('no role="tree" rendered');
    const visible = () =>
      enabled(tree.querySelectorAll('[role="treeitem"]')).filter((el) => {
        const group = el.parentElement?.closest('[role="group"]');
        const owner = group?.closest('[role="treeitem"]');
        return !owner || owner.getAttribute('aria-expanded') === 'true';
      });
    const rows = visible();
    if (rows.length < 2) throw new Error(`the tree needs two visible rows to test, found ${rows.length}`);
    structure(nameOf(tree), 'the tree has no accessible name');
    structure(
      [...tree.querySelectorAll('[role="treeitem"]')].every((row) => !row.querySelector('[role="group"]') || row.hasAttribute('aria-expanded')),
      'a branch does not carry aria-expanded',
    );
    const focusTarget = (row: HTMLElement) =>
      row.matches('[tabindex]') ? row : (row.querySelector<HTMLElement>('[tabindex]') ?? row);
    const onRow = async (row: HTMLElement, when: string) =>
      waitFor(() => {
        if (!row.contains(document.activeElement) || visible().find((r) => r !== row && row.contains(r) && r.contains(document.activeElement)))
          throw new Error(`${when}: expected ${describe(row)}, but focus is on ${describe(document.activeElement)}`);
      });

    focusTarget(rows[0]).focus();
    await press('ArrowDown');
    await onRow(rows[1], 'next (ArrowDown)');
    done('next');
    await press('ArrowUp');
    await onRow(rows[0], 'previous (ArrowUp)');
    done('previous');
    await press('End');
    await onRow(visible().at(-1)!, 'last (End)');
    done('last');
    await press('Home');
    await onRow(rows[0], 'first (Home)');
    done('first');

    // Type-to-find, from the first row: the first letter of the last visible
    // row's name lands on the next row after the first that starts with it.
    const now = visible();
    const letter = spoken(now.at(-1)!)[0];
    const target = now.slice(1).find((row) => spoken(row).startsWith(letter))!;
    await userEvent.keyboard(letter);
    await onRow(target, `typeahead ("${letter}")`);
    done('typeahead');

    const branch = visible().find((row) => row.getAttribute('aria-expanded') === 'false');
    if (!branch) throw new Error('expand: the story needs a closed branch to test');
    const keys = inlineKeys(rtl, false);
    focusTarget(branch).focus();
    await press(keys.next);
    await waitFor(() => {
      if (branch.getAttribute('aria-expanded') !== 'true') throw new Error(`expand (${keys.next}): the branch stayed closed`);
    });
    done('expand');
    await press(keys.previous);
    await waitFor(() => {
      if (branch.getAttribute('aria-expanded') !== 'false') throw new Error(`collapse (${keys.previous}): the branch stayed open`);
    });
    done('collapse');
  },
};

type Entry = { name: string; pattern?: string; partPatterns?: { pattern: string; part: string }[] };
const components = registry.components as Entry[];

/** Who a pattern is pressed against: a component, or one part of it under the key `Name:pattern`. */
const members = (pattern: string) =>
  components.flatMap((component) => [
    ...(component.pattern === pattern ? [{ name: component.name, key: component.name, label: component.name }] : []),
    ...(component.partPatterns ?? [])
      .filter((entry) => entry.pattern === pattern)
      .map((entry) => ({ name: component.name, key: `${component.name}:${pattern}`, label: `${component.name} (${entry.part})` })),
  ]);
const everyMember = new Set(Object.keys(keyboard.patterns).flatMap((pattern) => members(pattern).map((member) => member.key)));

const runPattern = async (pattern: PatternId) => {
  const rows = keyboard.patterns[pattern].rows as Row[];
  const names = members(pattern);
  const failures: string[] = [];

  for (const key of Object.keys(FIXTURES)) {
    if (!everyMember.has(key)) failures.push(`${key}: has a fixture but registry.json names no such pattern for it`);
  }

  for (const { name, key, label } of names) {
    const stories = storiesFor(name);
    if (!stories) {
      failures.push(`${label}: names the ${pattern} pattern but has no story file`);
      continue;
    }
    const composed = composeStories(stories) as Record<string, React.ComponentType>;
    // With no FIXTURES row a member is put on the page by its Default story, or its first.
    const fixture = FIXTURES[key] ?? { story: 'Default' in composed ? 'Default' : Object.keys(composed)[0] };
    const Story = composed[fixture.story];
    if (!Story) {
      failures.push(`${label}: no story named ${fixture.story}`);
      continue;
    }
    for (const rtl of [false, true]) {
      const host = document.createElement('div');
      host.dir = rtl ? 'rtl' : 'ltr';
      // In view: an anchored popup hides itself while its trigger is off screen.
      host.style.cssText = 'position: fixed; inset-block-start: 0; inset-inline: 0; padding: 16px;';
      document.body.appendChild(host);
      const root = createRoot(host);
      const asserted = new Set<string>();
      try {
        root.render(<Story />);
        await waitFor(() => {
          if (!host.firstElementChild) throw new Error('the story rendered nothing');
        });
        await RUNNERS[pattern]({ host, rtl, fixture, done: (id) => asserted.add(id) });
        const missed = rows.filter((row) => !asserted.has(row.id)).map((row) => row.id);
        if (missed.length > 0) failures.push(`${label} (${host.dir}): rows with no assertion: ${missed.join(', ')}`);
      } catch (error) {
        failures.push(`${label} (${host.dir}): ${(error as Error).message.split('\n')[0]}`);
      } finally {
        root.unmount();
        host.remove();
        (document.activeElement as HTMLElement | null)?.blur?.();
      }
    }
  }

  await expect(failures).toEqual([]);
  await expect(names.length).toBeGreaterThan(0);
};

/** What a keyboard can land on: the tab order, as the focus trap reads it. */
const TABBABLE =
  'button:not([disabled]), a[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

/** Mounts each component whose keys are `by`, and reports the ones whose tab order is not what that claims. */
const runClass = async (by: 'none' | 'platform') => {
  const failures: string[] = [];
  const claimed = (registry.components as (Entry & { keys?: { by: string } })[]).filter((c) => c.keys?.by === by);
  for (const { name } of claimed) {
    const stories = storiesFor(name);
    if (!stories) {
      failures.push(`${name}: no story file`);
      continue;
    }
    const composed = composeStories(stories) as Record<string, React.ComponentType>;
    const Story = composed['Default' in composed ? 'Default' : Object.keys(composed)[0]];
    const host = document.createElement('div');
    host.style.cssText = 'position: fixed; inset-block-start: 0; inset-inline: 0; padding: 16px;';
    document.body.appendChild(host);
    const root = createRoot(host);
    try {
      root.render(<Story />);
      await waitFor(() => {
        if (!host.firstElementChild) throw new Error('the story rendered nothing');
      });
      const stops = () =>
        [...host.querySelectorAll(TABBABLE)].filter((el) => !el.closest('[aria-hidden="true"], [inert]') && shown(el));
      if (by === 'none' && stops().length > 0) {
        failures.push(`${name}: says it has nothing to focus, but its default story can focus ${describe(stops()[0])}`);
      }
      if (by === 'platform') {
        // A chart draws its focusable layer a moment after it mounts.
        await waitFor(() => {
          if (stops().length === 0) throw new Error('says the platform owns its keys, but its default story has nothing to focus');
        });
      }
    } catch (error) {
      failures.push(`${name}: ${(error as Error).message.split('\n')[0]}`);
    } finally {
      root.unmount();
      host.remove();
    }
  }
  await expect(failures).toEqual([]);
  await expect(claimed.length).toBeGreaterThan(0);
};

const meta = {
  title: 'Foundations/Keyboard contract',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Runs a contract with motion stopped. The contract is about keys, roles and
 * focus, never about timing, but an overlay opens and closes through a CSS
 * transition (a panel is `visibility: hidden` until its open transition
 * starts, and stays shown until its close transition ends), and the focus
 * scope retries its initial focus for only a few animation frames. When the
 * suite runs its files in parallel, a test page in the background is
 * throttled: transitions barely advance and frames are few, so an overlay
 * read as "focus never moved in" or "still open after Escape" at random
 * (the Dialog pattern failed in five of seven full verifies on 2026-11-25,
 * each time on different overlays). With every transition and animation at
 * zero, which is what a reader who asks for reduced motion gets, the
 * overlay's state is settled by the time the next assertion reads it, and
 * every assertion still holds the component to the same behaviour.
 */
const withMotionStopped = async (run: () => Promise<void>) => {
  const still = document.createElement('style');
  still.textContent =
    '*, *::before, *::after { transition-duration: 0s !important; transition-delay: 0s !important; animation-duration: 0s !important; animation-delay: 0s !important; }';
  document.head.append(still);
  try {
    await run();
  } finally {
    still.remove();
  }
};

const contract = (pattern: PatternId): Story => ({
  render: () => (
    <p style={{ fontFamily: 'var(--font-family-body)', color: 'var(--color-text-secondary)' }}>
      Presses every key of the {keyboard.patterns[pattern].label.toLowerCase()} pattern against {members(pattern).map((member) => member.label).join(', ')}.
    </p>
  ),
  play: () => withMotionStopped(() => runPattern(pattern)),
});

export const TabsPattern = contract('tabs');
export const ToolbarPattern = contract('toolbar');
export const RadioGroupPattern = contract('radio-group');
export const MenuPattern = contract('menu');
export const MenubarPattern = contract('menubar');
export const ComboboxPattern = contract('combobox');
export const DialogPattern = contract('dialog');
export const TreePattern = contract('tree');
export const SliderPattern = contract('slider');
export const SplitterPattern = contract('splitter');
export const CalendarPattern = contract('calendar');
export const ListboxPattern = contract('listbox');
export const AccordionPattern = contract('accordion');
export const DisclosurePattern = contract('disclosure');
export const TooltipPattern = contract('tooltip');
export const ButtonPattern = contract('button');
export const ToggleButtonPattern = contract('toggle-button');
export const LinkPattern = contract('link');
export const CheckboxPattern = contract('checkbox');
export const SwitchPattern = contract('switch');
export const TextboxPattern = contract('textbox');

/** Every component that says it has nothing to focus: its default story puts nothing in the tab order. */
export const NothingToFocus: Story = {
  render: () => <p style={{ fontFamily: 'var(--font-family-body)' }}>Checks every component whose keys are owned by none.</p>,
  play: () => runClass('none'),
};

/** Every component that leaves its keys to the browser or its engine: there is something there to focus. */
export const KeysLeftToThePlatform: Story = {
  render: () => <p style={{ fontFamily: 'var(--font-family-body)' }}>Checks every component whose keys the platform owns.</p>,
  play: () => runClass('platform'),
};
