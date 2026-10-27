import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProgressiveBlur } from './ProgressiveBlur';

const meta = {
  title: 'Components/ProgressiveBlur',
  component: ProgressiveBlur,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    side: {
      control: 'inline-radio',
      options: ['top', 'bottom'],
    },
    tinted: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof ProgressiveBlur>;

export default meta;
type Story = StoryObj<typeof meta>;

const BAR_TOKENS = [
  '--color-status-info-text',
  '--color-status-positive-text',
  '--color-status-warning-text',
  '--color-status-error-text',
];

/**
 * The blur only shows over something, so every story sits on a surface of
 * busy content: rows of text over coloured bars, the shape of a page
 * scrolling under a header.
 */
const surface: Story['decorators'] = [
  (Story) => (
    <div
      style={{
        position: 'relative',
        maxWidth: 560,
        height: 240,
        overflow: 'hidden',
        borderRadius: 'var(--radius-400)',
        background: 'var(--color-bg-page-primary)',
        border: 'var(--border-025) solid var(--color-bg-container-border)',
      }}
    >
      <div style={{ padding: 'var(--padding-500)', display: 'grid', gap: 'var(--gap-300)' }}>
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-300)' }}>
            <span
              style={{
                width: 48,
                height: 20,
                borderRadius: 'var(--radius-pill)',
                background: `var(${BAR_TOKENS[i % BAR_TOKENS.length]})`,
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-paragraph-family)',
                fontSize: 'var(--font-paragraph-size)',
                lineHeight: 'var(--font-paragraph-line-height)',
                color: 'var(--color-text-primary)',
              }}
            >
              Content scrolling under the bar
            </span>
          </div>
        ))}
      </div>
      <Story />
    </div>
  ),
];

/** Anchored to the top edge with no tint: the blur alone, frosted at the top and clear by the foot. */
export const Default: Story = {
  decorators: surface,
  args: { side: 'top' },
};

/** The page-surface tint over the blur, as a header shows it once the page has scrolled. */
export const Tinted: Story = {
  decorators: surface,
  args: { side: 'top', tinted: true },
};

/** Anchored to the bottom edge, behind a toolbar or a footer bar. */
export const Bottom: Story = {
  decorators: surface,
  args: { side: 'bottom', tinted: true },
};
