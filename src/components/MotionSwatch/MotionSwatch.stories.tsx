import type { Meta, StoryObj } from '@storybook/react-vite';
import { MotionSwatch } from './MotionSwatch';

const meta = {
  title: 'Components/MotionSwatch',
  component: MotionSwatch,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
    },
    token: {
      control: 'text',
    },
    value: {
      control: 'text',
    },
    kind: {
      control: 'radio',
      options: ['duration', 'easing'],
    },
    demo: {
      control: 'radio',
      options: ['slide', 'spin', 'shimmer'],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '200px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MotionSwatch>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Duration token — dot travels the track at the token's speed */
export const DurationBase: Story = {
  args: {
    label: 'Base',
    token: '--motion-duration-base',
    value: '200ms',
    kind: 'duration',
    demo: 'slide',
  },
};

/** Easing token — dot traces the curve at a fixed readable duration */
export const EasingSpring: Story = {
  args: {
    label: 'Spring',
    token: '--motion-ease-spring',
    value: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    kind: 'easing',
    demo: 'slide',
  },
};

/** Loop duration — continuous spinner rotation */
export const LoopSpin: Story = {
  args: {
    label: 'Loop spin',
    token: '--motion-duration-loop-spin',
    value: '1000ms',
    kind: 'duration',
    demo: 'spin',
  },
};

/** Loop duration — continuous skeleton shimmer */
export const LoopShimmer: Story = {
  args: {
    label: 'Loop shimmer',
    token: '--motion-duration-loop-shimmer',
    value: '1800ms',
    kind: 'duration',
    demo: 'shimmer',
  },
};

/** Grid of duration swatches — how they appear on the page */
export const SwatchGrid: Story = {
  args: {
    label: 'Base',
    token: '--motion-duration-base',
    value: '200ms',
    kind: 'duration',
  },
  decorators: [
    () => (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', width: '800px' }}>
        <MotionSwatch label="Fast" token="--motion-duration-fast" value="150ms" kind="duration" />
        <MotionSwatch label="Base" token="--motion-duration-base" value="200ms" kind="duration" />
        <MotionSwatch label="Slow" token="--motion-duration-slow" value="300ms" kind="duration" />
        <MotionSwatch label="Slower" token="--motion-duration-slower" value="600ms" kind="duration" />
      </div>
    ),
  ],
};
