'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { AttachmentTile } from './AttachmentTile';
import { formatBytes } from './fileTypes';
import type { AttachmentItem } from './fileTypes';
import { renderTypeMark } from './typeMark';
import { AttachmentViewer } from './AttachmentViewer';
import './Attachment.css';

/* Re-exported so the headless hook reaches the package root through the
   barrel, which only walks .tsx modules (see AttachmentTile). */
/* eslint-disable react-refresh/only-export-components */
export { revokeAttachmentUrls, useAttachments } from './useAttachments';
/* eslint-enable react-refresh/only-export-components */
export type {
  AttachmentRejection,
  AttachmentRejectionReason,
  AttachmentUploadContext,
  UseAttachmentsOptions,
  UseAttachmentsResult,
} from './useAttachments';

/** Props owned by AttachmentGroup itself — everything else falls through to the root element. */
type AttachmentGroupOwnProps = {
  /** The files on the message, in order. */
  items: AttachmentItem[];
  /** Which edge the layout hugs: `end` for the sender's own turns. */
  align?: 'start' | 'end';
  /**
   * Most cells shown before the rest collapse. Over the limit, the last
   * cell becomes a "+N" button standing for the hidden files.
   */
  max?: number;
  /** Whether the overflow is expanded, for controlled use. Pair with `onOpenChange`. */
  open?: boolean;
  /** Whether the overflow starts expanded, for uncontrolled use. */
  defaultOpen?: boolean;
  /** Fires when the overflow expands or collapses. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Open a pressed file in the built-in AttachmentViewer, which steps
   * through the rest of the group. Turn it off to handle presses yourself
   * through `onItemClick`.
   */
  viewer?: boolean;
  /** Fires when a file is pressed, whether or not the viewer opens. */
  onItemClick?: (item: AttachmentItem) => void;
  /** Passed to the viewer: draws a file it cannot, such as the pages of a PDF. */
  renderPreview?: (item: AttachmentItem) => React.ReactNode;
  /** Passed to the viewer: fires when Download is pressed, and renders the buttons. */
  onDownload?: (item: AttachmentItem) => void;
  /** Passed to the viewer: fires when "Try again" is pressed on a file that failed to load. */
  onRetry?: (item: AttachmentItem) => void;
  /** Tile size, passed to every tile. */
  size?: 'default' | 'compact';
  /** Accessible label for the list. */
  label?: string;
  /** Builds the accessible label of the "+N" button from the hidden count. */
  showMoreLabel?: (hidden: number) => string;
  /** Text of the collapse button under an expanded group. */
  showLessLabel?: string;
  /** Additional CSS classes */
  className?: string;
};

export interface AttachmentGroupProps
  extends AttachmentGroupOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof AttachmentGroupOwnProps> {}

const isPicture = (item: AttachmentItem) =>
  item.status === 'ready' && item.kind === 'image' && Boolean(item.previewSrc);

/**
 * AttachmentGroup lays out the files on a sent message. One picture keeps
 * its own aspect ratio; anything else becomes a grid of square
 * AttachmentTiles. Past `max`, the tail collapses behind a "+N" cell laid
 * over the next file, which expands the grid in place; a "Show fewer"
 * button folds it again.
 *
 * Pressing a file opens it in an AttachmentViewer that steps through the
 * whole group. A file that is no longer available stays on the message as
 * a record and opens nothing.
 */
