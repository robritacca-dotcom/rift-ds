import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, waitFor } from 'storybook/test';
import { BentoTile } from './BentoTile';
import { Stat } from '../Stat/Stat';
import { Sparkline } from '../Sparkline/Sparkline';
import { Badge } from '../Badge/Badge';

const meta = {
  title: 'Components/BentoTile',
  component: BentoTile,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    background: {
      control: 'inline-radio',
      options: ['shader', 'solid', 'transparent'],
    },
    highlight: {
      control: 'select',
      options: [undefined, 1, 2, 3, 4, 5, 6],
    },
    align: {
      control: 'inline-radio',
      options: ['start', 'center', 'end'],
    },
    headingLevel: {
      control: 'select',
      options: [2, 3, 4, 5, 6],
    },
  },
} satisfies Meta<typeof BentoTile>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A tile fills its grid cell, so a single-tile story gives it a cell of its own. */
const cell: Story['decorators'] = [
  (Story) => (
    <div style={{ maxWidth: 420, height: 380 }}>
      <Story />
    </div>
  ),
];

/* Fictional figures for a fictional product. */
const TREND = [22, 28, 25, 31, 36, 34, 41, 39, 46, 52];

function Revenue() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Stat label="Monthly revenue" value="$48,210" delta="+12.4%" trend="up" />
      <Sparkline data={TREND} variant="area" tone="accent" width={240} height={48} label="Revenue, last ten months" />
    </div>
  );
}

/** The default: a shader pair behind content seated in the safe area. */
export const Default: Story = {
  decorators: cell,
  args: {
    title: 'Revenue that themes itself',
    children: <Revenue />,
  },
};

/** The plain container surface, no pair. */
export const Solid: Story = {
  decorators: cell,
  args: {
    title: 'A quiet tile',
    description: 'The container surface alone, for a tile that should not compete.',
    background: 'solid',
    children: <Revenue />,
  },
};

/** No surface at all: the tile is a border and its content. */
export const Transparent: Story = {
  decorators: cell,
  args: {
    title: 'Over the page',
    description: 'The page shows through, for a tile set over its own art.',
    background: 'transparent',
    children: <Revenue />,
  },
};

/** The six pairs, each pinned with highlight: pair N is ambient colour N with texture N. */
export const Pairs: Story = {
  args: { title: 'Pair' },
  decorators: [
    () => (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gridAutoRows: 200, gap: 16 }}>
        {(['dots', 'lines', 'rings', 'grid', 'waves', 'rays'] as const).map((texture, i) => (
          <BentoTile
            key={texture}
            title={`Pair ${i + 1}`}
            description={`Ambient ${i + 1} with ${texture}`}
            highlight={(i + 1) as 1 | 2 | 3 | 4 | 5 | 6}
          />
        ))}
      </div>
    ),
  ],
};

/** Content placed at the top, middle or foot of the space under the heading. */
export const Alignment: Story = {
  args: { title: 'Alignment' },
  decorators: [
    () => (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gridAutoRows: 280, gap: 16 }}>
        {(['start', 'center', 'end'] as const).map((align) => (
          <BentoTile key={align} title={`align="${align}"`} align={align} background="solid">
            <Badge label="Content" variant="info" />
          </BentoTile>
        ))}
      </div>
    ),
  ],
};

/** Content taller than the tile fades out at the edge it overflows, never cut hard. */
export const OverflowFades: Story = {
  decorators: cell,
  args: {
    title: 'More than fits',
    background: 'solid',
    align: 'start',
    children: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {['Northwind', 'Halcyon', 'Meridian', 'Lumen', 'Basalt', 'Cinder', 'Tessel'].map((name) => (
          <Stat key={name} label={name} value="12 seats" />
        ))}
      </div>
    ),
  },
};

/**
 * With expandedContent, the whole tile opens an overlay, morphing into it
 * where the browser has view transitions. Focus moves to the close control,
 * Escape closes, and focus returns to the expand control.
 */
export const Expandable: Story = {
  decorators: cell,
  args: {
    title: 'Quarterly revenue',
    children: <Revenue />,
    expandedContent: (
      <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
        The overlay holds anything: copy, calls to action, a larger copy of the tile&apos;s content.
      </p>
    ),
  },
  play: async ({ canvas, userEvent }) => {
    const trigger = await canvas.findByRole('button', { name: 'Open Quarterly revenue' });
    await userEvent.click(trigger);
    const dialog = await screen.findByRole('dialog', { name: 'Quarterly revenue' });
    await expect(dialog).toBeVisible();
    await expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Quarterly revenue' })).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
