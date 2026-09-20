import { useEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { StreamingText } from './StreamingText';

const RESPONSE =
  'The reveal animates through appended text only, so feeding it the accumulated ' +
  'response on every render is all a chat surface needs to do. When a large chunk ' +
  'lands at once, the reveal steps faster the further behind it falls, catching up ' +
  'in a beat instead of typing for seconds.';

/** Simulates a chunked stream: appends a few words at a time, then stops. */
const SimulatedStream = ({ chunkMs }: { chunkMs: number }) => {
  const [text, setText] = useState('');
  const [streaming, setStreaming] = useState(true);
  const words = useRef(RESPONSE.split(' '));
  const cursor = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const next = cursor.current + 3 + Math.floor(Math.random() * 4);
      const slice = words.current.slice(0, next).join(' ');
      cursor.current = next;
      setText(slice);
      if (next >= words.current.length) {
        setStreaming(false);
        clearInterval(interval);
      }
    }, chunkMs);
    return () => clearInterval(interval);
  }, [chunkMs]);

  return (
    <div style={{ maxWidth: '480px' }}>
      <StreamingText text={text} streaming={streaming} />
    </div>
  );
};

const meta = {
  title: 'Components/StreamingText',
  component: StreamingText,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    cursor: { control: 'boolean' },
    streaming: { control: 'boolean' },
  },
  args: {
    text: 'A finished message renders whole, with no cursor.',
    streaming: false,
  },
} satisfies Meta<typeof StreamingText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Streaming: Story = {
  render: () => <SimulatedStream chunkMs={400} />,
};

export const FastStream: Story = {
  render: () => <SimulatedStream chunkMs={120} />,
};

export const WaitingForChunks: Story = {
  args: {
    text: 'The cursor keeps blinking between chunks',
    streaming: true,
  },
};

export const NoCursor: Story = {
  args: {
    text: 'The same reveal without the cursor.',
    streaming: true,
    cursor: false,
  },
};
