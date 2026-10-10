import type React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { ContextMenu } from './ContextMenu';
import type { DropdownMenuEntry } from '../DropdownMenu/DropdownMenu';

const basicItems: DropdownMenuEntry[] = [
  { label: 'Open', icon: 'open_in_new', shortcut: '⌘ O', onClick: fn() },
  { label: 'Rename', icon: 'edit', shortcut: '⏎', onClick: fn() },
  { label: 'Duplicate', icon: 'content_copy', shortcut: '⌘ D', onClick: fn() },
  { type: 'separator' },
  { label: 'Delete', icon: 'delete', shortcut: '⌘ ⌫', destructive: true, onClick: fn() },
];

const richItems: DropdownMenuEntry[] = [
  {
    type: 'group',
    label: 'File',
    items: [
      { label: 'Open', icon: 'open_in_new', onClick: fn() },
      { label: 'Download', icon: 'download', onClick: fn() },
    ],
  },
  { type: 'separator' },
  {
    label: 'Share',
    icon: 'share',
    children: [
      { label: 'Copy link', icon: 'link', onClick: fn() },
      { label: 'Email', icon: 'mail', onClick: fn() },
    ],
  },
  { label: 'Archive', icon: 'archive', disabled: true },
  { type: 'separator' },
  { label: 'Delete', icon: 'delete', destructive: true, onClick: fn() },
];

const targetStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 320,
  height: 160,
  border: '1px dashed var(--color-bg-container-border)',
  borderRadius: 'var(--radius-300)',
  color: 'var(--color-text-tertiary)',
  userSelect: 'none',
};

const meta = {
  title: 'Components/ContextMenu',
  component: ContextMenu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['default', 'compact'],
    },
  },
  args: {
    items: basicItems,
    ariaLabel: 'File actions',
    children: <div style={targetStyle}>Right-click here</div>,
  },
} satisfies Meta<typeof ContextMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithGroupsAndSubmenu: Story = {
  args: { items: richItems },
};

export const Compact: Story = {
  args: { size: 'compact' },
};

/* A choice set: `selected` on every member turns the rows into radio items,
   and the chosen one holds the wash and the check (DropdownMenu's recipe). */
export const SelectedState: Story = {
  args: {
    ariaLabel: 'Sort order',
    items: [
      {
        type: 'group',
        label: 'Sort by',
        items: [
          { label: 'Name', icon: 'sort_by_alpha', selected: true, onClick: fn() },
          { label: 'Date modified', icon: 'schedule', selected: false, onClick: fn() },
          { label: 'Size', icon: 'straighten', selected: false, onClick: fn() },
        ],
      },
    ],
  },
};
