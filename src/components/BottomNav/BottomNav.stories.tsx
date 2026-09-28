import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { BottomNav } from './BottomNav';
import type { BottomNavProps } from './BottomNav';

const items = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'reels', label: 'Reels', icon: 'smart_display' },
  { key: 'messages', label: 'Messages', icon: 'chat_bubble', badge: 3 },
  { key: 'activity', label: 'Activity', icon: 'favorite', badge: true as const },
  { key: 'profile', label: 'Profile', icon: 'account_circle' },
];

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

/** A phone-sized stage with plain content cards scrolling under the bar. */
function PhoneStage({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: 'relative',
        width: 390,
        height: 720,
        margin: '0 auto',
        overflow: 'hidden',
        borderRadius: 40,
        background: 'var(--color-bg-page-primary)',
        boxShadow: '0 0 0 1px var(--color-bg-container-border)',
      }}
    >
      <div style={{ height: '100%', overflowY: 'auto', padding: 16, display: 'grid', gap: 12 }}>
        {Array.from({ length: 12 }, (_, i) => (
          <ContentCard key={i} />
        ))}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>{children}</div>
    </div>
  );
}

/** Wires selection so the stories respond to presses. */
function Interactive(props: BottomNavProps) {
  const [active, setActive] = useState(props.activeKey);
  return (
    <BottomNav
      {...props}
      activeKey={active}
      onValueChange={(key) => {
        setActive(key);
        props.onValueChange?.(key);
      }}
    />
  );
}

const meta = {
  title: 'Components/BottomNav',
  component: BottomNav,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    platform: { control: 'inline-radio', options: ['default', 'ios', 'android'] },
    activeKey: { control: 'select', options: items.map((i) => i.key) },
    minimized: { control: 'boolean' },
    fixed: { control: 'boolean' },
  },
  args: {
    items,
    activeKey: 'home',
    onValueChange: fn(),
  },
  render: (args) => (
    <PhoneStage>
      <Interactive {...args} />
    </PhoneStage>
  ),
} satisfies Meta<typeof BottomNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The iOS 26 Liquid Glass capsule, floating over the content with a lens
    behind the selection. */
export const IOS: Story = {
  args: { platform: 'ios', items: items.slice(0, 4) },
};

/** Search set apart as its own glass circle, the iOS 26 pattern. */
export const IOSWithSearch: Story = {
  args: {
    platform: 'ios',
    items: items.slice(0, 4),
    search: { label: 'Search' },
  },
};

/** Minimised while the page scrolls: the capsule closes to the selection. */
export const IOSMinimized: Story = {
  args: {
    platform: 'ios',
    items: items.slice(0, 4),
    activeKey: 'reels',
    minimized: true,
    search: { label: 'Search' },
  },
};

/** The Material 3 Expressive navigation bar, pill indicator behind the icon. */
export const Android: Story = {
  args: { platform: 'android' },
};

/** Three destinations, the smallest set a tab bar should carry. */
export const ThreeDestinations: Story = {
  args: { items: items.slice(0, 3) },
};

/** Pressing a destination selects it and reports its key. */
export const Selection: Story = {
  args: { platform: 'android' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const reels = canvas.getByRole('button', { name: 'Reels' });
    await userEvent.click(reels);
    await expect(args.onValueChange).toHaveBeenCalledWith('reels');
    await expect(reels).toHaveAttribute('aria-current', 'page');
    await userEvent.click(canvas.getByRole('button', { name: 'Home' }));
    await expect(canvas.getByRole('button', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
  },
};
