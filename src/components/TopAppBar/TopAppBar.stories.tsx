import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { TopAppBar } from './TopAppBar';
import type { TopAppBarProps } from './TopAppBar';

function ContentCard() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: 12,
        borderRadius: 24,
        border: '1px solid var(--color-bg-container-border)',
        background: 'var(--color-bg-container-primary)',
      }}
    >
      <div style={{ height: 120, borderRadius: 12, background: 'var(--color-bg-container-secondary)' }} />
      <div style={{ height: 10, borderRadius: 999, background: 'var(--color-bg-container-tertiary)' }} />
      <div style={{ height: 10, width: '55%', borderRadius: 999, background: 'var(--color-bg-container-tertiary)' }} />
    </div>
  );
}

/** A phone-sized scroller with the bar stuck to its top, watching its scroll,
    and plain content cards passing underneath. */
function PhoneStage(props: TopAppBarProps) {
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null);
  return (
    <div
      ref={setScroller}
      style={{
        position: 'relative',
        width: 390,
        height: 720,
        margin: '0 auto',
        overflowY: 'auto',
        borderRadius: 40,
        background: 'var(--color-bg-page-primary)',
        boxShadow: '0 0 0 1px var(--color-bg-container-border)',
      }}
    >
      <TopAppBar scrollTarget={scroller} headingLevel={2} {...props} />
      <div style={{ padding: 16, display: 'grid', gap: 12 }}>
        {Array.from({ length: 10 }, (_, i) => (
          <ContentCard key={i} />
        ))}
      </div>
    </div>
  );
}

const actions = [
  { key: 'add', icon: 'add', label: 'New post' },
  { key: 'activity', icon: 'favorite', label: 'Activity', badge: true },
];

const meta = {
  title: 'Components/TopAppBar',
  component: TopAppBar,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    platform: { control: 'inline-radio', options: ['default', 'ios', 'android'] },
    size: { control: 'inline-radio', options: ['small', 'medium', 'large'] },
    align: { control: 'inline-radio', options: ['start', 'center'] },
    navigation: { control: 'inline-radio', options: [undefined, 'menu', 'back', 'close'] },
    scrolled: { control: 'boolean' },
    title: { control: 'text' },
    subtitle: { control: 'text' },
  },
  args: {
    title: 'Inbox',
    navigation: 'menu',
    actions,
    onNavigate: fn(),
  },
  render: (args) => <PhoneStage {...args} />,
} satisfies Meta<typeof TopAppBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** A large title that collapses into the bar as the page scrolls. */
export const DefaultLarge: Story = {
  args: { size: 'large', subtitle: '12 unread' },
};

/** The iOS 26 bar: glass circle buttons over the content, the trailing pair
    sharing one capsule, and a blurred edge once content scrolls under. */
export const IOS: Story = {
  args: { platform: 'ios', navigation: 'back', title: 'Messages' },
};

/** The iOS large title, collapsing to the centred inline title on scroll. */
export const IOSLargeTitle: Story = {
  args: { platform: 'ios', size: 'large', navigation: undefined, title: 'Library' },
};

/** The bar as it looks with content scrolled under it. */
export const IOSScrolled: Story = {
  args: { platform: 'ios', size: 'large', navigation: 'back', title: 'Library', scrolled: true },
};

/** The Material 3 Expressive small app bar. */
export const Android: Story = {
  args: { platform: 'android' },
};

/** The medium flexible app bar with a subtitle, collapsing to the small bar on scroll. */
export const AndroidMedium: Story = {
  args: { platform: 'android', size: 'medium', subtitle: '12 unread', navigation: 'back' },
};

/** The large flexible app bar. */
export const AndroidLarge: Story = {
  args: { platform: 'android', size: 'large', navigation: 'back' },
};

/** Actions beyond the visible ones go into a "More" menu. */
export const WithOverflow: Story = {
  args: {
    platform: 'android',
    overflowActions: [
      { key: 'settings', icon: 'settings', label: 'Settings' },
      { key: 'help', icon: 'help', label: 'Help' },
    ],
  },
};

/** The leading control reports its press; the expanded title owns the heading. */
export const Behaviour: Story = {
  args: { platform: 'android', size: 'large', navigation: 'back', title: 'Budgets' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Back' }));
    await expect(args.onNavigate).toHaveBeenCalled();
    await expect(canvas.getAllByRole('heading', { name: 'Budgets' })).toHaveLength(1);
    await expect(canvas.getByRole('button', { name: 'Activity, new' })).toBeInTheDocument();
  },
};
