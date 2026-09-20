import type { Meta, StoryObj } from '@storybook/react-vite';
import { MapCallout } from './MapCallout';

const meta = {
  title: 'Components/MapCallout',
  component: MapCallout,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    align: {
      control: 'select',
      options: ['start', 'end'],
    },
  },
  args: {
    title: 'Santiago, CL',
    lines: ['Cobalt', '17.73 / 64 arcs', 'Cinder Loop'],
  },
} satisfies Meta<typeof MapCallout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AlignEnd: Story = {
  args: {
    align: 'end',
  },
};

export const TitleOnly: Story = {
  args: {
    title: 'Reykjavik, IS',
    lines: [],
  },
};
