import type { Meta, StoryObj } from '@storybook/react-vite';
import { WorldMap, type WorldMapPoint } from './WorldMap';
import { MapCallout } from '../MapCallout/MapCallout';

const points: WorldMapPoint[] = [
  { id: 'toronto', lat: 43.65, lng: -79.38, label: 'Toronto', kind: 'anchor' },
  { id: 'london', lat: 51.5, lng: -0.12, label: 'London', kind: 'anchor' },
  { id: 'reykjavik', lat: 64.15, lng: -21.94, label: 'Reykjavík', color: 'var(--color-chart-series-1)' },
  { id: 'santiago', lat: -33.45, lng: -70.66, label: 'Santiago', color: 'var(--color-chart-series-1)' },
  { id: 'amsterdam', lat: 52.37, lng: 4.9, label: 'Amsterdam', color: 'var(--color-chart-series-2)' },
  { id: 'lagos', lat: 6.52, lng: 3.37, label: 'Lagos', color: 'var(--color-chart-series-2)' },
  { id: 'tokyo', lat: 35.68, lng: 139.69, label: 'Tokyo', color: 'var(--color-chart-series-3)' },
  { id: 'sydney', lat: -33.87, lng: 151.21, label: 'Sydney', color: 'var(--color-chart-series-3)' },
];

const meta = {
  title: 'Components/WorldMap',
  component: WorldMap,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    fit: { control: 'radio', options: ['contain', 'cover'] },
    graticuleStep: { control: { type: 'range', min: 0, max: 45, step: 5 } },
    interactive: { control: 'boolean' },
    showLabels: { control: 'boolean' },
  },
  args: {
    points,
    label: 'Places across the network',
    style: { height: 420 },
  },
} satisfies Meta<typeof WorldMap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const RegionBounds: Story = {
  args: {
    bounds: [-28, 34, 32, 66],
    showLabels: true,
  },
};

export const CoverFit: Story = {
  args: {
    bounds: [-28, 34, 32, 66],
    fit: 'cover',
  },
};

export const ZoomControls: Story = {
  args: {
    bounds: [-28, 34, 32, 66],
    fit: 'cover',
    showZoomControls: true,
  },
};

export const WithCallout: Story = {
  args: {
    bounds: [-100, -45, 40, 68],
    activePointId: 'santiago',
    renderCallout: (point) => (
      <MapCallout
        title={point.label ?? point.id}
        lines={['Cobalt', `${point.lat.toFixed(2)} / ${point.lng.toFixed(2)}`, 'Cinder Loop']}
      />
    ),
  },
};

export const WithHoverCard: Story = {
  args: {
    bounds: [-28, 34, 32, 66],
    renderHoverCard: (point) => (
      <span style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span style={{ fontWeight: 600 }}>{point.label ?? point.id}</span>
        <span style={{ color: 'var(--color-text-tertiary)' }}>
          {point.lat.toFixed(2)} / {point.lng.toFixed(2)}
        </span>
      </span>
    ),
  },
};

export const NonInteractive: Story = {
  args: {
    interactive: false,
    graticuleStep: 0,
  },
};
