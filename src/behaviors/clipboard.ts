'use client';

/**
 * Clipboard: the one way the library puts text on the clipboard, and the
 * short "Copied" moment that follows.
 *
 * `writeClipboard` tries the async Clipboard API and falls back to a
 * selected, visually hidden textarea, for an embedded browser or a page
 * served over http where the API is missing or permission-gated. The
 * fallback takes focus to select, so it hands focus back to whatever held it
 * and the next key still reaches the button that was pressed.
 *
 * `useCopied` is the feedback half: `copy(text)` writes, flips `copied` on,
 * and turns it off after MOTION_FEEDBACK_RESET_MS, restarting on a second
 * press and clearing its timer on unmount. CopyButton, CodeBlock and
 * DescriptionList read it, so a copy behaves the same everywhere.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { MOTION_FEEDBACK_RESET_MS } from '../tokens/motion';

/** Put text on the clipboard: the async API, else a selected textarea. */
export function writeClipboard(text: string): void {
  const fallback = () => {
    const focused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.className = 'ds-visually-hidden';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    focused?.focus({ preventScroll: true });
  };
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(fallback);
  else fallback();
}

/** A copy action with a short-lived `copied` flag for the confirmation. */
export function useCopied(): { copied: boolean; copy: (text: string) => void } {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const copy = useCallback((text: string) => {
    writeClipboard(text);
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), MOTION_FEEDBACK_RESET_MS);
  }, []);
  return { copied, copy };
}
