import type { Meta, StoryObj } from '@storybook/react-vite';
import { Globe, type GlobeArc, type GlobePoint } from './Globe';
import { MapCallout } from '../MapCallout/MapCallout';

const points: GlobePoint[] = [
  { id: 'santiago', lat: -33.45, lng: -70.66, label: 'SCL', kind: 'point' },
  { id: 'toronto', lat: 43.65, lng: -79.38, label: 'YYZ', kind: 'anchor' },
  { id: 'london', lat: 51.5, lng: -0.12, label: 'LDN', kind: 'point' },
  { id: 'lagos', lat: 6.52, lng: 3.37, label: 'LOS', kind: 'point' },
  { id: 'singapore', lat: 1.35, lng: 103.82, label: 'SIN', kind: 'anchor' },
  { id: 'sydney', lat: -33.86, lng: 151.2, label: 'SYD', kind: 'point' },
  { id: 'reykjavik', lat: 64.14, lng: -21.94, label: 'RKV', kind: 'point' },
];

const arcs: GlobeArc[] = [
  { from: 'santiago', to: 'toronto' },
  { from: 'santiago', to: 'london', altitude: 0.35 },
  { from: 'toronto', to: 'reykjavik' },
  { from: 'london', to: 'lagos' },
  { from: 'london', to: 'singapore', altitude: 0.3 },
  { from: 'singapore', to: 'sydney' },
  { from: 'lagos', to: 'santiago', altitude: 0.4 },
];

const meta = {
  title: 'Components/Globe',
  component: Globe,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    autoRotate: { control: { type: 'range', min: 0, max: 20, step: 1 } },
    graticuleStep: { control: { type: 'range', min: 0, max: 45, step: 15 } },
    interactive: { control: 'boolean' },
    showLabels: { control: 'boolean' },
  },
  args: {
    points,
    arcs,
    label: 'Network points and the routes between them',
    style: { maxWidth: 480, margin: '0 auto' },
  },
} satisfies Meta<typeof Globe>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithCallout: Story = {
  args: {
    activePointId: 'santiago',
    autoRotate: 0,
    defaultRotation: [-70, -10],
    renderCallout: (point) => (
      <MapCallout
        title={`${point.label ?? point.id}`}
        lines={['Cobalt', `${point.lat.toFixed(2)} / ${point.lng.toFixed(2)}`, 'Cinder Loop']}
        align="end"
      />
    ),
  },
};

export const FlatArcColour: Story = {
  args: {
    arcs: arcs.map((arc) => ({ ...arc, color: 'var(--color-chart-series-2)' })),
  },
};

export const NonInteractive: Story = {
  args: {
    interactive: false,
    autoRotate: 0,
    showLabels: false,
    graticuleStep: 15,
  },
};

export const PointsOnly: Story = {
  args: {
    arcs: [],
  },
};
