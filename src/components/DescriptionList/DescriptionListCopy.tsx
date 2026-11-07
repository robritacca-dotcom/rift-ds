'use client';

import { useEffect, useRef, useState } from 'react';
import { CircularButton } from '../CircularButton/CircularButton';
import { MOTION_FEEDBACK_RESET_MS } from '../../tokens/motion';

/** Props owned by DescriptionListCopy. */
export interface DescriptionListCopyProps {
  /** The text put on the clipboard. */
  value: string;
  /** The button's accessible name before a copy. */
  label: string;
  /** The button's accessible name for a moment after a copy. */
  copiedLabel: string;
  /** Called after the value is put on the clipboard. */
  onCopied?: (value: string) => void;
}

/** Put text on the clipboard: the async API, else a selected textarea, for an embedded browser or a page served over http. */
function writeClipboard(text: string) {
  const fallback = () => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.className = 'ds-visually-hidden';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  };
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(fallback);
  else fallback();
}

/**
 * The copy button beside a description list value. Internal: DescriptionList
 * renders it for a `copyable` item, so the list itself stays
 * server-renderable. A compact tertiary CircularButton whose glyph and name
 * turn to "Copied" for a moment after a press.
 */
export function DescriptionListCopy({ value, label, copiedLabel, onCopied }: DescriptionListCopyProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const copy = () => {
    writeClipboard(value);
    onCopied?.(value);
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), MOTION_FEEDBACK_RESET_MS);
  };
  return (
    <CircularButton
      className="ds-description-list__copy"
      icon={copied ? 'check' : 'content_copy'}
      variant="tertiary"
      size="compact"
      ariaLabel={copied ? copiedLabel : label}
      onClick={copy}
    />
  );
}
