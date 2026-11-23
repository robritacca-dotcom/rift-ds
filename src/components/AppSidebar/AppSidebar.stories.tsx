import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { AppSidebar } from './AppSidebar';
import { Checkbox } from '../Checkbox/Checkbox';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';

const sampleSections = [
  {
    category: 'Main',
    items: [
      { key: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
      { key: 'analytics', icon: 'analytics', label: 'Analytics' },
      { key: 'projects', icon: 'folder', label: 'Projects' },
      { key: 'tasks', icon: 'task_alt', label: 'Tasks' },
      { key: 'calendar', icon: 'calendar_today', label: 'Calendar' },
    ],
  },
  {
    category: 'Design',
    items: [
      {
        key: 'components',
        icon: 'widgets',
        label: 'Components',
        children: [
          { key: 'buttons', label: 'Buttons' },
          { key: 'inputs', label: 'Inputs' },
          { key: 'cards', label: 'Cards' },
        ],
      },
      {
        key: 'foundations',
        icon: 'palette',
        label: 'Foundations',
        children: [
          { key: 'colours', label: 'Colours' },
          { key: 'typography', label: 'Typography' },
          { key: 'spacing', label: 'Spacing' },
        ],
      },
      { key: 'icons', icon: 'emoji_symbols', label: 'Icons' },
    ],
  },
  {
    items: [
      { key: 'settings', icon: 'settings', label: 'Settings' },
      { key: 'help', icon: 'help', label: 'Help & Support' },
    ],
  },
];

const sampleProfile = {
  name: 'Jordan Reyes',
  email: 'jordan@example.com',
};

const meta = {
  title: 'Components/AppSidebar',
  component: AppSidebar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    defaultExpanded: { control: 'boolean' },
    activeKey: { control: 'text' },
    activeSubKey: { control: 'text' },
    logoText: { control: 'text' },
  },
  args: {
    sections: sampleSections,
    profile: sampleProfile,
    activeKey: 'dashboard',
    logoText: 'Northlight',
    defaultExpanded: true,
  },
  decorators: [
    (Story, ctx) => {
      // A story that draws its own frame (the contained rail) skips the page.
      if (ctx.parameters.ownFrame) return <Story />;
      const expanded = (ctx.args as { defaultExpanded?: boolean }).defaultExpanded ?? false;
      return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#0E0E0E' }}>
          <Story />
          <div style={{
            marginLeft: (ctx.parameters.contentOffset as number | undefined) ?? (expanded ? 280 : 64),
            padding: 40,
            flex: 1,
            transition: 'margin-left 0.25s ease',
            color: '#F1F1F1',
          }}>
            <h1 style={{ fontSize: 32, marginBottom: 8 }}>Page Content</h1>
            <p style={{ color: '#6D6D6D' }}>
              {expanded
                ? 'Content area beside the sidebar.'
                : 'Collapsed sidebar — hover over icons to see tooltips.'}
            </p>
          </div>
        </div>
      );
    },
  ],
} satisfies Meta<typeof AppSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Expanded: Story = {
  args: {
    defaultExpanded: true,
  },
};

/**
 * Below the mobile breakpoint the rail is a modal drawer. From the keyboard:
 * the trigger opens it and focus moves inside, Tab and Shift+Tab stay inside
 * it, and Escape closes it with focus back on the trigger.
 */
export const MobileDrawer: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector<HTMLElement>('.ds-app-sidebar__mobile-trigger')!;
    const drawer = document.getElementById(trigger.getAttribute('aria-controls')!)!;
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));
    await waitFor(() => expect(drawer.contains(document.activeElement)).toBe(true));

    for (let step = 0; step < 12; step += 1) {
      await userEvent.tab();
      await expect(drawer.contains(document.activeElement)).toBe(true);
    }
    for (let step = 0; step < 12; step += 1) {
      await userEvent.tab({ shift: true });
      await expect(drawer.contains(document.activeElement)).toBe(true);
    }

    // A control with a tooltip opens it a hover-intent delay after focus
    // lands, as a layer of its own above the drawer, and Escape closes the
    // topmost layer only (WCAG 1.4.13). When focus rests on one, wait for the
    // tooltip and let the first Escape take it, so the run never depends on
    // whether the delay passed before the key.
    const tip = document.activeElement?.closest('.ds-tooltip')?.querySelector('[role="tooltip"]');
    if (tip) {
      await waitFor(() => expect(tip).toHaveClass('ds-tooltip__panel--visible'));
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(tip).not.toHaveClass('ds-tooltip__panel--visible'));
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    }

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

