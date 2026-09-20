import type { Meta, StoryObj } from '@storybook/react-vite';
import { AiButton } from './AiButton';

const meta = {
  title: 'Components/AiButton',
  component: AiButton,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'radio', options: ['default', 'compact'] },
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
