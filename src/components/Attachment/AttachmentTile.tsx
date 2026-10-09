import React from 'react';
import { FILE_KINDS, splitFileName } from './fileTypes';
import { renderTypeMark } from './typeMark';
import type { AttachmentStatus, FileKind } from './fileTypes';
import '../../fonts/material-symbols.css';
import './Attachment.css';

/* The barrel only walks a folder's .tsx modules, so the file-type model
   reaches the package root by being re-exported here (StreamingText's
   engine is the precedent). Fast-refresh granularity is the price, and a
   published library does not pay it. */
/* eslint-disable react-refresh/only-export-components */
export {
  FILE_KINDS,
  formatBytes,
  getFileExtension,
  getFileKind,
  getFileTypeLabel,
  matchesAccept,
  splitFileName,
} from './fileTypes';
/* eslint-enable react-refresh/only-export-components */
export type {
  AttachmentItem,
  AttachmentStatus,
  FileKind,
  FileKindMeta,
  FileLike,
} from './fileTypes';

/** Props owned by AttachmentTile itself — everything else falls through to the root element. */
type AttachmentTileOwnProps = {
  /** File name, extension included. Truncates in the middle so the extension stays visible. */
  name: string;
  /**
   * What kind of file it is, which picks the type mark: a coloured lettered
   * glyph for the well-known formats, a neutral extension badge for the
   * rest. Derive it with `getFileKind`.
   */
  kind?: FileKind;
  /** Short uppercase label on the type mark. Defaults from the kind and the extension. */
  typeLabel?: string;
  /** Where the file is in its life. Anything but `ready` shows the name with a status line. */
  status?: AttachmentStatus;
  /** Upload progress, 0 to 100, reported to assistive technology while `uploading`. */
  progress?: number;
  /**
   * Image that fills the tile while `ready`: an object URL for a picture, or
   * a first page the host rendered for a document. A non-image kind keeps
   * its type mark over the corner.
   */
  previewSrc?: string;
  /** Alt text for the preview. Defaults to the file name. */
  previewAlt?: string;
  /**
   * Whether the type mark sits over the corner of a preview. Defaults to on
   * for a document's first page, which still has to say what format it is,
   * and off for a picture, which is its own description. A sent message
   * turns it on for pictures too.
   */
  previewMark?: boolean;
  /** First lines of a pasted block, drawn as a faded excerpt filling the tile while `ready`. */
  excerpt?: string;
  /** Secondary line under the name while `ready`, e.g. "1.2 MB". Callers keep their own formatting. */
  meta?: string;
  /** Why the file failed. Replaces `errorLabel` on the status line. */
  error?: string;
  /**
   * Tile size. Compact shrinks the square and drops the secondary line of a
   * ready file. Unrelated to any native `size` attribute: the root is a div.
   */
  size?: 'default' | 'compact';
  /** Click handler. Its presence makes the tile body a button. */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** Remove handler. Its presence renders the corner remove button. */
  onRemove?: () => void;
  /** Status line while `uploading`. */
  uploadingLabel?: string;
  /** Status line while `error`, when no `error` message is given. */
  errorLabel?: string;
  /** Status line while `unavailable`. */
  unavailableLabel?: string;
  /** Accessible label for the remove button. Defaults to "Remove" and the file name. */
  removeLabel?: string;
  /** Additional CSS classes */
  className?: string;
};

export interface AttachmentTileProps
  extends AttachmentTileOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof AttachmentTileOwnProps> {}

/**
 * AttachmentTile is one file as a square: a picture fills it, a well-known
 * document format (PDF, spreadsheet, document, presentation) wears a
 * coloured lettered mark, and every other file wears its extension as a
 * neutral badge. Under the mark sit the name, truncated in the middle so
 * the extension survives, and one secondary line.
 *
 * The same tile serves a composer's queue and a sent message. `status`
 * swaps the mark for a spinner, an alert or an unavailable glyph and the
 * secondary line for the matching words, so a file reads the same wherever
 * it appears and whatever happened to it.
 *
 * The root is always a `<div>`; `onClick` turns the body into a `<button>`
 * so click and remove coexist without nesting controls. No hooks, so it
 * renders from a Server Component.
 */
