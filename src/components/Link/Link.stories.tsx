import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Link } from './Link';
import { Text } from '../Text/Text';

const meta = {
  title: 'Components/Link',
  component: Link,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'inline-radio', options: ['inline', 'standalone'] },
    size: { control: 'inline-radio', options: ['default', 'compact'] },
  },
  args: { href: '#billing', children: 'billing settings' },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Inside a sentence: the sentence's face and colour, underlined. */
export const Inline: Story = {
  render: (args) => (
    <Text>
      Update your card in <Link {...args} /> before the next invoice.
    </Text>
  ),
};

/** On its own line, beside a form or under a card. */
export const Standalone: Story = {
  args: { variant: 'standalone', children: 'Forgot your password?' },
};

export const StandaloneCompact: Story = {
  args: { variant: 'standalone', size: 'compact', children: 'View all transactions', iconRight: 'arrow_forward' },
};

/** Leaves the app: a new tab, an outward mark, and the same said to a screen reader. */
export const External: Story = {
  args: { href: 'https://example.com/help', external: true, variant: 'standalone', children: 'Help centre' },
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: 'Help centre (opens in a new tab)' });
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  },
};

/** Held still: text with `aria-disabled`, no address. */
export const Disabled: Story = {
  args: { variant: 'standalone', disabled: true, children: 'Download statement' },
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: 'Download statement' });
    await expect(link).toHaveAttribute('aria-disabled', 'true');
    await expect(link).not.toHaveAttribute('href');
  },
};

/** Icons on either side; a directional glyph turns round in right to left. */
export const WithIcons: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--gap-300)', justifyItems: 'start' }}>
      <Link href="#back" variant="standalone" iconLeft="arrow_back">
        Back to orders
      </Link>
      <Link href="#receipt" variant="standalone" iconLeft="receipt_long">
        Email receipt
      </Link>
    </div>
  ),
};
