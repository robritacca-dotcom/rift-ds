import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';
import { AnimatedNumber } from './AnimatedNumber';
import { Button } from '../Button/Button';

const meta = {
  title: 'Components/AnimatedNumber',
  component: AnimatedNumber,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'number' },
    decimals: { control: 'number' },
    duration: { control: 'number' },
    animateOnMount: { control: 'boolean' },
  },
  args: {
    value: 12847,
  },
} satisfies Meta<typeof AnimatedNumber>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  // The count-up settles on the exact target — grouped, no decimals.
  play: async ({ canvasElement }) => {
    await waitFor(
      () => expect(canvasElement.textContent).toContain((12847).toLocaleString()),
      { timeout: 3000 },
    );
  },
};

export const Decimals: Story = {
  args: {
    value: 98.6,
    decimals: 1,
  },
};

export const CustomFormat: Story = {
  args: {
    value: 1284700,
    format: (n: number) =>
      n.toLocaleString(undefined, {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }),
  },
};

export const Static: Story = {
  args: {
    value: 42,
    animateOnMount: false,
  },
};

export const ValueChanges: Story = {
  render: (args) => {
    const Demo = () => {
      const [value, setValue] = useState(1200);
      return (
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <AnimatedNumber {...args} value={value} style={{ fontSize: '32px', fontWeight: 700 }} />
          <Button
            label="Add 250"
            variant="secondary"
            size="compact"
            onClick={() => setValue((v) => v + 250)}
          />
        </div>
      );
    };
    return <Demo />;
  },
  // A change tweens from the previous value and lands exactly on the target.
  play: async ({ canvas, canvasElement, userEvent }) => {
    await waitFor(
      () => expect(canvasElement.textContent).toContain((1200).toLocaleString()),
      { timeout: 3000 },
    );
    await userEvent.click(await canvas.findByRole('button', { name: 'Add 250' }));
    await waitFor(
      () => expect(canvasElement.textContent).toContain((1450).toLocaleString()),
      { timeout: 3000 },
    );
  },
};

export const InAStatRow: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '48px' }}>
      {[
        { label: 'Requests', value: 48210 },
        { label: 'Uptime', value: 99.98, decimals: 2, suffix: '%' },
        { label: 'p95 latency', value: 187, suffix: 'ms' },
      ].map(({ label, value, decimals, suffix }) => (
        <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '13px', opacity: 0.65 }}>{label}</span>
          <span style={{ fontSize: '28px', fontWeight: 700 }}>
            <AnimatedNumber value={value} decimals={decimals ?? 0} />
            {suffix}
          </span>
        </div>
      ))}
    </div>
  ),
};
