import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconButton } from '../IconButton/IconButton';
import { SiteFooter } from './SiteFooter';

const meta = {
  title: 'Components/SiteFooter',
  component: SiteFooter,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  args: {
    brand: 'Acme',
    description: 'Components and guides for building the Acme app.',
    columns: [
      {
        title: 'Docs',
        links: [
          { label: 'Introduction', href: '#introduction' },
          { label: 'Installation', href: '#installation' },
          { label: 'Theming', href: '#theming' },
          { label: 'Changelog', href: '#changelog' },
        ],
      },
      {
        title: 'Components',
        links: [
          { label: 'Button', href: '#button' },
          { label: 'Menubar', href: '#menubar' },
          { label: 'Table', href: '#table' },
        ],
      },
      {
        title: 'Community',
        links: [
          { label: 'Discussions', href: 'https://example.com/discussions', external: true },
          { label: 'Contributing', href: '#contributing' },
        ],
      },
    ],
    legal: '© 2026 Acme. Released under the MIT licence.',
  },
} satisfies Meta<typeof SiteFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSocial: Story = {
  args: {
    social: (
      <>
        <IconButton icon="rss_feed" label="Feed" variant="tertiary" size="compact" href="#feed" />
        <IconButton icon="mail" label="Newsletter" variant="tertiary" size="compact" href="#newsletter" />
      </>
    ),
  },
};

export const ColumnsOnly: Story = {
  args: { brand: undefined, description: undefined, legal: undefined },
};
