import type { Meta, StoryObj } from '@storybook/react-vite';
import { Text } from './Text';

const meta = {
  title: 'Components/Text',
  component: Text,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    tier: { control: 'select', options: ['paragraph', 'paragraph-sm', 'caption', 'overline', 'code'] },
    as: { control: 'select', options: ['p', 'span', 'div', 'label', 'strong', 'em'] },
    tone: { control: 'select', options: ['default', 'neutral', 'positive', 'warning', 'error', 'inherit'] },
    weight: { control: 'inline-radio', options: ['default', 'emphasis'] },
    align: { control: 'inline-radio', options: ['start', 'center', 'end'] },
  },
  args: {
    children: 'Payouts arrive in your bank account two business days after a payment clears.',
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Every tier, at both weights. */
export const Tiers: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--gap-300)' }}>
      {(['paragraph', 'paragraph-sm', 'caption', 'overline', 'code'] as const).map((tier) => (
        <div key={tier} style={{ display: 'flex', gap: 'var(--gap-500)' }}>
          <Text tier={tier}>{tier}</Text>
          <Text tier={tier} weight="emphasis">
            {tier} emphasis
          </Text>
        </div>
      ))}
    </div>
  ),
};

/** Helper copy under a settings field, and a status line after a save. */
export const Tones: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--gap-200)' }}>
      <Text tier="paragraph-sm" tone="neutral">
        We use this address for receipts and security alerts.
      </Text>
      <Text tier="paragraph-sm" tone="positive">
        Changes saved.
      </Text>
      <Text tier="paragraph-sm" tone="warning">
        Your trial ends in 3 days.
      </Text>
      <Text tier="paragraph-sm" tone="error">
        The card was declined.
      </Text>
    </div>
  ),
};

/** Amounts in a column: tabular figures, aligned to the end. */
export const Amounts: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--gap-100)', inlineSize: '160px' }}>
      {['$1,204.00', '$88.10', '$12,950.75', '$7.00'].map((amount) => (
        <Text key={amount} as="span" numeric align="end">
          {amount}
        </Text>
      ))}
    </div>
  ),
};

/** A table cell that keeps to one line, and a record summary clamped to two. */
export const Truncation: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--gap-400)', maxInlineSize: '280px' }}>
      <Text tier="paragraph-sm" truncate>
        Acme Logistics, 4 Harbour Road, Unit 12, Portside Industrial Estate
      </Text>
      <Text tier="paragraph-sm" tone="neutral" lines={2}>
        Customer asked to move delivery to the afternoon slot, and confirmed by phone that the loading dock can take a
        long-wheelbase van after two o’clock.
      </Text>
    </div>
  ),
};

/** An eyebrow above a title, and an identifier in the code face. */
export const OverlineAndCode: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--gap-200)' }}>
      <Text tier="overline" tone="neutral">
        Account
      </Text>
      <Text>
        Your API key starts with{' '}
        <Text as="span" tier="code">
          sk_test_
        </Text>
        .
      </Text>
    </div>
  ),
};

/** A label naming a native control. */
export const AsLabel: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--gap-200)', alignItems: 'center' }}>
      <input id="text-story-terms" type="checkbox" />
      <Text as="label" htmlFor="text-story-terms" tier="paragraph-sm">
        I agree to the terms of service
      </Text>
    </div>
  ),
};
