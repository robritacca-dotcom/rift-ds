import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';
import { InspectorSection } from './InspectorSection';
import { InspectorSlider } from './InspectorSlider';
import { InspectorToggleSwitch } from './InspectorToggleSwitch';
import { InspectorSegmentedControl } from './InspectorSegmentedControl';
import { InspectorInput } from './InspectorInput';
import { InspectorDropdown } from './InspectorDropdown';
import { Button } from '../Button/Button';

const meta = {
  title: 'Components/InspectorSection',
  component: InspectorSection,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: {
    title: 'Shape and depth',
    defaultOpen: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 280 }}>
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <InspectorSection {...args}>
      <InspectorSlider
        size="compact"
        label="Corner radius"
        defaultValue={100}
        min={0}
        max={200}
        step={10}
        format={(v) => `${v}%`}
      />
      <InspectorToggleSwitch size="compact" label="Pill buttons" defaultChecked />
      <InspectorSegmentedControl
        size="compact"
        label="Elevation"
        defaultValue="default"
        options={[
          { value: 'default', label: 'Default' },
          { value: 'flat', label: 'Flat' },
          { value: 'soft', label: 'Soft' },
        ]}
      />
    </InspectorSection>
  ),
} satisfies Meta<typeof InspectorSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {};

export const Closed: Story = {
  args: { defaultOpen: false },
};

/** A full panel: stacked sections, every control in the family, at compact. */
export const Panel: Story = {
  render: () => (
    <div>
      <InspectorSection title="Theme" defaultOpen>
        <InspectorInput size="compact" label="Product name" placeholder="Acme Corp" />
        <InspectorDropdown
          size="compact"
          label="Headings"
          value="Match body"
          options={[
            { value: 'Match body', label: 'Match body' },
            { value: 'Serif', label: 'Serif', font: 'Georgia, serif' },
          ]}
        />
        <Button size="compact" variant="neutral" label="All colour ramps" iconLeft="palette" />
      </InspectorSection>
      <InspectorSection title="Space and motion" defaultOpen>
        <InspectorSlider
          size="compact"
          label="Density"
          defaultValue={100}
          min={70}
          max={130}
          step={5}
          format={(v) => `${v}%`}
        />
        <InspectorSlider
          size="compact"
          label="Motion"
          defaultValue={100}
          min={50}
          max={150}
          step={10}
          format={(v) => `${v}%`}
        />
      </InspectorSection>
      <InspectorSection title="Typography">
        <InspectorToggleSwitch size="compact" label="Tight headings" />
      </InspectorSection>
    </div>
  ),
};

/**
 * The header toggles the body, and a closed body is inert, so its controls
 * leave the tab order instead of hiding at zero height.
 */
export const TogglesAndInerts: Story = {
  play: async ({ canvas, userEvent }) => {
    const header = canvas.getByRole('button', { name: 'Shape and depth' });
    const region = canvas.getByRole('region', { name: 'Shape and depth' });
    await expect(header).toHaveAttribute('aria-expanded', 'true');
    await expect(region.inert).toBe(false);

    await userEvent.click(header);
    await expect(header).toHaveAttribute('aria-expanded', 'false');
    await expect(region.inert).toBe(true);

    await userEvent.click(header);
    await expect(header).toHaveAttribute('aria-expanded', 'true');
    await waitFor(() => expect(region.inert).toBe(false));
  },
};
