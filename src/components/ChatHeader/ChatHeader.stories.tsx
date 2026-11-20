import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChatHeader } from './ChatHeader';
import { IconButton } from '../IconButton/IconButton';

const meta = {
  title: 'Components/ChatHeader',
  component: ChatHeader,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
  },
  args: {
    title: 'Assistant',
  },
} satisfies Meta<typeof ChatHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

/* A container-width stage so space-between has room to read. */
const stage: React.CSSProperties = {
  width: 'min(560px, 90vw)',
  border: '1px solid var(--color-bg-container-border)',
  borderRadius: 'var(--radius-600)',
  background: 'var(--color-bg-container-primary)',
};

export const Default: Story = {
  render: (args) => (
    <div style={stage}>
      <ChatHeader
        {...args}
        actions={
          <IconButton icon="close" variant="tertiary" label="Close chat" />
        }
      />
    </div>
  ),
};

export const FullControls: Story = {
  render: (args) => (
    <div style={stage}>
      <ChatHeader
        {...args}
        actions={
          <>
            <IconButton
              icon="edit_square"
              variant="tertiary"
              label="New chat"
            />
            <IconButton
              icon="open_in_full"
              variant="tertiary"
              label="Enter full screen"
            />
            <IconButton icon="close" variant="tertiary" label="Close chat" />
          </>
        }
      />
    </div>
  ),
};

export const TitleOnly: Story = {
  render: (args) => (
    <div style={stage}>
      <ChatHeader {...args} title="Project planning" />
    </div>
  ),
};
