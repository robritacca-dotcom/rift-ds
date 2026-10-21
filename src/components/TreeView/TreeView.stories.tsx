import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { TreeView, type TreeViewNode } from './TreeView';

const fileTree: TreeViewNode[] = [
  {
    id: 'src',
    label: 'src',
    children: [
      {
        id: 'components',
        label: 'components',
        children: [
          { id: 'button-tsx', label: 'Button.tsx' },
          { id: 'button-css', label: 'Button.css' },
          { id: 'badge-tsx', label: 'Badge.tsx' },
        ],
      },
      {
        id: 'tokens',
        label: 'tokens',
        children: [
          { id: 'tokens-light', label: 'tokens-light.css' },
          { id: 'tokens-dark', label: 'tokens-dark.css' },
        ],
      },
      { id: 'index-ts', label: 'index.ts' },
    ],
  },
  { id: 'package-json', label: 'package.json' },
  { id: 'readme', label: 'README.md' },
];

const customIconTree: TreeViewNode[] = [
  {
    id: 'assets',
    label: 'Assets',
    icon: 'perm_media',
    children: [
      { id: 'hero-png', label: 'hero.png', icon: 'image' },
      { id: 'intro-mp4', label: 'intro.mp4', icon: 'movie' },
      { id: 'theme-json', label: 'theme.json', icon: 'data_object' },
    ],
  },
  {
    id: 'database',
    label: 'Database',
    icon: 'database',
    children: [
      { id: 'users-table', label: 'users', icon: 'table' },
      { id: 'orders-table', label: 'orders', icon: 'table' },
    ],
  },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];

const deepTree: TreeViewNode[] = [
  {
    id: 'level-1',
    label: 'Level 1',
    children: [
      {
        id: 'level-2',
        label: 'Level 2',
        children: [
          {
            id: 'level-3',
            label: 'Level 3',
            children: [
              {
                id: 'level-4',
                label: 'Level 4',
                children: [
                  {
                    id: 'level-5',
                    label: 'Level 5',
                    children: [{ id: 'leaf', label: 'Deepest leaf' }],
                  },
                ],
              },
            ],
          },
        ],
      },
      { id: 'level-2-sibling', label: 'Level 2 sibling' },
    ],
  },
];

const meta = {
  title: 'Components/TreeView',
  component: TreeView,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    nodes: fileTree,
    'aria-label': 'Project files',
  },
} satisfies Meta<typeof TreeView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div style={{ width: '280px' }}>
      <TreeView {...args} />
    </div>
  ),
};

export const DefaultExpanded: Story = {
  args: {
    defaultExpandedIds: ['src', 'components', 'tokens'],
  },
  render: (args) => (
    <div style={{ width: '280px' }}>
      <TreeView {...args} />
    </div>
  ),
};

export const WithSelection: Story = {
  args: {
    defaultExpandedIds: ['src', 'components'],
    defaultSelectedId: 'button-tsx',
  },
  render: (args) => (
    <div style={{ width: '280px' }}>
      <TreeView {...args} />
    </div>
  ),
};

export const CustomIcons: Story = {
  args: {
    nodes: customIconTree,
    defaultExpandedIds: ['assets', 'database'],
    'aria-label': 'Workspace',
  },
  render: (args) => (
    <div style={{ width: '280px' }}>
      <TreeView {...args} />
    </div>
  ),
};

export const DeepNesting: Story = {
  args: {
    nodes: deepTree,
    defaultExpandedIds: ['level-1', 'level-2', 'level-3', 'level-4', 'level-5'],
    'aria-label': 'Deeply nested structure',
  },
  render: (args) => (
    <div style={{ width: '320px' }}>
      <TreeView {...args} />
    </div>
  ),
};

/**
 * The WAI-ARIA tree keyboard model: one tab stop, ArrowDown and ArrowUp
 * walk the visible rows, ArrowRight expands a closed branch and then steps
 * into it, ArrowLeft collapses an open branch or moves to the parent, Home
 * and End jump, Enter and Space select, and `aria-expanded` follows.
 */
export const KeyboardNavigation: Story = {
  args: {
    onSelect: fn(),
    onExpandedChange: fn(),
  },
  render: (args) => (
    <div style={{ width: '280px' }}>
      <TreeView {...args} />
    </div>
  ),
  play: async ({ canvas, userEvent, args }) => {
    const item = (name: string) => canvas.getByRole('treeitem', { name });
    await expect(item('src')).toHaveAttribute('aria-expanded', 'false');
    await expect(item('package.json')).not.toHaveAttribute('aria-expanded');
    await expect(canvas.queryByRole('treeitem', { name: 'components' })).toBeNull();

    await userEvent.tab();
    await expect(item('src')).toHaveFocus();

    // ArrowRight on a closed branch expands it; focus stays.
    await userEvent.keyboard('{ArrowRight}');
    await expect(item('src')).toHaveAttribute('aria-expanded', 'true');
    await expect(item('src')).toHaveFocus();
    await expect(args.onExpandedChange).toHaveBeenLastCalledWith(['src']);

    // ArrowRight again steps into the first child.
    await userEvent.keyboard('{ArrowRight}');
    await expect(item('components')).toHaveFocus();

    // ArrowDown walks visible rows only: components is closed, so tokens.
    await userEvent.keyboard('{ArrowDown}');
    await expect(item('tokens')).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    await expect(item('tokens-light.css')).toHaveFocus();

    // ArrowLeft on a leaf moves to its parent; again collapses the parent.
    await userEvent.keyboard('{ArrowLeft}');
    await expect(item('tokens')).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(item('tokens')).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.queryByRole('treeitem', { name: 'tokens-light.css' })).toBeNull();

    await userEvent.keyboard('{End}');
    await expect(item('README.md')).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    await expect(item('package.json')).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onSelect).toHaveBeenLastCalledWith('package-json');
    await expect(item('package.json')).toHaveAttribute('aria-selected', 'true');

    await userEvent.keyboard('{Home}');
    await expect(item('src')).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(args.onSelect).toHaveBeenLastCalledWith('src');
    await expect(item('package.json')).toHaveAttribute('aria-selected', 'false');

    // Roving tabindex: exactly one item is tabbable, the focused one.
    const tabbable = canvas
      .getAllByRole('treeitem')
      .filter((el) => el.getAttribute('tabindex') === '0');
    await expect(tabbable).toEqual([item('src')]);
  },
};
