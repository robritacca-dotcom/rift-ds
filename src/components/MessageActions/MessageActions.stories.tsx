import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MessageActions, type MessageAction } from './MessageActions';
import { ChatMessage } from '../ChatMessage/ChatMessage';
import { Avatar } from '../Avatar/Avatar';

const defaultItems: MessageAction[] = [
  { id: 'copy', icon: 'content_copy', label: 'Copy' },
  { id: 'retry', icon: 'refresh', label: 'Retry' },
  { id: 'thumb-up', icon: 'thumb_up', label: 'Good response' },
  { id: 'thumb-down', icon: 'thumb_down', label: 'Bad response' },
];

const meta = {
  title: 'Components/MessageActions',
  component: MessageActions,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MessageActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: defaultItems,
  },
};

/** `active` holds the chosen feedback thumb on the pressed step of the ramp; `aria-pressed` announces it. */
export const WithActiveState: Story = {
  args: {
    items: [
      { id: 'copy', icon: 'content_copy', label: 'Copy' },
      { id: 'retry', icon: 'refresh', label: 'Retry' },
      { id: 'thumb-up', icon: 'thumb_up', label: 'Good response', active: true },
      { id: 'thumb-down', icon: 'thumb_down', label: 'Bad response', active: false },
    ],
  },
};

/** The row owns no state: the consumer swaps the item's icon and label, then swaps them back. */
const CopyFeedbackDemo = () => {
  const [copied, setCopied] = useState(false);

  return (
    <MessageActions
      items={[
        {
          id: 'copy',
          icon: copied ? 'check' : 'content_copy',
          label: copied ? 'Copied' : 'Copy',
        },
        { id: 'retry', icon: 'refresh', label: 'Retry' },
      ]}
      onActionClick={(id) => {
        if (id !== 'copy' || copied) return;
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    />
  );
};

/** Click copy: the consumer flips the icon to a check for two seconds, the row just renders it. */
export const CopyFeedback: Story = {
  args: { items: defaultItems },
  render: () => <CopyFeedbackDemo />,
};

/** Labels stay as each button's accessible name even with the tooltips off. */
export const WithoutTooltips: Story = {
  args: {
    items: defaultItems,
    showTooltips: false,
  },
};

/** The intended habitat: ChatMessage's actions slot, revealed on hover and keyboard focus. */
export const InAMessage: Story = {
  args: { items: defaultItems },
  render: () => (
    <div style={{ width: '480px' }}>
      <ChatMessage
        role="assistant"
        author="Assistant"
        timestamp="2:41 PM"
        avatar={<Avatar name="A I" size="sm" />}
        actions={<MessageActions items={defaultItems} />}
      >
        The last ferry back leaves at 11:48 PM, from Pier 4. Hover this
        message to show the action row.
      </ChatMessage>
    </div>
  ),
};
