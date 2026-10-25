import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { ThemeToggle } from './ThemeToggle';

/*
 * The stories store under their own key, so trying the control here never
 * changes the mode Storybook itself remembers.
 */
const STORY_KEY = 'rift-ds-theme-toggle-story';

const meta = {
  title: 'Components/ThemeToggle',
  component: ThemeToggle,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: { storageKey: STORY_KEY },
  argTypes: {
    size: { control: 'radio', options: ['default', 'compact'] },
  },
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const DefaultSize: Story = {
  args: { size: 'default' },
};

/** Icons alone: the labels stay as each segment's accessible name. */
export const IconsOnly: Story = {
  args: { showLabels: false },
};

/** Choosing a setting writes both attributes on the root and stores the choice. */
export const SetsTheMode: Story = {
  play: async ({ canvas, userEvent }) => {
    const root = document.documentElement;
    const before = root.getAttribute('data-theme');
    await userEvent.click(await canvas.findByRole('tab', { name: 'Dark' }));
    await expect(root.getAttribute('data-theme-setting')).toBe('dark');
    await expect(root.getAttribute('data-theme')).toBe('dark');
    await expect(localStorage.getItem(STORY_KEY)).toBe('dark');
    await userEvent.click(await canvas.findByRole('tab', { name: 'Light' }));
    await expect(root.getAttribute('data-theme')).toBe('light');
    // Hand the page back as it was for the stories that follow.
    if (before) root.setAttribute('data-theme', before);
    localStorage.removeItem(STORY_KEY);
  },
};
