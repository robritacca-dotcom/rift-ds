import React from 'react';
import type { LinkComponent } from '../../behaviors/LinkProvider';
import { getFileKind } from './fileTypes';
import type { FileKind } from './fileTypes';
import { renderTypeMark } from './typeMark';
import './Attachment.css';

/** Props owned by FileRow itself; everything else falls through to the root `<div>`. */
type FileRowOwnProps = {
  /** The file's name with its extension (`Q3 report.pdf`), which also picks its type mark. */
  name: string;
  /** The file's MIME type, when its name has no telling extension. */
  mimeType?: string;
  /**
   * The file's kind, when neither its name nor its MIME type says it.
   * @default picked from the name and the MIME type
   */
  kind?: FileKind;
  /** The type mark's lettering, in place of the one derived from the name. */
  typeLabel?: string;
  /** A quiet second line: the size, who added it, when. */
  meta?: React.ReactNode;
  /** Makes the name a link to the file or its preview page. */
  href?: string;
  /** Makes the name a button that opens the file in place, such as in a DocumentViewer dialog. `href` wins when both are set. */
  onOpen?: () => void;
  /** Controls at the row's end: a download, a share, a menu. */
  actions?: React.ReactNode;
  /** Row density: `compact` for a list in a side panel. */
  size?: 'default' | 'compact';
  /**
   * The component the name's link renders with, such as Next.js's `Link`, so
   * it navigates through the app's router; a plain `<a>` when unset. This
   * component can render on the server, so it never reads a LinkProvider:
   * pass the prop even under one.
   */
  linkComponent?: LinkComponent;
  /** Additional CSS classes */
  className?: string;
};

export interface FileRowProps extends FileRowOwnProps, Omit<React.ComponentPropsWithRef<'div'>, keyof FileRowOwnProps | 'children'> {}

/**
 * One file in a list: its type mark, its name and a line of detail, with
 * controls at the end. The name opens the file, as a link or a button, so a
 * document library, a record's attachments or a shared folder reads as rows
 * a keyboard can walk. The mark is the attachment family's own, so a file
 * looks the same as a row, a tile and in the viewer. Server-renderable.
 */
export function FileRow({
  name,
  mimeType,
  kind,
  typeLabel,
  meta,
  href,
  onOpen,
  actions,
  size = 'default',
  linkComponent,
  className = '',
  ref,
  ...rest
}: FileRowProps) {
  const Link = linkComponent ?? 'a';
  const resolvedKind = kind ?? getFileKind({ name, type: mimeType });
  const hasMeta = meta != null && meta !== false && meta !== '';
  const hasActions = actions != null && actions !== false;
  const classes = ['ds-file-row', size === 'compact' ? 'ds-file-row--compact' : '', className]
    .filter(Boolean)
    .join(' ');
  const nameClass = 'ds-file-row__name';
  return (
    <div {...rest} ref={ref} className={classes}>
      {renderTypeMark(name, resolvedKind, { typeLabel })}
      <span className="ds-file-row__main">
        {href !== undefined ? (
          <Link href={href} className={`${nameClass} ds-file-row__name--action`}>
            {name}
          </Link>
        ) : onOpen ? (
          <button type="button" className={`${nameClass} ds-file-row__name--action`} onClick={onOpen}>
            {name}
          </button>
        ) : (
          <span className={nameClass}>{name}</span>
        )}
        {hasMeta && <span className="ds-file-row__meta">{meta}</span>}
      </span>
      {hasActions && <span className="ds-file-row__actions">{actions}</span>}
    </div>
  );
}
