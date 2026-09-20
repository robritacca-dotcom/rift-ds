import type { Meta, StoryObj } from '@storybook/react-vite';
import { Rating } from './Rating';

const meta = {
  title: 'Components/Rating',
  component: Rating,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    max: { control: { type: 'number', min: 1, max: 10 } },
    size: {
      control: 'select',
      options: ['default', 'compact'],
    },
    icon: { control: 'text' },
  },
} satisfies Meta<typeof Rating>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultValue: 3,
    label: 'Rate this component',
  },
};

export const Empty: Story = {
  args: {
    label: 'Rate this component',
  },
};

export const Compact: Story = {
  args: {
    defaultValue: 4,
    size: 'compact',
    label: 'Rate this component',
  },
};

export const ReadOnly: Story = {
  args: {
    value: 4,
    readOnly: true,
    label: 'Average rating',
  },
};

export const TenSteps: Story = {
  args: {
    defaultValue: 7,
    max: 10,
    label: 'Score out of ten',
  },
};

export const CustomIcon: Story = {
  args: {
    defaultValue: 3,
    icon: 'favorite',
    label: 'Favourite level',
  },
};

export const AllowClear: Story = {
  args: {
    defaultValue: 3,
    allowClear: true,
    label: 'Rate this component',
  },
};

export const Disabled: Story = {
  args: {
    value: 2,
    disabled: true,
    label: 'Rate this component',
  },
};
