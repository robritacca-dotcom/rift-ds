import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Textarea } from './Textarea';

const meta = {
  title: 'Components/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    defaultValue: { control: 'text' },
    rows: { control: 'number' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    error: { control: 'boolean' },
    helperText: { control: 'text' },
    resize: {
      control: 'select',
      options: ['none', 'vertical', 'horizontal', 'both'],
    },
    maxLength: { control: 'number' },
  },
  args: {
    onChange: fn(),
    onFocus: fn(),
    onBlur: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ width: '360px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Description',
    placeholder: 'Enter a description...',
  },
};

export const WithValue: Story = {
  args: {
    label: 'Bio',
    defaultValue: 'Design systems engineer passionate about tokens, components, and scalable UI architecture.',
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Feedback',
    placeholder: 'Tell us what you think...',
    helperText: 'Your feedback helps us improve',
  },
};

export const WithCounter: Story = {
  args: {
    label: 'Tweet',
    placeholder: 'What\'s happening?',
    maxLength: 280,
    defaultValue: 'Building a design system',
  },
};

export const Required: Story = {
  args: {
    label: 'Comments',
    placeholder: 'Add your comments...',
    required: true,
  },
};

export const Error: Story = {
  args: {
    label: 'Description',
    defaultValue: 'Too short',
    error: true,
    helperText: 'Description must be at least 50 characters',
  },
};

export const ErrorWithCounter: Story = {
  args: {
    label: 'Bio',
    defaultValue: 'This bio has exceeded the maximum character limit for the field and needs to be shortened.',
    maxLength: 80,
    error: true,
    helperText: 'Exceeds character limit',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Notes',
    defaultValue: 'This field is not editable',
    disabled: true,
  },
};

/** The compact size, for dense forms and side panels. */
export const Compact: Story = {
  args: {
    label: 'Notes',
    placeholder: 'Add a note...',
    helperText: 'Visible to your team',
    size: 'compact',
  },
};

export const NoResize: Story = {
  args: {
    label: 'Fixed size',
    placeholder: 'Cannot be resized...',
    resize: 'none',
    rows: 3,
  },
};
