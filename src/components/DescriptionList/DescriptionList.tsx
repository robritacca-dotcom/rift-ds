import React from 'react';
import { DescriptionListCopy } from './DescriptionListCopy';
import '../../behaviors/visually-hidden.css';
import './DescriptionList.css';

/** One term and its value, as `items` takes them. */
export type DescriptionListEntry = {
  /** The term: what the value is ("Account number", "Due date"). */
  term: React.ReactNode;
  /** The value. Empty (null, undefined or an empty string) shows the list's `emptyValue`. */
  details?: React.ReactNode;
  /** A stable key for the entry; also its element id. */
  id?: string;
  /** A trailing control for this value: an Edit button, a link. */
  action?: React.ReactNode;
  /** Offer a copy button: `true` copies the value when it is text, a string copies that string (the unformatted account number behind a formatted one). */
  copyable?: boolean | string;
};

/** Props owned by DescriptionList itself; everything else falls through to the `<dl>`. */
type DescriptionListOwnProps = {
  /** The entries, in order. Or compose `DescriptionListItem` children instead. */
  items?: DescriptionListEntry[];
  /** `DescriptionListItem` children, for a list written out by hand. */
  children?: React.ReactNode;
  /** `stacked` puts each term above its value; `inline` sets term and value in two columns and stacks them when the list is narrow; `grid` lays stacked entries out in `columns`. */
  layout?: 'stacked' | 'inline' | 'grid';
  /** How many columns the `grid` layout uses at full width, 1 to 4. Fewer show as the list narrows. */
  columns?: 1 | 2 | 3 | 4;
  /** Draw a divider between entries. */
  dividers?: boolean;
  /** The type size: `default` the paragraph face, `compact` the small paragraph face for dense panels. */
  size?: 'default' | 'compact';
  /** How much of the row the term column takes in the `inline` layout: a quarter, a third or a half. */
  termWidth?: 'narrow' | 'default' | 'wide';
  /** Where values sit: `end` lines amounts up against the far edge. */
  align?: 'start' | 'end';
  /** What an empty value shows. Defaults to "Not set". */
  emptyValue?: React.ReactNode;
  /** The copy button's accessible name, given the entry's term when it is text and an empty string when it is not. Defaults to "Copy <term>", or "Copy". */
  copyLabel?: (term: string) => string;
  /** The copy button's accessible name for a moment after a copy. Defaults to "Copied". */
  copiedLabel?: string;
  /** Called after a value is put on the clipboard, so a host can confirm it or count it. Only reaches a list rendered from a client component. */
  onValueCopy?: (value: string) => void;
  /** Additional CSS classes. */
  className?: string;
};

export interface DescriptionListProps
  extends DescriptionListOwnProps,
    Omit<React.ComponentPropsWithRef<'dl'>, keyof DescriptionListOwnProps> {}

/** What the list hands each entry: its own settings, read by every item it renders. */
type EntrySettings = Pick<DescriptionListOwnProps, 'emptyValue' | 'copyLabel' | 'copiedLabel' | 'onValueCopy'>;

const isEmpty = (value: React.ReactNode) => value == null || value === false || value === '';
const textOf = (value: React.ReactNode) => (typeof value === 'string' || typeof value === 'number' ? String(value) : null);

function renderEntry(
  { term, details, id, action, copyable }: DescriptionListEntry,
  settings: Required<Pick<EntrySettings, 'emptyValue' | 'copyLabel' | 'copiedLabel'>> & Pick<EntrySettings, 'onValueCopy'>,
  className = '',
  rest: React.ComponentPropsWithoutRef<'div'> = {},
  ref?: React.Ref<HTMLDivElement>,
) {
  const empty = isEmpty(details);
  const copyText = empty ? null : typeof copyable === 'string' ? copyable : copyable ? textOf(details) : null;
  const termText = textOf(term);
  const classes = ['ds-description-list__item', className].filter(Boolean).join(' ');
  return (
    <div {...rest} ref={ref} id={id ?? rest.id} className={classes}>
      <dt className="ds-description-list__term">{term}</dt>
      <dd className="ds-description-list__details">
        <span className={`ds-description-list__value${empty ? ' ds-description-list__value--empty' : ''}`}>
          {empty ? settings.emptyValue : details}
        </span>
        {(copyText || action) && (
          <span className="ds-description-list__actions">
            {copyText && (
              <DescriptionListCopy
                value={copyText}
                label={settings.copyLabel(termText ?? '')}
                copiedLabel={settings.copiedLabel}
                onCopied={settings.onValueCopy}
              />
            )}
            {action}
          </span>
        )}
      </dd>
    </div>
  );
}

