import type { Meta, StoryObj } from '@storybook/react-vite';
import { CardStack } from './CardStack';
import { Card } from '../Card/Card';
import { Badge } from '../Badge/Badge';

const roles = [
  { title: 'Prompt Engineer', rate: '$120/hr', org: 'Anthropic' },
  { title: 'ML Engineer', rate: '$135/hr', org: 'Perplexity' },
  { title: 'LLM Platform Engineer', rate: '$130-160/hr', org: 'Google' },
  { title: 'Research Engineer', rate: '$140/hr', org: 'DeepMind' },
];

const cards = roles.map((role) => (
  <Card key={role.title} title={role.title}>
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--gap-md)',
      }}
    >
      <Badge variant="neutral" label={role.rate} />
      <span style={{ color: 'var(--color-text-secondary)' }}>{role.org}</span>
    </div>
  </Card>
));

const meta = {
  title: 'Components/CardStack',
  component: CardStack,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    peek: { control: { type: 'range', min: 0, max: 3, step: 1 } },
    loop: { control: 'boolean' },
    advanceOnClick: { control: 'boolean' },
  },
  args: {
    children: cards,
    label: 'Open roles',
    style: { maxWidth: 320, margin: '0 auto' },
  },
} satisfies Meta<typeof CardStack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const DeepPeek: Story = {
  args: {
    peek: 3,
  },
};

export const NoLoop: Story = {
  args: {
    loop: false,
  },
};

export const NoPeek: Story = {
  args: {
    peek: 0,
  },
};
