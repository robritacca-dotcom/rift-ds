import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spinner } from './Spinner';

const meta = {
  title: 'Components/Spinner',
  component: Spinner,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    variant: { control: 'select', options: ['primary', 'neutral', 'inherit'] },
    label: { control: 'text' },
  },
  args: {
    size: 'md',
    variant: 'primary',
    label: 'Loading',
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Small: Story = {
  args: { size: 'sm' },
};

export const Large: Story = {
  args: { size: 'lg' },
};

export const Neutral: Story = {
  args: { variant: 'neutral' },
};

/** `inherit` draws in `currentColor` — here it picks up the wrapping element's colour. */
export const Inherit: Story = {
  args: { variant: 'inherit' },
  render: (args) => (
    <span style={{ color: 'var(--color-text-secondary)' }}>
      <Spinner {...args} />
    </span>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
    </div>
  ),
};