/** Rows that name a thing rather than a place draw a generated pixel avatar
 *  in the icon seat; the sidebar spreads the inks so neighbours differ. */
export const WithPixelAvatars: Story = {
  args: {
    defaultExpanded: true,
    activeKey: 'Northwind Trading',
    sections: [
      {
        items: [
          { key: 'inbox', icon: 'inbox', label: 'Inbox', badge: 3 },
          { key: 'reports', icon: 'bar_chart', label: 'Reports' },
        ],
      },
      {
        category: 'Accounts',
        items: [
          'Northwind Trading',
          'Harbor & Vine',
          'Bluepeak Logistics',
          'Juniper Health',
          'Oakline Retail',
          'Meridian Foods',
        ].map((name) => ({ key: name, label: name, pixelAvatar: true })),
      },
    ],
  },
};

export const Collapsed: Story = {
  args: {
    defaultExpanded: false,
  },
};

/** The glass-card treatment: inset from the viewport edges with rounded
    corners, the translucent glass fill over a backdrop blur, and the
    floating shadow. */
export const Floating: Story = {
  args: {
    defaultExpanded: true,
    layout: 'floating',
  },
};

/** The inset layout's rail: flush on the app shell colour, beside a
    content surface inset from the other edges (AppLayout draws the
    surface; see its Inset story). */
export const Inset: Story = {
  args: {
    defaultExpanded: true,
    layout: 'inset',
  },
};

const badgeSections = [
  {
    items: [
      { key: 'home', icon: 'home', label: 'Home', badge: 152 },
      { key: 'campaigns', icon: 'campaign', label: 'Campaigns', badge: 'New' },
      { key: 'inbox', icon: 'inbox', label: 'Inbox', badge: 91 },
      { key: 'archive', icon: 'archive', label: 'Archive', badge: '9+' },
    ],
  },
];

/** Pills on nav rows: a count on the count badge pair, a word on the
    quiet pill. */
export const WithBadges: Story = {
  args: {
    defaultExpanded: true,
    sections: badgeSections,
  },
};

/** Collapsed, a count rides its icon's corner and a word is hidden. The
    corner copy is presentational: the trailing pill stays the one read. */
export const CollapsedWithBadges: Story = {
  args: {
    defaultExpanded: false,
    sections: badgeSections,
  },
  play: async ({ canvasElement }) => {
    const corners = Array.from(
      canvasElement.querySelectorAll<HTMLElement>('.ds-app-sidebar__btn-corner-badge'),
    );
    await expect(corners.map((corner) => corner.textContent)).toEqual(['152', '91', '9+']);
    for (const corner of corners) {
      await expect(corner).toHaveAttribute('aria-hidden', 'true');
    }
    const word = canvasElement.querySelector('.ds-app-sidebar__btn-badge:not(.ds-app-sidebar__btn-badge--count)');
    await expect(word).toHaveTextContent('New');
  },
};

/** The labelled panel-mode rail, collapsed: the counts ride the icons
    above their captions. */
export const PanelModeCollapsedWithBadges: Story = {
  args: {
    defaultExpanded: false,
    subNav: 'panel',
    sections: badgeSections,
  },
};

const slotArgs = {
  topSlot: (
    <input
      type="search"
      placeholder="Quick search"
      aria-label="Quick search"
      style={{ width: '100%' }}
    />
  ),
  footerSlot: <ThemeToggle size="compact" showLabels={false} />,
  collapsedFooterSlot: <ThemeToggle size="compact" cycle />,
};

/** Consumer slots: a search field under the logo row and the colour mode
    strip above the profile block, both fading out while collapsed; the
    strip's collapsed form, the one-circle toggle, takes its place then. */
export const WithSlots: Story = {
  args: {
    defaultExpanded: true,
    ...slotArgs,
  },
};

/** The same slots on the collapsed rail: the footer shows its collapsed
    form, and a click on the rail's dead space expands it. */
export const WithSlotsCollapsed: Story = {
  args: {
    defaultExpanded: false,
    ...slotArgs,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole('navigation', { name: 'App navigation' });
    await expect(nav).not.toHaveClass('ds-app-sidebar--expanded');
    await userEvent.click(nav);
    await expect(nav).toHaveClass('ds-app-sidebar--expanded');
  },
};

