import React from 'react';
import { Avatar } from '../Avatar/Avatar';
import { SegmentedControl } from '../SegmentedControl/SegmentedControl';
import './AgentRail.css';
import '../../fonts/material-symbols.css';

export interface AgentRailTab {
  /** Stable identifier: `activeTab` matches against it and `onTabChange` reports it. */
  id: string;
  /** The tab's label, shown beside its icon and used as the pane's accessible name. */
  label: string;
  /** Leading icon on the tab — Material Symbol name (string) or custom element (ReactNode). Give every tab one and a squeezed rail can fall back to icons alone; give none and it keeps the labels. */
  icon?: string | React.ReactNode;
  /** The pane rendered while this tab is active. */
  content?: React.ReactNode;
  /** Whether the tab is selectable. */
  disabled?: boolean;
}

export interface AgentRailProfile {
  /** The agent's display name, shown under the portrait; also seeds the Avatar's initials. */
  name: string;
  /** The portrait's image src, handed to an `lg` Avatar. Without one the rail draws its own agent mark instead, since initials would claim a person. Ignored when `avatar` is given. */
  avatarSrc?: string;
  /** Replaces the default portrait with a custom element — a hero portrait, an illustrated mark. */
  avatar?: React.ReactNode;
  /** A short line under the name, e.g. "Connected". Renders with a leading status dot. */
  status?: React.ReactNode;
  /** Which status role the dot under the name takes. */
  statusTone?: 'positive' | 'info' | 'warning' | 'error' | 'neutral';
  /** Fires when the portrait's edit affordance is pressed. The pencil renders only when this is given. */
  onEdit?: () => void;
  /** Accessible name for the portrait's edit affordance. */
  editLabel?: string;
}

/** Props owned by AgentRail itself — everything else falls through to the root `<div>`. */
type AgentRailOwnProps = {
  /** The agent this rail belongs to, rendered as the header's portrait block. */
  profile?: AgentRailProfile;
  /** The rail's tabs, in display order. Each carries its own pane. */
  tabs: AgentRailTab[];
  /** Id of the tab on stage. The rail is controlled, so the host owns the state. */
  activeTab: string;
  /** Fires with the chosen tab's id. */
  onTabChange?: (id: string) => void;
  /** Accessible name for the tab strip. */
  tabsLabel?: string;
  /** Accessible name for the rail itself. */
  ariaLabel?: string;
  /** Fires when the rail's collapse affordance is pressed. The button renders
      only when this is given, pinned to the rail's top trailing corner. It is
      a chevron rather than a cross on purpose: the host's own close control
      is usually a cross a few pixels away, and two of them side by side read
      as two ways to dismiss the same thing. */
  onCollapse?: () => void;
  /** Accessible name for the collapse affordance. */
  collapseLabel?: string;
  /** Rendered under the pane, outside its scroll — a sign-out row, a quiet hint. */
  footer?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
};

export interface AgentRailProps
  extends AgentRailOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof AgentRailOwnProps> {}

const baseClass = 'ds-agent-rail';

/**
 * AgentRail is the companion rail of an agent product: who the agent is at
 * the top, and the record of what it has been doing below, split across
 * tabs — activity, approvals waiting on a human, standing automations, the
 * agent's own personalization.
 *
 * Surface-less like its sibling ThreadPanel: it fills the band the host
 * paints and scrolls exactly one region, the active pane. Fully controlled
 * and hook-free, so a rail whose tabs are links renders from a Server
 * Component; every affordance takes a callback, which makes the interactive
 * form a client host's by nature.
 */
export const AgentRail = React.forwardRef<HTMLDivElement, AgentRailProps>(
  (
    {
      profile,
      tabs,
      activeTab,
      onTabChange,
      tabsLabel = 'Agent views',
      ariaLabel,
      onCollapse,
      collapseLabel = 'Collapse the agent panel',
      footer,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const classes = [baseClass, className].filter(Boolean).join(' ');
    const active = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

    return (
      <div {...rest} ref={ref} className={classes} aria-label={ariaLabel}>
        {onCollapse && (
          <button
            type="button"
            className={`${baseClass}__collapse`}
            aria-label={collapseLabel}
            onClick={onCollapse}
          >
            <span className="material-symbols-rounded" aria-hidden="true">
              chevron_right
            </span>
          </button>
        )}
        {profile && (
          <header className={`${baseClass}__header`}>
            <div className={`${baseClass}__portrait`}>
              {profile.avatar ??
                (profile.avatarSrc ? (
                  <Avatar size="lg" name={profile.name} src={profile.avatarSrc} />
                ) : (
                  /* No portrait means an agent with no face yet, and the
                     placeholder says agent: initials would claim a person,
                     which is the one thing the subject here is not. */
                  <span className={`${baseClass}__mark`} aria-hidden="true">
                    <span className="material-symbols-rounded">smart_toy</span>
                  </span>
                ))}
              {profile.onEdit && (
                <button
                  type="button"
                  className={`${baseClass}__edit`}
                  aria-label={profile.editLabel ?? `Edit ${profile.name}`}
                  onClick={profile.onEdit}
                >
                  <span className="material-symbols-rounded" aria-hidden="true">
                    edit
                  </span>
                </button>
              )}
            </div>
            <p className={`${baseClass}__name`}>{profile.name}</p>
            {profile.status && (
              <p
                className={`${baseClass}__status`}
                data-tone={profile.statusTone ?? 'positive'}
              >
                <span className={`${baseClass}__status-dot`} aria-hidden="true" />
                {profile.status}
              </p>
            )}
          </header>
        )}

        <div className={`${baseClass}__tabs`}>
          <SegmentedControl
            size="compact"
            variant="neutral"
            collapse
            ariaLabel={tabsLabel}
            activeSegment={active?.id ?? ''}
            onSegmentChange={onTabChange}
            segments={tabs.map((tab) => ({
              value: tab.id,
              label: tab.label,
              icon: tab.icon,
              disabled: tab.disabled,
            }))}
          />
        </div>

        {active && (
          <div
            className={`${baseClass}__pane`}
            role="tabpanel"
            aria-label={active.label}
            tabIndex={0}
          >
            {active.content}
          </div>
        )}

        {footer && <div className={`${baseClass}__footer`}>{footer}</div>}
      </div>
    );
  },
);

AgentRail.displayName = 'AgentRail';
