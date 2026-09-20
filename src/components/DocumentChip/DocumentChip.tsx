import React from 'react';
import { ProgressBar } from '../ProgressBar/ProgressBar';
import './DocumentChip.css';
import '../../fonts/material-symbols.css';

export type DocumentChipFileType =
  | 'pdf'
  | 'doc'
  | 'sheet'
  | 'slide'
  | 'image'
  | 'code'
  | 'archive'
  | 'generic';

/** The Material Symbol standing in for each document type. */
const FILE_TYPE_ICONS: Record<DocumentChipFileType, string> = {
  pdf: 'picture_as_pdf',
  doc: 'description',
  sheet: 'table',
  slide: 'co_present',
  image: 'image',
  code: 'code',
  archive: 'folder_zip',
  generic: 'draft',
};

/** Props owned by DocumentChip itself — everything else falls through to the root element. */
type DocumentChipOwnProps = {
  /** File name, truncated with an ellipsis when it outgrows the tile. */
  name: string;
  /** Document type — picks the leading Material Symbol. */
  fileType?: DocumentChipFileType;
  /** Override the type icon — a Material Symbol name, or any custom element. */
  icon?: string | React.ReactNode;
  /** Free-text metadata line, e.g. "1.2 MB" or "12 pages" — callers keep their own formatting. */
  meta?: string;
  /** Upload progress, 0–100. While set, replaces the metadata line with a progress bar. */
  progress?: number;
  /** Error message — replaces the metadata line and colours the tile with the error pair. */
  error?: string;
  /** Tile size. Compact drops the metadata line — name only — for dense composer rows. */
  size?: 'default' | 'compact';
  /** Click handler — presence makes the chip body (icon + text) an interactive button. */
  onClick?: () => void;
  /** Remove handler — renders a trailing close button. */
  onRemove?: () => void;
  /** Accessible label for the remove button. */
  removeLabel?: string;
  /** Additional CSS classes */
  className?: string;
};

export interface DocumentChipProps
  extends DocumentChipOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof DocumentChipOwnProps> {}

/**
 * DocumentChip is a compact file reference: a two-line tile with a type
 * icon, name, metadata line, upload progress, and an optional remove
 * button. It references documents attached to chat messages or queued
 * above a composer — Chip stays the one-line pill for attributes, and
 * FileInput stays the form control that owns selection.
 *
 * The root is always a `<div>`; passing `onClick` turns the body into a
 * `<button>` so click and remove coexist without nesting controls.
 */
export const DocumentChip = React.forwardRef<HTMLDivElement, DocumentChipProps>(
  (
    {
      name,
      fileType = 'generic',
      icon,
      meta,
      progress,
      error,
      size = 'default',
      onClick,
      onRemove,
      removeLabel = 'Remove file',
      className = '',
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-document-chip';

    const classes = [
      baseClass,
      `${baseClass}--${size}`,
      error ? `${baseClass}--error` : '',
      onClick ? `${baseClass}--clickable` : '',
      onRemove ? `${baseClass}--removable` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const typeIcon = icon ?? FILE_TYPE_ICONS[fileType];
    // Compact is a single line: the name alone carries the reference
    const showDetail = size !== 'compact';

    const body = (
      <>
        <span className={`${baseClass}__icon`} aria-hidden="true">
          {typeof typeIcon === 'string' ? (
            <span className="material-symbols-rounded">{typeIcon}</span>
          ) : (
            typeIcon
          )}
        </span>

        <span className={`${baseClass}__text`}>
          <span className={`${baseClass}__name`}>{name}</span>

          {showDetail && error && <span className={`${baseClass}__error`}>{error}</span>}

          {showDetail && !error && progress !== undefined && (
            <ProgressBar
              className={`${baseClass}__progress`}
              size="compact"
              value={progress}
              showLabel
              ariaLabel={`Uploading ${name}`}
            />
          )}

          {showDetail && !error && progress === undefined && meta && (
            <span className={`${baseClass}__meta`}>{meta}</span>
          )}
        </span>
      </>
    );

    return (
      <div {...rest} ref={ref} className={classes}>
        {onClick ? (
          <button type="button" className={`${baseClass}__main`} onClick={onClick}>
            {body}
          </button>
        ) : (
          body
        )}

        {onRemove && (
          <button
            type="button"
            className={`${baseClass}__remove`}
            onClick={onRemove}
            aria-label={removeLabel}
          >
            <span className="material-symbols-rounded" aria-hidden="true">
              close
            </span>
          </button>
        )}
      </div>
    );
  },
);

DocumentChip.displayName = 'DocumentChip';
