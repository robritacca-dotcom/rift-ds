'use client';

import { useState } from 'react';
import {
  AgentRail,
  type AgentRailProfile,
  type AgentRailTab,
} from '../components/AgentRail/AgentRail';
import './ChatAgentPane.css';

export interface ChatAgentPaneProps {
  /** The agent this pane belongs to: the portrait block at the top. */
  profile: AgentRailProfile;
  /** The panes, in display order: activity, approvals, automations, personalisation, or whatever the agent has. */
  tabs: AgentRailTab[];
  /** The tab on stage, when the host owns the state; otherwise the pane keeps its own. */
  activeTab?: string;
  /** Fires with the chosen tab's id. */
  onTabChange?: (id: string) => void;
  /** The widget seated the pane as a bottom sheet, where it fills the width instead of holding its own column. */
  overlay: boolean;
  /** Fires from the pane's own close button, a cross in its top trailing corner. Omit for a pane with no close of its own. */
  onClose?: () => void;
}

/**
 * The built-in agent pane: an AgentRail the widget seats on the
 * conversation's trailing edge (inline from ASIDE_RAIL_MIN_WIDTH, a bottom sheet
 * below, the artifact panel's own rule). A host hands it the agent's profile and panes; the widget owns
 * whether it is up. The header's agent toggle opens and closes it, and the
 * pane carries a close of its own in its top corner, where a panel's way
 * out is looked for.
 */
export function ChatAgentPane({ profile, tabs, activeTab, onTabChange, overlay, onClose }: ChatAgentPaneProps) {
  const [ownTab, setOwnTab] = useState(tabs[0]?.id ?? '');
  const current = activeTab ?? ownTab;
  return (
    <AgentRail
      className={overlay ? 'ds-chat-agent-pane--sheet' : undefined}
      profile={profile}
      tabs={tabs}
      activeTab={current}
      onCollapse={onClose}
      collapseVariant="close"
      collapseLabel="Close the agent panel"
      onTabChange={(id) => {
        setOwnTab(id);
        onTabChange?.(id);
      }}
    />
  );
}
