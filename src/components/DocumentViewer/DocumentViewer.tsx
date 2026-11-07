'use client';

import React, { useEffect, useState } from 'react';
import { CircularButton } from '../CircularButton/CircularButton';
import { Button } from '../Button/Button';
import { Spinner } from '../Spinner/Spinner';
import { useLocale } from '../../behaviors/LocaleProvider';
import { getFileKind } from '../Attachment/fileTypes';
import '../../fonts/material-symbols.css';
import '../../behaviors/visually-hidden.css';
import './DocumentViewer.css';

/** What the viewer shows a file as. */
export type DocumentViewerKind = 'pdf' | 'image' | 'text';

/** Props owned by DocumentViewer itself; everything else falls through to the root `<section>`. */
type DocumentViewerOwnProps = {
  /** The file's address. */
  src: string;
  /** The document's name, shown in the toolbar and naming the frame for a screen reader. Note: this replaces the native `title` tooltip attribute, which DocumentViewer does not expose. */
  title: string;
  /** How to show it, or `auto` to read it from `fileName`, `src` and `mimeType`. A kind the viewer cannot show renders the fallback. Defaults to `auto`. */
  kind?: DocumentViewerKind | 'auto';
  /** The file's name, extension included, for `auto` and for the downloaded file. Defaults to the last part of `src`. */
  fileName?: string;
  /** The file's mime type, when `auto` cannot tell from the name. */
  mimeType?: string;
  /** The viewer's height: `default`, `tall`, or `fill` to take the height of its container. */
  height?: 'default' | 'tall' | 'fill';
  /** Drop the frame and the toolbar and fill the host, for a host that brings its own header with the name and the actions, such as AttachmentViewer. */
  bare?: boolean;
  /** Show the download button. A string names the downloaded file. Defaults to true. */
  download?: boolean | string;
  /** Called when the download button is pressed, in place of the browser's own download: for a file the host must fetch with credentials. */
  onDownload?: () => void;
  /** Show the button that opens the file in a new tab. Defaults to true. */
  openInNewTab?: boolean;
  /** More controls for the toolbar, before the built-in ones: a share button, a page count. */
  toolbar?: React.ReactNode;
  /** What shows when the file cannot be shown here: an unknown kind, a text file that would not load, or a browser that will not embed a PDF. Defaults to a line saying so and a download button. */
  fallback?: React.ReactNode;
  /** Accessible name and text of the download button. Defaults to "Download". */
  downloadLabel?: string;
  /** Accessible name of the open button. Defaults to "Open in new tab". */
  openLabel?: string;
  /** Accessible name of the zoom-in button. Defaults to "Zoom in". */
  zoomInLabel?: string;
  /** Accessible name of the zoom-out button. Defaults to "Zoom out". */
  zoomOutLabel?: string;
  /** Accessible name of the button that fits an image to the width again, given the zoom in percent. Defaults to "Fit to width, now <zoom>%". */
  resetZoomLabel?: (percent: string) => string;
  /** Announced while a text file loads. Defaults to "Loading document". */
  loadingLabel?: string;
  /** The default fallback's line. Defaults to "This file can’t be shown here." */
  fallbackLabel?: string;
  /** The BCP 47 locale the zoom is written in. Defaults to the nearest LocaleProvider's, else `en-US`. */
  locale?: string;
  /** Additional CSS classes */
  className?: string;
};

export interface DocumentViewerProps
  extends DocumentViewerOwnProps,
    Omit<React.ComponentPropsWithRef<'section'>, keyof DocumentViewerOwnProps | 'children'> {}

/** The zoom steps an image moves through; 1 fits it to the width. */
const ZOOMS = [0.5, 0.75, 1, 1.5, 2, 3];

/** The kind a file shows as, from its name and mime type. */
function resolveKind(kind: DocumentViewerKind | 'auto', name: string, mime?: string): DocumentViewerKind | null {
  if (kind !== 'auto') return kind;
  const file = getFileKind({ name, type: mime });
  if (file === 'pdf' || file === 'image') return file;
  if (file === 'text' || file === 'code' || file === 'pasted') return 'text';
  return null;
}

/**
 * A document on the page: a statement, a contract, an invoice, an uploaded
 * receipt. A PDF shows in the browser's own viewer, an image with zoom, a
 * text file in a scrolling frame; the toolbar downloads it or opens it in a
 * new tab. Where the browser will not embed the file, the fallback shows in
 * its place. The library carries no document renderer.
 */
