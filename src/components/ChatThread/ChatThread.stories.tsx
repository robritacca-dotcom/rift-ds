import { useLayoutEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';
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
    flow: { control: 'inline-radio', options: ['top-down', 'bottom-up'] },
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
  borderRadius: 'var(--radius-600)',
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

const AnchoringDemo = ({ flow }: { flow?: 'top-down' | 'bottom-up' }) => {
  const [exchanges, setExchanges] = useState(EXCHANGES.slice(0, 1));

  const send = () => {
    const next = EXCHANGES[exchanges.length % EXCHANGES.length];
    setExchanges((current) => [...current, next]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={stage}>
        <ChatThread style={{ flex: 1 }} flow={flow}>
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

/** The classic thread: turns stack from the bottom edge and the view follows the newest one. */
export const BottomUp: Story = {
  render: () => <AnchoringDemo flow="bottom-up" />,
};

/* Forces a layout as it unmounts, in the middle of React's mutation phase:
   the browser does the same when it removes a focused element (a question
   card's Send button), which headless test runs do not reproduce. Placed
   after the block it is deleted with, so the layout sees that block gone
   and the turns that replace it not yet inserted. */
const MidCommitLayout = () => {
  useLayoutEffect(
    () => () => {
      void document.documentElement.offsetHeight;
    },
    [],
  );
  return null;
};

/* A turn that folds as the reply is appended, in one render: the shape that
   once made answering a question card stutter. */
const FoldingDemo = ({ flow }: { flow?: 'top-down' | 'bottom-up' }) => {
  const [answered, setAnswered] = useState(false);
  return (
    <div style={stage}>
      <ChatThread style={{ flex: 1 }} flow={flow}>
        {EXCHANGES.flatMap(({ q, a }) => [
          <ChatMessage key={q} role="user">
            {q}
          </ChatMessage>,
          <ChatMessage key={a} role="assistant">
            {a}
          </ChatMessage>,
        ])}
        <ChatMessage role="assistant">
          {answered ? (
            <p key="folded">Mentions, comments on my files</p>
          ) : (
            [
              <div key="open" style={{ display: 'grid', gap: '8px' }}>
                {['Mentions', 'Comments on my files', 'Invites accepted', 'A weekly summary'].map((label) => (
                  <div key={label} style={{ height: '56px', border: '1px solid var(--color-bg-container-border)' }}>
                    {label}
                  </div>
                ))}
                <Button variant="primary" size="compact" label="Send" onClick={() => setAnswered(true)} />
              </div>,
              <MidCommitLayout key="probe" />,
            ]
          )}
        </ChatMessage>
        {answered && <ChatMessage role="user">Mentions, comments on my files</ChatMessage>}
        {answered && <ChatMessage role="assistant">Done.</ChatMessage>}
      </ChatThread>
    </div>
  );
};

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

/**
 * Regression guard. A send whose render also folds part of the conversation
 * can be laid out partway through its commit, which clamps a reader at the
 * end of the scroll range upward before the thread reacts. The thread must
 * start its glide from where the reader was: the position never steps back,
 * except as far as the conversation itself got shorter (bottom-up rests at
 * its new end).
 */
const foldingPlay: Story['play'] = async ({ canvasElement, canvas, userEvent }) => {
  const thread = canvasElement.querySelector<HTMLElement>('.ds-chat-thread')!;
  thread.scrollTo({ top: thread.scrollHeight, behavior: 'instant' });
  await nextFrame();
  await nextFrame();
  const before = thread.scrollTop;
  await expect(before).toBeGreaterThan(0);

  await userEvent.click(await canvas.findByRole('button', { name: 'Send' }));
  await waitFor(() => expect(canvas.getByText('Done.')).toBeInTheDocument());
  await nextFrame();
  const end = thread.scrollHeight - thread.clientHeight;
  await expect(thread.scrollTop).toBeGreaterThanOrEqual(Math.min(before, end) - 1);
};

/** A turn folding as the reply lands (answering a question card): no backward jump. */
export const FoldOnSend: Story = {
  render: () => <FoldingDemo />,
  play: foldingPlay,
};

/** The same fold in the classic thread. */
export const FoldOnSendBottomUp: Story = {
  render: () => <FoldingDemo flow="bottom-up" />,
  play: foldingPlay,
};
