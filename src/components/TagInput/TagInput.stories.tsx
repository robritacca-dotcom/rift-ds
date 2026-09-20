import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { TagInput } from './TagInput';

const meta = {
  title: 'Components/TagInput',
  component: TagInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    size: {
      control: 'select',
      options: ['default', 'compact'],
    },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    error: { control: 'boolean' },
    helperText: { control: 'text' },
    maxTags: { control: 'number' },
  },
  args: {
    label: 'Tags',
    placeholder: 'Add a tag...',
    onValuesChange: fn(),
    onChange: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ width: '320px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TagInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithDefaultValues: Story = {
  args: {
    defaultValues: ['design', 'tokens'],
  },
};

export const WithHelperText: Story = {
  args: {
    helperText: 'Press Enter or comma to add a tag',
  },
};

export const ErrorState: Story = {
  args: {
    defaultValues: ['not-a-topic'],
    error: true,
    helperText: 'One of these tags is not recognised',
  },
};

export const MaxTags: Story = {
  args: {
    defaultValues: ['one', 'two', 'three'],
    maxTags: 3,
    helperText: 'Up to 3 tags',
  },
};

export const Compact: Story = {
  args: {
    size: 'compact',
    defaultValues: ['compact'],
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValues: ['locked', 'read-only'],
  },
};
