import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Icon } from './Icon';

const meta = {
  title: 'Components/Icon',
  component: Icon,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'inline-radio', options: ['500', '600', '800', '1200'] },
    tone: { control: 'inline-radio', options: ['default', 'neutral', 'inherit'] },
  },
  args: { name: 'settings' },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Decorative by default: hidden from assistive tech, since the text beside it says what it means. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('.ds-icon')).toHaveAttribute('aria-hidden', 'true');
  },
};

/** Every step of the icon scale. */
export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-400)' }}>
      {(['500', '600', '800', '1200'] as const).map((size) => (
        <Icon key={size} {...args} size={size} />
      ))}
    </div>
  ),
};

/** The tones: the primary icon colour, the quieter secondary, and the colour of the text around it. */
export const Tones: Story = {
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-400)' }}>
      <Icon {...args} tone="default" />
      <Icon {...args} tone="neutral" />
      <span style={{ color: 'var(--color-status-error-text)' }}>
        <Icon {...args} name="error" tone="inherit" /> Inherits
      </span>
    </div>
  ),
};

/** The filled form, as a selected item draws it. */
export const Filled: Story = {
  args: { name: 'star', filled: true },
};

/** On a round tile: the mark at the head of a stat card or a list row. */
export const Tile: Story = {
  args: { name: 'payments', tile: true, size: '500' },
};

/** With a label it is an image with that name, for an icon that carries meaning on its own. */
export const Labelled: Story = {
  args: { name: 'lock', label: 'Private' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('img', { name: 'Private' })).toBeInTheDocument();
  },
};
