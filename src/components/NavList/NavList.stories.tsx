import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
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
