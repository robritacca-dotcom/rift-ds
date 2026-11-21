import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Menubar, type MenubarMenu } from './Menubar';

const MENUS: MenubarMenu[] = [
  {
    label: 'File',
    items: [
      { label: 'New tab', keys: 'mod+t' },
      { label: 'New window', keys: 'mod+n' },
      { type: 'separator' },
      { label: 'Share', children: [{ label: 'Email link' }, { label: 'Copy link' }] },
      { type: 'separator' },
      { label: 'Print', keys: 'mod+p' },
    ],
  },
  {
    label: 'Edit',
    items: [
      { label: 'Undo', keys: 'mod+z' },
      { label: 'Redo', keys: 'mod+shift+z' },
      { type: 'separator' },
      { label: 'Cut' },
      { label: 'Copy' },
      { label: 'Paste' },
    ],
  },
  {
    label: 'View',
    items: [
      { label: 'Show sidebar', checked: true },
      { label: 'Show status bar', checked: false },
      { type: 'separator' },
      { label: 'Zoom in', keys: 'mod+=' },
      { label: 'Zoom out', keys: 'mod+-' },
    ],
  },
  {
    label: 'Help',
    items: [{ label: 'Documentation' }, { label: 'Keyboard shortcuts' }, { label: 'Release notes' }],
  },
];

const meta = {
  title: 'Components/Menubar',
  component: Menubar,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'radio', options: ['default', 'compact'] },
  },
  args: { menus: MENUS },
} satisfies Meta<typeof Menubar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Compact: Story = {
  args: { size: 'compact' },
};

/** Checkbox and radio items keep their state in the host, as DropdownMenu's do. */
export const WithState: Story = {
  render: (args) => {
    const [sidebar, setSidebar] = useState(true);
    const [theme, setTheme] = useState('System');
    const menus: MenubarMenu[] = [
      ...MENUS.slice(0, 2),
      {
        label: 'View',
        items: [
          { label: 'Show sidebar', checked: sidebar, onClick: () => setSidebar((v) => !v) },
          { type: 'separator' },
          {
            type: 'group',
            label: 'Theme',
            items: ['Light', 'Dark', 'System'].map((t) => ({ label: t, selected: theme === t, onClick: () => setTheme(t) })),
          },
        ],
      },
    ];
    return <Menubar {...args} menus={menus} />;
  },
};

export const WithDisabledMenu: Story = {
  args: { menus: [...MENUS.slice(0, 3), { ...MENUS[3], disabled: true }] },
};

/** The bar is one tab stop; the arrows walk it, and open the next menu while one is open. */
export const Keyboard: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const file = canvas.getByRole('menuitem', { name: 'File' });
    const edit = canvas.getByRole('menuitem', { name: 'Edit' });
    await expect(file).toHaveAttribute('tabindex', '0');
    await expect(edit).toHaveAttribute('tabindex', '-1');
    file.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(edit).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(edit).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{ArrowRight}');
    const view = canvas.getByRole('menuitem', { name: 'View' });
    await expect(view).toHaveFocus();
    await expect(view).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{Escape}');
    await expect(view).toHaveAttribute('aria-expanded', 'false');
  },
};
