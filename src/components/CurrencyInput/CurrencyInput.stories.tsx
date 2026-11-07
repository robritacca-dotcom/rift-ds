import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { CurrencyInput } from './CurrencyInput';

const meta = {
  title: 'Components/CurrencyInput',
  component: CurrencyInput,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    currencyDisplay: { control: 'inline-radio', options: ['symbol', 'code', 'none'] },
    size: { control: 'inline-radio', options: ['default', 'compact'] },
  },
  args: { label: 'Price', currency: 'USD', onValueChange: fn() },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: '280px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CurrencyInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/** An invoice line's price: the raw number while typing, grouped at two digits once the field is left. */
export const Default: Story = {
  play: async ({ canvas, args }) => {
    const input = canvas.getByRole('textbox', { name: 'Price' });
    await userEvent.type(input, '1234.5');
    await expect(args.onValueChange).toHaveBeenLastCalledWith('1234.5');
    await userEvent.tab();
    await expect(input).toHaveValue('1,234.50');
    await expect(args.onValueChange).toHaveBeenLastCalledWith('1234.50');
  },
};

/** A budget in euros, read and written in German: the comma is the decimal mark and the symbol follows the number. */
export const EuroInGerman: Story = {
  args: { label: 'Budget', currency: 'EUR', locale: 'de-DE', defaultValue: '25000' },
};

/** Yen have no minor unit, so the field takes whole amounts. */
export const Yen: Story = {
  args: { label: 'Transfer amount', currency: 'JPY', locale: 'ja-JP', defaultValue: '15000' },
};

/** Three digits after the point for a dinar, and the code in place of the symbol. */
export const DinarByCode: Story = {
  args: { label: 'Amount', currency: 'KWD', currencyDisplay: 'code', defaultValue: '12.5' },
};

/** A pasted amount with a symbol and grouping is read for its number. */
export const Paste: Story = {
  args: { label: 'Tip' },
  play: async ({ canvas, args }) => {
    const input = canvas.getByRole('textbox', { name: 'Tip' });
    await userEvent.click(input);
    await userEvent.paste('$1,234.5');
    await expect(args.onValueChange).toHaveBeenLastCalledWith('1234.5');
    await userEvent.tab();
    await expect(input).toHaveValue('1,234.50');
  },
};

/** Up and Down step by `step`, held to `min` and `max`. */
export const Stepping: Story = {
  args: { label: 'Monthly budget', defaultValue: '9', step: '5', min: '0', max: '10' },
  play: async ({ canvas, args }) => {
    const input = canvas.getByRole('textbox', { name: 'Monthly budget' });
    await userEvent.click(input);
    await userEvent.keyboard('{ArrowUp}');
    await expect(args.onValueChange).toHaveBeenLastCalledWith('10.00');
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
    await expect(args.onValueChange).toHaveBeenLastCalledWith('0.00');
    await userEvent.tab();
  },
};

/** A refund or an adjustment may go below zero. */
export const Negative: Story = {
  args: { label: 'Adjustment', allowNegative: true, defaultValue: '-42.1' },
};

/** Controlled: the amount lives in the parent, here doubled by a button. */
export const Controlled: Story = {
  render: function Render(args) {
    const [amount, setAmount] = useState<string | null>('19.99');
    return (
      <div style={{ display: 'grid', gap: 'var(--gap-200)' }}>
        <CurrencyInput {...args} label="Unit price" value={amount} onValueChange={setAmount} />
        <span>Stored as {amount === null ? 'nothing' : `"${amount}"`}</span>
      </div>
    );
  },
};

/** The form receives the decimal string, never the grouped text. */
export const InAForm: Story = {
  args: { label: 'Deposit', name: 'deposit', defaultValue: '1500' },
  play: async ({ canvasElement }) => {
    const hidden = canvasElement.querySelector<HTMLInputElement>('input[type="hidden"][name="deposit"]');
    await expect(hidden?.value).toBe('1500');
  },
};

export const Compact: Story = {
  args: { size: 'compact', label: 'Fee', defaultValue: '2.5' },
};

export const WithError: Story = {
  args: { label: 'Transfer amount', defaultValue: '0', errorText: 'Enter an amount above zero.' },
};

export const Disabled: Story = {
  args: { label: 'Credit limit', defaultValue: '5000', disabled: true },
};
