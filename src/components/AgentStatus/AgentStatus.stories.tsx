import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AgentStatus } from './AgentStatus';
import { agentStatusPatterns } from './AgentStatusPatterns';

const meta = {
  title: 'Components/AgentStatus',
  component: AgentStatus,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    state: {
      control: 'select',
      options: ['idle', 'thinking', 'working', 'waiting', 'done', 'error'],
    },
    pattern: { control: 'select', options: agentStatusPatterns },
    size: { control: 'inline-radio', options: ['default', 'compact'] },
    variant: { control: 'inline-radio', options: ['inline', 'bar'] },
  },
} satisfies Meta<typeof AgentStatus>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { state: 'thinking', label: 'Thinking' },
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <AgentStatus state="idle" />
      <AgentStatus state="thinking" />
      <AgentStatus state="working" label="Reading 14 files" />
      <AgentStatus state="waiting" label="Waiting for approval" />
      <AgentStatus state="done" label="Finished in 4s" />
      <AgentStatus state="error" label="Tool call failed" />
    </div>
  ),
};

/** Every choreography runs over the same 4x3 grid, so the footprint never shifts. */
export const Patterns: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {agentStatusPatterns.map((pattern) => (
        <AgentStatus key={pattern} pattern={pattern} label={pattern} />
      ))}
    </div>
  ),
};

export const Bar: Story = {
  args: { variant: 'bar', state: 'working', label: 'Running the test suite' },
  parameters: { layout: 'padded' },
};

/** Compact matches compact ChatMessage text, for dense transcripts. */
export const Compact: Story = {
  args: { size: 'compact', state: 'thinking', label: 'Planning the migration' },
};

/** The shimmer is on by default while active; turn it off for a quieter row. */
export const NoShimmer: Story = {
  args: { state: 'working', label: 'Indexing the repository', shimmer: false },
};

const CYCLING_LABELS = [
  'Reading the brief',
  'Comparing the options',
  'Drafting the answer',
];

const LabelTransitionsDemo = () => {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setStep((s) => (s + 1) % CYCLING_LABELS.length),
      1600,
    );
    return () => clearInterval(id);
  }, []);
  return <AgentStatus state="working" label={CYCLING_LABELS[step]} />;
};

/**
 * A changing `label` crossfades: the old text fades up and out while the
 * new one fades up and in. The shimmer pauses for the swap and resumes on
 * the settled text.
 */
export const LabelTransitions: Story = {
  render: () => <LabelTransitionsDemo />,
};
