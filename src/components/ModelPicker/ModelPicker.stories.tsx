import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';
import { ModelPicker } from './ModelPicker';

const models = [
  {
    label: 'Fable 5',
    value: 'fable-5',
    description: 'Deepest reasoning for hard problems',
    badge: 'New',
  },
  {
    label: 'Opus 5',
    value: 'opus-5',
    description: 'Strong reasoning, faster output',
  },
  {
    label: 'Sonnet 5',
    value: 'sonnet-5',
    description: 'Everyday balance of speed and skill',
  },
  {
    label: 'Haiku 4.5',
    value: 'haiku-4-5',
    description: 'Fastest for light work',
  },
];

const meta = {
  title: 'Components/ModelPicker',
  component: ModelPicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    placement: {
      control: 'select',
      options: ['bottom', 'top'],
    },
    disabled: { control: 'boolean' },
  },
  args: {
    models,
  },
} satisfies Meta<typeof ModelPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Type-to-find: with the list open, a letter moves to the next model named with it. */
export const Typeahead: Story = {
  args: { defaultValue: 'sonnet-5' },
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('combobox');
    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));
    await userEvent.keyboard('o');
    await waitFor(() =>
      expect(document.getElementById(trigger.getAttribute('aria-activedescendant') ?? '')).toHaveTextContent(/Opus 5/),
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
  },
};

export const Default: Story = {
  args: {
    defaultValue: 'sonnet-5',
  },
};

export const Open: Story = {
  args: {
    defaultValue: 'sonnet-5',
  },
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector<HTMLButtonElement>('.ds-model-picker__trigger');
    trigger?.click();
  },
};

export const WithEffort: Story = {
  args: {
    defaultValue: 'fable-5',
    defaultEffort: 'medium',
  },
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector<HTMLButtonElement>('.ds-model-picker__trigger');
    trigger?.click();
  },
};

export const OpensUpward: Story = {
  args: {
    defaultValue: 'sonnet-5',
    placement: 'top',
  },
};

export const WithDisabledModel: Story = {
  args: {
    models: [
      ...models.slice(0, 3),
      { label: 'Haiku 4.5', value: 'haiku-4-5', description: 'Fastest for light work', disabled: true },
    ],
    defaultValue: 'sonnet-5',
  },
};

export const Disabled: Story = {
  args: {
    defaultValue: 'sonnet-5',
    disabled: true,
  },
};