export const AttachmentGroup = React.forwardRef<HTMLDivElement, AttachmentGroupProps>(
  (
    {
      items,
      align = 'start',
      max = 4,
      open,
      defaultOpen = false,
      onOpenChange,
      viewer = true,
      onItemClick,
      renderPreview,
      onDownload,
      onRetry,
      size = 'default',
      label = 'Attachments',
      showMoreLabel = (hidden) => `Show ${hidden} more`,
      showLessLabel = 'Show fewer',
      className = '',
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-attachment-group';
    const gridId = useId();

    const isControlled = open !== undefined;
    const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
    const isOpen = isControlled ? open : uncontrolledOpen;

    const [viewing, setViewing] = useState<string | null>(null);
    const moreRef = useRef<HTMLButtonElement | null>(null);
    const lessRef = useRef<HTMLButtonElement | null>(null);
    /* Focus follows the disclosure, but only when the person drove it: the
       control they pressed is replaced by its opposite, and focus would
       otherwise fall back to the document. */
    const moveFocus = useRef(false);

    const setOpen = (next: boolean) => {
      moveFocus.current = true;
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    };

    useEffect(() => {
      if (!moveFocus.current) return;
      moveFocus.current = false;
      (isOpen ? lessRef.current : moreRef.current)?.focus();
    }, [isOpen]);

    const overflowing = items.length > Math.max(1, max);
    const visible = overflowing && !isOpen ? items.slice(0, Math.max(1, max) - 1) : items;
    const hidden = items.length - visible.length;

    const viewed = items.find((item) => item.id === viewing);

    /** What pressing a file does, or undefined when it does nothing. */
    const clickHandler = (item: AttachmentItem) => {
      // A file that is gone stays as a record; there is nothing to open.
      const opens = viewer && item.status !== 'unavailable';
      if (!opens && !onItemClick) return undefined;
      return () => {
        onItemClick?.(item);
        if (opens) setViewing(item.id);
      };
    };

    const classes = [baseClass, `${baseClass}--${align}`, `${baseClass}--${size}`, className]
      .filter(Boolean)
      .join(' ');

    const single = items.length === 1 && isPicture(items[0]) ? items[0] : undefined;

    let layout: React.ReactNode;

    if (single) {
      const onClick = clickHandler(single);
      const image = (
        <img
          className={`${baseClass}__single-image`}
          src={single.previewSrc}
          alt={single.previewAlt ?? single.name}
          width={single.width}
          height={single.height}
        />
      );
      const badge = (
        <span className={`${baseClass}__single-mark`} aria-hidden="true">
          {renderTypeMark(single.name, single.kind, { form: 'badge' })}
        </span>
      );
      layout = onClick ? (
        <button type="button" className={`${baseClass}__single`} onClick={onClick}>
          {image}
          {badge}
        </button>
      ) : (
        <span className={`${baseClass}__single`}>
          {image}
          {badge}
        </span>
      );
    } else {
      layout = (
        <>
          <ul
            className={`${baseClass}__grid`}
            id={gridId}
            aria-label={label}
            // Four cells that cannot share a row sit two by two (see the CSS)
            data-cells={visible.length + (hidden > 0 ? 1 : 0)}
          >
            {visible.map((item) => (
              <li key={item.id} className={`${baseClass}__cell`}>
                <AttachmentTile
                  name={item.name}
                  kind={item.kind}
                  status={item.status}
                  progress={item.progress}
                  error={item.error}
                  previewSrc={item.previewSrc}
                  previewAlt={item.previewAlt}
                  excerpt={item.excerpt}
                  previewMark
                  meta={item.size === undefined ? undefined : formatBytes(item.size)}
                  size={size}
                  onClick={clickHandler(item)}
                />
              </li>
            ))}

            {hidden > 0 && (
              <li className={`${baseClass}__cell ${baseClass}__cell--more`}>
                {/* The next file shows through the scrim, so the cell reads
                    as "more of these" rather than a blank button. It is a
                    picture of a tile, not a second copy of one. */}
                <span className={`${baseClass}__peek`} aria-hidden="true">
                  <AttachmentTile
                    name={items[visible.length].name}
                    kind={items[visible.length].kind}
                    previewSrc={items[visible.length].previewSrc}
                    previewAlt=""
                    size={size}
                  />
                </span>
                <button
                  type="button"
                  ref={moreRef}
                  className={`${baseClass}__more`}
                  aria-expanded={false}
                  aria-controls={gridId}
                  aria-label={showMoreLabel(hidden)}
                  onClick={() => setOpen(true)}
                >
                  +{hidden}
                </button>
              </li>
            )}
          </ul>

          {overflowing && isOpen && (
            <button
              type="button"
              ref={lessRef}
              className={`${baseClass}__less`}
              aria-expanded
              aria-controls={gridId}
              onClick={() => setOpen(false)}
            >
              {showLessLabel}
            </button>
          )}
        </>
      );
    }

    return (
      <div {...rest} ref={ref} className={classes}>
        {layout}

        {viewer && (
          <AttachmentViewer
            open={viewed !== undefined}
            onOpenChange={(next) => {
              if (!next) setViewing(null);
            }}
            items={items}
            activeId={viewed?.id ?? items[0]?.id}
            onActiveChange={setViewing}
            renderPreview={renderPreview}
            onDownload={onDownload}
            onRetry={onRetry}
          />
        )}
      </div>
    );
  },
);

AttachmentGroup.displayName = 'AttachmentGroup';
