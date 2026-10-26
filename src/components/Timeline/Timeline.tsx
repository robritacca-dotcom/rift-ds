import React from 'react';
import './Timeline.css';
import '../../fonts/material-symbols.css';
import { mirrorClass } from '../../behaviors/direction';

export interface TimelineItem {
  /** Step or event title */
  title: string;
  /** Small line above the title, e.g. a date range or stage tag */
  meta?: string;
  /** Body content under the title */
  description?: React.ReactNode;
  /** Icon shown in the marker (overrides dot/number) — Material Symbol name (string) or custom element (ReactNode) */
  icon?: string | React.ReactNode;
}

/** A single role/position within a company entry (`company` variant). */
export interface TimelineRole {
  /** Role or position title */
  title: string;
  /** Secondary line under the title, e.g. the team, org, or product the role sat in */
  subtitle?: React.ReactNode;
  /** Start of the date range, e.g. "May 2024" (omit for entries with no dates) */
  start?: string;
  /** End of the date range, e.g. "Jan 2026" (ignored when `present` is set) */
  end?: string;
  /** Renders a green "Present" in place of `end` for current roles */
  present?: boolean;
  /** Optional summary paragraph under the role header */
  description?: React.ReactNode;
  /** Optional bullet points; each entry is rendered as an `<li>` */
  bullets?: React.ReactNode[];
}

/** A company/tool entry grouping one or more roles under a logo (`company` variant). */
export interface TimelineCompany {
  /** Company or tool name shown beside the logo */
  name: string;
  /** Image node used as the marker (e.g. an `<img>` / framework image element) */
  logo?: React.ReactNode;
  /** One or more roles nested under this entry */
  roles: TimelineRole[];
}

