import type { Meta, StoryObj } from '@storybook/react-vite';
import { BackToTop } from './BackToTop';

const meta = {
  title: 'Components/BackToTop',
  component: BackToTop,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: { threshold: 0 },
} satisfies Meta<typeof BackToTop>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Shown at once here (`threshold: 0`), so the story displays it. */
export const Default: Story = {
  render: (args) => (
    <div style={{ minHeight: '200vh', padding: 'var(--padding-500)', fontFamily: 'var(--font-family-body)' }}>
      <p>Scroll down; the button sits in the bottom end corner.</p>
      <BackToTop {...args} />
    </div>
  ),
};

/** Appears only after the reader scrolls past the threshold. */
export const AfterThreshold: Story = {
  args: { threshold: 400, focusTarget: 'storybook-root' },
  render: Default.render,
};
