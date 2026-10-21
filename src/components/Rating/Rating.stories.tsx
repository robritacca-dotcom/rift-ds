import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
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

/**
 * The radio-group keyboard pattern: the checked step is the one tab stop,
 * arrows move and select (clamped at the ends, never down to 0), Home and
 * End jump to the ends, and focus follows the selection.
 */
export const KeyboardNavigation: Story = {
  args: {
    defaultValue: 3,
    label: 'Rate this component',
    onValueChange: fn(),
  },
  play: async ({ canvas, userEvent, args }) => {
    const group = canvas.getByRole('radiogroup', { name: 'Rate this component' });
    const step = (n: number) =>
      canvas.getByRole('radio', { name: `Rate this component: ${n} out of 5` });
    const tabStops = () =>
      Array.from(group.querySelectorAll('[role="radio"]')).filter(
        (el) => el.getAttribute('tabindex') === '0',
      );

    await expect(step(3)).toBeChecked();
    await expect(tabStops()).toEqual([step(3)]);

    await userEvent.tab();
    await expect(step(3)).toHaveFocus();

    await userEvent.keyboard('{ArrowRight}');
    await expect(step(4)).toBeChecked();
    await expect(step(4)).toHaveFocus();
    await expect(args.onValueChange).toHaveBeenLastCalledWith(4);
    await expect(tabStops()).toEqual([step(4)]);

    await userEvent.keyboard('{ArrowLeft}{ArrowDown}');
    await expect(step(2)).toBeChecked();
    await expect(step(2)).toHaveFocus();

    await userEvent.keyboard('{Home}');
    await expect(step(1)).toBeChecked();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(step(1)).toBeChecked();
    await expect(args.onValueChange).not.toHaveBeenCalledWith(0);

    await userEvent.keyboard('{End}');
    await expect(step(5)).toBeChecked();
    await expect(step(5)).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    await expect(step(5)).toBeChecked();
    await expect(args.onValueChange).toHaveBeenLastCalledWith(5);

    // Tabbing away and back returns to the checked step, not the first.
    await userEvent.tab({ shift: true });
    await userEvent.tab();
    await expect(step(5)).toHaveFocus();
  },
};
