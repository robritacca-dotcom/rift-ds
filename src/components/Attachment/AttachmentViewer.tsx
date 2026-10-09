'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { Button } from '../Button/Button';
import { CircularButton } from '../CircularButton/CircularButton';
import { formatBytes } from './fileTypes';
import type { AttachmentItem } from './fileTypes';
import { renderTypeMark } from './typeMark';
import { useMounted } from '../../behaviors/useMounted';
import { useLayer } from '../../behaviors/useLayer';
import { useFocusScope } from '../../behaviors/useFocusScope';
import { useScrollLock } from '../../behaviors/useScrollLock';
import '../../fonts/material-symbols.css';
import './Attachment.css';

/** Props owned by AttachmentViewer itself — everything else falls through to the panel. */
type AttachmentViewerOwnProps = {
  /** Whether the viewer is open. */
  open: boolean;
  /** Fires when the viewer asks to close: the close button, Escape, or the backdrop. */
  onOpenChange: (open: boolean) => void;
  /** The files the viewer steps through, in order. */
  items: AttachmentItem[];
  /** Id of the file on show, for controlled use. Pair with `onActiveChange`. */
  activeId?: string;
  /** Id of the file shown first, for uncontrolled use. Defaults to the first item. */
  defaultActiveId?: string;
  /** Fires with the id of the file stepped to. */
  onActiveChange?: (id: string) => void;
  /**
   * Draws a file the viewer cannot: the pages of a PDF, a media player, a
   * rendered spreadsheet. Return nothing to fall back to the built-in view.
   */
  renderPreview?: (item: AttachmentItem) => React.ReactNode;
  /** Fires with the file on show when Download is pressed. Its presence renders the buttons. */
  onDownload?: (item: AttachmentItem) => void;
  /** Fires with a file that failed to load when "Try again" is pressed. Its presence renders the button. */
  onRetry?: (item: AttachmentItem) => void;
  /** Whether Escape, the backdrop and the close button dismiss the viewer. */
  dismissible?: boolean;
  /** Text of the Download buttons. */
  downloadLabel?: string;
  /** Accessible label for the close button. */
  closeLabel?: string;
  /** Accessible label for the previous-file button. */
  previousLabel?: string;
  /** Accessible label for the next-file button. */
  nextLabel?: string;
  /** Text of the retry button. */
  retryLabel?: string;
  /** Headline when a file has nothing the viewer can draw. */
  noPreviewLabel?: string;
  /** Headline when a file failed to load or is no longer available. */
  failedLabel?: string;
  /** Sentence under `failedLabel`, when the file carries no error message of its own. */
  failedDescription?: string;
  /** Builds the position text, e.g. "2 of 5", from a one-based index and the total. */
  formatPosition?: (position: number, total: number) => string;
  /** Additional CSS classes — applied to the portal container, not the panel. */
  className?: string;
};

export interface AttachmentViewerProps
  extends AttachmentViewerOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof AttachmentViewerOwnProps> {}

/**
 * AttachmentViewer opens a file from a conversation: a centred dialog on a
 * wide screen, a full-screen sheet on a narrow one. The header names the
 * file with its type mark, size and position; the stage shows a picture, a
 * host-drawn preview, or a plain statement that there is nothing to show;
 * the footer steps through the rest of the message's files.
 *
 * The viewer draws pictures itself. Everything else is the host's to
 * render through `renderPreview`, so the library carries no document
 * renderer. A file that failed or has expired says so and offers
 * "Try again" when the host can.
 *
 * Forwards a ref to the panel and spreads unrecognised props onto it.
 */
