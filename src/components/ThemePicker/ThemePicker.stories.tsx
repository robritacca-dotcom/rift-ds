import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemePicker } from './ThemePicker';

const THEMES = [
  { value: 'tide', label: 'Tide', color: '#0E6E8F', description: 'One face throughout' },
  { value: 'forest', label: 'Forest', color: '#2F6B3F', swatchRadius: '4px', description: 'Serif headings, sans body', headingFont: 'Georgia, serif' },
  { value: 'zest', label: 'Zest', color: '#C2410C', description: 'Rounded and bright' },
];

const meta = {
  title: 'Components/ThemePicker',
  component: ThemePicker,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { themes: THEMES },
  decorators: [(Story) => <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 260 }}><Story /></div>],
} satisfies Meta<typeof ThemePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Open: Story = {
  args: { defaultOpen: true },
};

export const Compact: Story = {
  args: { size: 'compact' },
};

/** A footer row after the themes: here, a link to build your own. */
export const WithFooter: Story = {
  args: {
    defaultOpen: true,
    footer: (
      <a href="#playground" role="menuitem">
        Make your own
      </a>
    ),
  },
};
