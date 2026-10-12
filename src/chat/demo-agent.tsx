'use client';

/**
 * The demo agent's four tabs: activity, approvals, automations and
 * personalisation, for ChatWidget's `agent` prop.
 */
import type { AgentRailTab } from '../components/AgentRail/AgentRail';
import { EmptyState } from '../components/EmptyState/EmptyState';
import { DemoActivityPane, DemoPersonalizationPane, DemoScheduledPane } from './demo-agent-panes';

/** The agent pane's four tabs for an agent called `name`. */
export function demoAgentTabs(name: string): AgentRailTab[] {
  return [
    { id: 'activity', label: 'Activity', icon: 'list', content: <DemoActivityPane /> },
    {
      id: 'approvals',
      label: 'Approvals',
      icon: 'verified_user',
      content: (
        <EmptyState
          size="compact"
          icon="verified_user"
          title="No approvals yet"
          description="Anything the agent wants to spend or send lands here first."
        />
      ),
    },
    { id: 'scheduled', label: 'Scheduled', icon: 'history_toggle_off', content: <DemoScheduledPane /> },
    { id: 'profile', label: 'You', icon: 'fingerprint', content: <DemoPersonalizationPane name={name} /> },
  ];
}
