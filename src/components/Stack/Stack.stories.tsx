import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Stack } from './Stack';
import { Button } from '../Button/Button';
import { Panel } from '../Panel/Panel';

const GAPS = ['050', '100', '200', '300', '400', '500', '1000', '1500', '2000', '3000'] as const;

const Box = ({ children }: { children: React.ReactNode }) => (
  <Panel bordered padding="compact">
    {children}
  </Panel>
);

const meta = {
  title: 'Components/Stack',
  component: Stack,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    direction: { control: 'inline-radio', options: ['column', 'row'] },
    gap: { control: 'select', options: GAPS },
    align: { control: 'select', options: ['start', 'center', 'end', 'baseline', 'stretch'] },
    justify: { control: 'select', options: ['start', 'center', 'end', 'between'] },
  },
  args: {
    children: (
      <>
        <Box>First</Box>
        <Box>Second</Box>
        <Box>Third</Box>
      </>
    ),
  },
} satisfies Meta<typeof Stack>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A column with the default gap: the shape a page, a panel or a form is built from. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const stack = canvasElement.querySelector('.ds-stack') as HTMLElement;
    await expect(getComputedStyle(stack).flexDirection).toBe('column');
    await expect(stack.style.getPropertyValue('--ds-stack-gap')).toBe('var(--gap-400)');
  },
};

/** A row of actions, spread to the ends of its line. */
export const RowBetween: Story = {
  args: {
    direction: 'row',
    justify: 'between',
    children: (
      <>
        <Button label="Back" variant="secondary" />
        <Stack direction="row" gap="200">
          <Button label="Save draft" variant="tertiary" />
          <Button label="Continue" />
        </Stack>
      </>
    ),
  },
};

/** Cards in a row that stretch to the tallest, so their edges line up. */
export const EqualHeights: Story = {
  args: {
    direction: 'row',
    align: 'stretch',
    gap: '500',
    children: (
      <>
        <Box>A short card.</Box>
        <Box>
          A card with more to say, running over several lines so it sets the height of the row for the cards beside it.
        </Box>
        <Box>Another short one.</Box>
      </>
    ),
  },
};

/** A row that wraps onto more lines when it runs out of room, keeping the gap between lines. */
export const Wrapping: Story = {
  args: {
    direction: 'row',
    wrap: true,
    gap: '200',
    children: (
      <>
        {['Design', 'Engineering', 'Marketing', 'Operations', 'Research', 'Sales', 'Support'].map((name) => (
          <Button key={name} label={name} variant="secondary" size="compact" />
        ))}
      </>
    ),
  },
};

/** Rendered as a list, so the items are announced as one. */
export const AsList: Story = {
  args: {
    as: 'ul',
    gap: '200',
    children: (
      <>
        <li>One</li>
        <li>Two</li>
        <li>Three</li>
      </>
    ),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('list')).toBeInTheDocument();
    await expect(canvas.getAllByRole('listitem')).toHaveLength(3);
  },
};
