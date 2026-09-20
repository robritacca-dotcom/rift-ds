import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Reasoning } from './Reasoning';
import { AgentStatus } from '../AgentStatus/AgentStatus';
import { Button } from '../Button/Button';

const TRACE = `The request asks for the total across both regions, but the two tables
report in different currencies. I need to convert before summing, and the rate
should be the one on the invoice date rather than today's.`;

const meta = {
  title: 'Components/Reasoning',
  component: Reasoning,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    size: { control: 'inline-radio', options: ['default', 'compact'] },
  },
  args: { children: TRACE },
} satisfies Meta<typeof Reasoning>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The resting state: collapsed, with the time it took. */
export const Default: Story = {
  args: { duration: 12 },
};

/** While the trace arrives the panel is open and the summary shimmers. */
export const Streaming: Story = {
  args: { streaming: true },
};

export const Expanded: Story = {
  args: { duration: 4, defaultOpen: true },
};

/** With no duration to report, the summary falls back to a plain label. */
export const NoDuration: Story = {};

export const CustomLabel: Story = {
  args: { label: 'Checked the currency conversion', duration: 8 },
};

/** Compact matches compact ChatMessage text, for dense transcripts. */
export const Compact: Story = {
  args: { size: 'compact', duration: 12, defaultOpen: true },
};

/**
 * The live pairing: an AgentStatus as the summary while the trace streams in.
 * The status row is the disclosure trigger — click it to collapse or reopen
 * the thinking underneath. A list inside the panel renders as the trace's
 * node list: no bullets, one thinking step per item.
 */
export const LiveAgentStatus: Story = {
  args: {
    streaming: true,
    defaultOpen: true,
    summary: <AgentStatus state="working" />,
    children: (
      <ul>
        <li>The two tables report in different currencies.</li>
        <li>Convert on the invoice date, not today.</li>
        <li>Sum after conversion.</li>
      </ul>
    ),
  },
};

/**
 * A model that reports what it is doing but produces no trace to read. With
 * nothing behind the line, the chevron and the panel go: the status is just
 * a status, not a disclosure that opens onto nothing.
 */
export const SummaryOnly: Story = {
  args: {
    streaming: true,
    summaryOnly: true,
    summary: <AgentStatus state="working" label="Reading the site" />,
    children: undefined,
  },
};

const HandoffDemo = () => {
  const [live, setLive] = useState(true);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'flex-start' }}>
      <Button
        size="compact"
        variant="secondary"
        onClick={() => setLive((v) => !v)}
        label={live ? 'Complete the response' : 'Back to live'}
      />
      <Reasoning
        streaming={live}
        duration={8}
        summary={live ? <AgentStatus state="working" /> : undefined}
      >
        <ul>
          <li>The two tables report in different currencies.</li>
          <li>Convert on the invoice date, not today.</li>
        </ul>
      </Reasoning>
    </div>
  );
};

/**
 * The live→done handoff is the component's job: flip `streaming` off and
 * drop the `summary`, and the status row fades out while the thought-for
 * line slides left into the flush position.
 */
export const LiveHandoff: Story = {
  render: () => <HandoffDemo />,
};
