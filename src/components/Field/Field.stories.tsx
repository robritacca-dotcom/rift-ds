import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field } from './Field';
import { Input } from '../Input/Input';

const meta = {
  title: 'Components/Field',
  component: Field,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Field owns the scaffolding every labelled form control shares: the label and its `htmlFor`, the required marker, the helper/error message, the ids tying them together, and the `aria-describedby` / `aria-invalid` wiring. Controls compose inside it and read that wiring through `useField()` rather than each deriving it themselves.',
      },
    },
  },
  argTypes: {
    size: { control: 'radio', options: ['default', 'compact'] },
  },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A control composed inside Field — the normal usage. */
export const Default: Story = {
  args: {
    label: 'Email address',
    helperText: 'We will only use this to contact you.',
    children: <Input placeholder="you@example.com" />,
  },
};

export const Required: Story = {
  args: {
    label: 'Full name',
    required: true,
    helperText: 'As it appears on your ID.',
    children: <Input placeholder="Jane Doe" />,
  },
};

/** Error recolours the helper text and marks the control invalid. */
export const ErrorState: Story = {
  name: 'Error',
  args: {
    label: 'Email address',
    error: true,
    helperText: 'That address is not valid.',
    children: <Input placeholder="you@example.com" error />,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Account ID',
    disabled: true,
    helperText: 'Assigned automatically.',
    children: <Input placeholder="—" disabled />,
  },
};

export const Compact: Story = {
  args: {
    label: 'Search term',
    size: 'compact',
    helperText: 'Matches titles and descriptions.',
    children: <Input placeholder="Search" size="compact" />,
  },
};

/** Without a label or helper text, Field renders only its child. */
export const BareControl: Story = {
  args: {
    children: <Input placeholder="No label, no helper" />,
  },
};

/** Every variation together. */
export const AllStates: Story = {
  args: { children: null },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '420px' }}>
      <Field label="Default" helperText="Helper text sits below the control.">
        <Input placeholder="Default" />
      </Field>
      <Field label="Required" required helperText="Marked with an asterisk.">
        <Input placeholder="Required" />
      </Field>
      <Field label="Error" error helperText="Something is wrong.">
        <Input placeholder="Error" error />
      </Field>
      <Field label="Disabled" disabled helperText="Cannot be edited.">
        <Input placeholder="Disabled" disabled />
      </Field>
      <Field label="Compact" size="compact" helperText="Smaller label and helper.">
        <Input placeholder="Compact" size="compact" />
      </Field>
    </div>
  ),
};
