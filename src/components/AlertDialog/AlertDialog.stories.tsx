import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { AlertDialog } from './AlertDialog';
import { Button } from '../Button/Button';

const meta = {
  title: 'Components/AlertDialog',
  component: AlertDialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    open: { control: 'boolean' },
    title: { control: 'text' },
    description: { control: 'text' },
    confirmLabel: { control: 'text' },
    cancelLabel: { control: 'text' },
    variant: {
      control: 'select',
      options: ['default', 'destructive'],
    },
  },
  args: {
    onOpenChange: fn(),
    onConfirm: fn(),
    onCancel: fn(),
  },
} satisfies Meta<typeof AlertDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    open: true,
    title: 'Confirm action',
    description: 'Are you sure you want to proceed? This action can be undone later.',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
  },
};

export const Destructive: Story = {
  args: {
    open: true,
    title: 'Delete item',
    description: 'This will permanently delete the item. This action cannot be undone.',
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    variant: 'destructive',
  },
};

export const TitleOnly: Story = {
  args: {
    open: true,
    title: 'Discard unsaved changes?',
    confirmLabel: 'Discard',
    cancelLabel: 'Keep editing',
  },
};

export const CustomLabels: Story = {
  args: {
    open: true,
    title: 'Publish article',
    description: 'Your article will be visible to all users once published.',
    confirmLabel: 'Publish now',
    cancelLabel: 'Save as draft',
  },
};

export const Interactive: Story = {
  args: {
    open: false,
    title: 'Confirm action',
    description: 'Click the button below to open the dialog.',
  },
  render: function InteractiveStory() {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button label="Open dialog" variant="secondary" onClick={() => setOpen(true)} />
        <AlertDialog
          open={open}
          onOpenChange={setOpen}
          title="Confirm action"
          description="Are you sure you want to proceed with this action?"
          onConfirm={() => console.log('Confirmed')}
          onCancel={() => console.log('Cancelled')}
        />
      </>
    );
  },
};

export const InteractiveDestructive: Story = {
  args: {
    open: false,
    title: 'Delete item',
    description: 'Click the button below to open the destructive dialog.',
  },
  render: function InteractiveDestructiveStory() {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button label="Delete item" variant="destructive" onClick={() => setOpen(true)} />
        <AlertDialog
          open={open}
          onOpenChange={setOpen}
          title="Delete item"
          description="This will permanently delete the item. This action cannot be undone."
          confirmLabel="Delete"
          variant="destructive"
          onConfirm={() => console.log('Deleted')}
        />
      </>
    );
  },
};
