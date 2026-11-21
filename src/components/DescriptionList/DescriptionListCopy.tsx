'use client';

import { CopyButton } from '../CopyButton/CopyButton';

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

/**
 * The copy button beside a description list value. Internal: DescriptionList
 * renders it for a `copyable` item, so the list itself stays
 * server-renderable. An icon-only CopyButton whose glyph and name turn to
 * "Copied" for a moment after a press.
 */
export function DescriptionListCopy({ value, label, copiedLabel, onCopied }: DescriptionListCopyProps) {
  return (
    <CopyButton
      className="ds-description-list__copy"
      value={value}
      iconOnly
      copyLabel={label}
      copiedLabel={copiedLabel}
      onCopied={onCopied}
    />
  );
}
