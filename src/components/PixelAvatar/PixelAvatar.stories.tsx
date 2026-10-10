import type { Meta, StoryObj } from '@storybook/react-vite';
import { PixelAvatar, distinctPixelInks } from './PixelAvatar';

const meta = {
  title: 'Components/PixelAvatar',
  component: PixelAvatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    name: { control: 'text' },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
    variant: {
      control: 'select',
      options: ['plain', 'tile'],
    },
    label: { control: 'text' },
    ink: {
      control: 'select',
      options: [undefined, 1, 2, 3, 4, 5, 6],
    },
  },
  args: {
    name: 'Northwind Trading',
    size: 'xl',
  },
} satisfies Meta<typeof PixelAvatar>;

export default meta;
type Story = StoryObj<typeof meta>;

const NAMES = [
  'Northwind Trading',
  'Harbor & Vine',
  'Bluepeak Logistics',
  'Juniper Health',
  'Oakline Retail',
  'Meridian Foods',
  'Copperfield Studio',
  'Tidewater Supply',
  'Larkspur Hotels',
  'Fennel & Co',
  'Atlas Freight',
  'Solstice Energy',
];

const row = { display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' } as const;

export const Default: Story = {};

/** A different name is a different character: the seed is all there is. */
export const Cast: Story = {
  render: () => (
    <div style={{ ...row, maxWidth: '420px' }}>
      {NAMES.map((name) => (
        <PixelAvatar key={name} name={name} size="xl" label={name} />
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={row}>
      <PixelAvatar name="Northwind Trading" size="sm" />
      <PixelAvatar name="Northwind Trading" size="md" />
      <PixelAvatar name="Northwind Trading" size="lg" />
      <PixelAvatar name="Northwind Trading" size="xl" />
    </div>
  ),
};

export const Tile: Story = {
  render: () => (
    <div style={{ ...row, maxWidth: '420px' }}>
      {NAMES.slice(0, 7).map((name) => (
        <PixelAvatar key={name} name={name} size="xl" variant="tile" label={name} />
      ))}
    </div>
  ),
};

/** Beside its own name the character is decorative, so it stays unlabelled. */
export const BesideAName: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {NAMES.slice(0, 4).map((name) => (
        <span
          key={name}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'var(--font-paragraph-family)',
            fontSize: 'var(--font-paragraph-size)',
            color: 'var(--color-text-primary)',
          }}
        >
          <PixelAvatar name={name} />
          {name}
        </span>
      ))}
    </div>
  ),
};

/** Six inks cannot keep twelve names apart on their own: `distinctPixelInks`
 *  spreads them across a list, so no two neighbours share a colour. */
export const DistinctInAList: Story = {
  render: () => {
    const inks = distinctPixelInks(NAMES);
    return (
      <div style={{ ...row, maxWidth: '420px' }}>
        {NAMES.map((name, index) => (
          <PixelAvatar key={name} name={name} ink={inks[index]} size="xl" label={name} />
        ))}
      </div>
    );
  },
};

