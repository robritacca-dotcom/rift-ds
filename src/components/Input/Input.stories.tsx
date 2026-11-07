import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { Input } from './Input';

const meta = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    value: { control: 'text' },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url'],
    },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    error: { control: 'boolean' },
    helperText: { control: 'text' },
    iconLeft: { control: 'text' },
    iconRight: { control: 'text' },
  },
  args: {
    onChange: fn(),
    onFocus: fn(),
    onBlur: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ width: '320px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Email',
    placeholder: 'Enter your email',
  },
};

export const WithValue: Story = {
  args: {
    label: 'Email',
    value: 'jordan@example.com',
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter password',
    helperText: 'Must be at least 8 characters',
  },
};

export const Required: Story = {
  args: {
    label: 'Full Name',
    placeholder: 'Enter your name',
    required: true,
  },
};

export const Error: Story = {
  args: {
    label: 'Email',
    value: 'invalid-email',
    error: true,
    helperText: 'Please enter a valid email address',
  },
};

export const WithIconLeft: Story = {
  args: {
    label: 'Search',
    placeholder: 'Search...',
    iconLeft: 'search',
  },
};

export const WithIconRight: Story = {
  args: {
    label: 'Email',
    placeholder: 'Enter your email',
    iconRight: 'mail',
  },
};

export const WithBothIcons: Story = {
  args: {
    label: 'Search',
    placeholder: 'Search...',
    iconLeft: 'search',
    iconRight: 'tune',
  },
};

/** Icon props also take a custom element — any icon set works when the SVG draws with `currentColor`. */
export const WithCustomIconNode: Story = {
  args: {
    label: 'Search',
    placeholder: 'Search...',
    iconLeft: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    ),
  },
};

export const Disabled: Story = {
  args: {
    label: 'Email',
    value: 'disabled@example.com',
    disabled: true,
  },
};

/** The compact size, for dense forms and toolbars. */
export const Compact: Story = {
  args: {
    label: 'Email',
    placeholder: 'Enter your email',
    helperText: 'We never share it',
    size: 'compact',
  },
};

export const NoLabel: Story = {
  args: {
    placeholder: 'No label input',
    'aria-label': 'Unlabelled input',
  },
};

/** Text inside the field, read as part of it: a scheme before an address. */
export const WithPrefix: Story = {
  args: { label: 'Website', prefix: 'https://', placeholder: 'example.com' },
};

/** A unit after the value. */
export const WithSuffix: Story = {
  args: { label: 'Weight', suffix: 'kg', inputMode: 'decimal', defaultValue: '2.5' },
};

/** A prefix and a suffix together, at the compact size. */
export const PrefixAndSuffixCompact: Story = {
  args: { label: 'Subdomain', size: 'compact', prefix: 'https://', suffix: '.example.app', defaultValue: 'northwind' },
};

/** A clear button while the field holds a value; it empties the field and hands focus back. */
export const Clearable: Story = {
  args: { label: 'Search orders', iconLeft: 'search', clearable: true, defaultValue: 'INV-2041', onClear: fn(), onValueChange: fn() },
  play: async ({ canvas, args }) => {
    const input = canvas.getByRole('textbox', { name: 'Search orders' });
    await userEvent.click(canvas.getByRole('button', { name: 'Clear' }));
    await expect(input).toHaveValue('');
    await expect(input).toHaveFocus();
    await expect(args.onClear).toHaveBeenCalled();
    await expect(args.onValueChange).toHaveBeenCalledWith('');
    await expect(canvas.queryByRole('button', { name: 'Clear' })).toBeNull();
    await userEvent.type(input, 'INV-2041');
  },
};

/** The newer error form: the message under the field, the helper text kept beside it. */
export const WithErrorText: Story = {
  args: {
    label: 'Email',
    type: 'email',
    defaultValue: 'sam@',
    helperText: 'We send receipts here.',
    errorText: 'Enter an email address like name@example.com.',
  },
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: 'Email' });
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input).toHaveAccessibleDescription(
      'Enter an email address like name@example.com. We send receipts here.',
    );
  },
};
