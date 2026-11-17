'use client';

import React, { useId, useState } from 'react';
import { Avatar } from '../Avatar/Avatar';
import { Checkbox, CheckboxIndicator } from '../Checkbox/Checkbox';
import { Heading } from '../Heading/Heading';
import { ProgressBar } from '../ProgressBar/ProgressBar';
import { formatNumber } from '../../behaviors/locale';
import { useLocale } from '../../behaviors/LocaleProvider';
import '../../behaviors/visually-hidden.css';
import './Checklist.css';

/** One task on a checklist. */
export interface ChecklistItem {
  /** A stable id, which `values` holds while the task is done. */
  id: string;
  /** What the task is ("Invite your team"). */
  label: string;
  /** A line under the label on what doing it involves. */
  description?: string;
  /** Who the task is with: a name, and an image for their avatar. */
  owner?: { name: string; src?: string };
  /** A control at the end of the row that does the task or opens it, such as a compact Button or a Link. */
  action?: React.ReactNode;
  /** Holds the task as it is: it cannot be ticked or unticked. */
  disabled?: boolean;
}

/** Props owned by Checklist itself; everything else falls through to the root `<section>`. */
type ChecklistOwnProps = {
  /** The tasks, in the order they are best done. */
  items: ChecklistItem[];
  /**
   * The checklist's heading, which names its section.
   * Note: this shadows the native `title` tooltip attribute, which Checklist does not expose.
   */
  title?: string;
  /** The ids of the done tasks, for a controlled list. Leave undefined to let the list keep its own, seeded from `defaultValues`. */
  values?: string[];
  /** The ids done on first render when the list is uncontrolled. */
  defaultValues?: string[];
  /** Fires with every done id after a task is ticked or unticked. */
  onValuesChange?: (values: string[]) => void;
  /** Shows the done marks without letting them change, for a list that reports what the host already knows (a setup's steps, a review's checks). */
  readOnly?: boolean;
  /** Shows how many tasks are done, as a count and a bar, under the heading. Defaults to true. */
  showProgress?: boolean;
  /** The progress count, given the done and total tasks already written in the resolved locale. Defaults to "3 of 5 done". */
  progressLabel?: (done: string, total: string) => string;
  /** The owner avatar's accessible name, given the owner's name. Defaults to "Owner: <name>". */
  ownerLabel?: (name: string) => string;
  /** A read-only row's state, read after its label. Defaults to "Done". */
  doneLabel?: string;
  /** A read-only row's state when it is not done. Defaults to "Not done". */
  notDoneLabel?: string;
  /** The BCP 47 locale the counts are written in, such as `ar-EG`. Defaults to the nearest LocaleProvider's, else `en-US`. */
  locale?: string;
  /** Row density: `compact` for a checklist in a side panel. */
  size?: 'default' | 'compact';
  /** Additional CSS classes */
  className?: string;
};

export interface ChecklistProps
  extends ChecklistOwnProps,
    Omit<React.ComponentPropsWithRef<'section'>, keyof ChecklistOwnProps | 'children'> {}

const defaultProgressLabel = (done: string, total: string) => `${done} of ${total} done`;
const defaultOwnerLabel = (name: string) => `Owner: ${name}`;

/**
 * Tasks with a done state each: a setup to finish, an onboarding to work
 * through, the checks before a release. Each row is a Checkbox with the
 * task's label and description, its owner's avatar and an optional action,
 * under a heading with the count done and a bar. Read-only, it reports done
 * marks the host owns.
 */
export function Checklist({
  items,
  title,
  values,
  defaultValues,
  onValuesChange,
  readOnly = false,
  showProgress = true,
  progressLabel = defaultProgressLabel,
  ownerLabel = defaultOwnerLabel,
  doneLabel = 'Done',
  notDoneLabel = 'Not done',
  locale: localeProp,
  size = 'default',
  className = '',
  ref,
  ...rest
}: ChecklistProps) {
  const locale = useLocale(localeProp);
  const headingId = useId();
  const [internal, setInternal] = useState<string[]>(() => defaultValues ?? []);
  const done = values ?? internal;
  const doneSet = new Set(done);
  const doneCount = items.filter((item) => doneSet.has(item.id)).length;
  const total = items.length;

  const toggle = (id: string, checked: boolean) => {
    const next = checked ? [...done.filter((v) => v !== id), id] : done.filter((v) => v !== id);
    if (values === undefined) setInternal(next);
    onValuesChange?.(next);
  };

  const countText = progressLabel(formatNumber(doneCount, locale), formatNumber(total, locale));
  const classes = ['ds-checklist', size === 'compact' ? 'ds-checklist--compact' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <section aria-labelledby={title ? headingId : undefined} {...rest} ref={ref} className={classes}>
      {(title || showProgress) && (
        <div className="ds-checklist__header">
          {title && (
            <Heading id={headingId} level={3} tier="title-body" className="ds-checklist__title">
              {title}
            </Heading>
          )}
          {showProgress && total > 0 && (
            <div className="ds-checklist__progress">
              <span className="ds-checklist__count">{countText}</span>
              <ProgressBar
                value={(doneCount / total) * 100}
                size="compact"
                aria-label={countText}
                locale={locale}
                className="ds-checklist__bar"
              />
            </div>
          )}
        </div>
      )}
      <ul className="ds-checklist__list">
        {items.map((item) => {
          const isDone = doneSet.has(item.id);
          return (
            <li
              key={item.id}
              className={['ds-checklist__item', isDone ? 'ds-checklist__item--done' : ''].filter(Boolean).join(' ')}
            >
              <div className="ds-checklist__task">
                {readOnly ? (
                  <div className="ds-checklist__static">
                    <CheckboxIndicator checked={isDone} size={size} />
                    <span className="ds-checklist__text">
                      <span className="ds-checklist__label">
                        {item.label}
                        <span className="ds-visually-hidden">, {isDone ? doneLabel : notDoneLabel}</span>
                      </span>
                      {item.description && <span className="ds-checklist__description">{item.description}</span>}
                    </span>
                  </div>
                ) : (
                  <Checkbox
                    label={item.label}
                    helperText={item.description}
                    checked={isDone}
                    disabled={item.disabled}
                    size={size}
                    onCheckedChange={(checked) => toggle(item.id, checked)}
                  />
                )}
              </div>
              {(item.owner || item.action) && (
                <div className="ds-checklist__meta">
                  {item.owner && (
                    <Avatar
                      name={item.owner.name}
                      src={item.owner.src}
                      size="sm"
                      aria-label={ownerLabel(item.owner.name)}
                    />
                  )}
                  {item.action}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
