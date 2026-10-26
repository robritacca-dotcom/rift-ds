'use client';

import { useEffect, useRef } from 'react';
import { getFocusable, getInitialFocus } from './focusable';

/**
 * Focus containment for modal overlays: initial focus, Tab wrapping, focus
 * restore, and background isolation.
 *
 * Restore is guarded twice. The element that opened a dialog can be gone by
 * the time it closes (a row the dialog itself deleted), and it can still be in
 * the document but hidden: a button inside a popover that closed underneath
 * the dialog sits in a `display: none` panel, and `.focus()` on it silently
 * drops focus to `<body>`. A detached element is skipped; a hidden one hands
 * focus to the first visible control of its nearest visible ancestor, which
 * for a closed popover is its trigger. It also runs when the component
 * unmounts while open, which the per-component implementations this replaced
 * never handled.
 *
 * Background isolation uses `inert`, not `aria-hidden`: a JS focus trap only
 * fences the Tab key, while a screen reader's virtual cursor walks the page
 * behind the dialog freely. `inert` closes all three doors at once —
 * assistive-tech traversal, focusability, and pointer events. Scopes stack:
 * only the topmost active scope's overlay is interactive, and closing it
 * hands the page back to the scope below, not to the whole document. The
 * inert set is recomputed only when a scope activates or deactivates, so a
 * portal that mounts *while* a modal is open (a toast, say) is not inerted
 * until the stack next changes — under `aria-modal` that content is outside
 * the dialog's world anyway. Live regions are never inerted: a toast region
 * (`aria-live`, a direct child of the body) must keep announcing, and keep
 * its actions pressable, while a modal is open.
 */

type FocusScopeOptions = {
  /** Whether the scope is active — the overlay's open state. */
  active: boolean;
  /** Wrap Tab / Shift+Tab within the scope. Default true. */
  trap?: boolean;
  /**
   * Restore focus on deactivate. Default true: the previously focused
   * element, or its nearest visible stand-in. A function names the target
   * instead, read at the moment of closing, for a host that knows better
   * than the opener: a table whose row deleted itself from this dialog
   * sends focus to the next row rather than the table's first control. A
   * function that returns null falls back to the default.
   */
  restoreFocus?: boolean | (() => HTMLElement | null);
  /**
   * Where initial focus lands. Defaults to the first visible real control,
   * then the first focusable of any kind, then the container itself.
   */
  initialFocus?: () => HTMLElement | null;
  /** Make everything outside the scope inert while active. Default true. */
  inertOutside?: boolean;
};

type InertScope = { panel: HTMLElement };

const inertScopes: InertScope[] = [];
/** Elements this module made inert — never touches a consumer's own `inert`. */
const inerted = new Set<HTMLElement>();

const applyInert = () => {
  const top = inertScopes[inertScopes.length - 1];
  for (const child of Array.from(document.body.children)) {
    if (!(child instanceof HTMLElement)) continue;
    if (child.tagName === 'SCRIPT' || child.tagName === 'STYLE') continue;
    if (child.hasAttribute('aria-live')) continue;
    const shouldBeInert = top !== undefined && !child.contains(top.panel);
    if (shouldBeInert && !child.inert) {
      child.inert = true;
      inerted.add(child);
    } else if (!shouldBeInert && inerted.has(child)) {
      child.inert = false;
      inerted.delete(child);
    }
  }
  // Anything left inert but detached from the body (a removed portal) has no
  // effect; drop the bookkeeping once the stack empties.
  if (top === undefined && inerted.size > 0) {
    for (const el of inerted) el.inert = false;
    inerted.clear();
  }
};

/**
 * The panel of the topmost modal scope that isolates the page, or null when
 * none is open. Keyboard shortcuts read it: while a modal is open, only the
 * shortcuts that live inside it (or are global) may fire.
 */
export const activeModalPanel = (): HTMLElement | null =>
  inertScopes[inertScopes.length - 1]?.panel ?? null;

const isVisible = (el: HTMLElement) => el.getClientRects().length > 0;

/** Where focus goes back to on close: the opener, or the nearest visible stand-in for it. */
const restoreTarget = (previous: HTMLElement): HTMLElement | null => {
  if (!document.contains(previous)) return null;
  if (isVisible(previous)) return previous;
  for (let el = previous.parentElement; el && el !== document.body; el = el.parentElement) {
    if (isVisible(el)) return getFocusable(el)[0] ?? null;
  }
  return null;
};

export function useFocusScope(
  ref: React.RefObject<HTMLElement | null>,
  options: FocusScopeOptions,
): void {
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  });

  const { active } = options;
  useEffect(() => {
    if (!active) return;
    const panel = ref.current;
    if (!panel) return;

    const previousFocus = document.activeElement as HTMLElement | null;

    // At effect time the panel can still be computed `visibility: hidden` —
    // the open transition has not started — and focusing a hidden element is
    // a silent no-op. Retry across a few frames until the focus takes; the
    // element is re-resolved per attempt because visibility gates what the
    // focusable query can see.
    let focusRaf = 0;
    let focusAttempts = 0;
    const tryInitialFocus = () => {
      const initial = optionsRef.current.initialFocus?.() ?? getInitialFocus(panel) ?? panel;
      initial.focus();
      if (document.activeElement === initial) return;
      focusAttempts += 1;
      if (focusAttempts < 5) focusRaf = requestAnimationFrame(tryInitialFocus);
    };
    tryInitialFocus();

    const scope: InertScope = { panel };
    if (optionsRef.current.inertOutside !== false) {
      inertScopes.push(scope);
      applyInert();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || optionsRef.current.trap === false) return;
      const focusable = getFocusable(panel);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(focusRaf);
      document.removeEventListener('keydown', handleKeyDown);
      const index = inertScopes.indexOf(scope);
      if (index !== -1) {
        inertScopes.splice(index, 1);
        applyInert();
      }
      const restore = optionsRef.current.restoreFocus;
      const chosen = typeof restore === 'function' ? restore() : null;
      if (chosen) {
        chosen.focus();
      } else if (restore !== false && previousFocus) {
        restoreTarget(previousFocus)?.focus();
      }
    };
  }, [active, ref]);
}
