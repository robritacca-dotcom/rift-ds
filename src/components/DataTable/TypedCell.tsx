'use client';

/**
 * A typed column's cell, composed from the library's own parts: a Badge for
 * a status, an Avatar for a person, Badges for tags, a ProgressBar for
 * progress, the shared check for a checkbox, the app's link for a link.
 * An empty value draws nothing, so a sparse column stays quiet.
 * Internal: DataTable draws it for a column with a `type` and no `render`.
 */

import { Avatar } from '../Avatar/Avatar';
import { AvatarGroup } from '../AvatarGroup/AvatarGroup';
import { Badge } from '../Badge/Badge';
import { CheckIcon } from '../Checkbox/Checkbox';
import { ProgressBar } from '../ProgressBar/ProgressBar';
import type { LinkComponent } from '../../behaviors/LinkProvider';
import { useMounted } from '../../behaviors/useMounted';
import {
  absoluteDate,
  formatNumber,
  parseDate,
  readableUrl,
  relativeDate,
  type ColumnFormat,
  type ColumnType,
  type StatusRole,
} from './columnTypes';
import type { CellValue } from './editorKinds';
import '../../behaviors/visually-hidden.css';

/** Tags shown before the rest fold into a "+N". */
const TAG_LIMIT = 2;

export interface TypedCellProps {
  type: ColumnType;
  value: CellValue;
  format?: ColumnFormat;
  options?: { value: string; label: string; status?: StatusRole }[];
  /** The words a checkbox cell is read as, and the "+N" of folded tags. */
  words: { checked: string; unchecked: string; more: (count: number) => string };
  /** The link component a `link` cell renders through: the table's, resolved from its prop or the nearest LinkProvider. */
  link: LinkComponent;
}

export function TypedCell({ type, value, format, options, words, link: Link }: TypedCellProps) {
  const mounted = useMounted();
  if (value == null || value === '' || (Array.isArray(value) && value.length === 0)) {
    // A checkbox's empty is unchecked, and is still read out.
    return type === 'checkbox' ? <span className="ds-visually-hidden">{words.unchecked}</span> : null;
  }
  const option = (v: string) => options?.find((o) => o.value === v);
  const label = (v: string) => option(v)?.label ?? v;
  const base = 'ds-data-table__typed';

  switch (type) {
    case 'number':
    case 'currency':
      return (
        <span className={`${base}-number`}>
          {typeof value === 'number' ? formatNumber(type, value, format) : String(value)}
        </span>
      );
    case 'progress': {
      const amount = typeof value === 'number' ? value : Number(value);
      return (
        <span className={`${base}-progress`}>
          <ProgressBar value={amount} size="compact" aria-hidden="true" />
          <span className={`${base}-number`}>{formatNumber('progress', amount, format)}</span>
        </span>
      );
    }
    case 'date': {
      const date = parseDate(value);
      if (!date) return <>{String(value)}</>;
      const full = absoluteDate(date, format, 'long');
      // Relative reads against today, which the server cannot know, so it waits for the browser.
      const shown =
        format?.date === 'relative'
          ? mounted
            ? relativeDate(date, format, new Date())
            : absoluteDate(date, format, 'medium')
          : absoluteDate(date, format);
      return (
        <time dateTime={String(value)} title={full}>
          {shown}
        </time>
      );
    }
    case 'status': {
      const v = String(value);
      return <Badge label={label(v)} variant={option(v)?.status ?? 'neutral'} />;
    }
    case 'person': {
      // One person reads as a face and a name; a list, even of one, as a stack, so a column of lists lines up.
      if (!Array.isArray(value))
        return (
          <span className={`${base}-person`}>
            <Avatar name={label(String(value))} size="sm" />
            <span className={`${base}-name`}>{label(String(value))}</span>
          </span>
        );
      const people = value;
      return (
        <span className={`${base}-person`} title={people.map(label).join(', ')}>
          <AvatarGroup size="sm" max={3}>
            {people.map((person) => (
              <Avatar key={person} name={label(person)} />
            ))}
          </AvatarGroup>
          <span className="ds-visually-hidden">{people.map(label).join(', ')}</span>
        </span>
      );
    }
    case 'tags': {
      const tags = Array.isArray(value) ? value : [String(value)];
      const hidden = tags.length - TAG_LIMIT;
      return (
        <span className={`${base}-tags`}>
          {tags.slice(0, TAG_LIMIT).map((tag) => (
            <Badge key={tag} label={label(tag)} variant="neutral" />
          ))}
          {hidden > 0 && (
            <>
              <span className={`${base}-more`} title={tags.slice(TAG_LIMIT).map(label).join(', ')} aria-hidden="true">
                {words.more(hidden)}
              </span>
              {/* The folded tags, read in full: the count alone tells a screen reader nothing. */}
              <span className="ds-visually-hidden">{tags.slice(TAG_LIMIT).map(label).join(', ')}</span>
            </>
          )}
        </span>
      );
    }
    case 'checkbox':
      return value === true ? (
        <span className={`${base}-check`}>
          <CheckIcon className={`${base}-check-icon`} />
          <span className="ds-visually-hidden">{words.checked}</span>
        </span>
      ) : (
        <span className="ds-visually-hidden">{words.unchecked}</span>
      );
    case 'link': {
      const href = String(value);
      return (
        <Link className={`${base}-link`} href={href}>
          {readableUrl(href)}
        </Link>
      );
    }
    default:
      return <>{Array.isArray(value) ? value.map(label).join(', ') : label(String(value))}</>;
  }
}
