import type { Meta, StoryObj } from '@storybook/react-vite';
import { Nav } from './Nav';
import { ToggleSwitch } from '../ToggleSwitch/ToggleSwitch';

const meta = {
  title: 'Components/Nav',
  component: Nav,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    brandText: {
      control: 'text',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '0 24px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Nav>;

export default meta;
type Story = StoryObj<typeof meta>;

const siteNavButtons = [
  { label: 'Home' },
  { label: 'About' },
  { label: 'Design System', state: 'active' as const },
  { label: 'Blog', state: 'disabled' as const },
];

export const Default: Story = {
  args: {
    brandText: 'Northlight',
    buttons: siteNavButtons,
  },
};

export const WithToggle: Story = {
  args: {
    brandText: 'Northlight',
    buttons: siteNavButtons,
    trailing: <ToggleSwitch checked={true} label="Dark Mode" />,
  },
};

export const WithIcons: Story = {
  args: {
    brandText: 'myapp',
    buttons: [
      { label: 'Dashboard', iconLeft: 'dashboard' },
      { label: 'Projects', iconLeft: 'folder' },
      { label: 'Team', iconLeft: 'group' },
      { label: 'Settings', iconLeft: 'settings', state: 'active' as const },
    ],
  },
};

export const NoBrand: Story = {
  args: {
    buttons: [
      { label: 'Products' },
      { label: 'Solutions' },
      { label: 'Pricing' },
      { label: 'Docs' },
    ],
  },
};
