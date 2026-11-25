import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within, waitFor } from 'storybook/test';
import { AgentConnections, type AgentConnection } from './AgentConnections';
import { Widget } from '../Widget/Widget';

const AGENTS: AgentConnection[] = [
  { id: 'ledger', name: 'Ledger', owner: 'Sara Ito', scope: 'Views balances, prepares payments', lastActive: 'Active 2h ago' },
  { id: 'tally', name: 'Tally', owner: 'Omar Haddad', scope: 'Views statements', lastActive: 'Active yesterday' },
  { id: 'quill', name: 'Quill', owner: 'June Park', scope: 'Manages cards', lastActive: 'Active Mon' },
];

const meta = {
  title: 'Components/AgentConnections',
  component: AgentConnections,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { agents: AGENTS, onDisconnect: fn() },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 640 }}>
        <Widget title="Connected agents">
          <Story />
        </Widget>
      </div>
    ),
  ],
} satisfies Meta<typeof AgentConnections>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Each agent with its person, what it may do and when it last acted, and a Disconnect named for it. */
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Disconnect Tally' }));
    await expect(args.onDisconnect).toHaveBeenCalledWith(AGENTS[1]);
  },
};

/** The whole cycle, with the host owning the status: Disconnect cuts the agent off, the row stays as a record, focus lands on it and the change is announced. */
export const Lifecycle: Story = {
  render: function Render(args) {
    const [agents, setAgents] = useState(AGENTS);
    return (
      <AgentConnections
        {...args}
        agents={agents}
        onDisconnect={(agent) =>
          setAgents((current) => current.map((entry) => (entry.id === agent.id ? { ...entry, status: 'disconnected' } : entry)))
        }
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Disconnect Ledger' }));
    await waitFor(() => expect(canvasElement.querySelector('.ds-agent-connections > [role="status"]')).toHaveTextContent('Ledger disconnected'));
    await expect(canvas.queryByRole('button', { name: 'Disconnect Ledger' })).toBeNull();
    await expect(canvasElement.querySelector('.ds-agent-connections__item--disconnected')).toHaveFocus();
  },
};

/** A disconnected agent stays listed as a record, with no control. */
export const WithDisconnected: Story = {
  args: {
    agents: [...AGENTS.slice(0, 2), { ...AGENTS[2], status: 'disconnected' }],
  },
};

/** Read-only: with no `onDisconnect`, as for a person who can see the agents but not remove them. */
export const ReadOnly: Story = {
  args: { onDisconnect: undefined },
};

/** The host's own words. */
export const OwnWords: Story = {
  args: {
    ownerLabel: (owner) => `Acts for ${owner}`,
    disconnectLabel: 'Revoke',
    disconnectAccessibleLabel: (name) => `Revoke ${name}`,
    disconnectedLabel: 'Revoked',
    disconnectedAnnouncement: (name) => `${name} revoked`,
  },
};