export const AttachmentTile = React.forwardRef<HTMLDivElement, AttachmentTileProps>(
  (
    {
      name,
      kind = 'generic',
      typeLabel,
      status = 'ready',
      progress,
      previewSrc,
      previewAlt,
      previewMark,
      excerpt,
      meta,
      error,
      size = 'default',
      onClick,
      onRemove,
      uploadingLabel = 'Uploading…',
      errorLabel = 'Upload failed',
      unavailableLabel = 'Unavailable',
      removeLabel,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-attachment-tile';
    const ready = status === 'ready';
    const colored = FILE_KINDS[kind].colored;

    // Full-bleed content belongs to a ready file only: every other state
    // falls back to the text stack, which is where its status line lives.
    const showPreview = ready && Boolean(previewSrc);
    const showExcerpt = ready && !showPreview && Boolean(excerpt);

    const classes = [
      baseClass,
      `${baseClass}--${size}`,
      `${baseClass}--${status}`,
      colored ? `${baseClass}--${kind}` : `${baseClass}--neutral`,
      showPreview ? `${baseClass}--preview` : '',
      showExcerpt ? `${baseClass}--excerpt` : '',
      onClick ? `${baseClass}--clickable` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const typeMark = renderTypeMark(name, kind, { typeLabel });
    const cornerMark = renderTypeMark(name, kind, { typeLabel, form: 'badge' });

    let mark: React.ReactNode = typeMark;
    let secondary: string | undefined = meta;

    if (status === 'uploading') {
      const value =
        progress === undefined ? undefined : Math.max(0, Math.min(100, Math.round(progress)));
      mark = (
        <span
          className={`${baseClass}__spinner`}
          role="progressbar"
          aria-label={`Uploading ${name}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={value}
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
            <circle
              className={`${baseClass}__spinner-track`}
              cx="12"
              cy="12"
              r="9"
              strokeWidth="1.75"
            />
            <circle
              className={`${baseClass}__spinner-arc`}
              cx="12"
              cy="12"
              r="9"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </span>
      );
      secondary = uploadingLabel;
    } else if (status === 'error') {
      mark = (
        <span className={`${baseClass}__state material-symbols-rounded`} aria-hidden="true">
          error
        </span>
      );
      secondary = error ?? errorLabel;
    } else if (status === 'unavailable') {
      mark = (
        <span className={`${baseClass}__state material-symbols-rounded`} aria-hidden="true">
          block
        </span>
      );
      secondary = unavailableLabel;
    }

    // Compact keeps a ready file to mark and name; a status line always shows.
    const showSecondary = Boolean(secondary) && !(size === 'compact' && ready);
    const { head, tail } = splitFileName(name);

    const stack = (
      <span className={`${baseClass}__stack`}>
        <span className={`${baseClass}__mark`}>{mark}</span>
        <span className={`${baseClass}__name`} title={name}>
          {/* One announced copy of the name; the two visible halves are the
              truncation mechanics and say nothing on their own. */}
          <span className={`${baseClass}__sr-only`}>{name}</span>
          {head !== '' && (
            <span className={`${baseClass}__name-head`} aria-hidden="true">
              {head}
            </span>
          )}
          <span className={`${baseClass}__name-tail`} aria-hidden="true">
            {tail}
          </span>
        </span>
        {showSecondary && <span className={`${baseClass}__meta`}>{secondary}</span>}
      </span>
    );

    let content: React.ReactNode = stack;

    if (showPreview) {
      content = (
        <>
          <img className={`${baseClass}__preview`} src={previewSrc} alt={previewAlt ?? name} />
          {(previewMark ?? kind !== 'image') && (
            <span className={`${baseClass}__corner`}>{cornerMark}</span>
          )}
        </>
      );
    } else if (showExcerpt) {
      content = (
        <>
          <span className={`${baseClass}__sr-only`}>{name}</span>
          <span className={`${baseClass}__excerpt`}>{excerpt}</span>
          <span className={`${baseClass}__corner`}>{cornerMark}</span>
        </>
      );
    }

    return (
      <div {...rest} ref={ref} className={classes}>
        {onClick ? (
          <button type="button" className={`${baseClass}__body`} onClick={onClick}>
            {content}
          </button>
        ) : (
          <span className={`${baseClass}__body`}>{content}</span>
        )}

        {onRemove && (
          <button
            type="button"
            className={`${baseClass}__remove`}
            onClick={onRemove}
            aria-label={removeLabel ?? `Remove ${name}`}
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

AttachmentTile.displayName = 'AttachmentTile';
