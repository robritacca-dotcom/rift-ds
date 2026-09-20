import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './Badge';

const meta = {
  title: 'Components/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    variant: {
      control: 'select',
      options: ['info', 'positive', 'warning', 'error', 'neutral'],
    },
  },
  args: {
    label: 'Badge',
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

// Variants
export const Info: Story = {
  args: {
    variant: 'info',
    label: 'Info',
  },
};

export const Positive: Story = {
  args: {
    variant: 'positive',
    label: 'Success',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    label: 'Warning',
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    label: 'Error',
  },
};

export const Neutral: Story = {
  args: {
    variant: 'neutral',
    label: 'Neutral',
  },
};

// All variants together
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <Badge variant="info" label="Info" />
      <Badge variant="positive" label="Success" />
      <Badge variant="warning" label="Warning" />
      <Badge variant="error" label="Error" />
      <Badge variant="neutral" label="Neutral" />
    </div>
  ),
};
