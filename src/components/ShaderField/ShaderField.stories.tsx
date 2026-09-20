import type { Meta, StoryObj } from '@storybook/react-vite';
import { ShaderField } from './ShaderField';
import type { ShaderBlob } from './useShaderField';

/**
 * The field fills its positioned ancestor, so every story provides one. On the
 * website that ancestor is a fixed layer behind the page; here it is a plain
 * bordered box, which is the honest way to show that placement is the caller's.
 */
const Stage = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      position: 'relative',
      width: 640,
      height: 320,
      overflow: 'hidden',
      borderRadius: 'var(--radius-md)',
      border: 'var(--border-xs) solid var(--color-bg-container-border)',
      background: 'var(--color-bg-page-primary)',
    }}
  >
    {children}
  </div>
);

const meta = {
  title: 'Components/ShaderField',
  component: ShaderField,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    enabled: { control: 'boolean' },
  },
  render: (args) => (
    <Stage>
      <ShaderField {...args} />
    </Stage>
  ),
} satisfies Meta<typeof ShaderField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** `streak` stretches every source along a fixed diagonal: 0 is discs, 1 is light streams. */
export const LightStreams: Story = {
  args: { params: { streak: 1, warp: 0.2 } },
};

/** Grain both textures the field and is what kills 8-bit banding on ramps this wide. */
export const Grainy: Story = {
  args: { params: { grain: 0.35, intensity: 0.7 } },
};

/**
 * The cursor wake ships dormant at `react: 0`. Raised, it swirls and brightens
 * the field under the pointer — move across the stage to see it — and the loop
 * steps from 30fps to 60fps only while a wake is alive.
 */
export const CursorWake: Story = {
  args: { params: { react: 0.8, streak: 0.2 } },
};

/**
 * Sources read their colour from a token at runtime, so a composition is just
 * a table of token names. Negative weights absorb light instead of emitting
 * it, which is how you get a shadow that occludes what shines behind it.
 */
export const CustomComposition: Story = {
  args: {
    params: { intensity: 0.9, scale: 1.8, streak: 0 },
    blobs: [
      { token: '--color-core-accent-violet', size: 0.7, cx: -0.2, cy: 0, period: 18, phase: 0, weight: 1 },
      { token: '--color-core-accent-cobalt', size: 0.6, cx: 0.25, cy: 0.1, period: 15, phase: 1.1, weight: 1 },
      { token: '--color-core-accent-coral', size: 0.35, cx: 0.05, cy: -0.15, period: 21, phase: 0.4, weight: 1 },
      { token: '--color-bg-page-primary', size: 0.3, cx: 0.1, cy: 0.05, period: 19, phase: 0.9, weight: -0.8 },
    ] satisfies ShaderBlob[],
  },
};

/**
 * `enabled={false}` unmounts WebGL entirely and reports `unavailable`, so the
 * caller's fallback is the whole background. Same path a machine with no
 * WebGL2 takes, which makes it the way to check that fallback deliberately.
 */
export const Disabled: Story = {
  args: { enabled: false },
  render: (args) => (
    <Stage>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          color: 'var(--color-text-tertiary)',
          font: 'var(--font-paragraph-sm-weight) var(--font-paragraph-sm-size)/var(--font-paragraph-sm-line-height) var(--font-family-primary)',
        }}
      >
        the caller&rsquo;s fallback
      </div>
      <ShaderField {...args} />
    </Stage>
  ),
};
