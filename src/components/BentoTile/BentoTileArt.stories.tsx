import type { Meta, StoryObj } from '@storybook/react-vite';
import { BentoTileArt, type BentoTileArtPattern } from './BentoTileArt';

const PATTERNS: BentoTileArtPattern[] = ['dots', 'lines', 'rings', 'grid', 'waves', 'rays'];

const meta = {
  title: 'Components/BentoTileArt',
  component: BentoTileArt,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    pattern: {
      control: 'select',
      options: PATTERNS,
    },
  },
} satisfies Meta<typeof BentoTileArt>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The texture fills its positioned parent, so a single story gives it a surface. */
const surface: Story['decorators'] = [
  (Story) => (
    <div
      style={{
        position: 'relative',
        maxWidth: 420,
        height: 240,
        overflow: 'hidden',
        borderRadius: 'var(--radius-400)',
        background: 'var(--color-bg-container-primary)',
        border: 'var(--border-025) solid var(--color-bg-container-border)',
      }}
    >
      <Story />
    </div>
  ),
];

/** One texture on a surface of its own, outside a tile. */
export const Default: Story = {
  decorators: surface,
  args: { pattern: 'dots' },
};

/** The whole set, each pinned by pattern. */
export const AllPatterns: Story = {
  decorators: [
    () => (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
        {PATTERNS.map((pattern) => (
          <div
            key={pattern}
            style={{
              position: 'relative',
              height: 160,
              overflow: 'hidden',
              borderRadius: 'var(--radius-400)',
              background: 'var(--color-bg-container-primary)',
              border: 'var(--border-025) solid var(--color-bg-container-border)',
            }}
          >
            <BentoTileArt pattern={pattern} />
            <span style={{ position: 'absolute', top: 12, left: 16, color: 'var(--color-text-secondary)' }}>{pattern}</span>
          </div>
        ))}
      </div>
    ),
  ],
};
