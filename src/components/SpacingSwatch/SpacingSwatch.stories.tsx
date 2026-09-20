import type { Meta, StoryObj } from '@storybook/react-vite';
import { SpacingSwatch } from './SpacingSwatch';

const meta = {
  title: 'Components/SpacingSwatch',
  component: SpacingSwatch,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
    },
    value: {
      control: 'text',
    },
    px: {
      control: 'number',
    },
    variant: {
      control: 'radio',
      options: ['border', 'radius', 'gap', 'padding'],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '180px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SpacingSwatch>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Border width — thin vertical bar */
export const BorderXS: Story = {
  args: {
    label: 'XS',
    value: '1px',
    px: 1,
    variant: 'border',
  },
};

/** Border width — medium */
export const BorderMD: Story = {
  args: {
    label: 'MD',
    value: '2px',
    px: 2,
    variant: 'border',
  },
};

/** Radius — small rounded square */
export const RadiusSM: Story = {
  args: {
    label: 'SM',
    value: '8px',
    px: 8,
    variant: 'radius',
  },
};

/** Radius — full circle */
export const RadiusFull: Story = {
  args: {
    label: 'Full',
    value: '999px',
    px: 999,
    variant: 'radius',
  },
};

/** Gap — space between two lines */
export const GapLG: Story = {
  args: {
    label: 'LG',
    value: '20px',
    px: 20,
    variant: 'gap',
  },
};

/** Padding — outer box with inner element */
export const PaddingMD: Story = {
  args: {
    label: 'MD',
    value: '8px',
    px: 8,
    variant: 'padding',
  },
};

/** Grid of spacing swatches — how they appear on the page */
export const SwatchGrid: Story = {
  args: {
    label: 'XS',
    value: '4px',
    px: 4,
    variant: 'radius',
  },
  decorators: [
    () => (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', width: '800px' }}>
        <SpacingSwatch label="XXS" value="2px" px={2} variant="radius" />
        <SpacingSwatch label="XS" value="4px" px={4} variant="radius" />
        <SpacingSwatch label="SM" value="8px" px={8} variant="radius" />
        <SpacingSwatch label="MD" value="12px" px={12} variant="radius" />
        <SpacingSwatch label="LG" value="16px" px={16} variant="radius" />
        <SpacingSwatch label="XL" value="24px" px={24} variant="radius" />
        <SpacingSwatch label="XXL" value="48px" px={48} variant="radius" />
        <SpacingSwatch label="Full" value="999px" px={999} variant="radius" />
      </div>
    ),
  ],
};
