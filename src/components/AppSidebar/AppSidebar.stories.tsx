import React from 'react';
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
    category: 'Account',
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
  // Most stories below show the accordion on a flush rail, so they name
  // those; the defaults (panel mode, the inset layout) are the Defaults story.
  args: {
    sections: sampleSections,
    profile: sampleProfile,
    activeKey: 'dashboard',
    logoText: 'Northlight',
    defaultExpanded: true,
    subNav: 'accordion',
    layout: 'flush',
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
        category: 'Main',
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

/** A child is the current page: only it carries `aria-current`, and while it
    shows below its parent the parent gives up its fill, so one row reads as
    current. Collapse the rail and the parent takes the fill back. */
export const WithActiveAccordion: Story = {
  args: {
    defaultExpanded: true,
    activeKey: 'components',
    activeSubKey: 'buttons',
  },
  play: async ({ canvasElement }) => {
    const current = canvasElement.querySelectorAll('[aria-current="page"]');
    await expect(current).toHaveLength(1);
    await expect(current[0]).toHaveClass('ds-app-sidebar__sub-btn');
    await expect(canvasElement.querySelectorAll('.ds-app-sidebar__btn--active')).toHaveLength(0);
  },
};

/** The current page is a third-level item in the panel: it alone carries
    `aria-current`, and the second-level row feeding the panel keeps only
    its selection fill. */
export const CurrentInThePanel: Story = {
  args: {
    defaultExpanded: true,
    sections: [
      {
        items: [
          {
            key: 'reports',
            icon: 'bar_chart',
            label: 'Reports',
            children: [
              { key: 'standard', label: 'Standard reports' },
              {
                key: 'planning',
                label: 'Financial planning',
                children: [
                  { key: 'budgets', label: 'Budgets' },
                  { key: 'forecasts', label: 'Forecasts' },
                ],
              },
            ],
          },
        ],
      },
    ],
    activeKey: 'reports',
    activeSubKey: 'planning',
    activeTertiaryKey: 'budgets',
  },
  play: async () => {
    await waitFor(() => expect(document.body.querySelectorAll('[aria-current="page"]')).toHaveLength(1));
    await expect(document.body.querySelector('[aria-current="page"]')).toHaveTextContent('Budgets');
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
    category: 'Main',
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

/** The defaults, with no `subNav` or `layout` given: panel mode, whose collapsed rail names each destination under its icon, on the inset layout's shell colour. */
export const Defaults: Story = {
  args: {
    subNav: undefined,
    layout: undefined,
    defaultExpanded: false,
    sections: threeLevelSections,
    activeKey: 'reports',
    activeSubKey: 'standard',
  },
  parameters: { contentOffset: 80 + 240 },
};

/** A nav longer than the rail: the rows scroll in a block of their own above the profile, an end with more beyond it fades out, the collapsed rail hides its scrollbar, a short divider on the icons' axis marks each group break, and the Theme row's icon is a swatch node centred on the glyphs' axis. */
export const LongNavCollapsed: Story = {
  args: {
    subNav: 'panel',
    layout: undefined,
    defaultExpanded: false,
    activeKey: 'realtime',
    sections: [
      {
        category: 'Analytics',
        items: [
          { key: 'home', icon: 'home', label: 'Home' },
          { key: 'realtime', icon: 'monitoring', label: 'Realtime' },
          { key: 'audience', icon: 'groups', label: 'Audience' },
          { key: 'acquisition', icon: 'conversion_path', label: 'Acquisition' },
          { key: 'events', icon: 'bolt', label: 'Events' },
          { key: 'reports', icon: 'description', label: 'Reports', badge: 4 },
        ],
      },
      {
        category: 'Account',
        items: [
          { key: 'support', icon: 'headset_mic', label: 'Support' },
          { key: 'settings', icon: 'settings', label: 'Settings' },
        ],
      },
      {
        category: 'Appearance',
        items: [
          {
            key: 'theme',
            icon: (
              <span
                aria-hidden="true"
                style={{ display: 'block', width: 20, height: 20, borderRadius: 999, background: 'var(--color-chart-series-3)' }}
              />
            ),
            label: 'Theme',
            value: 'Ember',
          },
          { key: 'mode', icon: 'dark_mode', label: 'Mode', value: 'Dark' },
        ],
      },
    ],
  },
  parameters: { contentOffset: 80 },
  render: (args) => (
    <div style={{ display: 'flex', height: 480 }}>
      <AppSidebar {...args} fixed={false} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const top = canvasElement.querySelector('.ds-app-sidebar__top') as HTMLElement;
    await waitFor(() => expect(top.scrollHeight).toBeGreaterThan(top.clientHeight));
    // At rest the rows run on below, so the end fades and the start does not.
    await waitFor(() => expect(top).toHaveAttribute('data-fade-end'));
    await expect(top).not.toHaveAttribute('data-fade-start');
    // The collapsed rail draws a divider at each group break.
    const navs = canvasElement.querySelectorAll('.ds-app-sidebar__sections > .ds-app-sidebar__nav');
    await expect(getComputedStyle(navs[1], '::before').borderTopStyle).toBe('solid');
  },
};

/** A crowded collapsed rail with a persistent top slot: the rows scroll
    and the slot keeps its content's full height, so a switcher's mark is
    never squeezed under the slot's clip. */
export const TopSlotCrowded: Story = {
  args: {
    ...LongNavCollapsed.args,
    persistentTopSlot: true,
    topSlot: (
      <div data-testid="crowded-slot" style={{ height: 52, display: 'grid', placeItems: 'center' }}>
        <span
          aria-hidden="true"
          style={{ display: 'block', width: 32, height: 32, borderRadius: 8, background: 'var(--color-chart-series-2)' }}
        />
      </div>
    ),
  },
  parameters: { contentOffset: 80 },
  render: LongNavCollapsed.render,
  play: async ({ canvasElement }) => {
    const top = canvasElement.querySelector('.ds-app-sidebar__top') as HTMLElement;
    await waitFor(() => expect(top.scrollHeight).toBeGreaterThan(top.clientHeight));
    const slot = canvasElement.querySelector('.ds-app-sidebar__top-slot') as HTMLElement;
    await expect(slot.getBoundingClientRect().height).toBeGreaterThanOrEqual(52);
  },
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

/** Both cards float: the side panel joins the rail as a second card. */
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

/** `collapsibleSections` lets the reader fold each titled section under
    its heading: the heading becomes a toggle with a chevron, every section
    starts open, and a folded section's rows glide shut and go inert. Off by
    default, where the headings stay plain labels. */
export const CollapsibleSections: Story = {
  args: {
    defaultExpanded: true,
    collapsibleSections: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByRole('button', { name: 'Design' });
    const panel = canvasElement.ownerDocument.getElementById(heading.getAttribute('aria-controls') ?? '');
    await expect(heading).toHaveAttribute('aria-expanded', 'true');
    await expect(panel).not.toHaveAttribute('inert');

    await userEvent.click(heading);
    await expect(heading).toHaveAttribute('aria-expanded', 'false');
    await expect(panel).toHaveAttribute('inert');

    // Rest open, as the snapshot expects.
    await userEvent.click(heading);
    await expect(heading).toHaveAttribute('aria-expanded', 'true');
  },
};

/** `fixed={false}` lays the rail out in its parent instead of fixing
    it to the viewport: here a bordered 720 x 480 frame, a flex row with the
    rail as its first item. The rail runs the frame's height, the side panel
    opens beside it inside the frame, and the content gives way to both. */
export const Contained: Story = {
  args: {
    fixed: false,
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

/* ---- Unique content in the shared rail ---- */

const CONTENT_SECTIONS = [
  { items: [{ key: 'new', icon: 'edit_square', label: 'New chat', keys: 'mod+shift+o' }] },
  {
    category: 'Projects',
    action: { label: 'New project', icon: 'add', onClick: () => {} },
    items: [
      { key: 'atlas-app', label: 'Atlas app', pixelAvatar: 'atlas-app' },
      { key: 'atlas-docs', label: 'Atlas docs', pixelAvatar: 'atlas-docs' },
    ],
  },
  {
    category: 'History',
    items: [],
    content: (
      <ul data-testid="history" style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        <li style={{ padding: 'var(--padding-200) var(--padding-300)' }}>Rework the onboarding flow</li>
        <li style={{ padding: 'var(--padding-200) var(--padding-300)' }}>Speed up the search index</li>
      </ul>
    ),
  },
];

/** A section's `content` carries the rail's own content after its rows (a
    chat's history), and its `action` puts a button on the heading. An item's
    `keys` draws a shortcut hint at the row's end. Collapsed, the rail folds
    the content away. */
export const WithContentSection: Story = {
  args: { defaultExpanded: true, sections: CONTENT_SECTIONS },
  parameters: { contentOffset: 280 },
  render: (args) => (
    <div style={{ display: 'flex', height: 560 }}>
      <AppSidebar {...args} fixed={false} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('history')).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'New project' })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Collapse sidebar' }));
    const content = canvasElement.querySelector('.ds-app-sidebar__section-content')!;
    await waitFor(() => expect(content).toHaveAttribute('inert'));
    // Collapsed, the logo and the toggle both expand; press the toggle.
    await userEvent.click(canvasElement.querySelector<HTMLElement>('.ds-app-sidebar__toggle')!);
    await waitFor(() => expect(content).not.toHaveAttribute('inert'));
  },
};

/** `responsive="drawer"` with a controlled drawer: the host opens it, focus
    moves inside and stays there, and Escape closes it without reaching a
    parent that closes on Escape, with focus back on the opener. */
export const HostDrawer: Story = {
  args: { sections: CONTENT_SECTIONS },
  parameters: { contentOffset: 0 },
  render: function Render(args) {
    const [open, setOpen] = React.useState(false);
    const [parentHeard, setParentHeard] = React.useState(false);
    return (
      <div
        data-testid="host"
        data-parent-heard={parentHeard || undefined}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && !event.defaultPrevented) setParentHeard(true);
        }}
        style={{ display: 'flex', flexDirection: 'column', width: 420, height: 560 }}
      >
        <button type="button" onClick={() => setOpen(true)}>
          Open history
        </button>
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          <AppSidebar {...args} fixed={false} responsive="drawer" showMobileTrigger={false} drawerOpen={open} onDrawerOpenChange={setOpen} />
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const opener = canvas.getByRole('button', { name: 'Open history' });
    await userEvent.click(opener);
    const nav = canvasElement.querySelector('.ds-app-sidebar') as HTMLElement;
    await waitFor(() => expect(nav).toHaveClass('ds-app-sidebar--mobile-open'));
    await waitFor(() => expect(nav.contains(document.activeElement)).toBe(true));
    for (let step = 0; step < 6; step += 1) {
      await userEvent.tab();
      await expect(nav.contains(document.activeElement)).toBe(true);
    }
    // A tooltip may hold the first Escape (one press, one layer), so press
    // again only once the first has settled and the drawer is still open.
    await userEvent.keyboard('{Escape}');
    try {
      await waitFor(() => expect(nav).not.toHaveClass('ds-app-sidebar--mobile-open'), { timeout: 400 });
    } catch {
      await userEvent.keyboard('{Escape}');
    }
    await waitFor(() => expect(nav).not.toHaveClass('ds-app-sidebar--mobile-open'));
    await expect(canvas.getByTestId('host')).not.toHaveAttribute('data-parent-heard');
    await waitFor(() => expect(opener).toHaveFocus());
  },
};

/** `responsive="container"` decides the form by the parent's width: in a
    700px frame the rail is the drawer form, and its built-in trigger opens
    it inside the frame. */
export const ContainerResponsive: Story = {
  args: { defaultExpanded: true, sections: CONTENT_SECTIONS },
  parameters: { contentOffset: 0 },
  render: (args) => (
    <div style={{ display: 'flex', width: 700, height: 520, border: '1px solid var(--color-bg-container-border)' }}>
      <AppSidebar {...args} fixed={false} responsive="container" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const nav = canvasElement.querySelector('.ds-app-sidebar') as HTMLElement;
    await waitFor(() => expect(nav).toHaveClass('ds-app-sidebar--drawer-form'));
    const trigger = canvasElement.querySelector<HTMLElement>('.ds-app-sidebar__mobile-trigger')!;
    await userEvent.click(trigger);
    await waitFor(() => expect(nav).toHaveClass('ds-app-sidebar--mobile-open'));
    await userEvent.click(within(nav).getByRole('button', { name: 'Close navigation' }));
    await waitFor(() => expect(nav).not.toHaveClass('ds-app-sidebar--mobile-open'));
  },
};

/** `foldForPanel` folds the expanded rail to its icon form when the side
    panel opens in a parent too narrow for the rail, the panel and a
    readable column. */
export const FoldForPanel: Story = {
  args: { defaultExpanded: true, subNav: 'panel', sections: threeLevelSections, foldForPanel: true, defaultPanelOpen: false },
  parameters: { contentOffset: 0 },
  render: (args) => (
    <div style={{ display: 'flex', width: 900, height: 560 }}>
      <AppSidebar {...args} fixed={false} responsive="rail" />
      <div style={{ flex: 1 }} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = canvasElement.querySelector('.ds-app-sidebar') as HTMLElement;
    await expect(nav).toHaveClass('ds-app-sidebar--expanded');
    await userEvent.click(canvas.getByRole('button', { name: /Reports/ }));
    await waitFor(() => expect(nav).not.toHaveClass('ds-app-sidebar--expanded'));
  },
};
