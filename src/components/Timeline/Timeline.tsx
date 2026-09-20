import React from 'react';
import './Timeline.css';
import '../../fonts/material-symbols.css';

export interface TimelineItem {
  /** Step or event title */
  title: string;
  /** Small line above the title, e.g. a date range or stage tag */
  meta?: string;
  /** Body content under the title */
  description?: React.ReactNode;
  /** Material Symbol shown in the marker (overrides dot/number) */
  icon?: string;
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
  /** Additional CSS classes */
  className?: string;
}

export type TimelineProps = TimelineDefaultProps | TimelineCompanyProps;

const BASE_CLASS = 'ds-timeline';

const renderRoleDates = (role: TimelineRole) => {
  if (!role.start) return null;
  return (
    <span className={`${BASE_CLASS}__role-dates`}>
      {role.start} –{' '}
      {role.present ? (
        <span className={`${BASE_CLASS}__present`}>Present</span>
      ) : (
        role.end
      )}
    </span>
  );
};

const CompanyTimeline = ({ items, className = '' }: TimelineCompanyProps) => {
  const classes = [BASE_CLASS, `${BASE_CLASS}--vertical`, `${BASE_CLASS}--company`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <ol className={classes}>
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
                    {renderRoleDates(role)}
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
};

/**
 * Timeline component — an ordered sequence of steps or events with
 * connected markers. Vertical for histories and process narratives,
 * horizontal for compact steppers. The `company` variant groups one or
 * more roles under a logo marker for résumé/pipeline histories.
 */
export const Timeline = (props: TimelineProps) => {
  if (props.variant === 'company') {
    return <CompanyTimeline {...props} />;
  }

  const { items, orientation = 'vertical', numbered = false, className = '' } = props;

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
      return (
        <span className={`material-symbols-rounded ${BASE_CLASS}__marker-icon`} aria-hidden="true">
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
    <ol className={classes}>
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
};
