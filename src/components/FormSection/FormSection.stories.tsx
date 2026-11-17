import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { FormSection } from './FormSection';
import { Button } from '../Button/Button';
import { Input } from '../Input/Input';
import { Dropdown } from '../Dropdown/Dropdown';
import { ToggleSwitch } from '../ToggleSwitch/ToggleSwitch';

const meta = {
  title: 'Components/FormSection',
  component: FormSection,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    columns: { control: 'inline-radio', options: [1, 2, 3] },
    layout: { control: 'inline-radio', options: ['stacked', 'aside'] },
  },
  args: {
    title: 'Profile',
    description: 'How you appear to the people you work with.',
    columns: 2,
    children: (
      <>
        <Input label="First name" defaultValue="Ada" />
        <Input label="Last name" defaultValue="Lovelace" />
        <Input label="Email" type="email" defaultValue="ada@example.com" />
        <Dropdown
          label="Time zone"
          defaultValue="utc"
          options={[
            { value: 'utc', label: 'UTC' },
            { value: 'cet', label: 'Central European' },
          ]}
        />
      </>
    ),
    actions: (
      <>
        <Button label="Cancel" variant="tertiary" />
        <Button label="Save" />
      </>
    ),
  },
} satisfies Meta<typeof FormSection>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A heading over two columns of fields and the section's own actions. */
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { level: 2, name: 'Profile' })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  },
};

/** The settings layout: the heading in a column beside the fields, stacking when the section is narrow. */
export const Aside: Story = {
  args: { layout: 'aside' },
};

/** A column of sections, each under a rule, each saving on its own: a settings page. */
export const SettingsColumn: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-1000)', maxWidth: '880px' }}>
      <FormSection {...args} layout="aside" />
      <FormSection
        layout="aside"
        divider
        title="Notifications"
        description="What we email you about."
        actions={<Button label="Save" />}
      >
        <ToggleSwitch label="Weekly summary" defaultChecked />
        <ToggleSwitch label="Mentions" defaultChecked />
      </FormSection>
    </div>
  ),
};
