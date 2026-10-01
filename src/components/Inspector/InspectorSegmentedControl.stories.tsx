import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { InspectorSegmentedControl } from './InspectorSegmentedControl';

const meta = {
  title: 'Components/InspectorSegmentedControl',
  component: InspectorSegmentedControl,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['default', 'compact'] },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Elevation',
    defaultValue: 'default',
    options: [
      { value: 'default', label: 'Default' },
      { value: 'flat', label: 'Flat' },
      { value: 'soft', label: 'Soft' },
    ],
  },
  decorators: [
    (Story) => (
      <div style={{ width: 280 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InspectorSegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Compact: Story = {
  args: { size: 'compact' },
};

export const TwoChoices: Story = {
  args: {
    label: 'Transport',
    defaultValue: 'sim',
    options: [
      { value: 'sim', label: 'Simulated' },
      { value: 'live', label: 'Live' },
    ],
  },
};

/** One radiogroup: arrow keys move the selection between segments. */
export const Keyboard: Story = {
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByRole('radiogroup', { name: 'Elevation' })).toBeInTheDocument();
    const first = canvas.getByRole('radio', { name: 'Default' });
    await expect(first).toBeChecked();
    first.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('radio', { name: 'Flat' })).toBeChecked();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(first).toBeChecked();
  },
};

export const DisabledOption: Story = {
  args: {
    options: [
      { value: 'default', label: 'Default' },
      { value: 'flat', label: 'Flat' },
      { value: 'soft', label: 'Soft', disabled: true },
    ],
  },
};

export const Disabled: Story = {
  args: { disabled: true },
};
