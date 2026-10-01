import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent } from 'storybook/test';
import { InspectorSlider } from './InspectorSlider';

const meta = {
  title: 'Components/InspectorSlider',
  component: InspectorSlider,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['default', 'compact'] },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Intensity',
    defaultValue: 0.5,
    min: 0,
    max: 1,
    step: 0.02,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 280 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InspectorSlider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Compact: Story = {
  args: { size: 'compact' },
};

/** A percentage reading through `format`; the same string is announced. */
export const Formatted: Story = {
  args: {
    label: 'Density',
    defaultValue: 100,
    min: 70,
    max: 130,
    step: 5,
    format: (value: number) => `${value}%`,
  },
  play: async ({ canvas }) => {
    const range = canvas.getByRole('slider', { name: 'Density' });
    await expect(range).toHaveAttribute('aria-valuetext', '100%');
  },
};

/** A change to the range moves the fill and the reading together. */
export const ReadingFollowsValue: Story = {
  args: { label: 'Speed', defaultValue: 2, min: 0, max: 4, step: 0.5 },
  play: async ({ canvas }) => {
    const range = canvas.getByRole('slider', { name: 'Speed' });
    fireEvent.change(range, { target: { value: '2.5' } });
    await expect(range).toHaveValue('2.5');
    await expect(canvas.getByText('2.5')).toBeInTheDocument();
    await expect(range).toHaveAttribute('aria-valuetext', '2.5');
  },
};

export const Empty: Story = {
  args: { label: 'Cursor interaction', defaultValue: 0 },
};

export const Disabled: Story = {
  args: { disabled: true },
};