/** A control in the collapsed rail's foot keeps its own press: a role-bearing
    div such as Checkbox toggles without expanding the rail. */
export const CollapsedFooterControl: Story = {
  args: {
    defaultExpanded: false,
    collapsedFooterSlot: <Checkbox label="Pin" />,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole('navigation', { name: 'App navigation' });
    const box = canvas.getByRole('checkbox', { name: 'Pin' });
    await userEvent.click(box);
    await expect(box).toHaveAttribute('aria-checked', 'true');
    await expect(nav).not.toHaveClass('ds-app-sidebar--expanded');
  },
};

export const WithActiveAccordion: Story = {
  args: {
    defaultExpanded: true,
    activeKey: 'components',
    activeSubKey: 'buttons',
  },
};

/** Items with an `href` render as real links (with `aria-current` on the
    active one), so middle-click and copy-link work; accordion rows stay
    buttons, and their sub-items can be links too. */
export const WithLinks: Story = {
  args: {
    defaultExpanded: true,
    activeKey: 'dashboard',
    sections: [
      {
        category: 'Main',
        items: [
          { key: 'dashboard', icon: 'dashboard', label: 'Dashboard', href: '#dashboard' },
          { key: 'analytics', icon: 'analytics', label: 'Analytics', href: '#analytics' },
          { key: 'projects', icon: 'folder', label: 'Projects', href: '#projects' },
        ],
      },
      {
        category: 'Design',
        items: [
          {
            key: 'components',
            icon: 'widgets',
            label: 'Components',
            children: [
              { key: 'buttons', label: 'Buttons', href: '#buttons' },
              { key: 'inputs', label: 'Inputs', href: '#inputs' },
            ],
          },
        ],
      },
    ],
  },
};

const reportsChildren = [
  { key: 'standard', label: 'Standard reports' },
  { key: 'custom', label: 'Custom reports' },
  { key: 'kpis', label: 'KPIs', badge: 'New' },
  {
    key: 'planning',
    label: 'Financial planning',
    children: [
      { key: 'cash-overview', label: 'Cash flow overview' },
      { key: 'cash-planner', label: 'Cash flow planner' },
      { key: 'budgets', label: 'Budgets' },
      { key: 'forecasts', label: 'Forecasts' },
    ],
  },
];

const threeLevelSections = [
  {
    items: [
      { key: 'home', icon: 'home', label: 'Home' },
      { key: 'create', icon: 'add_circle', label: 'Create' },
      { key: 'reports', icon: 'monitoring', label: 'Reports', children: reportsChildren },
      { key: 'apps', icon: 'apps', label: 'My apps' },
    ],
  },
  {
    category: 'Pinned',
    items: [
      { key: 'clients', icon: 'group', label: 'Clients' },
      { key: 'payroll', icon: 'payments', label: 'Payroll' },
    ],
  },
];

/** Three levels in accordion mode: the accordion holds level 2, and a
    sub-item with children (Financial planning) opens level 3 in the side
    panel. Pressing the sub-item again, or the panel's collapse control,
    closes it. */
export const ThirdLevelPanel: Story = {
  args: {
    defaultExpanded: true,
    sections: threeLevelSections,
    activeKey: 'reports',
    activeSubKey: 'planning',
    activeTertiaryKey: 'budgets',
  },
  parameters: { contentOffset: 280 + 240 },
};

/** `subNav="panel"` skips the accordion: Reports opens its sub-items straight
    into the side panel, with Financial planning as the panel's own accordion.
    The collapsed rail names every destination under its icon. */
export const PanelMode: Story = {
  args: {
    defaultExpanded: false,
    subNav: 'panel',
    sections: threeLevelSections,
    activeKey: 'reports',
    activeSubKey: 'standard',
  },
  parameters: { contentOffset: 80 + 240 },
};

/** Panel mode with the rail expanded by hand. */
export const PanelModeExpanded: Story = {
  args: {
    defaultExpanded: true,
    subNav: 'panel',
    sections: threeLevelSections,
    activeKey: 'reports',
    activeTertiaryKey: 'forecasts',
  },
  parameters: { contentOffset: 280 + 240 },
};

