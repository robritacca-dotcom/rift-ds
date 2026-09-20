import type { Meta, StoryObj } from '@storybook/react-vite';
import { LinkList } from './LinkList';

const meta = {
  title: 'Components/LinkList',
  component: LinkList,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
  },
} satisfies Meta<typeof LinkList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: [
      {
        label: 'Storybook Docs',
        href: 'https://storybook.js.org',
        logo: '/logos/storybook.svg',
        sub: 'Interactive component showcase and docs',
      },
      {
        label: 'ChatGPT Connector',
        href: 'https://chatgpt.com',
        logo: '/logos/ChatGPT.svg',
        sub: 'USA only',
      },
      {
        label: 'Claude Connector',
        href: 'https://claude.ai',
        logo: '/logos/Claude.svg',
        sub: 'USA only',
      },
    ],
  },
};

export const WithMaterialIcon: Story = {
  args: {
    items: [
      {
        label: 'Design Awards 2026',
        href: '#',
        icon: 'emoji_events',
        sub: ['Winner — AI · Productivity', "People's Voice Winner — AI · Productivity"],
      },
    ],
  },
};

export const NoSubtitle: Story = {
  args: {
    items: [
      {
        label: 'React Docs',
        href: 'https://react.dev',
        logo: '/logos/React.svg',
      },
      {
        label: 'GitHub',
        href: 'https://github.com',
        logo: '/logos/Git.svg',
      },
    ],
  },
};

export const InternalLinks: Story = {
  args: {
    items: [
      {
        label: 'Foundations',
        href: '/foundations',
        icon: 'palette',
        sub: 'Stays in the current tab, with an arrow_forward indicator',
        newTab: false,
      },
      {
        label: 'Components',
        href: '/components',
        icon: 'widgets',
        sub: 'Set newTab: false for links inside the same site',
        newTab: false,
      },
    ],
  },
};

export const Consulting: Story = {
  args: {
    items: [
      {
        label: 'Book a consultation',
        href: '#',
        logo: '/logos/stripe-new.png',
        logoAlt: 'Stripe',
        sub: 'Secure checkout via Stripe',
      },
    ],
  },
};
