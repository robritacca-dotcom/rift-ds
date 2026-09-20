import type { Meta, StoryObj } from '@storybook/react-vite';
import { ToolCall } from './ToolCall';
import { Button } from '../Button/Button';
import { CodeBlock } from '../CodeBlock/CodeBlock';

const ARGS = `{
  "path": "src/tokens/tokens-light.css",
  "pattern": "--color-status-"
}`;

const meta = {
  title: 'Components/ToolCall',
  component: ToolCall,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    status: {
      control: 'inline-radio',
      options: ['pending', 'running', 'success', 'error'],
    },
  },
  args: {
    name: 'grep',
    summary: 'src/tokens/tokens-light.css',
    duration: '0.4s',
  },
} satisfies Meta<typeof ToolCall>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <CodeBlock code={ARGS} language="json" />,
  },
};

export const Running: Story = {
  args: { status: 'running', duration: undefined },
};

export const Failed: Story = {
  args: {
    status: 'error',
    duration: '1.1s',
    children: 'ENOENT: no such file or directory',
  },
};

/** Approval controls sit outside the panel — answering never means expanding first. */
export const AwaitingApproval: Story = {
  args: {
    name: 'write_file',
    status: 'pending',
    summary: 'src/components/Button/Button.tsx',
    duration: undefined,
    children: <CodeBlock code={ARGS} language="json" />,
    actions: (
      <>
        <Button variant="secondary" size="compact" label="Deny" />
        <Button variant="primary" size="compact" label="Allow" />
      </>
    ),
  },
};

/** With no children the header renders as a plain row rather than a control. */
export const NoDetail: Story = {
  args: { children: undefined },
};

/** A run is mostly a list of these. */
export const Sequence: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <ToolCall {...args} name="read_file" summary="package.json" duration="0.1s" />
      <ToolCall {...args} name="grep" summary="--color-status-" duration="0.4s" />
      <ToolCall {...args} name="bash" summary="npm run lint" status="running" duration={undefined} />
    </div>
  ),
  args: { children: undefined },
};
