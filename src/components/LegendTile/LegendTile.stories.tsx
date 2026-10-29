import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { LegendTile } from './LegendTile';

const meta = {
  title: 'Components/LegendTile',
  component: LegendTile,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    value: { control: 'text' },
    swatch: { control: 'text' },
  },
  args: {
    label: 'Sessions',
    value: '3.8M',
  },
} satisfies Meta<typeof LegendTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// The intended use: a row of tiles under a chart, each dot matching its
// series colour from the chart palette.
export const WithSwatch: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px' }}>
      <LegendTile
        label="Direct"
        value="1,204"
        swatch="var(--color-chart-series-1)"
      />
      <LegendTile
        label="Organic search"
        value="982"
        swatch="var(--color-chart-series-2)"
      />
      <LegendTile
        label="Referral"
        value="611"
        swatch="var(--color-chart-series-3)"
      />
      <LegendTile
        label="Social"
        value="245"
        swatch="var(--color-chart-series-4)"
      />
    </div>
  ),
};

// A number is written in the resolved locale: en-US unless `locale` or a LocaleProvider says otherwise.
export const NumericValue: Story = {
  args: {
    label: 'Total events',
    value: 1284093,
    swatch: 'var(--color-chart-series-5)',
  },
};

// A tile narrower than its caption, as in a phone-width chart footer: the
// caption ends in an ellipsis rather than being cut mid-letter.
export const LongLabel: Story = {
  args: {
    label: 'Returning visitors from paid search',
    value: '38,500',
    swatch: 'var(--color-chart-series-2)',
  },
  render: (args) => (
    <div style={{ width: '140px' }}>
      <LegendTile {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const text = canvasElement.querySelector<HTMLElement>('.ds-legend-tile__label-text');
    await expect(text).not.toBeNull();
    await expect(text!.scrollWidth).toBeGreaterThan(text!.clientWidth);
    await expect(getComputedStyle(text!).textOverflow).toBe('ellipsis');
  },
};
