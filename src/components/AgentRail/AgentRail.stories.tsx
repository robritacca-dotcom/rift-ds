import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { EmptyState } from '../EmptyState/EmptyState';
import { NotificationItem } from '../NotificationCenter/NotificationCenter';
import { AgentRail, type AgentRailTab } from './AgentRail';

/* All data here is fictional: Skylark is a made-up agent, and every run,
   automation and approval below is invented set dressing. */

const ACTIVITY = (
  <>
    <NotificationItem title="Watch the Q3 invoices" media="bolt" time="9:13 am">
      Started the hourly check on the billing inbox
    </NotificationItem>
    <NotificationItem title="Draft the renewal note" media="check_circle" time="9:04 am">
      Asked for your choice on the tone
    </NotificationItem>
    <NotificationItem title="Tidy the workspace roles" media="check_circle" time="9:02 am">
      Interrupted
    </NotificationItem>
  </>
);

const AUTOMATIONS = (
  <>
    <NotificationItem title="Morning digest" media="schedule" time="8:00 am">
      Every weekday
    </NotificationItem>
    <NotificationItem title="Inbox sweep" media="mail" time="Every 30 minutes">
      Flags anything waiting on a reply
    </NotificationItem>
  </>
);

const TABS: AgentRailTab[] = [
  { id: 'activity', label: 'Activity', icon: 'list', content: ACTIVITY },
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
  { id: 'scheduled', label: 'Scheduled', icon: 'history_toggle_off', content: AUTOMATIONS },
  {
    id: 'profile',
    label: 'You',
    icon: 'fingerprint',
    content: (
      <EmptyState
        size="compact"
        icon="fingerprint"
        title="Nothing saved"
        description="What the agent remembers about you shows up here."
      />
    ),
  },
];

const meta = {
  title: 'Components/AgentRail',
  component: AgentRail,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    activeTab: { control: 'text' },
    tabsLabel: { control: 'text' },
  },
  args: {
    tabs: TABS,
    activeTab: 'activity',
    profile: {
      name: 'Skylark',
      status: 'Connected',
      onEdit: fn(),
    },
    onTabChange: fn(),
    onCollapse: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320, height: 600, display: 'flex' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AgentRail>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The full anatomy: the agent's portrait with its edit affordance, the
 *  four-tab strip, and the activity pane on stage. */
export const Default: Story = {};

/** A pane with nothing in it yet. Approvals is the tab that spends most of
 *  its life empty, which is the point — a quiet rail means nothing is
 *  waiting on a human. */
export const EmptyPane: Story = {
  args: { activeTab: 'approvals' },
};

/** Without onCollapse the rail has no way out of its own: the shape for a
 *  host where the panel is permanent furniture. */
export const NoCollapse: Story = {
  args: { onCollapse: undefined },
};

/** Without a profile the rail is tabs alone — the shape for a product whose
 *  agent has no face of its own. */
export const NoProfile: Story = {
  args: { profile: undefined },
};

/** The status line takes any of the five status roles. */
export const Disconnected: Story = {
  args: {
    profile: { name: 'Skylark', status: 'Reconnecting', statusTone: 'warning' },
  },
};

/** The rail is controlled, so a host that owns the state switches panes.
 *  This story wires that state up and asserts the swap. */
export const Switching: Story = {
  render: (args) => {
    const [tab, setTab] = useState('activity');
    return <AgentRail {...args} activeTab={tab} onTabChange={setTab} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('tabpanel', { name: 'Activity' })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('tab', { name: 'Approvals' }));
    await expect(canvas.getByRole('tabpanel', { name: 'Approvals' })).toBeInTheDocument();
    // Back to the resting state, so the snapshot is stable.
    await userEvent.click(canvas.getByRole('tab', { name: 'Activity' }));
    await expect(canvas.getByRole('tabpanel', { name: 'Activity' })).toBeInTheDocument();
  },
};
