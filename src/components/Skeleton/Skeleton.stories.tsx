import type { Meta, StoryObj } from '@storybook/react-vite';
import { Skeleton } from './Skeleton';

const meta = {
  title: 'Components/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['text', 'circular', 'rectangular'] },
    width: { control: 'text' },
    height: { control: 'text' },
    lines: { control: { type: 'number', min: 1, max: 10 } },
  },
  args: {
    variant: 'text',
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = {
  args: { variant: 'text', width: '200px' },
};

export const TextMultiline: Story = {
  args: { variant: 'text', lines: 3, width: '280px' },
};

export const Circular: Story = {
  args: { variant: 'circular', width: '48px', height: '48px' },
};

export const Rectangular: Story = {
  args: { variant: 'rectangular', width: '280px', height: '120px' },
};

export const CardPlaceholder: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', width: '280px' }}>
      <Skeleton variant="circular" width="40px" height="40px" />
      <div style={{ flex: 1 }}>
        <Skeleton variant="text" lines={3} />
      </div>
    </div>
  ),
};
