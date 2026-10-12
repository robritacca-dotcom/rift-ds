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
}

/**
 * The built-in agent pane: an AgentRail the widget seats on the
 * conversation's trailing edge (inline at 860px and up, a bottom sheet
 * below). A host hands it the agent's profile and panes; the widget owns
 * whether it is up, so `onCollapse` is deliberately unwired here: the
 * header's agent toggle is the one control, both ways.
 */
export function ChatAgentPane({ profile, tabs, activeTab, onTabChange, overlay }: ChatAgentPaneProps) {
  const [ownTab, setOwnTab] = useState(tabs[0]?.id ?? '');
  const current = activeTab ?? ownTab;
  return (
    <AgentRail
      className={overlay ? 'ds-chat-agent-pane--sheet' : undefined}
      profile={profile}
      tabs={tabs}
      activeTab={current}
      onTabChange={(id) => {
        setOwnTab(id);
        onTabChange?.(id);
      }}
    />
  );
}
