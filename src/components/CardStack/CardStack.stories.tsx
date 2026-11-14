import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor } from 'storybook/test';
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
        gap: 'var(--gap-400)',
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

/** The stack from the keyboard: with the stack focused, the arrow keys step to the next card and back. */
export const Keyboard: Story = {
  args: { onIndexChange: fn() },
  play: async ({ args, canvasElement }) => {
    const stack = canvasElement.querySelector<HTMLElement>('[aria-roledescription="card stack"]')!;
    stack.focus();
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(args.onIndexChange).toHaveBeenLastCalledWith(1));
    await userEvent.keyboard('{ArrowLeft}');
    await waitFor(() => expect(args.onIndexChange).toHaveBeenLastCalledWith(0));
  },
};
