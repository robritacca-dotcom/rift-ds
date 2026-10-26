/**
 * The reading direction, for the code that moves along the inline axis:
 * arrow keys, drags and anything placed in pixels. Stylesheets read it
 * through logical properties and `--ds-inline-sign` (direction.css); script
 * reads it here, from the element itself at the moment it acts, so a `dir`
 * attribute anywhere up the tree applies and a change to it needs no
 * re-render. No React and no browser API at import time, so a server
 * component can import it too. design.md's "Layout follows the reading
 * direction" owns the contract.
 */

/** Whether `element` lays out right to left. False on the server and for a missing element. */
export function isRtl(element: Element | null | undefined): boolean {
  if (!element || typeof getComputedStyle === 'undefined') return false;
  return getComputedStyle(element).direction === 'rtl';
}

/** 1 when `element` reads left to right, -1 when it reads right to left: the sign to multiply a horizontal pointer delta by. */
export const inlineSign = (element: Element | null | undefined): 1 | -1 => (isRtl(element) ? -1 : 1);

/**
 * An arrow key along the inline axis as a step through the reading order:
 * `1` for the next item (ArrowRight in English, ArrowLeft in Arabic), `-1`
 * for the previous one, and 0 for any other key.
 */
export function inlineStep(key: string, element: Element | null | undefined): -1 | 0 | 1 {
  if (key !== 'ArrowRight' && key !== 'ArrowLeft') return 0;
  const forward = key === 'ArrowRight' ? 1 : -1;
  return (isRtl(element) ? -forward : forward) as -1 | 1;
}

/**
 * The Material Symbols ligatures that point along the reading direction and
 * so mirror in a right-to-left context: a "next" chevron points left in
 * Arabic. A component that draws one adds the `ds-mirror-rtl` class (the
 * rule lives in src/fonts/material-symbols.css, which every icon imports);
 * `mirrorClass` decides it for an icon a consumer passes by name.
 */
export const DIRECTIONAL_ICONS = new Set([
  'chevron_left',
  'chevron_right',
  'arrow_back',
  'arrow_forward',
  'arrow_back_ios',
  'arrow_forward_ios',
  'arrow_back_ios_new',
  'first_page',
  'last_page',
  'keyboard_arrow_left',
  'keyboard_arrow_right',
  'keyboard_double_arrow_left',
  'keyboard_double_arrow_right',
  'navigate_before',
  'navigate_next',
  'east',
  'west',
  'trending_flat',
  'subdirectory_arrow_right',
  'subdirectory_arrow_left',
  'reply',
  'forward',
  'undo',
  'redo',
  'logout',
  'login',
  'send',
  'menu_open',
  'format_indent_increase',
  'format_indent_decrease',
  'view_sidebar',
  'left_panel_open',
  'left_panel_close',
  'right_panel_open',
  'right_panel_close',
]);

/** Whether the icon named `name` points along the reading direction and should mirror in a right-to-left context. */
export const mirrorsInRtl = (name: unknown): boolean => typeof name === 'string' && DIRECTIONAL_ICONS.has(name);

/**
 * A key as it would be pressed in a left-to-right layout: ArrowLeft and
 * ArrowRight swap when `element` reads right to left, and every other key
 * passes through. A component that steps along the inline axis switches on
 * this instead of the raw key, so "the next tab" is ArrowRight in English
 * and ArrowLeft in Arabic with no second branch.
 */
export function logicalArrowKey(key: string, element: Element | null | undefined): string {
  if ((key !== 'ArrowLeft' && key !== 'ArrowRight') || !isRtl(element)) return key;
  return key === 'ArrowLeft' ? 'ArrowRight' : 'ArrowLeft';
}

/** `ds-mirror-rtl` when the icon named `name` mirrors in a right-to-left context, else an empty string, for a className. */
export const mirrorClass = (name: unknown): string => (mirrorsInRtl(name) ? 'ds-mirror-rtl' : '');
