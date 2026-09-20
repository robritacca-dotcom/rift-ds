import type { Meta, StoryObj } from '@storybook/react-vite';
import { SourceTrail } from './SourceTrail';

const meta = {
  title: 'Components/SourceTrail',
  component: SourceTrail,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof SourceTrail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: [
      { title: 'Design tokens quarterly', icon: 'article' },
      { title: 'Colour contrast working group notes', icon: 'article' },
      { title: 'Component API changelog', icon: 'history' },
    ],
  },
  render: (args) => (
    <div style={{ width: 480 }}>
      <SourceTrail {...args} />
    </div>
  ),
};

export const Streaming: Story = {
  args: {
    streaming: true,
    items: [
      { title: 'Design tokens quarterly', icon: 'article', status: 'done' },
      { title: 'Colour contrast working group notes', icon: 'article', status: 'active' },
      { title: 'Component API changelog', icon: 'history', status: 'pending' },
    ],
  },
  render: (args) => (
    <div style={{ width: 480 }}>
      <SourceTrail {...args} />
    </div>
  ),
};

export const AllRead: Story = {
  args: {
    defaultOpen: false,
    items: [
      { title: 'Design tokens quarterly', status: 'done' },
      { title: 'Colour contrast working group notes', status: 'done' },
      { title: 'Component API changelog', status: 'done' },
      { title: 'Release notes archive', status: 'done' },
    ],
  },
  render: (args) => (
    <div style={{ width: 480 }}>
      <SourceTrail {...args} />
    </div>
  ),
};

export const WithDetails: Story = {
  args: {
    items: [
      {
        title: 'Design tokens quarterly',
        icon: 'article',
        detail: 'The three-tier token architecture',
      },
      {
        title: 'Colour contrast working group notes',
        icon: 'article',
        detail: 'AA pairings for the action colour',
      },
      {
        title: 'Component API changelog',
        icon: 'history',
        detail: 'When the convenience callbacks landed',
      },
    ],
  },
  render: (args) => (
    <div style={{ width: 480 }}>
      <SourceTrail {...args} />
    </div>
  ),
};

export const LinksOut: Story = {
  args: {
    title: 'Sources for this answer',
    items: [
      { title: 'Design tokens quarterly', icon: 'link', href: 'https://example.com/tokens' },
      { title: 'Colour contrast working group notes', icon: 'link', href: 'https://example.com/contrast' },
    ],
  },
  render: (args) => (
    <div style={{ width: 480 }}>
      <SourceTrail {...args} />
    </div>
  ),
};
