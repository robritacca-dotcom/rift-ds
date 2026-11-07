import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { MASK_PRESETS, MaskedInput } from './MaskedInput';

const meta = {
  title: 'Components/MaskedInput',
  component: MaskedInput,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'inline-radio', options: ['default', 'compact'] },
  },
  args: { label: 'Phone number', mask: MASK_PRESETS.phoneUs, onValueChange: fn() },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: '280px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MaskedInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A phone number: the separators arrive as the digits do, and the value is the digits alone. */
export const Default: Story = {
  play: async ({ canvas, args }) => {
    const input = canvas.getByRole('textbox', { name: 'Phone number' });
    await userEvent.type(input, '5550100199');
    await expect(input).toHaveValue('(555) 010-0199');
    await expect(args.onValueChange).toHaveBeenLastCalledWith('5550100199', '(555) 010-0199');
  },
};

/** Backspace just after a separator removes the digit before it, and the caret holds its place. */
export const BackspaceOverSeparator: Story = {
  args: { defaultValue: '5550100199' },
  play: async ({ canvas }) => {
    const input = canvas.getByRole<HTMLInputElement>('textbox', { name: 'Phone number' });
    await userEvent.click(input);
    // The caret just after the dash: "(555) 010-|0199".
    input.setSelectionRange(10, 10);
    await userEvent.keyboard('{Backspace}');
    await expect(input).toHaveValue('(555) 010-199');
    await expect(input.selectionStart).toBe(8);
  },
};

/** A paste in another shape is cleaned up to the mask. */
export const Paste: Story = {
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: 'Phone number' });
    await userEvent.click(input);
    await userEvent.paste('555.010.0199');
    await expect(input).toHaveValue('(555) 010-0199');
  },
};

/** A card number, hidden but for its last four until revealed. */
export const SensitiveCard: Story = {
  args: {
    label: 'Card number',
    mask: MASK_PRESETS.card,
    defaultValue: '4242424242424242',
    sensitive: true,
    revealable: true,
    visibleTail: 4,
  },
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: 'Card number' });
    await expect(input).toHaveValue('•••• •••• •••• 4242');
    const show = canvas.getByRole('button', { name: 'Show' });
    await expect(show).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(show);
    await expect(input).toHaveValue('4242 4242 4242 4242');
    await expect(canvas.getByRole('button', { name: 'Hide' })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(canvas.getByRole('button', { name: 'Hide' }));
  },
};

/** A tax ID that hides itself again thirty seconds after it is shown. */
export const AutoHide: Story = {
  args: {
    label: 'Tax ID',
    mask: MASK_PRESETS.idNumber,
    defaultValue: '123456789',
    sensitive: true,
    revealable: true,
    autoHideAfter: true,
  },
};

/** Letters and digits: a licence key in blocks of four. */
export const LicenceKey: Story = {
  args: { label: 'Licence key', mask: MASK_PRESETS.licenceKey },
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: 'Licence key' });
    await userEvent.type(input, 'AB12CD34');
    await expect(input).toHaveValue('AB12-CD34');
  },
};

/** A postal code with an optional extension. */
export const PostalCode: Story = {
  args: { label: 'ZIP code', mask: MASK_PRESETS.postalCode, defaultValue: '94107' },
};

/** A function mask: a verification code too long for PinInput, grouped in threes. */
export const FunctionMask: Story = {
  args: {
    label: 'Recovery code',
    mask: (raw: string) => (raw.slice(0, 12).match(/.{1,3}/g) ?? []).join(' '),
    defaultValue: '482913775024',
  },
};

/** The form receives the raw value, never the shown text. */
export const InAForm: Story = {
  args: { name: 'phone', defaultValue: '5550100199' },
  play: async ({ canvasElement }) => {
    const hidden = canvasElement.querySelector<HTMLInputElement>('input[type="hidden"][name="phone"]');
    await expect(hidden?.value).toBe('5550100199');
  },
};

export const Compact: Story = {
  args: { size: 'compact', defaultValue: '5550100199' },
};

export const WithError: Story = {
  args: { defaultValue: '555010', errorText: 'Enter all ten digits.' },
};

export const Disabled: Story = {
  args: { defaultValue: '5550100199', disabled: true },
};
