import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Checkbox, CheckboxGroup } from '../components/Checkbox/Checkbox';
import { ColorPicker } from '../components/ColorPicker/ColorPicker';
import { Dropdown } from '../components/Dropdown/Dropdown';
import { PinInput } from '../components/PinInput/PinInput';
import { RadioButton, RadioGroup } from '../components/RadioButton/RadioButton';
import { RichDropdown } from '../components/RichDropdown/RichDropdown';
import { SelectionCard } from '../components/SelectionCard/SelectionCard';
import { TagInput } from '../components/TagInput/TagInput';
import { TimePicker } from '../components/TimePicker/TimePicker';
import { ToggleSwitch } from '../components/ToggleSwitch/ToggleSwitch';

/**
 * FORM PARTICIPATION: design.md's "A control reaches a form through `name`",
 * held with a real `FormData`. Each control that has no native input of its
 * own writes a hidden one, so these assert what a form reads rather than what
 * the markup looks like: the selection, never the draft text, and nothing
 * while disabled.
 */
const meta: Meta = {
  title: 'Foundations/Form participation',
};
export default meta;

type Story = StoryObj;

const OPTIONS = [
  { label: 'Starter', value: 'starter' },
  { label: 'Pro', value: 'pro' },
];

const Controls = ({ disabled = false }: { disabled?: boolean }) => (
  <form aria-label="Form participation" style={{ display: 'grid', gap: 'var(--gap-400)', maxWidth: 360 }}>
    <Checkbox name="terms" label="Terms" defaultChecked disabled={disabled} />
    <Checkbox name="unticked" label="Newsletter" disabled={disabled} />
    <CheckboxGroup
      name="days"
      label="Days"
      defaultValues={['mon', 'tue']}
      items={[
        { label: 'Monday', value: 'mon', disabled },
        { label: 'Tuesday', value: 'tue', disabled },
        { label: 'Wednesday', value: 'wed', disabled },
      ]}
    />
    <RadioGroup
      name="plan"
      label="Plan"
      defaultValue="pro"
      options={OPTIONS.map((option) => ({ ...option, disabled }))}
    />
    <RadioButton name="solo" label="Solo" checked disabled={disabled} />
    <ToggleSwitch name="alerts" value="yes" label="Alerts" defaultChecked disabled={disabled} />
    <PinInput name="code" label="Code" length={4} defaultValue="1234" disabled={disabled} />
    <Dropdown name="tier" label="Tier" defaultValue="pro" options={OPTIONS} disabled={disabled} />
    <RichDropdown name="face" label="Face" defaultValue="starter" options={OPTIONS} disabled={disabled} />
    <TagInput name="tag" label="Tags" defaultValues={['design', 'docs']} disabled={disabled} />
    <TimePicker name="time" label="Time" defaultValue="14:30" disabled={disabled} />
    <SelectionCard
      name="seat"
      aria-label="Seat"
      defaultValue="pro"
      options={OPTIONS.map((option) => ({ ...option, disabled }))}
    />
    <SelectionCard
      name="addon"
      aria-label="Add-ons"
      mode="checkbox"
      defaultValue={['starter', 'pro']}
      options={OPTIONS.map((option) => ({ ...option, disabled }))}
    />
  </form>
);

const formOf = (canvasElement: HTMLElement) =>
  new FormData(canvasElement.querySelector('form') as HTMLFormElement);

/** Every control submits its own value under its own name. */
export const Submits: Story = {
  render: () => <Controls />,
  play: async ({ canvasElement, userEvent }) => {
    const form = formOf(canvasElement);
    await expect(form.get('terms')).toBe('on');
    await expect(form.has('unticked')).toBe(false);
    await expect(form.getAll('days')).toEqual(['mon', 'tue']);
    await expect(form.get('plan')).toBe('pro');
    await expect(form.get('solo')).toBe('on');
    await expect(form.get('alerts')).toBe('yes');
    await expect(form.get('code')).toBe('1234');
    await expect(form.get('tier')).toBe('pro');
    await expect(form.get('face')).toBe('starter');
    await expect(form.getAll('tag')).toEqual(['design', 'docs']);
    await expect(form.get('time')).toBe('14:30');
    await expect(form.get('seat')).toBe('pro');
    await expect(form.getAll('addon')).toEqual(['starter', 'pro']);

    // TagInput's draft is what someone is still typing, never a submitted tag.
    await userEvent.type(within(canvasElement).getByLabelText('Tags'), 'draft');
    await expect(formOf(canvasElement).getAll('tag')).toEqual(['design', 'docs']);
  },
};

/** A control outside its form still reaches it through the native `form` attribute. */
export const AssociatedByFormAttribute: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--gap-400)', maxWidth: 360 }}>
      <form id="remote-form" aria-label="Remote form" />
      <ToggleSwitch name="alerts" label="Alerts" defaultChecked form="remote-form" />
      <TimePicker name="time" label="Time" defaultValue="14:30" form="remote-form" />
      <TagInput name="tag" label="Tags" defaultValues={['design']} form="remote-form" />
      <ColorPicker name="tint" label="Tint" form="remote-form" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const form = formOf(canvasElement);
    await expect(form.get('alerts')).toBe('on');
    await expect(form.get('time')).toBe('14:30');
    await expect(form.getAll('tag')).toEqual(['design']);
    await expect(form.get('tint')).toEqual(expect.any(String));
  },
};

/** `required` is announced, and an empty draft never blocks the submit of committed tags. */
export const RequiredTagInputSubmits: Story = {
  render: () => (
    <form aria-label="Required tags">
      <TagInput name="tag" label="Tags" required defaultValues={['design']} />
    </form>
  ),
  play: async ({ canvasElement }) => {
    const form = canvasElement.querySelector('form') as HTMLFormElement;
    await expect(form.checkValidity()).toBe(true);
    await expect(within(canvasElement).getByLabelText(/Tags/)).toHaveAttribute('aria-required', 'true');
  },
};

/** A disabled control contributes nothing, as a disabled native one does. */
export const DisabledSubmitsNothing: Story = {
  render: () => <Controls disabled />,
  play: async ({ canvasElement }) => {
    await expect([...formOf(canvasElement).keys()]).toEqual([]);
  },
};