/** Both cards float: the side panel joins the rail as a second glass card. */
export const PanelModeFloating: Story = {
  args: {
    defaultExpanded: false,
    layout: 'floating',
    subNav: 'panel',
    sections: threeLevelSections,
    activeKey: 'reports',
    activeSubKey: 'kpis',
  },
  parameters: { contentOffset: 20 + 80 + 12 + 240 + 20 },
};

/** Inset: the side panel continues the rail on the shell colour, a divider
    between them, and the content surface starts beyond both. */
export const PanelModeInset: Story = {
  args: {
    defaultExpanded: false,
    layout: 'inset',
    subNav: 'panel',
    sections: threeLevelSections,
    activeKey: 'reports',
    activeSubKey: 'kpis',
  },
  parameters: { contentOffset: 80 + 240 },
};

/** The row feeding the panel toggles it, and the panel's own collapse
    control closes it too; a closed panel is inert. */
export const PanelBehaviour: Story = {
  args: {
    defaultExpanded: true,
    sections: threeLevelSections,
    activeKey: 'reports',
    activeSubKey: 'planning',
    activeTertiaryKey: 'budgets',
  },
  parameters: { contentOffset: 280 + 240 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const source = canvas.getByRole('button', { name: 'Financial planning' });
    const panel = canvasElement.querySelector('.ds-app-sidebar__panel');
    await expect(source).toHaveAttribute('aria-expanded', 'true');
    await expect(panel).not.toHaveAttribute('inert');

    await userEvent.click(source);
    await expect(source).toHaveAttribute('aria-expanded', 'false');
    await expect(panel).toHaveAttribute('inert');

    await userEvent.click(source);
    await expect(source).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(canvas.getByRole('button', { name: 'Collapse Financial planning' }));
    await expect(source).toHaveAttribute('aria-expanded', 'false');

    // Rest in the open state the snapshot expects.
    await userEvent.click(source);
    await expect(source).toHaveAttribute('aria-expanded', 'true');
  },
};

/** `position="contained"` lays the rail out in its parent instead of fixing
    it to the viewport: here a bordered 720 x 480 frame, a flex row with the
    rail as its first item. The rail runs the frame's height, the side panel
    opens beside it inside the frame, and the content gives way to both. */
export const Contained: Story = {
  args: {
    position: 'contained',
    layout: 'inset',
    defaultExpanded: true,
    sections: threeLevelSections,
    activeKey: 'reports',
    activeSubKey: 'planning',
    activeTertiaryKey: 'budgets',
  },
  parameters: { ownFrame: true, layout: 'centered' },
  render: (args) => (
    <div
      data-testid="frame"
      style={{
        display: 'flex',
        width: 720,
        height: 480,
        boxSizing: 'border-box',
        overflow: 'hidden',
        border: 'var(--border-025) solid var(--color-bg-container-border)',
        borderRadius: 'var(--radius-600)',
        background: 'var(--color-bg-app-shell)',
        color: 'var(--color-text-primary)',
      }}
    >
      <AppSidebar {...args} />
      <div style={{ flex: 1, minWidth: 0, padding: 'var(--padding-1000)', overflow: 'auto' }}>
        <h1 style={{ margin: 0 }}>Page content</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Content beside the contained rail.</p>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const frame = canvasElement.querySelector<HTMLElement>('[data-testid="frame"]')!;
    const rail = frame.querySelector<HTMLElement>('.ds-app-sidebar')!;
    const panel = frame.querySelector<HTMLElement>('.ds-app-sidebar__panel')!;
    const outer = frame.getBoundingClientRect();
    const border = parseFloat(getComputedStyle(frame).borderTopWidth);
    // The rail starts at the frame's inner corner and runs its height.
    await waitFor(() => {
      const box = rail.getBoundingClientRect();
      expect(Math.round(box.top)).toBe(Math.round(outer.top + border));
      expect(Math.round(box.left)).toBe(Math.round(outer.left + border));
      expect(Math.round(box.height)).toBe(Math.round(outer.height - border * 2));
    });
    // The open panel sits beside the rail, inside the frame.
    await waitFor(() => {
      const railBox = rail.getBoundingClientRect();
      const panelBox = panel.getBoundingClientRect();
      expect(Math.round(panelBox.left)).toBe(Math.round(railBox.right));
      expect(panelBox.bottom).toBeLessThanOrEqual(outer.bottom);
    });
  },
};
