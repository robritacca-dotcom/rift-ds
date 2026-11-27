import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { PaymentCard } from './PaymentCard';

const meta = {
  title: 'Components/PaymentCard',
  component: PaymentCard,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    tone: { control: 'inline-radio', options: ['default', 'neutral'] },
    size: { control: 'inline-radio', options: ['default', 'compact'] },
    frozen: { control: 'boolean' },
  },
  args: {
    brand: 'Northlight',
    holderName: 'Jordan Reyes',
    last4: '5555',
    expiry: { month: 4, year: 2029 },
    network: <span style={{ fontWeight: 700, fontStyle: 'italic' }}>Orbit</span>,
  },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: 360 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PaymentCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The solid face, with the brand, the last four digits, the holder, the expiry and the network's mark. */
export const Default: Story = {
  play: async ({ canvas }) => {
    const card = canvas.getByRole('group', { name: 'Northlight card ending in 5555, Jordan Reyes' });
    await expect(card).toHaveTextContent('ending in');
    await expect(card).toHaveTextContent('04/29');
  },
};

/** A tier printed at the top end. */
export const WithLabel: Story = {
  args: { label: 'Plus' },
};

/** The quieter face on the container ramp. */
export const Neutral: Story = {
  args: { tone: 'neutral', label: 'Virtual' },
};

/** Frozen: the face dimmed under a lock, and the frozen label said as well as seen. */
export const Frozen: Story = {
  args: { frozen: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('group')).toHaveTextContent('Frozen');
  },
};

/** The compact width step, for a list of cards or a rail. */
export const Compact: Story = {
  args: { size: 'compact', label: 'Plus' },
};

/** The expiry in the locale's own digits. */
export const Arabic: Story = {
  args: { locale: 'ar-EG' },
  globals: { direction: 'rtl' },
};

/** A long holder name ends in an ellipsis rather than pushing the network's mark off the face. */
export const LongName: Story = {
  args: { holderName: 'Alexandra Montgomery-Fitzwilliam' },
};

/** A wallet of cards, each tone and state side by side. */
export const Wallet: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 'var(--gap-500)' }}>
      <PaymentCard {...args} label="Plus" />
      <PaymentCard {...args} tone="neutral" label="Virtual" last4="0142" />
      <PaymentCard {...args} frozen last4="7781" />
    </div>
  ),
};
