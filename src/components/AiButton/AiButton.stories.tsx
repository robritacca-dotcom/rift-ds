import type { Meta, StoryObj } from '@storybook/react-vite';
import { AiButton } from './AiButton';
import { InterruptCard } from '../InterruptCard/InterruptCard';

const meta = {
  title: 'Components/AiButton',
  component: AiButton,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'radio', options: ['default', 'compact'] },
    state: {
      control: 'select',
      options: [undefined, 'idle', 'thinking', 'working', 'waiting', 'done', 'error'],
    },
  },
} satisfies Meta<typeof AiButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const CustomLabel: Story = {
  args: { label: 'Chat with the agent', icon: 'forum' },
};

export const Compact: Story = {
  args: { size: 'compact' },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Working: Story = {
  args: { state: 'working', label: 'Agent', size: 'compact' },
};

export const Waiting: Story = {
  args: { state: 'waiting', label: 'Agent', size: 'compact' },
};

/** Every status side by side at both sizes. Done and error return to the resting icon after a beat. */
export const Statuses: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      {(['default', 'compact'] as const).map((size) => (
        <div key={size} style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {(['idle', 'thinking', 'working', 'waiting', 'done', 'error'] as const).map((status) => (
            <AiButton key={status} label="Agent" size={size} state={status} />
          ))}
        </div>
      ))}
    </div>
  ),
};

/** Waiting with a request: an InterruptCard approval opens in a panel at the button. */
export const WithRequest: Story = {
  args: {
    label: 'Agent',
    state: 'waiting',
    requestPlacement: 'bottom',
    request: (
      <InterruptCard
        bare
        title="Allow file edit?"
        description="The agent wants to write to src/routes/checkout.ts."
        options={[
          { value: 'allow-once', label: 'Allow once', variant: 'primary' },
          { value: 'deny', label: 'Deny' },
        ]}
      />
    ),
  },
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div style={{ paddingBottom: 240 }}><Story /></div>],
};

export const AsLink: Story = {
  args: { label: 'Open the chat', href: '#', icon: 'forum' },
};

const exampleSummary = {
  title: 'The Meridian workspace rebuild',
  caption: '6 min read',
  text: 'A fictional walkthrough of rebuilding a workspace product on token-owned foundations, with the decisions that made the difference.',
  suggestions: [
    { id: 'deeper', label: 'Go deeper on this page' },
    { id: 'decisions', label: 'What were the key decisions?' },
  ],
};

export const WithSummary: Story = {
  args: {
    label: 'Ask the agent',
    summary: exampleSummary,
    summaryPinned: true,
  },
  parameters: {
    // Reserve room for the panel, which opens above the button.
    layout: 'centered',
  },
};

export const SummaryBelow: Story = {
  args: {
    label: 'Ask the agent',
    summary: exampleSummary,
    summaryPlacement: 'bottom',
    summaryPinned: true,
  },
};

export const SummaryOnHover: Story = {
  args: {
    label: 'Hover me',
    summary: exampleSummary,
  },
};
