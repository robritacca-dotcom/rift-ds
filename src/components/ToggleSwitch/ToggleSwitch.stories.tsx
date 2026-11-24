import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { ToggleSwitch } from './ToggleSwitch';

const meta = {
  title: 'Components/ToggleSwitch',
  component: ToggleSwitch,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
    },
    label: {
      control: 'text',
    },
    showLabel: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
  args: {
    onCheckedChange: fn(),
  },
} satisfies Meta<typeof ToggleSwitch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const On: Story = {
  args: {
    checked: true,
    label: 'Dark Mode',
  },
};

/** Off reads as off: no tick, a neutral thumb, and a track off the action colour. */
export const Off: Story = {
  args: {
    checked: false,
    label: 'Light Mode',
  },
  play: async ({ canvasElement }) => {
    const part = (name: string) => {
      const node = canvasElement.querySelector<HTMLElement>(`.ds-toggle-switch__${name}`);
      if (!node) throw new Error(`${name} did not render`);
      return getComputedStyle(node);
    };
    const probe = document.createElement('span');
    probe.style.color = 'var(--color-action-primary-bg)';
    canvasElement.appendChild(probe);
    const action = getComputedStyle(probe).color;
    probe.remove();
    await expect(part('thumb-icon').opacity).toBe('0');
    await expect(part('track').backgroundColor).not.toBe(action);
    await expect(part('thumb').backgroundColor).not.toBe(part('track').backgroundColor);
  },
};

export const WithoutLabel: Story = {
  args: {
    checked: true,
    showLabel: false,
    'aria-label': 'Toggle theme',
  },
};

export const Disabled: Story = {
  args: {
    checked: true,
    label: 'Disabled',
    disabled: true,
  },
};

export const DisabledOff: Story = {
  args: {
    checked: false,
    label: 'Disabled Off',
    disabled: true,
  },
};

/** The compact size, for dense settings lists. */
export const Compact: Story = {
  args: {
    checked: true,
    label: 'Compact',
    size: 'compact',
  },
};

/** No `checked`: the switch keeps its own state, starting from `defaultChecked`, off unless it is set. */
export const Uncontrolled: Story = {
  args: {
    label: 'Notifications',
  },
  play: async ({ canvas, userEvent }) => {
    const toggle = canvas.getByRole('switch', { name: 'Notifications' });
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
  },
};

export const WithHelperText: Story = {
  args: {
    checked: true,
    label: 'Usage analytics',
    helperText: 'Anonymous counts only, never content.',
  },
};
