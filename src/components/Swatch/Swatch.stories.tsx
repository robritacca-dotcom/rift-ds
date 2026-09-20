import type { Meta, StoryObj } from '@storybook/react-vite';
import { Swatch } from './Swatch';

const meta = {
  title: 'Components/Swatch',
  component: Swatch,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'color' },
    label: { control: 'text' },
    selected: { control: 'boolean' },
    size: { control: 'select', options: ['default', 'compact'] },
    shape: { control: 'select', options: ['circle', 'square'] },
    disabled: { control: 'boolean' },
  },
  args: {
    value: '#118AB2',
    label: 'Teal 07',
  },
} satisfies Meta<typeof Swatch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = {
  args: {
    selected: true,
  },
};

export const Square: Story = {
  args: {
    shape: 'square',
    value: '#9E47EF',
    label: 'Purple 07',
  },
};

export const Compact: Story = {
  args: {
    size: 'compact',
    value: '#06D6A0',
    label: 'Green 07',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

/** A preset palette — swatches laid out by the consumer; one carries the selection. */
export const PaletteRow: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px' }}>
      {[
        ['#EF476F', 'Red 07'],
        ['#EF8247', 'Orange 07'],
        ['#FFD166', 'Yellow 07'],
        ['#06D6A0', 'Green 07'],
        ['#118AB2', 'Teal 07'],
        ['#1E47B0', 'Blue 07'],
        ['#9E47EF', 'Purple 07'],
      ].map(([value, label]) => (
        <Swatch key={value} value={value} label={label} selected={value === '#118AB2'} />
      ))}
    </div>
  ),
};
