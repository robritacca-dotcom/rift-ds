import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Dropdown } from './Dropdown';

const sampleOptions = [
  { label: 'Red', value: 'red' },
  { label: 'Teal', value: 'teal' },
  { label: 'Purple', value: 'purple' },
  { label: 'Yellow', value: 'yellow' },
  { label: 'Green', value: 'green' },
];

const meta = {
  title: 'Components/Dropdown',
  component: Dropdown,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    value: { control: 'text' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    error: { control: 'boolean' },
    helperText: { control: 'text' },
  },
  args: {
    onChange: fn(),
    options: sampleOptions,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '320px', minHeight: '300px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Dropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Colour',
    placeholder: 'Select a colour',
  },
};

export const WithValue: Story = {
  args: {
    label: 'Colour',
    value: 'teal',
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Theme',
    placeholder: 'Choose a theme',
    helperText: 'This sets the primary colour',
  },
};

export const Required: Story = {
  args: {
    label: 'Country',
    placeholder: 'Select your country',
    required: true,
    options: [
      { label: 'Canada', value: 'ca' },
      { label: 'United States', value: 'us' },
      { label: 'United Kingdom', value: 'uk' },
      { label: 'Australia', value: 'au' },
    ],
  },
};

export const Error: Story = {
  args: {
    label: 'Priority',
    placeholder: 'Select priority',
    error: true,
    helperText: 'Please select a priority level',
  },
};

export const WithDisabledOption: Story = {
  args: {
    label: 'Plan',
    value: 'pro',
    options: [
      { label: 'Free', value: 'free' },
      { label: 'Pro', value: 'pro' },
      { label: 'Enterprise (coming soon)', value: 'enterprise', disabled: true },
    ],
  },
};

export const Disabled: Story = {
  args: {
    label: 'Colour',
    value: 'teal',
    disabled: true,
  },
};

export const ManyOptions: Story = {
  args: {
    label: 'Icon',
    placeholder: 'Choose an icon',
    options: [
      { label: 'Home', value: 'home' },
      { label: 'Search', value: 'search' },
      { label: 'Settings', value: 'settings' },
      { label: 'Account', value: 'account_circle' },
      { label: 'Notifications', value: 'notifications' },
      { label: 'Mail', value: 'mail' },
      { label: 'Chat', value: 'chat' },
      { label: 'Calendar', value: 'calendar_today' },
      { label: 'Star', value: 'star' },
      { label: 'Bookmark', value: 'bookmark' },
      { label: 'Download', value: 'download' },
      { label: 'Upload', value: 'upload' },
    ],
  },
};

export const NoLabel: Story = {
  args: {
    placeholder: 'Filter by...',
    ariaLabel: 'Filter options',
  },
};

export const Grouped: Story = {
  args: {
    label: 'Font',
    placeholder: 'Choose a font',
    options: [],
    groups: [
      {
        label: 'Sans-serif',
        options: [
          { label: 'Inter', value: 'inter' },
          { label: 'Roboto', value: 'roboto' },
          { label: 'Open Sans', value: 'open-sans' },
        ],
      },
      {
        label: 'Serif',
        options: [
          { label: 'Georgia', value: 'georgia' },
          { label: 'Merriweather', value: 'merriweather' },
        ],
      },
      {
        label: 'Monospace',
        options: [
          { label: 'Fira Code', value: 'fira-code' },
          { label: 'JetBrains Mono', value: 'jetbrains-mono' },
        ],
      },
    ],
  },
};

/* Each option carries its own `font`, so the typeface previews itself —
   system-available faces, no webfonts needed in the sandbox. */
export const FontPreview: Story = {
  args: {
    label: 'Typeface',
    value: 'georgia',
    options: [
      { label: 'Georgia', value: 'georgia', font: "Georgia, 'Times New Roman', serif" },
      { label: 'Verdana', value: 'verdana', font: 'Verdana, sans-serif' },
      { label: 'Courier New', value: 'courier', font: "'Courier New', monospace" },
      { label: 'Arial', value: 'arial', font: 'Arial, sans-serif' },
    ],
  },
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector<HTMLElement>('.ds-dropdown__trigger');
    trigger?.click();
  },
};
