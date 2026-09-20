import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Toolbar, ToolbarSeparator } from './Toolbar';
import { CircularButton } from '../CircularButton/CircularButton';
import { SegmentedControl } from '../SegmentedControl/SegmentedControl';
import { Button } from '../Button/Button';

const meta = {
  title: 'Components/Toolbar',
  component: Toolbar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
    variant: {
      control: 'select',
      options: ['default', 'floating'],
    },
    label: { control: 'text' },
  },
  args: {
    label: 'Canvas controls',
  },
} satisfies Meta<typeof Toolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Toolbar {...args}>
      <CircularButton icon="remove" variant="tertiary" ariaLabel="Zoom out" />
      <Button label="100%" variant="tertiary" size="compact" />
      <CircularButton icon="add" variant="tertiary" ariaLabel="Zoom in" />
      <ToolbarSeparator />
      <CircularButton icon="fit_screen" variant="tertiary" ariaLabel="Fit to screen" />
      <CircularButton icon="open_in_full" variant="tertiary" ariaLabel="Expand" />
    </Toolbar>
  ),
  // The toolbar keyboard pattern: arrows walk the controls, Home/End jump
  // to the ends. Ends resting with focus released.
  play: async ({ canvas, userEvent }) => {
    const zoomOut = await canvas.findByRole('button', { name: 'Zoom out' });
    zoomOut.focus();

    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('button', { name: '100%' })).toHaveFocus();

    await userEvent.keyboard('{End}');
    await expect(canvas.getByRole('button', { name: 'Expand' })).toHaveFocus();

    await userEvent.keyboard('{ArrowRight}');
    await expect(zoomOut).toHaveFocus();

    await userEvent.keyboard('{Home}');
    await expect(zoomOut).toHaveFocus();
    zoomOut.blur();
  },
};

export const Floating: Story = {
  render: (args) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        width: '560px',
        height: '240px',
        padding: '24px',
        borderRadius: '12px',
        background:
          'radial-gradient(circle at 25% 30%, rgba(239,71,111,0.35), transparent 55%), radial-gradient(circle at 75% 40%, rgba(17,138,178,0.35), transparent 55%), radial-gradient(circle at 55% 90%, rgba(255,209,102,0.4), transparent 50%)',
      }}
    >
      <FloatingToolbar {...args} />
    </div>
  ),
};

const FloatingToolbar = (args: Omit<ComponentProps<typeof Toolbar>, 'children'>) => (
  <Toolbar {...args} variant="floating">
      <CircularButton icon="undo" variant="tertiary" ariaLabel="Undo" />
      <CircularButton icon="redo" variant="tertiary" ariaLabel="Redo" />
      <ToolbarSeparator />
      <SegmentedControl
        size="compact"
        ariaLabel="Canvas mode"
        segments={[
          { label: 'Select', value: 'select' },
          { label: 'Pan', value: 'pan' },
        ]}
        activeSegment="select"
      />
      <ToolbarSeparator />
      <CircularButton icon="delete" variant="tertiary" ariaLabel="Delete selection" />
  </Toolbar>
);

export const Vertical: Story = {
  render: (args) => (
    <Toolbar {...args} orientation="vertical" label="Drawing tools">
      <CircularButton icon="near_me" variant="tertiary" ariaLabel="Select tool" />
      <CircularButton icon="edit" variant="tertiary" ariaLabel="Draw tool" />
      <CircularButton icon="crop_square" variant="tertiary" ariaLabel="Shape tool" />
      <ToolbarSeparator />
      <CircularButton icon="delete" variant="tertiary" ariaLabel="Delete" />
    </Toolbar>
  ),
};

export const MixedControls: Story = {
  render: (args) => (
    <Toolbar {...args} label="Editor actions">
      <Button label="Share" variant="primary" size="compact" />
      <Button label="Preview" variant="tertiary" size="compact" />
      <ToolbarSeparator />
      <CircularButton icon="more_horiz" variant="tertiary" ariaLabel="More actions" />
    </Toolbar>
  ),
};
