import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { InspectorToggleSwitch } from './InspectorToggleSwitch';

const meta = {
  title: 'Components/InspectorToggleSwitch',
  component: InspectorToggleSwitch,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['default', 'compact'] },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Pill buttons',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 280 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InspectorToggleSwitch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Off: Story = {};

export const On: Story = {
  args: { defaultChecked: true },
};

export const Compact: Story = {
  args: { size: 'compact', defaultChecked: true },
};

/** A click anywhere on the bar flips the switch, and the state is announced. */
export const WholeBarToggles: Story = {
  play: async ({ canvas, userEvent }) => {
    const toggle = canvas.getByRole('switch', { name: 'Pill buttons' });
    await expect(toggle).not.toBeChecked();
    await userEvent.click(toggle);
    await expect(toggle).toBeChecked();
    await userEvent.keyboard(' ');
    await expect(toggle).not.toBeChecked();
  },
};

export const Disabled: Story = {
  args: { disabled: true, defaultChecked: true },
};
