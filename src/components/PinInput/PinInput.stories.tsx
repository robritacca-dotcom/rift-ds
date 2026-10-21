import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { PinInput } from './PinInput';

const meta = {
  title: 'Components/PinInput',
  component: PinInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    length: { control: { type: 'number', min: 3, max: 8 } },
    format: {
      control: 'select',
      options: ['numeric', 'alphanumeric'],
    },
    mask: { control: 'boolean' },
    error: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Verification code',
  },
} satisfies Meta<typeof PinInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    helperText: 'Enter the 6-digit code we sent you',
  },
};

export const FourDigits: Story = {
  args: {
    label: 'PIN',
    length: 4,
  },
};

export const Masked: Story = {
  args: {
    label: 'PIN',
    length: 4,
    mask: true,
    defaultValue: '1234',
  },
};

export const Alphanumeric: Story = {
  args: {
    label: 'Invite code',
    format: 'alphanumeric',
    defaultValue: 'A7',
  },
};

export const ErrorState: Story = {
  args: {
    error: true,
    defaultValue: '135791',
    helperText: 'That code has expired. Request a new one.',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: '80',
  },
};

/**
 * Entry and editing from the keyboard: typing fills a cell and advances,
 * a rejected character stays out, Backspace clears and steps back, arrows
 * move, paste distributes a whole code from the first cell, and
 * `onComplete` fires once per transition into a full code.
 */
export const KeyboardEntry: Story = {
  args: {
    label: 'PIN',
    length: 4,
    onValueChange: fn(),
    onComplete: fn(),
  },
  play: async ({ canvas, userEvent, args }) => {
    const cells = canvas.getAllByRole('textbox');
    await expect(cells).toHaveLength(4);
    await expect(cells[0]).toHaveAccessibleName('Digit 1 of 4');

    await userEvent.click(cells[0]);
    await userEvent.keyboard('1');
    await expect(cells[0]).toHaveValue('1');
    await expect(cells[1]).toHaveFocus();

    // Numeric format: a letter is rejected and focus stays put.
    await userEvent.keyboard('x');
    await expect(cells[1]).toHaveValue('');
    await expect(cells[1]).toHaveFocus();

    await userEvent.keyboard('234');
    await expect(args.onValueChange).toHaveBeenLastCalledWith('1234');
    await expect(args.onComplete).toHaveBeenCalledTimes(1);
    await expect(args.onComplete).toHaveBeenCalledWith('1234');

    // Replacing the last digit keeps the code complete, so no second call.
    await expect(cells[3]).toHaveFocus();
    await userEvent.keyboard('5');
    await expect(args.onValueChange).toHaveBeenLastCalledWith('1235');
    await expect(args.onComplete).toHaveBeenCalledTimes(1);

    // Backspace clears the focused cell and steps back; again clears that one.
    await userEvent.keyboard('{Backspace}');
    await expect(cells[3]).toHaveValue('');
    await expect(cells[2]).toHaveFocus();
    await userEvent.keyboard('{Backspace}');
    await expect(cells[2]).toHaveValue('');
    await expect(cells[1]).toHaveFocus();
    await expect(args.onValueChange).toHaveBeenLastCalledWith('12');

    // Arrows move without editing.
    await userEvent.keyboard('{ArrowLeft}');
    await expect(cells[0]).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    await expect(cells[2]).toHaveFocus();

    // Paste from any cell distributes from cell 0, non-digits stripped, and
    // the code that completes again fires onComplete again.
    await userEvent.paste('98-76');
    await expect(cells.map((cell) => (cell as HTMLInputElement).value)).toEqual([
      '9',
      '8',
      '7',
      '6',
    ]);
    await expect(args.onComplete).toHaveBeenCalledTimes(2);
    await expect(args.onComplete).toHaveBeenLastCalledWith('9876');
  },
};
