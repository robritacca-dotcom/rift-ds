import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import { RichDropdown } from './RichDropdown';

/* System-available faces so the cells preview real typographic contrast
   without loading webfonts in the sandbox. */
const presets = [
  {
    label: 'House default',
    value: 'default',
    color: '#0E6E8F',
    description: 'One face for everything',
  },
  {
    label: 'Editorial serif',
    value: 'editorial',
    headingFont: "Georgia, 'Times New Roman', serif",
    bodyFont: 'Verdana, sans-serif',
    color: '#D97757',
    description: 'Georgia over Verdana',
  },
  {
    label: 'Terminal mono',
    value: 'terminal',
    headingFont: "'Courier New', monospace",
    bodyFont: "'Courier New', monospace",
    color: '#05A67C',
    swatchRadius: '0px',
    description: 'Courier through and through',
  },
  {
    label: 'Ink and paper',
    value: 'mono',
    headingFont: 'Arial Black, Arial, sans-serif',
    bodyFont: 'Arial, sans-serif',
    color: '#232323',
    swatchRadius: '4px',
    description: 'Arial Black over Arial',
  },
];

const meta = {
  title: 'Components/RichDropdown',
  component: RichDropdown,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '320px' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    error: { control: 'boolean' },
  },
  args: {
    options: presets,
  },
} satisfies Meta<typeof RichDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Theme preset',
    defaultValue: 'editorial',
  },
};

export const Open: Story = {
  args: {
    label: 'Theme preset',
    defaultValue: 'editorial',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox');
    trigger.click();
    await waitFor(() => expect(canvas.getByRole('listbox')).toBeVisible());
  },
};

export const Placeholder: Story = {
  args: {
    label: 'Theme preset',
    placeholder: 'Choose a look',
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Theme preset',
    defaultValue: 'terminal',
    helperText: 'Every lever loads a saved position.',
  },
};

export const WithDisabledOption: Story = {
  args: {
    label: 'Theme preset',
    defaultValue: 'default',
    options: [
      ...presets.slice(0, 3),
      { ...presets[3], disabled: true },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    canvas.getByRole('combobox').click();
    await waitFor(() => expect(canvas.getByRole('listbox')).toBeVisible());
  },
};

export const Error: Story = {
  args: {
    label: 'Theme preset',
    placeholder: 'Choose a look',
    error: true,
    helperText: 'Pick a preset to continue.',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Theme preset',
    defaultValue: 'mono',
    disabled: true,
  },
};

/* The behavioural contract: keyboard open, arrow to an option, select it,
   and the trigger re-renders as that preset's cell. Runs as CI. */
export const KeyboardSelection: Story = {
  args: {
    label: 'Theme preset',
    defaultValue: 'default',
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox');

    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(canvas.getByRole('listbox')).toBeVisible());

    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    await waitFor(() =>
      expect(canvas.queryByRole('listbox')).not.toBeInTheDocument(),
    );
    await expect(trigger).toHaveTextContent('Editorial serif');

    // Escape closes without changing the value.
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(canvas.getByRole('listbox')).toBeVisible());
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(canvas.queryByRole('listbox')).not.toBeInTheDocument(),
    );
    await expect(trigger).toHaveTextContent('Editorial serif');
  },
};
