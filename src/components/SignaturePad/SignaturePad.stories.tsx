import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor } from 'storybook/test';
import { SignaturePad } from './SignaturePad';

const meta = {
  title: 'Components/SignaturePad',
  component: SignaturePad,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    mode: { control: 'inline-radio', options: ['both', 'draw', 'type'] },
    height: { control: 'inline-radio', options: ['default', 'tall'] },
    size: { control: 'inline-radio', options: ['default', 'compact'] },
  },
  args: { label: 'Signature', onValueChange: fn() },
  decorators: [
    (Story) => (
      <div style={{ maxInlineSize: '520px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SignaturePad>;

export default meta;
type Story = StoryObj<typeof meta>;

/** E-sign consent: draw or type, the drawn strokes kept as SVG. A stroke is announced, and Undo takes it back. */
export const Default: Story = {
  play: async ({ canvas, args }) => {
    const pad = canvas.getByRole('img', { name: 'Signature drawing area' });
    const box = pad.getBoundingClientRect();
    const at = (x: number, y: number) => ({ clientX: box.left + box.width * x, clientY: box.top + box.height * y });
    await userEvent.pointer([
      { keys: '[MouseLeft>]', target: pad, coords: at(0.2, 0.6) },
      { target: pad, coords: at(0.35, 0.4) },
      { target: pad, coords: at(0.5, 0.65) },
      { target: pad, coords: at(0.7, 0.45) },
      { keys: '[/MouseLeft]', target: pad, coords: at(0.8, 0.6) },
    ]);
    await waitFor(() =>
      expect(args.onValueChange).toHaveBeenLastCalledWith(expect.objectContaining({ kind: 'drawn' })),
    );
    await expect(canvas.getByText('Signature added')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Undo' }));
    await expect(args.onValueChange).toHaveBeenLastCalledWith(null);
    await expect(canvas.getByRole('button', { name: 'Undo' })).toBeDisabled();
  },
};

/** The typed way in: the name sets on the baseline in the body face, italic. */
export const Typed: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('tab', { name: 'Type' }));
    await userEvent.type(canvas.getByRole('textbox', { name: 'Type your full name' }), 'Sam Okafor');
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ kind: 'typed', text: 'Sam Okafor' }),
    );
  },
};

/** Delivery proof on a handheld: drawing only, a taller pad. */
export const DeliveryProof: Story = {
  args: { label: 'Recipient signature', mode: 'draw', height: 'tall', helperText: 'Ask the recipient to sign with a finger.' },
};

/** An approval that takes a typed name only. */
export const TypeOnly: Story = {
  args: { label: 'Approved by', mode: 'type', defaultValue: { kind: 'typed', text: 'Priya Shah' } },
};

export const Compact: Story = {
  args: { size: 'compact' },
};

export const WithError: Story = {
  args: { errorText: 'Sign to accept the agreement.', required: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};
