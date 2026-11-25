import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { AgentActivity, type AgentActivityEntry } from './AgentActivity';
import { Widget, WidgetGroup } from '../Widget/Widget';

const TODAY: AgentActivityEntry[] = [
  { id: '1', agent: 'Ledger', owner: 'Sara Ito', action: 'Prepared a payment of $4,200.00 to Hollis Supply', time: '10:42', outcome: 'awaiting' },
  { id: '2', agent: 'Tally', owner: 'Omar Haddad', action: 'Read the October statement', time: '09:15' },
  { id: '3', agent: 'Ledger', owner: 'Sara Ito', action: 'Asked for the payroll balance', time: '08:58', outcome: 'blocked', reason: 'Sara doesn’t hold Payroll' },
];

const YESTERDAY: AgentActivityEntry[] = [
  { id: '4', agent: 'Quill', owner: 'June Park', action: 'Froze the card ending 4417', time: '17:30' },
  { id: '5', agent: 'Ledger', owner: 'Sara Ito', action: 'Prepared a transfer of $12,000.00 to Reserve', time: '14:05', outcome: 'declined', reason: 'Declined by Sara' },
];

const meta = {
  title: 'Components/AgentActivity',
  component: AgentActivity,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { entries: TODAY },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 640 }}>
        <Widget title="Agent activity">
          <Story />
        </Widget>
      </div>
    ),
  ],
} satisfies Meta<typeof AgentActivity>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every entry names the agent and the person it acted for. A payment it drafted waits on approval; a request outside the person's own access is blocked, with the reason. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText(/Ledger for Sara Ito/)).toHaveLength(2);
    await expect(canvas.getByText('Awaiting approval')).toBeInTheDocument();
    await expect(canvas.getByText(/Sara doesn’t hold Payroll/)).toBeInTheDocument();
  },
};

/** Split by day with WidgetGroups, one log each. */
export const ByDay: Story = {
  render: (args) => (
    <>
      <WidgetGroup label="Today">
        <AgentActivity {...args} entries={TODAY} />
      </WidgetGroup>
      <WidgetGroup label="Yesterday">
        <AgentActivity {...args} entries={YESTERDAY} />
      </WidgetGroup>
    </>
  ),
};

/** The host's own words, with `done` given a mark of its own. */
export const OwnWords: Story = {
  args: {
    attributionLabel: (agent, owner) => `${agent}, acting for ${owner}`,
    outcomeLabels: { done: 'Done', awaiting: 'Needs approval', blocked: 'Not allowed' },
  },
};
