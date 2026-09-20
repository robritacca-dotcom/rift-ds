import type { Meta, StoryObj } from '@storybook/react-vite';
import { MapLegend } from './MapLegend';

const meta = {
  title: 'Components/MapLegend',
  component: MapLegend,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
  },
  args: {
    title: 'Meridian',
    description: 'A listening surface for machines agreeing on where the signal was last seen.',
    items: [
      { glyph: 'point', label: 'Listening point' },
      { glyph: 'anchor', label: 'Fixed witness' },
      { glyph: 'arc', label: 'Signal route' },
    ],
  },
} satisfies Meta<typeof MapLegend>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const KeyOnly: Story = {
  args: {
    title: undefined,
    description: undefined,
  },
};

export const FlatColours: Story = {
  args: {
    title: 'Coverage',
    description: 'Regions by reporting network.',
    items: [
      { glyph: 'line', label: 'Primary network', color: 'var(--color-chart-series-1)' },
      { glyph: 'line', label: 'Partner network', color: 'var(--color-chart-series-3)' },
      { glyph: 'arc', label: 'Relay route', color: 'var(--color-chart-series-4)' },
    ],
  },
};
