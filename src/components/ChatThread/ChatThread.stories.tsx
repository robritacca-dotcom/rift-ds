import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChatThread } from './ChatThread';
import { ChatMessage } from '../ChatMessage/ChatMessage';
import { Button } from '../Button/Button';

const meta = {
  title: 'Components/ChatThread',
  component: ChatThread,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    anchor: { control: 'boolean' },
    ariaLabel: { control: 'text' },
  },
} satisfies Meta<typeof ChatThread>;

export default meta;
type Story = StoryObj<typeof meta>;

/* A fixed-height stage so the thread has something to scroll inside. */
const stage: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  width: 'min(560px, 90vw)',
  height: '420px',
  border: '1px solid var(--color-bg-container-border)',
  borderRadius: 'var(--radius-xl)',
  background: 'var(--color-bg-container-primary)',
  overflow: 'hidden',
};

const EXCHANGES = [
  {
    q: 'What does the design system cover?',
    a: 'It spans foundations like colour, type, and motion, plus the component library that builds on them.',
  },
  {
    q: 'How is dark mode handled?',
    a: 'Every semantic token has a light and dark value, so components never branch on the theme themselves.',
  },
  {
    q: 'And what about the chat pieces?',
    a: 'The ai category holds the conversation primitives — messages, the composer, status, and reasoning.',
  },
];

export const Default: Story = {
  render: (args) => (
    <div style={stage}>
      <ChatThread {...args} style={{ flex: 1 }}>
        {EXCHANGES.flatMap(({ q, a }) => [
          <ChatMessage key={q} role="user">
            {q}
          </ChatMessage>,
          <ChatMessage key={a} role="assistant">
            {a}
          </ChatMessage>,
        ])}
      </ChatThread>
    </div>
  ),
};

export const EdgeFades: Story = {
  render: (args) => (
    <div style={{ ...stage, height: '280px' }}>
      <ChatThread {...args} style={{ flex: 1 }}>
        {EXCHANGES.flatMap(({ q, a }) => [
          <ChatMessage key={q} role="user">
            {q}
          </ChatMessage>,
          <ChatMessage key={a} role="assistant">
            {a}
          </ChatMessage>,
        ])}
      </ChatThread>
    </div>
  ),
};

const AnchoringDemo = () => {
  const [exchanges, setExchanges] = useState(EXCHANGES.slice(0, 1));

  const send = () => {
    const next = EXCHANGES[exchanges.length % EXCHANGES.length];
    setExchanges((current) => [...current, next]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={stage}>
        <ChatThread style={{ flex: 1 }}>
          {exchanges.flatMap(({ q, a }, i) => [
            <ChatMessage key={`${q}-${i}-q`} role="user">
              {q}
            </ChatMessage>,
            <ChatMessage key={`${a}-${i}-a`} role="assistant">
              {a}
            </ChatMessage>,
          ])}
        </ChatThread>
      </div>
      <Button variant="secondary" size="compact" label="Send another turn" onClick={send} />
    </div>
  );
};

export const SendAnchoring: Story = {
  render: () => <AnchoringDemo />,
};