export const AttachmentViewer = React.forwardRef<HTMLDivElement, AttachmentViewerProps>(
  (
    {
      open,
      onOpenChange,
      items,
      activeId,
      defaultActiveId,
      onActiveChange,
      renderPreview,
      onDownload,
      onRetry,
      dismissible = true,
      downloadLabel = 'Download',
      closeLabel = 'Close',
      previousLabel = 'Previous file',
      nextLabel = 'Next file',
      retryLabel = 'Try again',
      noPreviewLabel = 'No preview for this file type',
      failedLabel = 'Couldn’t load this file',
      failedDescription = 'The link may have expired.',
      formatPosition = (position, total) => `${position} of ${total}`,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-attachment-viewer';
    const titleId = useId();
    const panelRef = useRef<HTMLDivElement | null>(null);

    const setPanelRef = (node: HTMLDivElement | null) => {
      panelRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    };

    const isControlled = activeId !== undefined;
    const [uncontrolledId, setUncontrolledId] = useState(defaultActiveId);
    const currentId = isControlled ? activeId : uncontrolledId;
    const foundIndex = items.findIndex((item) => item.id === currentId);
    const index = foundIndex === -1 ? 0 : foundIndex;
    const item = items[index] as AttachmentItem | undefined;
    const total = items.length;

    const mounted = useMounted();

    // Shared overlay behaviors (src/behaviors/): Escape routes through the
    // layer stack, focus is trapped with the page inert behind the panel,
    // and the scroll lock is counted.
    useLayer({
      open,
      dismissOnEscape: dismissible,
      onDismiss: () => onOpenChange(false),
    });
    useFocusScope(panelRef, { active: open });
    useScrollLock(open);

    const step = (delta: number) => {
      if (total < 2) return;
      const next = items[(index + delta + total) % total];
      if (!isControlled) setUncontrolledId(next.id);
      onActiveChange?.(next.id);
    };

    // Arrow keys step through the files: this component's own listener,
    // gated on open state. The handler rides a ref so the subscription does
    // not churn on every render.
    const stepRef = useRef(step);
    stepRef.current = step;
    useEffect(() => {
      if (!open || total < 2) return;
      const onKey = (event: KeyboardEvent) => {
        if (event.key === 'ArrowLeft') stepRef.current(-1);
        if (event.key === 'ArrowRight') stepRef.current(1);
      };
      document.addEventListener('keydown', onKey);
      return () => document.removeEventListener('keydown', onKey);
    }, [open, total]);

    if (!mounted) return null;

    const containerClasses = [baseClass, open ? `${baseClass}--open` : '', className]
      .filter(Boolean)
      .join(' ');

    const sizeText = item?.size === undefined ? '' : formatBytes(item.size);
    const positionText = total > 1 ? formatPosition(index + 1, total) : '';
    const subtitle = [sizeText, positionText].filter(Boolean).join(' · ');

    let stage: React.ReactNode = null;

    if (item) {
      const failed = item.status === 'error' || item.status === 'unavailable';
      const custom = failed ? undefined : renderPreview?.(item);
      const imageSrc = item.src ?? item.previewSrc;

      if (custom !== undefined && custom !== null && custom !== false) {
        stage = custom;
      } else if (!failed && imageSrc) {
        stage = (
          <img
            className={`${baseClass}__image`}
            src={imageSrc}
            alt={item.previewAlt ?? item.name}
          />
        );
      } else if (!failed && item.excerpt) {
        stage = <p className={`${baseClass}__text`}>{item.excerpt}</p>;
      } else {
        // Nothing to draw: say so, and say which file, rather than leaving
        // an empty stage. A failed file gets the retry path.
        stage = (
          <div className={`${baseClass}__empty`}>
            <span className={`${baseClass}__empty-mark`}>
              {renderTypeMark(item.name, item.kind)}
            </span>
            <p className={`${baseClass}__empty-title`}>{failed ? failedLabel : noPreviewLabel}</p>
            <p className={`${baseClass}__empty-detail`}>
              {failed
                ? (item.error ?? failedDescription)
                : [item.name, sizeText].filter(Boolean).join(' · ')}
            </p>
            {((failed && onRetry) || onDownload) && (
              <div className={`${baseClass}__empty-actions`}>
                {failed && onRetry && (
                  <Button
                    variant="primary"
                    size="compact"
                    label={retryLabel}
                    onClick={() => onRetry(item)}
                  />
                )}
                {onDownload && (
                  <Button
                    variant={failed && onRetry ? 'secondary' : 'primary'}
                    size="compact"
                    iconLeft="download"
                    label={downloadLabel}
                    onClick={() => onDownload(item)}
                  />
                )}
              </div>
            )}
          </div>
        );
      }
    }

    const viewer = (
      <div className={containerClasses}>
        <div
          className={`${baseClass}__backdrop`}
          onClick={dismissible ? () => onOpenChange(false) : undefined}
        />

        <div
          {...rest}
          ref={setPanelRef}
          className={`${baseClass}__panel`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
        >
          <div className={`${baseClass}__header`}>
            {item && (
              <span className={`${baseClass}__header-mark`}>
                {renderTypeMark(item.name, item.kind)}
              </span>
            )}
            <div className={`${baseClass}__heading`}>
              <h2 className={`${baseClass}__title`} id={titleId} title={item?.name}>
                {item?.name}
              </h2>
              {subtitle !== '' && <p className={`${baseClass}__subtitle`}>{subtitle}</p>}
            </div>
            {item && onDownload && (
              <Button
                className={`${baseClass}__download`}
                variant="secondary"
                size="compact"
                iconLeft="download"
                label={downloadLabel}
                onClick={() => onDownload(item)}
              />
            )}
            {dismissible && (
              <CircularButton
                icon="close"
                variant="tertiary"
                size="compact"
                ariaLabel={closeLabel}
                tooltip={false}
                onClick={() => onOpenChange(false)}
              />
            )}
          </div>

          <div className={`${baseClass}__stage`}>{stage}</div>

          {total > 1 && (
            <div className={`${baseClass}__footer`}>
              <CircularButton
                icon="chevron_left"
                variant="secondary"
                size="compact"
                ariaLabel={previousLabel}
                tooltip={false}
                onClick={() => step(-1)}
              />
              <span className={`${baseClass}__position`} aria-live="polite">
                {positionText}
              </span>
              <CircularButton
                icon="chevron_right"
                variant="secondary"
                size="compact"
                ariaLabel={nextLabel}
                tooltip={false}
                onClick={() => step(1)}
              />
            </div>
          )}
        </div>
      </div>
    );

    return ReactDOM.createPortal(viewer, document.body);
  },
);

AttachmentViewer.displayName = 'AttachmentViewer';
