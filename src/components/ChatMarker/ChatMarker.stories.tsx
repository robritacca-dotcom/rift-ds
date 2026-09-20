import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChatMarker } from './ChatMarker';

const meta = {
  title: 'Components/ChatMarker',
  component: ChatMarker,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    icon: {
      control: 'text',
    },
    line: {
      control: 'boolean',
    },
    children: {
      control: 'text',
    },
  },
  args: {
    children: 'Today',
    line: true,
  },
} satisfies Meta<typeof ChatMarker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithIcon: Story = {
  args: { icon: 'history', children: 'Conversation resumed' },
};

export const SystemNote: Story = {
  args: { icon: 'model_training', children: 'Model changed' },
};

export const Bare: Story = {
  args: { line: false, children: 'Yesterday' },
};

/** Markers punctuating a run of conversation content. */
export const InConversation: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--gap-md)',
        maxWidth: '480px',
      }}
    >
      <ChatMarker>Yesterday</ChatMarker>
      <p style={{ margin: 0 }}>Where did we land on the sidebar layout?</p>
      <ChatMarker icon="history">Conversation resumed</ChatMarker>
      <p style={{ margin: 0 }}>
        We agreed to keep the searchable variant and revisit density later.
      </p>
    </div>
  ),
};
