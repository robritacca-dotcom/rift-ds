import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { InspectorColorPicker } from './InspectorColorPicker';

const meta = {
  title: 'Components/InspectorColorPicker',
  component: InspectorColorPicker,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['default', 'compact'] },
    disabled: { control: 'boolean' },
    showAlpha: { control: 'boolean' },
  },
  args: {
    label: 'Tint colour',
    defaultValue: '#163300',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 280, minHeight: 320 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InspectorColorPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Compact: Story = {
  args: { size: 'compact', label: 'Brand', defaultValue: '#8AE86E' },
};

export const WithAlpha: Story = {
  args: { label: 'Overlay', defaultValue: '#0E6E8F80', showAlpha: true },
};

/** The trigger is named by the setting and its reading, and a click anywhere on the bar opens the panel. */
export const WholeBarOpens: Story = {
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: 'Tint colour #163300' });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('dialog')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};

export const Disabled: Story = {
  args: { disabled: true },
};
