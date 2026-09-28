import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { SidebarPanel } from './SidebarPanel';

const reportItems = [
  { key: 'standard', label: 'Standard reports' },
  { key: 'custom', label: 'Custom reports' },
  { key: 'management', label: 'Management reports' },
  { key: 'kpis', label: 'KPIs', badge: 'New' },
  { key: 'sync', label: 'Spreadsheet sync' },
  { key: 'performance', label: 'Performance centre' },
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

const meta = {
  title: 'Components/SidebarPanel',
  component: SidebarPanel,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    activeKey: { control: 'text' },
    backLabel: { control: 'text' },
  },
  args: {
    items: reportItems,
    title: 'Reports and analytics',
    activeKey: 'standard',
  },
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', display: 'flex' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SidebarPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The current page sits inside an accordion, which starts open. */
export const ActiveInAccordion: Story = {
  args: {
    activeKey: 'budgets',
  },
};

/** Group headings split a long section into labelled runs. */
export const Grouped: Story = {
  args: {
    title: 'Settings',
    activeKey: 'profile',
    items: [
      { key: 'profile', label: 'Profile', group: 'Account' },
      { key: 'security', label: 'Security', group: 'Account' },
      { key: 'notifications', label: 'Notifications', group: 'Account', badge: 3 },
      { key: 'members', label: 'Members', group: 'Workspace' },
      { key: 'billing', label: 'Billing', group: 'Workspace' },
      { key: 'integrations', label: 'Integrations', group: 'Workspace' },
    ],
  },
};

/** The collapse control beside the heading. */
export const Collapsible: Story = {
  args: {
    onCollapse: () => {},
  },
};

/** The drill-in screen a drawer shows on small screens: a back row above the heading. */
export const WithBackRow: Story = {
  args: {
    onBack: () => {},
    backLabel: 'Menu',
  },
};

/** The accordion toggles, and a closed accordion takes its rows out of the tab order. */
export const AccordionBehaviour: Story = {
  args: {
    activeKey: 'standard',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Financial planning' });
    const region = canvasElement.querySelector<HTMLElement>(
      `#${CSS.escape(toggle.getAttribute('aria-controls') ?? '')}`,
    );
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(region).toHaveAttribute('inert');

    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(region).not.toHaveAttribute('inert');

    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(region).toHaveAttribute('inert');
  },
};
