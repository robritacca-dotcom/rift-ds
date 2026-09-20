import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { DatePicker } from './DatePicker';

const meta = {
  title: 'Components/DatePicker',
  component: DatePicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'text' },
    size: {
      control: 'select',
      options: ['default', 'compact'],
    },
    disabled: { control: 'boolean' },
    min: { control: 'text' },
    max: { control: 'text' },
  },
  args: {
    onDateSelect: fn(),
    size: 'default',
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithSelected: Story = {
  args: {
    value: '2026-02-16',
  },
};

export const WithMinMax: Story = {
  args: {
    value: '2026-02-16',
    min: '2026-02-01',
    max: '2026-02-28',
  },
};

export const Disabled: Story = {
  args: {
    value: '2026-02-16',
    disabled: true,
  },
};

// Compact
export const CompactDefault: Story = {
  args: {
    size: 'compact',
  },
};

export const CompactWithSelected: Story = {
  args: {
    size: 'compact',
    value: '2026-02-16',
  },
};

export const CompactDisabled: Story = {
  args: {
    size: 'compact',
    value: '2026-02-16',
    disabled: true,
  },
};
