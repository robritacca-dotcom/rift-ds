/**
 * Shared focusability queries for the overlay behavior layer.
 *
 * One home for the selector the modal components previously each carried a
 * copy of. Plain DOM utilities — no React, safe to import anywhere.
 */

/** Everything a focus trap must cycle through. */
export const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * The subset worth landing initial focus on: real controls, not arbitrary
 * tabindex carriers (a scrollable body region is tabbable but focusing it on
 * open would strand a keyboard user on a non-control).
 */
export const INITIAL_FOCUS =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])';

/**
 * `checkVisibility` is Baseline but this must not throw in older test
 * environments; `offsetParent` is the fallback (null for `display: none`
 * subtrees, which is the case that matters for the trap).
 */
const isVisible = (el: HTMLElement): boolean =>
  typeof el.checkVisibility === 'function' ? el.checkVisibility() : el.offsetParent !== null;

/**
 * The focusable elements inside a container, in DOM order, excluding
 * invisible ones — a control hidden by `display: none` must not count as the
 * trap's first or last stop.
 */
export function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(isVisible);
}

/**
 * Where initial focus should land when a scope activates: the first visible
 * real control, then the first visible focusable of any kind, else null (the
 * caller falls back to the container itself).
 */
export function getInitialFocus(container: HTMLElement): HTMLElement | null {
  const preferred = Array.from(container.querySelectorAll<HTMLElement>(INITIAL_FOCUS)).find(
    isVisible,
  );
  return preferred ?? getFocusable(container)[0] ?? null;
}
