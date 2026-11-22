import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../Button/Button';
import { ShaderScene, type ShaderSceneSource } from './ShaderScene';

/**
 * A scene written outside the library, the way a consumer writes one: the
 * colour roles it reads, two settings, and the GLSL that paints it from the
 * uniforms and noise helpers every scene is handed.
 */
const ember: ShaderSceneSource = {
  mode: 'dark',
  colours: ['--color-ambient-1', '--color-ambient-4'],
  params: [
    { key: 'glow', label: 'Glow', min: 0, max: 2, step: 0.01, default: 1 },
    { key: 'height', label: 'Height', min: 0.1, max: 1, step: 0.01, default: 0.55 },
  ],
  glsl: /* glsl */ `
vec3 scene(vec2 uv, float t) {
  float aspect = u_size.x / u_size.y;
  vec2 p = vec2((uv.x - 0.5) * aspect, uv.y);
  float drift = fbm(vec2(p.x * 2.4, p.y * 1.4 - t * 0.12));
  float rise = lobe(uv.y - u_height * drift, 0.22, 0.5);
  float fine = fbm(p * 7.0 - vec2(0.0, t * 0.3));
  vec3 light = (u_col[0] + u_col[1] * fine * 1.6) * rise * u_glow * 0.5;
  return u_ground + light;
}
`,
};

/** Whether this browser can run a scene at all; a play function asserts less where it cannot. */
const hasWebGL2 = () => Boolean(document.createElement('canvas').getContext('webgl2'));

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
    scene: { control: 'inline-radio', options: ['horizon', 'rift', 'glyphs', 'prism', 'meteors', 'waves', 'aurora', 'highway', 'ocean', 'sky', 'galaxy', 'tide'] },
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

/** The horizon: a planet's limb at night, a sun on the arc, a hazy world and ocean below. */
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

/** Highway: a straight highway at night, drawn in light trails that pull to one point on a hazy horizon. */
export const Highway: Story = {
  args: {
    scene: 'highway',
    passes: { fadeTop: { on: false }, fadeBottom: { on: false }, grain: { params: { amount: 0.08 } } },
  },
};

/** Ocean: open water from above, sea life drawn in type swimming through it; a turquoise shallow on a light page, deep and moonlit on a dark one. */
export const Ocean: Story = {
  args: {
    scene: 'ocean',
    passes: { fadeTop: { on: false }, fadeBottom: { on: false }, grain: { on: false } },
  },
};

/** Sky: cloud massed overhead and burning with a low sun; a golden hour on a light page, the last of a sunset under a night sky on a dark one. */
export const Sky: Story = {
  args: {
    scene: 'sky',
    passes: { fadeTop: { on: false }, fadeBottom: { on: false }, grain: { params: { amount: 0.22 } } },
  },
};

/** Galaxy: a spiral galaxy seen at a slant, a hot core in wound arms, deep in a field of stars. */
export const Galaxy: Story = {
  args: {
    scene: 'galaxy',
    passes: { fadeTop: { on: false }, fadeBottom: { on: false }, grain: { params: { amount: 0.08 } } },
  },
};

/** Tide: dusk over still water, smeared like a long exposure, a band of fire on the horizon mirrored in the water. */
export const Tide: Story = {
  args: {
    scene: 'tide',
    passes: { fadeTop: { on: false }, fadeBottom: { on: false }, grain: { params: { amount: 0.1 } } },
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

/** A scene of your own: `scene` takes a source in place of an id, and it gets the same passes, light-mode handling and budget. */
export const CustomScene: Story = {
  args: {
    scene: ember,
    passes: { fadeTop: { on: false } },
  },
};

/**
 * A scene written inline is compared by content, so a host that renders
 * again with a new object rebuilds nothing: the program is linked once.
 */
export const InlineScene: Story = {
  render: (args) => {
    const Host = () => {
      const [renders, setRenders] = useState(0);
      return (
        <div style={{ display: 'grid', gap: 'var(--gap-300)', justifyItems: 'start' }}>
          <Stage>
            <ShaderScene {...args} scene={{ ...ember }} data-testid="scene" data-renders={renders} />
          </Stage>
          <Button variant="secondary" onClick={() => setRenders((count) => count + 1)}>
            Render again
          </Button>
        </div>
      );
    };
    return <Host />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const scene = canvas.getByTestId('scene');
    if (!hasWebGL2()) {
      await waitFor(() => expect(scene).toHaveAttribute('data-status', 'unavailable'));
      return;
    }
    await waitFor(() => expect(scene).toHaveAttribute('data-status', 'active'));
    const original = WebGL2RenderingContext.prototype.linkProgram;
    let links = 0;
    WebGL2RenderingContext.prototype.linkProgram = function (program) {
      links += 1;
      return original.call(this, program);
    };
    try {
      const again = canvas.getByRole('button', { name: 'Render again' });
      await userEvent.click(again);
      await userEvent.click(again);
      await waitFor(() => expect(scene).toHaveAttribute('data-renders', '2'));
      expect(links).toBe(0);
    } finally {
      WebGL2RenderingContext.prototype.linkProgram = original;
    }
  },
};

/**
 * A scene whose GLSL does not compile reports `unavailable` and hands the
 * compiler's log to `onError`, numbered from the scene's own first line.
 */
export const BrokenScene: Story = {
  args: {
    scene: {
      colours: [],
      params: [],
      glsl: 'vec3 scene(vec2 uv, float t) {\n  return missing;\n}',
    },
    onError: fn(),
    'data-testid': 'scene',
  } as Story['args'],
  play: async ({ args, canvasElement }) => {
    const scene = within(canvasElement).getByTestId('scene');
    await waitFor(() => expect(scene).toHaveAttribute('data-status', 'unavailable'));
    if (!hasWebGL2()) return;
    await waitFor(() => expect(args.onError).toHaveBeenCalled());
    expect(args.onError).toHaveBeenCalledWith(expect.stringContaining('1:2'));
  },
};
