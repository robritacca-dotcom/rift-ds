import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';
import { AppLayout } from './AppLayout';
import { AppToolbar } from '../AppToolbar/AppToolbar';

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
  title: 'Components/AppLayout',
  component: AppLayout,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    defaultExpanded: { control: 'boolean' },
    layout: { control: 'inline-radio', options: ['flush', 'floating', 'inset'] },
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
} satisfies Meta<typeof AppLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The defaults: the inset layout and the sidebar's panel mode, as the templates draw it. */
export const Default: Story = {
  args: {
    children: (
      <div>
        <h1 style={{ fontSize: 40, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 8 }}>
          Dashboard
        </h1>
        <p style={{ fontSize: 16, color: 'var(--color-text-tertiary)', maxWidth: 640 }}>
          This is the AppLayout template with a collapsible sidebar and centred content area.
          Click the collapse button in the sidebar to toggle between expanded and collapsed states.
        </p>
      </div>
    ),
  },
};

export const CollapsedByDefault: Story = {
  args: {
    defaultExpanded: false,
    children: (
      <div>
        <h1 style={{ fontSize: 40, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 8 }}>
          Dashboard
        </h1>
        <p style={{ fontSize: 16, color: 'var(--color-text-tertiary)', maxWidth: 640 }}>
          Sidebar starts collapsed. Click the sidebar to expand it.
        </p>
      </div>
    ),
  },
};

/** The rail floats as a card on the shell colour; the content stays centred on the crisp surface. */
export const Floating: Story = {
  args: {
    layout: 'floating',
    children: (
      <div>
        <h1 style={{ fontSize: 40, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 8 }}>
          Dashboard
        </h1>
        <p style={{ fontSize: 16, color: 'var(--color-text-tertiary)', maxWidth: 640 }}>
          The rail floats off the viewport edges as a card on the shell colour, and the content stays centred beside it on the crisp surface.
        </p>
      </div>
    ),
  },
};

/** The rail runs flush on the shell colour and the content sits in a
    surface inset from the other edges, scrolling inside itself, centred at
    the contained width like every mode. */
export const Inset: Story = {
  args: {
    layout: 'inset',
    children: (
      <div>
        <h1 style={{ fontSize: 40, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 8 }}>
          Dashboard
        </h1>
        <p style={{ fontSize: 16, color: 'var(--color-text-tertiary)', maxWidth: 640 }}>
          The rail sits flush on the shell colour, and the content sits in a raised surface that scrolls on its own.
        </p>
      </div>
    ),
  },
};

/** Any mode at full width: the width is its own choice, apart from the mode. */
export const InsetFullWidth: Story = {
  args: { ...Inset.args, layout: 'inset', width: 'full' },
};

/** `layout="flush"`: the rail edge to edge on the shell colour behind a hairline, the content crisp beside it, nothing raised. */
export const Flush: Story = {
  args: { ...Default.args, layout: 'flush' },
};

/** Flush at full width. */
export const FlushFullWidth: Story = {
  args: { ...Default.args, layout: 'flush', width: 'full' },
};

/** `sidebarProps` passes the rest of the rail's options through, so an app
    on AppLayout has the same rail as the templates: here its sections fold
    from a chevron at each heading, and a full-width action sits under the
    profile. */
export const WithSidebarProps: Story = {
  args: {
    sidebarProps: {
      collapsibleSections: true,
      footerAction: (
        <button type="button" style={{ width: '100%', height: 40, borderRadius: 999 }}>
          Upgrade plan
        </button>
      ),
    },
    children: (
      <div>
        <h1 style={{ fontSize: 40, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 8 }}>
          Dashboard
        </h1>
      </div>
    ),
  },
  play: async ({ canvasElement }) => {
    const fold = canvasElement.querySelector<HTMLButtonElement>('.ds-app-sidebar__fold');
    await expect(fold).not.toBeNull();
    await userEvent.click(fold!);
    await waitFor(() => expect(fold).toHaveAttribute('aria-expanded', 'false'));
    // Rest open, as the snapshot expects.
    await userEvent.click(fold!);
    await waitFor(() => expect(fold).toHaveAttribute('aria-expanded', 'true'));
    await expect(canvasElement.querySelector('.ds-app-sidebar__footer-action')).not.toBeNull();
  },
};

/** The bar a working app keeps above its page, an AppToolbar. */
const sampleToolbar = (
  <AppToolbar
    onSearch={() => {}}
    actions={[
      { id: 'notifications', icon: 'notifications', label: 'Notifications', badge: 3 },
      { id: 'help', icon: 'help', label: 'Help' },
    ]}
    onChat={() => {}}
  />
);

/** Rows enough to scroll, so the pinned bar shows what passes under it. */
const longContent = (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-500)' }}>
    <h1 style={{ fontSize: 40, fontWeight: 700, color: 'var(--color-text-primary)' }}>Dashboard</h1>
    {Array.from({ length: 16 }, (_, index) => (
      <p key={index} style={{ fontSize: 16, color: 'var(--color-text-tertiary)', maxWidth: 640 }}>
        Row {index + 1}. The toolbar stays pinned at the top of the content column while this scrolls under it.
      </p>
    ))}
  </div>
);

/** `toolbar` seats a bar at the top of the content column and pins it
    while the surface scrolls, at the width the content runs. */
export const WithToolbar: Story = {
  args: { toolbar: sampleToolbar, children: longContent },
  play: async ({ canvasElement }) => {
    const bar = canvasElement.querySelector<HTMLElement>('.ds-app-layout__toolbar');
    await expect(bar).not.toBeNull();
    await expect(bar!.parentElement).toHaveClass('ds-app-layout__content');
    await expect(getComputedStyle(bar!).position).toBe('sticky');
  },
};

/** The toolbar in the flush layout: pinned to the viewport as the page scrolls. */
export const WithToolbarFlush: Story = {
  args: { ...WithToolbar.args, layout: 'flush' },
};

/** The toolbar in the floating layout, beside the floating rail. */
export const WithToolbarFloating: Story = {
  args: { ...WithToolbar.args, layout: 'floating' },
};
