'use client';

import React, { useRef, useState } from 'react';
import '../../fonts/material-symbols.css';
import './Attachment.css';

/** Props owned by AttachmentDropZone itself — everything else falls through to the root element. */
type AttachmentDropZoneOwnProps = {
  /** Fires with the files dropped anywhere on the zone. */
  onFilesSelected?: (files: File[]) => void;
  /** Stops the zone reacting to drags; its children behave as if it were not there. */
  disabled?: boolean;
  /**
   * Icon above the overlay's headline: a Material Symbol name, or any
   * custom element. Pass `null` for none.
   */
  icon?: string | React.ReactNode;
  /** Headline of the overlay shown while files are dragged over the zone. */
  label?: string;
  /** Second line of the overlay: what may be dropped, e.g. accepted types and limits. */
  hint?: string;
  /** Additional CSS classes */
  className?: string;
  /** The surface that accepts drops: a chat panel, a thread and its composer. */
  children?: React.ReactNode;
};

export interface AttachmentDropZoneProps
  extends AttachmentDropZoneOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof AttachmentDropZoneOwnProps> {}

const carriesFiles = (event: React.DragEvent) =>
  Array.from(event.dataTransfer?.types ?? []).includes('Files');

/**
 * AttachmentDropZone turns a whole surface into a drop target. Wrap a chat
 * in it and a file dragged anywhere over the conversation lands, instead of
 * the person having to aim for the composer. While files hover, an
 * outlined overlay covers the surface and says what dropping will do.
 *
 * The zone hears drags in the capture phase and keeps the ones that carry
 * files to itself, so a drop target nested inside it, or a page-level one
 * outside it, never handles the same drop twice. A drag of anything else
 * (selected text, a link) passes straight through.
 *
 * Dropping is a pointer path only. Pair it with a picker button, which
 * Composer provides, so the same files can be added from the keyboard.
 */
export const AttachmentDropZone = React.forwardRef<HTMLDivElement, AttachmentDropZoneProps>(
  (
    {
      onFilesSelected,
      disabled = false,
      icon = 'upload_file',
      label = 'Drop files to attach',
      hint,
      className = '',
      children,
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-attachment-drop-zone';
    const [active, setActive] = useState(false);
    /* dragenter and dragleave fire for every descendant the pointer crosses;
       the zone is "over" while more enters than leaves have been seen. */
    const depth = useRef(0);

    const claims = (event: React.DragEvent) => !disabled && carriesFiles(event);

    const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
      if (!claims(event)) return;
      event.preventDefault();
      event.stopPropagation();
      depth.current += 1;
      setActive(true);
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
      if (!claims(event)) return;
      // Without this the browser refuses the drop and opens the file instead.
      event.preventDefault();
      event.stopPropagation();
      event.dataTransfer.dropEffect = 'copy';
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
      if (!claims(event)) return;
      event.stopPropagation();
      depth.current = Math.max(0, depth.current - 1);
      if (depth.current === 0) setActive(false);
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
      if (!claims(event)) return;
      event.preventDefault();
      event.stopPropagation();
      depth.current = 0;
      setActive(false);
      const files = Array.from(event.dataTransfer.files ?? []);
      if (files.length > 0) onFilesSelected?.(files);
    };

    const classes = [baseClass, active ? `${baseClass}--active` : '', className]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        {...rest}
        ref={ref}
        className={classes}
        onDragEnterCapture={handleDragEnter}
        onDragOverCapture={handleDragOver}
        onDragLeaveCapture={handleDragLeave}
        onDropCapture={handleDrop}
      >
        {children}

        {/* Decorative: a drag is a pointer gesture, and the overlay's words
            describe what the pointer is doing. Nothing here is announced. */}
        <div className={`${baseClass}__overlay`} aria-hidden="true">
          <div className={`${baseClass}__message`}>
            {icon !== null && icon !== undefined && (
              <span className={`${baseClass}__icon`}>
                {typeof icon === 'string' ? (
                  <span className="material-symbols-rounded">{icon}</span>
                ) : (
                  icon
                )}
              </span>
            )}
            <span className={`${baseClass}__label`}>{label}</span>
            {hint && <span className={`${baseClass}__hint`}>{hint}</span>}
          </div>
        </div>
      </div>
    );
  },
);

AttachmentDropZone.displayName = 'AttachmentDropZone';
