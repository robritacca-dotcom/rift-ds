import React from 'react';
import type { LinkComponent } from '../../behaviors/LinkProvider';
import { ScrollRegion } from '../../behaviors/ScrollRegion';
import { Avatar } from '../Avatar/Avatar';
import './OrgChart.css';

/** One person in the chart, and the people who report to them. */
export interface OrgChartNode {
  /** A stable id for the person. */
  id: string;
  /** Their name. */
  name: string;
  /** Their role ("Head of design"). */
  role?: string;
  /** An image for their avatar; their initials show without one. */
  avatarSrc?: string;
  /** Makes the person's name a link to their profile. */
  href?: string;
  /** The people who report to them, in order. */
  reports?: OrgChartNode[];
}

/** Props owned by OrgChart itself; everything else falls through to the root `<div>`. */
type OrgChartOwnProps = {
  /** The person at the top, with everyone under them. */
  root: OrgChartNode;
  /** The chart's name, read before the people in it ("Design team"). */
  label: string;
  /**
   * The component the people's links render with, such as Next.js's `Link`,
   * so they navigate through the app's router; a plain `<a>` when unset.
   * This component can render on the server, so it never reads a
   * LinkProvider: pass the prop even under one.
   */
  linkComponent?: LinkComponent;
  /** Additional CSS classes */
  className?: string;
};

export interface OrgChartProps extends OrgChartOwnProps, Omit<React.ComponentPropsWithRef<'div'>, keyof OrgChartOwnProps | 'children'> {}

/**
 * Who reports to whom: each person a card with their avatar, name and role,
 * their reports in a row beneath them, joined by lines. The hierarchy is
 * nested lists, so a screen reader hears each person's reports as a list
 * inside their item, at its level. A chart wider than its column scrolls
 * sideways. Server-renderable.
 */
export function OrgChart({ root, label, linkComponent, className = '', ref, ...rest }: OrgChartProps) {
  const Link = linkComponent ?? 'a';
  const node = (person: OrgChartNode): React.ReactNode => {
    const reports = person.reports ?? [];
    return (
      <li key={person.id} className="ds-org-chart__item">
        <div className="ds-org-chart__card">
          <Avatar name={person.name} src={person.avatarSrc} size="sm" aria-hidden="true" />
          <span className="ds-org-chart__text">
            {person.href !== undefined ? (
              <Link href={person.href} className="ds-org-chart__name ds-org-chart__name--link">
                {person.name}
              </Link>
            ) : (
              <span className="ds-org-chart__name">{person.name}</span>
            )}
            {person.role && <span className="ds-org-chart__role">{person.role}</span>}
          </span>
        </div>
        {reports.length > 0 && <ul className="ds-org-chart__reports">{reports.map(node)}</ul>}
      </li>
    );
  };
  const classes = ['ds-org-chart', className].filter(Boolean).join(' ');
  return (
    <div role="group" aria-label={label} {...rest} ref={ref} className={classes}>
      <ScrollRegion className="ds-org-chart__scroll">
        <ul className="ds-org-chart__tree">{node(root)}</ul>
      </ScrollRegion>
    </div>
  );
}
