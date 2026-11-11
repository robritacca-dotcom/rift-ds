import type { Meta, StoryObj } from '@storybook/react-vite';
import { ShaderScene } from './ShaderScene';

/**
 * The scene fills its positioned ancestor, so every story provides one: a
 * plain bordered box, the honest way to show that placement is the caller's.
 */
const Stage = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      position: 'relative',
      width: 640,
      height: 360,
      overflow: 'hidden',
      borderRadius: 'var(--radius-300)',
      border: 'var(--border-025) solid var(--color-bg-container-border)',
      background: 'var(--color-bg-page-primary)',
    }}
  >
    {children}
  </div>
);

const meta = {
  title: 'Components/ShaderScene',
  component: ShaderScene,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    scene: { control: 'inline-radio', options: ['horizon', 'rift', 'glyphs', 'prism', 'meteors', 'waves', 'aurora', 'dusk', 'embers'] },
    speed: { control: { type: 'range', min: 0, max: 4, step: 0.05 } },
  },
  args: { scene: 'horizon' },
  render: (args) => (
    <Stage>
      <ShaderScene {...args} />
    </Stage>
  ),
} satisfies Meta<typeof ShaderScene>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The horizon: a planet's limb at night, a fixed sun at the apex, a hazy world and ocean below. */
export const Horizon: Story = {};

/** The rift: a glowing tear that opens at its middle, with light streaming in. */
export const Rift: Story = {
  args: {
    scene: 'rift',
    passes: { fadeTop: { on: false }, fadeBottom: { on: false }, vignette: { on: true, params: { amount: 0.6 } } },
  },
};

/** Glyphs: soft light printed in type, the characters thickening with the brightness under them. */
export const Glyphs: Story = {
  args: {
    scene: 'glyphs',
    passes: { fadeTop: { on: false }, fadeBottom: { on: false }, grain: { params: { amount: 0.06 } } },
  },
};

/** Prism: beams of light from a cut stone, uneven in strength, their edges split into the theme's spectrum. */
export const Prism: Story = {
  args: {
    scene: 'prism',
    passes: { fadeTop: { on: false }, fadeBottom: { on: false }, grain: { params: { amount: 0.08 } } },
  },
};

/** Meteors: a shower over a planet's edge, with a sun flaring on the limb. */
export const Meteors: Story = {
  args: {
    scene: 'meteors',
    passes: { fadeTop: { on: false }, fadeBottom: { on: false }, grain: { params: { amount: 0.08 } } },
  },
};

/** Waves: a sea of points rolling off into the dark, bright on the crests. */
export const Waves: Story = {
  args: {
    scene: 'waves',
    passes: { fadeTop: { on: false }, fadeBottom: { on: false }, grain: { params: { amount: 0.08 } } },
  },
};

/** Aurora: wide ribbons of the theme's colour folding through one another, round a deep void. */
export const Aurora: Story = {
  args: {
    scene: 'aurora',
    passes: { fadeTop: { on: false }, fadeBottom: { on: false }, grain: { params: { amount: 0.08 } } },
  },
};

/** Dusk: a soft dome of light low on black, curtains of violet trailing below. */
export const Dusk: Story = {
  args: {
    scene: 'dusk',
  },
};

/** Embers: sparks rising off a low hearth glow, cooling as they climb. */
export const Embers: Story = {
  args: {
    scene: 'embers',
    passes: { fadeTop: { on: false } },
  },
};

/** Settings merged over the scene's defaults: a higher, brighter horizon with a strong beam. */
export const TunedHorizon: Story = {
  args: {
    params: { crown: 0.52, glow: 1.45, beam: 1.8, ocean: 0.55 },
  },
};

/** Finishing passes: a scrim and a vignette over the horizon, for text that sits on it. */
export const WithPasses: Story = {
  args: {
    passes: { scrim: { on: true, params: { amount: 0.3 } }, vignette: { on: true } },
  },
};

/** Speed 0 holds the scene still, as reduced motion does. */
export const Still: Story = {
  args: { speed: 0 },
};
