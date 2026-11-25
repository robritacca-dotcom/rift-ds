'use client';

import React, { useState } from 'react';
import { WidgetRow } from '../Widget/Widget';
import { SegmentedControl, type Segment } from '../SegmentedControl/SegmentedControl';
import { useLocale } from '../../behaviors/LocaleProvider';
import { formatNumber } from '../../behaviors/locale';
import { mirrorClass } from '../../behaviors/direction';
import '../../fonts/material-symbols.css';
import './AgentScope.css';

/** How far an agent may go in one area, lowest first: nothing, look, draft for a person to approve, do it itself. */
export type AgentScopeLevel = 'none' | 'view' | 'prepare' | 'act';

/** The levels in order, lowest first. A level is offered only up to the person's own. */
const LEVEL_ORDER: AgentScopeLevel[] = ['none', 'view', 'prepare', 'act'];

const rank = (level: AgentScopeLevel) => LEVEL_ORDER.indexOf(level);

/** One area of the account an agent can be let into. */
export interface AgentScopePermission {
  /** A stable key: the permission's key in `value`. */
  id: string;
  /** The area, in the reader's words: "Payments", "Cards", "Statements". */
  label: string;
  /** A quiet line under the label saying what the area covers. */
  description?: string;
  /** A leading mark: a Material Symbol name, or your own element. */
  icon?: string | React.ReactNode;
  /** The levels this area has, lowest first. Defaults to all four; an area with nothing to draft leaves out `prepare`. */
  levels?: AgentScopeLevel[];
  /** The level the connecting person holds here themselves. The agent is never offered more: levels above it are left out, not shown disabled, and an area the person holds at `none` is left out altogether. */
  held: AgentScopeLevel;
  /** The area moves money. `act` is never offered, whatever the person holds: the agent drafts, and a person approves each one. */
  approval?: boolean;
  /** Hold the area at its current level. */
  disabled?: boolean;
}

/** The words for each level, as the segments show them. */
export type AgentScopeLevelLabels = Record<AgentScopeLevel, string>;

const DEFAULT_LEVEL_LABELS: AgentScopeLevelLabels = {
  none: 'Off',
  view: 'View',
  prepare: 'Prepare',
  act: 'Act',
};

/** Props owned by AgentScope itself; everything else falls through to the root `<div>`. */
type AgentScopeOwnProps = {
  /** The areas an agent can be let into, in the order they are listed. */
  permissions: AgentScopePermission[];
  /** The level the agent holds in each area, keyed by permission id, for controlled use. An area missing from it is off. Pair with `onValueChange`. */
  value?: Record<string, AgentScopeLevel>;
  /** The levels to begin with, for uncontrolled use. An agent starts with nothing: an area missing from it is off. */
  defaultValue?: Record<string, AgentScopeLevel>;
  /** Called with every area's level when the reader changes one. */
  onValueChange?: (value: Record<string, AgentScopeLevel>) => void;
  /** The words for each level. Defaults to Off, View, Prepare and Act. */
  levelLabels?: Partial<AgentScopeLevelLabels>;
  /** The note an area that moves money adds to its description, in place of `act`. Defaults to "A person approves". */
  approvalLabel?: string;
  /** The closing line counting the areas left out because the person does not hold them, given the count already written in the locale. Return an empty string to leave it out. */
  hiddenLabel?: (count: string) => string;
  /** Hold every area at its current level. */
  disabled?: boolean;
  /** The BCP 47 locale the closing count is written in, such as `ar-EG`. Defaults to the nearest LocaleProvider's, then `en-US`. */
  locale?: string;
  /** Additional CSS classes */
  className?: string;
};

export interface AgentScopeProps
  extends AgentScopeOwnProps,
    Omit<React.ComponentPropsWithRef<'div'>, keyof AgentScopeOwnProps | 'defaultValue' | 'onChange'> {}

const baseClass = 'ds-agent-scope';

const defaultHiddenLabel = (count: string) =>
  count === '1' ? '1 more area is left out: you don’t hold it yourself.' : `${count} more areas are left out: you don’t hold them yourself.`;

/** The levels an area offers: its own, up to the person's, never `act` where a person approves. */
function offeredLevels(permission: AgentScopePermission): AgentScopeLevel[] {
  const own = permission.levels ?? LEVEL_ORDER;
  return own.filter((level) => rank(level) <= rank(permission.held) && !(permission.approval && level === 'act'));
}

/** The level an area shows: the one asked for, brought down to the highest the area offers. */
function shownLevel(asked: AgentScopeLevel | undefined, offered: AgentScopeLevel[]): AgentScopeLevel {
  const wanted = rank(asked ?? 'none');
  let shown: AgentScopeLevel = offered[0] ?? 'none';
  for (const level of offered) if (rank(level) <= wanted) shown = level;
  return shown;
}

/**
 * The areas of an account an agent may enter, and how far in each: off,
 * view, prepare (draft for a person to approve) or act. The agent is never
 * offered more than the person connecting it holds: levels past theirs are
 * left out rather than shown disabled, an area they do not hold is not
 * listed (a closing line counts those), and an area that moves money never
 * offers `act`, so its drafts always wait on a person. Each area is a
 * WidgetRow with a compact SegmentedControl at its end, so the list sits in
 * a Widget beside plain rows.
 */
export function AgentScope({
  ref,
  permissions,
  value: valueProp,
  defaultValue,
  onValueChange,
  levelLabels,
  approvalLabel = 'A person approves',
  hiddenLabel = defaultHiddenLabel,
  disabled = false,
  locale: localeProp,
  className = '',
  ...rest
}: AgentScopeProps) {
  const locale = useLocale(localeProp);
  const [ownValue, setOwnValue] = useState<Record<string, AgentScopeLevel>>(defaultValue ?? {});
  const value = valueProp ?? ownValue;
  const labels = { ...DEFAULT_LEVEL_LABELS, ...levelLabels };

  const listed = permissions.filter((permission) => permission.held !== 'none');
  const hiddenCount = permissions.length - listed.length;
  const hiddenNote = hiddenCount > 0 ? hiddenLabel(formatNumber(hiddenCount, locale)) : '';

  const change = (id: string, level: AgentScopeLevel) => {
    const next = { ...value, [id]: level };
    if (valueProp === undefined) setOwnValue(next);
    onValueChange?.(next);
  };

  return (
    <div {...rest} ref={ref} className={[baseClass, className].filter(Boolean).join(' ')}>
      {listed.map((permission) => {
        const offered = offeredLevels(permission);
        const segments: Segment[] = offered.map((level) => ({ value: level, label: labels[level] }));
        const leading =
          typeof permission.icon === 'string' ? (
            <span className={`material-symbols-rounded ${mirrorClass(permission.icon)}`} aria-hidden="true">
              {permission.icon}
            </span>
          ) : (
            permission.icon
          );
        return (
          <div key={permission.id} className={`${baseClass}__row`}>
            <WidgetRow
              title={permission.label}
              description={permission.approval ? [permission.description, approvalLabel].filter(Boolean).join(' · ') : permission.description}
              leading={leading}
              actions={
                <SegmentedControl
                  size="compact"
                  tone="neutral"
                  segments={segments.map((segment) => ({ ...segment, disabled: disabled || permission.disabled }))}
                  value={shownLevel(value[permission.id], offered)}
                  onValueChange={(next) => change(permission.id, next as AgentScopeLevel)}
                  aria-label={permission.label}
                />
              }
            />
          </div>
        );
      })}
      {hiddenNote && <p className={`${baseClass}__hidden`}>{hiddenNote}</p>}
    </div>
  );
}
