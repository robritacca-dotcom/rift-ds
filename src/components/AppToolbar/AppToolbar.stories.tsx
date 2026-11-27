import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';
import { AppToolbar } from './AppToolbar';
import { NotificationCenter, NotificationItem } from '../NotificationCenter/NotificationCenter';

const meta = {
  title: 'Components/AppToolbar',
  component: AppToolbar,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  args: {
    onSearch: () => {},
    actions: [
      { id: 'notifications', icon: 'notifications', label: 'Notifications', badge: 3 },
      { id: 'calendar', icon: 'calendar_today', label: 'Calendar' },
      { id: 'help', icon: 'help', label: 'Help' },
      { id: 'settings', icon: 'settings', label: 'Settings', href: '#settings' },
    ],
    onChat: () => {},
  },
} satisfies Meta<typeof AppToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The search, space, then the borderless icon controls and the AI button. */
export const Default: Story = {
  play: async ({ canvas }) => {
    canvas.getByRole('group', { name: 'App toolbar' });
    // Each folding control shows one form at a time, so each is announced once.
    await expect(canvas.getAllByRole('button', { name: 'Search or ask anything' })).toHaveLength(1);
    await expect(canvas.getAllByRole('button', { name: /Ask AI/ })).toHaveLength(1);
    await expect(canvas.queryByRole('button', { name: 'More' })).toBeNull();
  },
};

/** With the page's primary action last, a primary Button with a leading icon at the AI button's size. */
export const WithPrimaryAction: Story = {
  args: { primaryAction: { label: 'Move money', icon: 'swap_horiz' } },
  play: async ({ canvas }) => {
    const ai = canvas.getByRole('button', { name: /Ask AI/ });
    const primary = canvas.getByRole('button', { name: 'Move money' });
    await expect(primary.getBoundingClientRect().height).toBe(ai.getBoundingClientRect().height);
    // The primary action comes last.
    await expect(ai.compareDocumentPosition(primary) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  },
};

/** Under 800px the AI button and the primary action fold to their icons. */
export const Medium: Story = {
  args: { primaryAction: { label: 'Move money', icon: 'swap_horiz' } },
  decorators: [(Story) => <div style={{ inlineSize: 640 }}><Story /></div>],
};

/** Under 600px the search folds to its icon too. */
export const Narrow: Story = {
  decorators: [(Story) => <div style={{ inlineSize: 480 }}><Story /></div>],
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Search or ask anything' })).toHaveClass('ds-command-palette-trigger--icon-only');
  },
};

/** Under 420px every icon control after the first moves into the More menu. */
export const Phone: Story = {
  decorators: [(Story) => <div style={{ inlineSize: 340 }}><Story /></div>],
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'More' })).toBeVisible();
    await expect(canvas.queryByRole('button', { name: 'Help' })).toBeNull();
  },
};

/** One control and nothing else: the start stays empty and the end holds its place. */
export const Minimal: Story = {
  args: {
    onSearch: undefined,
    onChat: undefined,
    actions: [{ id: 'settings', icon: 'settings', label: 'Settings' }],
  },
};

/** `size="compact"`: every control at the 32px row height, still one height across the bar. */
export const Compact: Story = {
  args: { size: 'compact', primaryAction: { label: 'Move money', icon: 'swap_horiz' } },
};

/** `searchGlass` frosts the search, for a bar riding over a map or a shader. */
export const SearchGlass: Story = {
  args: { searchGlass: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Search or ask anything' })).toHaveClass('ds-command-palette-trigger--glass');
  },
};

/** An icon control that opens a panel: the bell opens a NotificationCenter below it. */
export const WithNotifications: Story = {
  args: {
    actions: [
      {
        id: 'notifications',
        icon: 'notifications',
        label: 'Notifications',
        badge: 2,
        panel: (
          <NotificationCenter unreadCount={2}>
            <NotificationItem title="Payment received" time="2m" unread>
              Northwind Supply paid invoice 1042.
            </NotificationItem>
            <NotificationItem title="Statement ready" time="Mon">
              Your October statement is ready to download.
            </NotificationItem>
          </NotificationCenter>
        ),
      },
      { id: 'help', icon: 'help', label: 'Help' },
    ],
  },
  play: async ({ canvas, canvasElement }) => {
    const bell = canvas.getByRole('button', { name: /Notifications/ });
    await userEvent.click(bell);
    await waitFor(() => expect(canvasElement.querySelector('.ds-popover__panel--open')).not.toBeNull());
    await waitFor(() => expect(canvas.getByText('Payment received')).toBeVisible());
    // Rest closed, as the snapshot expects.
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(canvasElement.querySelector('.ds-popover__panel--open')).toBeNull());
  },
};
