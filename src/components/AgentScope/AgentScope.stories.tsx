import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { AgentScope, type AgentScopeLevel, type AgentScopePermission } from './AgentScope';
import { Widget } from '../Widget/Widget';

const PERMISSIONS: AgentScopePermission[] = [
  { id: 'balances', label: 'Balances', description: 'Accounts and what is in them', icon: 'account_balance', held: 'act', levels: ['none', 'view'] },
  { id: 'payments', label: 'Payments', description: 'Send and schedule payments', icon: 'payments', held: 'act', approval: true },
  { id: 'cards', label: 'Cards', description: 'Card limits and freezes', icon: 'credit_card', held: 'act' },
  { id: 'statements', label: 'Statements', description: 'Monthly statements and exports', icon: 'description', held: 'view', levels: ['none', 'view'] },
  { id: 'payroll', label: 'Payroll', description: 'Pay runs and payslips', icon: 'badge', held: 'none' },
];

const meta = {
  title: 'Components/AgentScope',
  component: AgentScope,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    permissions: PERMISSIONS,
    defaultValue: { balances: 'view', payments: 'prepare' },
    onValueChange: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 640 }}>
        <Widget title="What Ledger can do" description="Never more than you can do yourself">
          <Story />
        </Widget>
      </div>
    ),
  ],
} satisfies Meta<typeof AgentScope>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Each area offers levels up to the person's own. Payments moves money, so it stops at Prepare and says a person approves; Payroll, which this person does not hold, is left out and counted. */
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    /* Payments never offers Act. */
    const payments = canvas.getByRole('tablist', { name: 'Payments' });
    await expect(within(payments).queryByRole('tab', { name: 'Act' })).toBeNull();
    /* Statements stops at the person's own View. */
    const statements = canvas.getByRole('tablist', { name: 'Statements' });
    await expect(within(statements).getAllByRole('tab')).toHaveLength(2);
    /* Payroll is left out and counted. */
    await expect(canvas.queryByRole('tablist', { name: 'Payroll' })).toBeNull();
    await expect(canvas.getByText(/1 more area is left out/)).toBeInTheDocument();
    /* Changing a level reports every area's. */
    const cards = canvas.getByRole('tablist', { name: 'Cards' });
    await userEvent.click(within(cards).getByRole('tab', { name: 'View' }));
    await expect(args.onValueChange).toHaveBeenCalledWith({ balances: 'view', payments: 'prepare', cards: 'view' });
  },
};

/** Controlled: the host owns the levels, here with a reset that takes the agent back to nothing. */
export const Controlled: Story = {
  render: function Render(args) {
    const [value, setValue] = useState<Record<string, AgentScopeLevel>>({ balances: 'view', cards: 'act' });
    return (
      <>
        <AgentScope {...args} defaultValue={undefined} value={value} onValueChange={setValue} />
        <button type="button" onClick={() => setValue({})} style={{ marginBlockStart: 12 }}>
          Revoke everything
        </button>
      </>
    );
  },
};

/** A person with less access: the agent's ceiling falls with theirs, so Cards stops at View and Payments at Prepare. */
export const LimitedPerson: Story = {
  args: {
    permissions: PERMISSIONS.map((permission) =>
      permission.id === 'cards' ? { ...permission, held: 'view' as const } : permission,
    ),
  },
};

/** The host's own words for the levels and the notes. */
export const OwnWords: Story = {
  args: {
    levelLabels: { none: 'No access', view: 'Read', prepare: 'Draft', act: 'Full' },
    approvalLabel: 'Approval required',
    hiddenLabel: (count) => `Hidden: ${count}`,
  },
};

/** Disabled: every area held where it is, as while a change saves. */
export const Disabled: Story = {
  args: { disabled: true },
};
