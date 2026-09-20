import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { InterruptCard, type InterruptCardOption } from './InterruptCard';
import { Button } from '../Button/Button';
import { ToolCall } from '../ToolCall/ToolCall';
import { CodeBlock } from '../CodeBlock/CodeBlock';

const APPROVAL_OPTIONS: InterruptCardOption[] = [
  { value: 'allow-once', label: 'Allow once', variant: 'primary' },
  { value: 'allow-always', label: 'Always allow' },
  { value: 'deny', label: 'Deny' },
];

const WRITE_ARGS = `{
  "path": "src/routes/checkout.ts",
  "bytes": 2048
}`;

const meta = {
  title: 'Components/InterruptCard',
  component: InterruptCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    icon: { control: 'text' },
    value: { control: 'text' },
  },
  args: {
    title: 'Allow file edit?',
    description: 'The agent wants to write to src/routes/checkout.ts.',
    options: APPROVAL_OPTIONS,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '480px', maxWidth: '100%' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InterruptCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The intended pairing: a pending ToolCall in the detail slot showing what wants to run. */
export const WithToolCall: Story = {
  args: {
    children: (
      <ToolCall name="write_file" status="pending" summary="src/routes/checkout.ts">
        <CodeBlock code={WRITE_ARGS} language="json" />
      </ToolCall>
    ),
  },
};

/** A destructive approval takes the `danger` weight, which renders Button's destructive variant. */
export const DangerOption: Story = {
  args: {
    title: 'Delete 3 files?',
    description: 'This removes the generated fixtures and cannot be undone.',
    icon: 'warning',
    options: [
      { value: 'delete', label: 'Delete', variant: 'danger' },
      { value: 'cancel', label: 'Cancel' },
    ],
  },
};

/** With `value` set the decision is made: monochrome, and the footer echoes the chosen label. */
export const Answered: Story = {
  args: {
    value: 'allow-once',
  },
};

/** Fully controlled wiring: `onValueChange` reports the choice and `value` renders it. */
const InteractiveDemo = () => {
  const [value, setValue] = useState<string | undefined>(undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
      <InterruptCard
        title="Allow file edit?"
        description="The agent wants to write to src/routes/checkout.ts."
        options={APPROVAL_OPTIONS}
        value={value}
        onValueChange={setValue}
      />
      {value !== undefined && (
        <Button
          variant="tertiary"
          size="compact"
          label="Reset"
          onClick={() => setValue(undefined)}
        />
      )}
    </div>
  );
};

export const Interactive: Story = {
  render: () => <InteractiveDemo />,
};
