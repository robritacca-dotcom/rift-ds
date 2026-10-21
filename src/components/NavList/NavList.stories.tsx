import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { NavList } from './NavList';

const flatItems = [
  { label: 'Overview', href: '#overview' },
  { label: 'Getting started', href: '#getting-started' },
  { label: 'Guides', href: '#guides' },
  { label: 'Changelog', href: '#changelog' },
];

const nestedItems = [
  { label: 'Overview', href: '#overview' },
  {
    label: 'Guides',
    href: '#guides',
    id: 'guides',
    items: [
      { label: 'Theming', href: '#theming' },
      { label: 'Migration', href: '#migration' },
    ],
  },
  {
    label: 'Reference',
    href: '#reference',
    id: 'reference',
    items: [
      { label: 'Tokens', href: '#tokens' },
      { label: 'Utilities', href: '#utilities' },
    ],
  },
];

const threeLevelItems = [
  { label: 'Overview', href: '#overview' },
  {
    label: 'Library',
    href: '#library',
    id: 'library',
    items: [
      {
        label: 'Primitives',
        href: '#primitives',
        id: 'primitives',
        items: [
          { label: 'Colour', href: '#colour' },
          { label: 'Spacing', href: '#spacing' },
        ],
      },
      { label: 'Patterns', href: '#patterns' },
    ],
  },
];

const meta = {
  title: 'Components/NavList',
  component: NavList,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    multiple: { control: 'boolean' },
    currentHref: { control: 'text' },
  },
} satisfies Meta<typeof NavList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: flatItems,
    'aria-label': 'Documentation',
  },
};

export const Nested: Story = {
  args: {
    items: nestedItems,
    defaultExpandedIds: ['guides'],
    'aria-label': 'Documentation',
  },
};

export const ThreeLevels: Story = {
  args: {
    items: threeLevelItems,
    defaultExpandedIds: ['library'],
    multiple: true,
    'aria-label': 'Documentation',
  },
};

export const CurrentPage: Story = {
  args: {
    items: flatItems,
    currentHref: '#guides',
    'aria-label': 'Documentation',
  },
};

export const Controlled: Story = {
  args: {
    items: nestedItems,
    'aria-label': 'Documentation',
  },
  render: function ControlledStory(args) {
    const [expandedIds, setExpandedIds] = useState<string[]>(['guides']);
    return <NavList {...args} expandedIds={expandedIds} onExpandedChange={setExpandedIds} />;
  },
};

export const MultipleOpen: Story = {
  args: {
    items: nestedItems,
    multiple: true,
    defaultExpandedIds: ['guides', 'reference'],
    'aria-label': 'Documentation',
  },
};

export const StaticGroup: Story = {
  args: {
    items: [
      { label: 'Overview', href: '#overview' },
      {
        label: 'Foundations',
        href: '#foundations',
        collapsible: false,
        items: [
          { label: 'Colour', href: '#colour' },
          { label: 'Typography', href: '#typography' },
        ],
      },
    ],
    'aria-label': 'Documentation',
  },
};

/**
 * The expansion contract from the keyboard: the chevron toggle is its own
 * tab stop beside the link, Enter and Space flip it, `aria-expanded` and the
 * toggle's name follow the state, single-open collapses the other section,
 * and a collapsed sublist is inert, so its links cannot take focus.
 */
export const KeyboardExpansion: Story = {
  args: {
    items: nestedItems,
    defaultExpandedIds: ['guides'],
    onExpandedChange: fn(),
    'aria-label': 'Documentation',
  },
  play: async ({ canvas, userEvent, args }) => {
    const collapseGuides = canvas.getByRole('button', { name: 'Collapse Guides' });
    const expandReference = canvas.getByRole('button', { name: 'Expand Reference' });
    await expect(collapseGuides).toHaveAttribute('aria-expanded', 'true');
    await expect(expandReference).toHaveAttribute('aria-expanded', 'false');

    // Collapsed: Tokens sits in an inert panel and refuses focus.
    const tokens = canvas.getByRole('link', { name: 'Tokens' });
    tokens.focus();
    await expect(tokens).not.toHaveFocus();

    // Tab order: Overview, Guides, its toggle, then the open section's links.
    await userEvent.tab();
    await expect(canvas.getByRole('link', { name: 'Overview' })).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole('link', { name: 'Guides' })).toHaveFocus();
    await userEvent.tab();
    await expect(collapseGuides).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole('link', { name: 'Theming' })).toHaveFocus();

    // Enter on Reference's toggle opens it and, single-open, closes Guides.
    expandReference.focus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onExpandedChange).toHaveBeenLastCalledWith(['reference']);
    await expect(expandReference).toHaveAttribute('aria-expanded', 'true');
    await expect(expandReference).toHaveAccessibleName('Collapse Reference');
    await expect(expandReference).toHaveFocus();
    await expect(canvas.getByRole('button', { name: 'Expand Guides' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    const theming = canvas.getByRole('link', { name: 'Theming' });
    theming.focus();
    await expect(theming).not.toHaveFocus();
    tokens.focus();
    await expect(tokens).toHaveFocus();

    // Space on the same toggle collapses it again.
    expandReference.focus();
    await userEvent.keyboard(' ');
    await expect(args.onExpandedChange).toHaveBeenLastCalledWith([]);
    await expect(expandReference).toHaveAttribute('aria-expanded', 'false');
    tokens.focus();
    await expect(tokens).not.toHaveFocus();
  },
};
