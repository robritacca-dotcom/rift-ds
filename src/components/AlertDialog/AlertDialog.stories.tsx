import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, waitFor } from 'storybook/test';
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
    tone: {
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
    tone: 'destructive',
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
        <Button label="Delete item" variant="secondary" tone="destructive" onClick={() => setOpen(true)} />
        <AlertDialog
          open={open}
          onOpenChange={setOpen}
          title="Delete item"
          description="This will permanently delete the item. This action cannot be undone."
          confirmLabel="Delete"
          tone="destructive"
          onConfirm={() => console.log('Deleted')}
        />
      </>
    );
  },
};

/**
 * The keyboard contract: focus opens on the cancel button (the safe action),
 * Tab and Shift+Tab stay inside the panel, and Escape cancels, calling
 * `onCancel` and `onOpenChange(false)` and handing focus back to the trigger.
 */
export const KeyboardContract: Story = {
  args: {
    open: false,
    title: 'Delete project',
    description: 'This removes the project and its history.',
    confirmLabel: 'Delete',
    cancelLabel: 'Keep project',
    tone: 'destructive',
  },
  render: function KeyboardContractStory(args) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button label="Open alert" variant="secondary" onClick={() => setOpen(true)} />
        <AlertDialog
          {...args}
          open={open}
          onOpenChange={(next) => {
            args.onOpenChange(next);
            setOpen(next);
          }}
        />
      </>
    );
  },
  play: async ({ canvas, userEvent, args }) => {
    const trigger = await canvas.findByRole('button', { name: 'Open alert' });
    await userEvent.click(trigger);

    const dialog = await screen.findByRole('alertdialog', { name: 'Delete project' });
    const cancel = screen.getByRole('button', { name: 'Keep project' });
    const confirm = screen.getByRole('button', { name: 'Delete' });
    await waitFor(() => expect(cancel).toHaveFocus());

    // Tab cycles the two actions and never leaves the panel.
    await userEvent.tab();
    await expect(confirm).toHaveFocus();
    await userEvent.tab();
    await expect(cancel).toHaveFocus();
    await userEvent.tab({ shift: true });
    await expect(confirm).toHaveFocus();
    await expect(dialog.contains(document.activeElement)).toBe(true);

    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.queryByRole('alertdialog', { name: 'Delete project' })).toBeNull(),
    );
    await expect(args.onCancel).toHaveBeenCalledTimes(1);
    await expect(args.onOpenChange).toHaveBeenCalledWith(false);
    await expect(args.onConfirm).not.toHaveBeenCalled();
    await expect(trigger).toHaveFocus();
  },
};
