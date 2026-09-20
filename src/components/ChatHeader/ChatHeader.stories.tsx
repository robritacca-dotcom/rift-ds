import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChatHeader } from './ChatHeader';
import { CircularButton } from '../CircularButton/CircularButton';

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
  borderRadius: 'var(--radius-xl)',
  background: 'var(--color-bg-container-primary)',
};

export const Default: Story = {
  render: (args) => (
    <div style={stage}>
      <ChatHeader
        {...args}
        actions={
          <CircularButton icon="close" variant="tertiary" ariaLabel="Close chat" />
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
            <CircularButton
              icon="edit_square"
              variant="tertiary"
              ariaLabel="New chat"
            />
            <CircularButton
              icon="open_in_full"
              variant="tertiary"
              ariaLabel="Enter full screen"
            />
            <CircularButton icon="close" variant="tertiary" ariaLabel="Close chat" />
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