const DEFAULT_COPY_LABEL = (term: string) => (term ? `Copy ${term}` : 'Copy');

/** The context a written-out item reads its list's settings from, set by the list on each child. */
const SETTINGS_PROP = '__dsDescriptionListSettings';

/**
 * Terms and their values: a review screen before submit, a receipt, account
 * details, a record inspector. Stacked, in two columns that stack when
 * narrow, or in a grid; values can be copied or carry a trailing action, and
 * an empty value says so in words. Server-renderable.
 */
export function DescriptionList({
  items,
  children,
  layout = 'stacked',
  columns = 2,
  dividers = false,
  size = 'default',
  termWidth = 'default',
  align = 'start',
  emptyValue = 'Not set',
  copyLabel = DEFAULT_COPY_LABEL,
  copiedLabel = 'Copied',
  onValueCopy,
  className = '',
  style,
  ref,
  ...rest
}: DescriptionListProps) {
  const settings = { emptyValue, copyLabel, copiedLabel, onValueCopy };
  const classes = [
    'ds-description-list',
    `ds-description-list--${layout}`,
    `ds-description-list--${size}`,
    layout === 'inline' && `ds-description-list--term-${termWidth}`,
    dividers && 'ds-description-list--dividers',
    align === 'end' && 'ds-description-list--align-end',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  const resolvedStyle =
    layout === 'grid' ? ({ ...style, '--ds-description-list-columns': columns } as React.CSSProperties) : style;

  // Written-out items take the list's settings through a prop the list sets,
  // since a server-renderable list has no context to hand them down.
  const composed = React.Children.map(children, (child) =>
    React.isValidElement<DescriptionListItemProps>(child) && child.type === DescriptionListItem
      ? React.cloneElement(child, { [SETTINGS_PROP]: settings } as Partial<DescriptionListItemProps>)
      : child,
  );

  return (
    <div className="ds-description-list__frame">
      <dl {...rest} ref={ref} className={classes} style={resolvedStyle}>
        {items?.map((entry, index) => (
          <React.Fragment key={entry.id ?? index}>{renderEntry(entry, settings)}</React.Fragment>
        ))}
        {composed}
      </dl>
    </div>
  );
}

/** Props owned by DescriptionListItem itself; everything else falls through to the entry's wrapper `<div>`. */
type DescriptionListItemOwnProps = Omit<DescriptionListEntry, 'id'> & {
  /** The value, as children. `details` wins when both are set. */
  children?: React.ReactNode;
  /** Additional CSS classes. */
  className?: string;
};

export interface DescriptionListItemProps
  extends DescriptionListItemOwnProps,
    Omit<React.ComponentPropsWithRef<'div'>, keyof DescriptionListItemOwnProps> {}

/** One term and its value inside a DescriptionList, for a list written out by hand. Server-renderable. */
export function DescriptionListItem({
  term,
  details,
  children,
  action,
  copyable,
  className = '',
  ref,
  ...rest
}: DescriptionListItemProps) {
  const { [SETTINGS_PROP]: passed, ...divRest } = rest as typeof rest & { [SETTINGS_PROP]?: EntrySettings };
  const settings = {
    emptyValue: passed?.emptyValue ?? 'Not set',
    copyLabel: passed?.copyLabel ?? DEFAULT_COPY_LABEL,
    copiedLabel: passed?.copiedLabel ?? 'Copied',
    onValueCopy: passed?.onValueCopy,
  };
  return renderEntry(
    { term, details: details ?? children, action, copyable },
    settings,
    className,
    divRest,
    ref,
  );
}
