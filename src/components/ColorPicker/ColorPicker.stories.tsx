import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, waitFor } from 'storybook/test';
import { ColorPicker } from './ColorPicker';

const meta = {
  title: 'Components/ColorPicker',
  component: ColorPicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'text' },
    defaultValue: { control: 'text' },
    showText: { control: 'boolean' },
    showAlpha: { control: 'boolean' },
    size: { control: 'select', options: ['default', 'compact'] },
    disabled: { control: 'boolean' },
    error: { control: 'boolean' },
  },
  args: {
    defaultValue: '#118AB2',
  },
} satisfies Meta<typeof ColorPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/**
 * The picker from the keyboard: opening moves focus onto the colour area,
 * the arrows move both of its axes, Home and End take saturation to its
 * ends, and Escape closes the panel and hands focus back to the trigger.
 */
export const Keyboard: Story = {
  args: { 'aria-label': 'Pick a colour' },
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: 'Pick a colour' });
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    const area = await screen.findByRole('slider', { name: 'Saturation and brightness' });
    await waitFor(() => expect(area).toHaveFocus());

    const brightness = () => Number(area.getAttribute('aria-valuenow'));
    const text = () => area.getAttribute('aria-valuetext');
    const before = { brightness: brightness(), text: text() };
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(brightness()).toBeLessThan(before.brightness));
    await userEvent.keyboard('{ArrowUp}');
    await waitFor(() => expect(brightness()).toBe(before.brightness));
    await userEvent.keyboard('{ArrowLeft}');
    await waitFor(() => expect(text()).not.toBe(before.text));
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(text()).toBe(before.text));
    await userEvent.keyboard('{Home}');
    const least = text();
    await userEvent.keyboard('{End}');
    await waitFor(() => expect(text()).not.toBe(least));

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('slider', { name: 'Saturation and brightness' })).toBeNull());
    await expect(trigger).toHaveFocus();
  },
};

export const WithText: Story = {
  args: {
    showText: true,
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Brand colour',
    showText: true,
    helperText: 'Drives the whole action ramp.',
  },
};

export const WithAlpha: Story = {
  args: {
    showText: true,
    showAlpha: true,
    defaultValue: '#9E47EFCC',
  },
};

export const Compact: Story = {
  args: {
    size: 'compact',
    showText: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    showText: true,
  },
};

export const ErrorState: Story = {
  args: {
    label: 'Accent colour',
    error: true,
    helperText: 'This colour fails the contrast requirement.',
    showText: true,
  },
};

/** Controlled usage — the picker drives external state and reflects it back. */
export const Controlled: Story = {
  render: function ControlledStory() {
    const [colour, setColour] = useState('#EF476F');
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <ColorPicker value={colour} onValueChange={setColour} showText aria-label="Pick a colour" />
        <span style={{ fontSize: '14px' }}>Current: {colour}</span>
      </div>
    );
  },
};