export function DocumentViewer({
  src,
  title,
  kind = 'auto',
  fileName,
  mimeType,
  height = 'default',
  bare = false,
  download = true,
  onDownload,
  openInNewTab = true,
  toolbar,
  fallback,
  downloadLabel = 'Download',
  openLabel = 'Open in new tab',
  zoomInLabel = 'Zoom in',
  zoomOutLabel = 'Zoom out',
  resetZoomLabel,
  loadingLabel = 'Loading document',
  fallbackLabel = 'This file can’t be shown here.',
  locale: localeProp,
  className = '',
  ref,
  ...rest
}: DocumentViewerProps) {
  const locale = useLocale(localeProp);
  const name = fileName ?? decodeURIComponent(src.split(/[?#]/)[0].split('/').pop() ?? '');
  const resolved = resolveKind(kind, name, mimeType);
  const [zoom, setZoom] = useState(ZOOMS.indexOf(1));
  const [text, setText] = useState<{ src: string; body: string | null; failed: boolean } | null>(null);

  // A text file is fetched and set in a <pre>; one that will not load shows the fallback.
  useEffect(() => {
    if (resolved !== 'text') return;
    let cancelled = false;
    fetch(src)
      .then((response) => (response.ok ? response.text() : Promise.reject(new Error(String(response.status)))))
      .then((body) => !cancelled && setText({ src, body, failed: false }))
      .catch(() => !cancelled && setText({ src, body: null, failed: true }));
    return () => {
      cancelled = true;
    };
  }, [resolved, src]);

  const downloadName = typeof download === 'string' ? download : name || undefined;
  const downloadButton = download ? (
    onDownload ? (
      <CircularButton icon="download" variant="tertiary" size="compact" ariaLabel={downloadLabel} onClick={onDownload} />
    ) : (
      <CircularButton
        icon="download"
        variant="tertiary"
        size="compact"
        ariaLabel={downloadLabel}
        href={src}
        {...({ download: downloadName } as Record<string, string | undefined>)}
      />
    )
  ) : null;

  const fallbackNode = fallback ?? (
    <div className="ds-document-viewer__fallback">
      <span className="ds-document-viewer__fallback-icon material-symbols-rounded" aria-hidden="true">
        description
      </span>
      <p className="ds-document-viewer__fallback-text">{fallbackLabel}</p>
      {download &&
        (onDownload ? (
          <Button variant="secondary" size="compact" iconLeft="download" label={downloadLabel} onClick={onDownload} />
        ) : (
          <Button
            variant="secondary"
            size="compact"
            iconLeft="download"
            label={downloadLabel}
            href={src}
            {...({ download: downloadName } as Record<string, string | undefined>)}
          />
        ))}
    </div>
  );

  const percent = new Intl.NumberFormat(locale, { style: 'percent' }).format(ZOOMS[zoom]);
  const resetLabel = resetZoomLabel ? resetZoomLabel(percent) : `Fit to width, now ${percent}`;

  let body: React.ReactNode;
  if (resolved === 'pdf') {
    body = (
      <object className="ds-document-viewer__frame" data={src} type="application/pdf" aria-label={title}>
        {fallbackNode}
      </object>
    );
  } else if (resolved === 'image') {
    body = (
      <div className="ds-document-viewer__scroll" role="region" aria-label={title} tabIndex={0}>
        <img
          className="ds-document-viewer__image"
          src={src}
          alt={title}
          style={{ inlineSize: `${ZOOMS[zoom] * 100}%` }}
        />
      </div>
    );
  } else if (resolved === 'text') {
    const current = text?.src === src ? text : null;
    body = current?.failed ? (
      fallbackNode
    ) : current?.body != null ? (
      <div className="ds-document-viewer__scroll" role="region" aria-label={title} tabIndex={0}>
        <pre className="ds-document-viewer__text">{current.body}</pre>
      </div>
    ) : (
      <div className="ds-document-viewer__loading" role="status">
        <Spinner size="md" />
        <span className="ds-visually-hidden">{loadingLabel}</span>
      </div>
    );
  } else {
    body = fallbackNode;
  }

  return (
    // The frame itself stays unnamed, so it is a plain container rather than
    // a second landmark beside the scrolling region the title names.
    <section
      {...rest}
      ref={ref}
      className={[
        'ds-document-viewer',
        `ds-document-viewer--height-${bare ? 'fill' : height}`,
        bare && 'ds-document-viewer--bare',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {!bare && (
        <header className="ds-document-viewer__toolbar">
          <span className="ds-document-viewer__title">{title}</span>
          <div className="ds-document-viewer__actions">
            {resolved === 'image' && (
              <>
                <CircularButton
                  icon="zoom_out"
                  variant="tertiary"
                  size="compact"
                  ariaLabel={zoomOutLabel}
                  disabled={zoom === 0}
                  onClick={() => setZoom((z) => Math.max(0, z - 1))}
                />
                <button
                  type="button"
                  className="ds-document-viewer__zoom"
                  aria-label={resetLabel}
                  onClick={() => setZoom(ZOOMS.indexOf(1))}
                >
                  {percent}
                </button>
                <CircularButton
                  icon="zoom_in"
                  variant="tertiary"
                  size="compact"
                  ariaLabel={zoomInLabel}
                  disabled={zoom === ZOOMS.length - 1}
                  onClick={() => setZoom((z) => Math.min(ZOOMS.length - 1, z + 1))}
                />
              </>
            )}
            {toolbar}
            {openInNewTab && (
              <CircularButton
                icon="open_in_new"
                variant="tertiary"
                size="compact"
                ariaLabel={openLabel}
                href={src}
                target="_blank"
                rel="noopener noreferrer"
              />
            )}
            {downloadButton}
          </div>
        </header>
      )}
      <div className="ds-document-viewer__body">{body}</div>
    </section>
  );
}