/** Default variant — a flat sequence of steps/events with dot, badge, or icon markers. */
export interface TimelineDefaultProps {
  /** Selects the flat step/event layout — the default when omitted */
  variant?: 'default';
  /** Ordered list of steps/events */
  items: TimelineItem[];
  /** `vertical` timeline (default) or `horizontal` stepper */
  orientation?: 'vertical' | 'horizontal';
  /** Number the markers 1..n instead of dots */
  numbered?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/** Company variant — grouped roles under a logo, for résumé/pipeline histories. */
export interface TimelineCompanyProps {
  /** Selects the grouped layout: roles nested under a company logo */
  variant: 'company';
  /** Ordered list of company/tool entries */
  items: TimelineCompany[];
  /** Text shown in place of the end date for a role marked `present` */
  presentLabel?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Timeline props: one of the two variants' own props, plus the native `<ol>`
 * attributes, which reach the list in both variants.
 */
export type TimelineProps = (TimelineDefaultProps | TimelineCompanyProps) &
  Omit<React.ComponentPropsWithoutRef<'ol'>, keyof TimelineDefaultProps | keyof TimelineCompanyProps | 'children'>;

const BASE_CLASS = 'ds-timeline';

const renderRoleDates = (role: TimelineRole, presentLabel: string) => {
  if (!role.start) return null;
  return (
    <span className={`${BASE_CLASS}__role-dates`}>
      {role.start} –{' '}
      {role.present ? (
        <span className={`${BASE_CLASS}__present`}>{presentLabel}</span>
      ) : (
        role.end
      )}
    </span>
  );
};

const CompanyTimeline = React.forwardRef<HTMLOListElement, Extract<TimelineProps, { variant: 'company' }>>(
  // `variant` is the discriminant, not an <ol> attribute, so it is held back from the spread.
  ({ variant: _variant, items, presentLabel = 'Present', className = '', ...rest }, ref) => {
    const classes = [BASE_CLASS, `${BASE_CLASS}--vertical`, `${BASE_CLASS}--company`, className]
      .filter(Boolean)
      .join(' ');

    return (
      <ol {...rest} ref={ref} className={classes}>
        {items.map((company, index) => (
          <li key={`${company.name}-${index}`} className={`${BASE_CLASS}__item`}>
            <span className={`${BASE_CLASS}__marker ${BASE_CLASS}__marker--logo`} aria-hidden="true">
              {company.logo}
            </span>
            <div className={`${BASE_CLASS}__content`}>
              <span className={`${BASE_CLASS}__company-name`}>{company.name}</span>
              <div className={`${BASE_CLASS}__roles`}>
                {company.roles.map((role, roleIndex) => (
                  <div key={`${role.title}-${roleIndex}`} className={`${BASE_CLASS}__role`}>
                    <div className={`${BASE_CLASS}__role-header`}>
                      <h3 className={`${BASE_CLASS}__role-title`}>{role.title}</h3>
                      {renderRoleDates(role, presentLabel)}
                    </div>
                    {role.subtitle && (
                      <p className={`${BASE_CLASS}__role-subtitle`}>{role.subtitle}</p>
                    )}
                    {role.description && (
                      <p className={`${BASE_CLASS}__role-description`}>{role.description}</p>
                    )}
                    {role.bullets && role.bullets.length > 0 && (
                      <ul className={`${BASE_CLASS}__role-bullets`}>
                        {role.bullets.map((bullet, bulletIndex) => (
                          <li key={bulletIndex}>{bullet}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ol>
    );
  },
);

CompanyTimeline.displayName = 'CompanyTimeline';

/**
 * Timeline component — an ordered sequence of steps or events with
 * connected markers. Vertical for histories and process narratives,
 * horizontal for compact steppers. The `company` variant groups one or
 * more roles under a logo marker for résumé/pipeline histories.
 *
 * The forwarded ref and any unrecognised props target the `<ol>` in both
 * variants.
 */
// The defaults sit in the parameter, where docgen reads them for the props
// tables and the published contract. The parameter type names each variant's
// layout props on both, only so they can be destructured before the split.
export const Timeline = React.forwardRef<HTMLOListElement, TimelineProps>((
  {
    orientation = 'vertical',
    numbered = false,
    presentLabel = 'Present',
    className = '',
    ...props
  }: TimelineProps &
    Pick<TimelineDefaultProps, 'orientation' | 'numbered'> &
    Pick<TimelineCompanyProps, 'presentLabel'>,
  ref,
) => {
  if (props.variant === 'company') {
    return <CompanyTimeline {...props} presentLabel={presentLabel} className={className} ref={ref} />;
  }

  const { variant: _variant, items, ...rest } = props;

  const classes = [
    BASE_CLASS,
    `${BASE_CLASS}--${orientation}`,
    numbered && `${BASE_CLASS}--numbered`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const renderMarker = (item: TimelineItem, index: number) => {
    if (item.icon) {
      if (typeof item.icon === 'string') {
        return (
          <span className={`material-symbols-rounded ${BASE_CLASS}__marker-icon ${mirrorClass(item.icon)}`} aria-hidden="true">
            {item.icon}
          </span>
        );
      }
      return (
        <span className={`${BASE_CLASS}__marker-icon`} aria-hidden="true">
          {item.icon}
        </span>
      );
    }
    if (numbered) {
      return <span aria-hidden="true">{index + 1}</span>;
    }
    return null;
  };

  return (
    <ol {...rest} ref={ref} className={classes}>
      {items.map((item, index) => (
        <li key={`${item.title}-${index}`} className={`${BASE_CLASS}__item`}>
          <span
            className={`${BASE_CLASS}__marker${
              item.icon
                ? ` ${BASE_CLASS}__marker--icon`
                : numbered
                  ? ` ${BASE_CLASS}__marker--badge`
                  : ''
            }`}
          >
            {renderMarker(item, index)}
          </span>
          <div className={`${BASE_CLASS}__content`}>
            {item.meta && <span className={`${BASE_CLASS}__meta`}>{item.meta}</span>}
            <span className={`${BASE_CLASS}__title`}>{item.title}</span>
            {item.description && (
              <div className={`${BASE_CLASS}__description`}>{item.description}</div>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
});

Timeline.displayName = 'Timeline';
