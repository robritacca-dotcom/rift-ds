import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, waitFor } from 'storybook/test';
import { Dialog } from './Dialog';
import { Drawer } from '../Drawer/Drawer';
import { acquireScrollLock, releaseScrollLock } from '../../behaviors/useScrollLock';
import { Button } from '../Button/Button';
import { Input } from '../Input/Input';

const meta = {
  title: 'Components/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    dismissible: {
      control: 'boolean',
    },
  },
  args: {
    open: false,
    onOpenChange: () => {},
    title: 'Dialog title',
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Trigger + dialog wrapper so stories are openable */
const DialogDemo = (props: Omit<React.ComponentProps<typeof Dialog>, 'open' | 'onOpenChange'>) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button label="Open dialog" variant="secondary" onClick={() => setOpen(true)} />
      <Dialog {...props} open={open} onOpenChange={setOpen} />
    </>
  );
};

export const Default: Story = {
  render: (args) => (
    <DialogDemo
      {...args}
      title="Edit profile"
      description="Changes are saved when you press Save."
    >
      <p style={{ margin: 0 }}>
        Any content can live in the dialog body — forms, text, lists, or other
        components.
      </p>
    </DialogDemo>
  ),
  // The modal contract, end to end: open, page inert behind the panel,
  // Escape closes, focus returns to the trigger. Ends closed, so the
  // snapshot matches the resting state.
  play: async ({ canvas, canvasElement, userEvent }) => {
    const trigger = await canvas.findByRole('button', { name: 'Open dialog' });
    await userEvent.click(trigger);

    const dialog = await screen.findByRole('dialog', { name: 'Edit profile' });
    await expect(dialog).toBeVisible();

    // Everything outside the dialog's portal is inert while it is open —
    // including the story root that holds the trigger.
    const storyRoot = canvasElement.closest<HTMLElement>('body > *');
    await expect(storyRoot?.inert).toBe(true);

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Edit profile' })).toBeNull());
    await expect(storyRoot?.inert).toBe(false);
    await expect(trigger).toHaveFocus();
  },
};

export const WithFooter: Story = {
  render: (args) => {
    const Demo = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button label="Open dialog" variant="secondary" onClick={() => setOpen(true)} />
          <Dialog
            {...args}
            open={open}
            onOpenChange={setOpen}
            title="Rename project"
            footer={
              <>
                <Button label="Cancel" variant="tertiary" onClick={() => setOpen(false)} />
                <Button label="Save" variant="primary" onClick={() => setOpen(false)} />
              </>
            }
          >
            <Input label="Project name" placeholder="design-system" />
          </Dialog>
        </>
      );
    };
    return <Demo />;
  },
  // Tab is fenced inside the panel: Shift+Tab from the first stop wraps to
  // the last, Tab from the last wraps back to the first.
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(await canvas.findByRole('button', { name: 'Open dialog' }));

    const closeButton = await screen.findByRole('button', { name: 'Close dialog' });
    await expect(closeButton).toHaveFocus();

    await userEvent.tab({ shift: true });
    await expect(screen.getByRole('button', { name: 'Save' })).toHaveFocus();

    await userEvent.tab();
    await expect(closeButton).toHaveFocus();

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Rename project' })).toBeNull());
  },
};

export const Small: Story = {
  render: (args) => (
    <DialogDemo {...args} title="Small dialog" size="sm">
      <p style={{ margin: 0 }}>A narrow panel for short messages.</p>
    </DialogDemo>
  ),
};

export const Large: Story = {
  render: (args) => (
    <DialogDemo {...args} title="Large dialog" size="lg">
      <p style={{ margin: 0 }}>
        A wide panel for richer content like tables, previews, or multi-column
        forms.
      </p>
    </DialogDemo>
  ),
};

export const NonDismissible: Story = {
  render: (args) => {
    const Demo = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button label="Open dialog" variant="secondary" onClick={() => setOpen(true)} />
          <Dialog
            {...args}
            open={open}
            onOpenChange={setOpen}
            title="Action required"
            description="This dialog only closes through the footer action."
            dismissible={false}
            footer={<Button label="Acknowledge" variant="primary" onClick={() => setOpen(false)} />}
          >
            <p style={{ margin: 0 }}>
              ESC, backdrop clicks, and the close button are disabled.
            </p>
          </Dialog>
        </>
      );
    };
    return <Demo />;
  },
  // A non-dismissible dialog swallows Escape; only its own action closes it.
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(await canvas.findByRole('button', { name: 'Open dialog' }));

    const dialog = await screen.findByRole('dialog', { name: 'Action required' });
    await userEvent.keyboard('{Escape}');
    await expect(dialog).toBeVisible();

    await userEvent.click(screen.getByRole('button', { name: 'Acknowledge' }));
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Action required' })).toBeNull(),
    );
  },
};

export const StackedOnDrawer: Story = {
  render: (args) => {
    const Demo = () => {
      const [drawerOpen, setDrawerOpen] = useState(false);
      const [dialogOpen, setDialogOpen] = useState(false);
      return (
        <>
          <Button label="Open drawer" variant="secondary" onClick={() => setDrawerOpen(true)} />
          <Drawer
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
            title="Filters"
            description="A dialog can stack on top of this drawer."
          >
            <Button label="Open dialog" variant="primary" onClick={() => setDialogOpen(true)} />
          </Drawer>
          <Dialog {...args} open={dialogOpen} onOpenChange={setDialogOpen} title="Confirm changes">
            <p style={{ margin: 0 }}>
              Escape closes this dialog first; the drawer underneath stays open
              and keeps its scroll lock.
            </p>
          </Dialog>
        </>
      );
    };
    return <Demo />;
  },
  // The stacking contract: Escape closes only the topmost overlay, the
  // drawer's scroll lock survives the dialog's close (the counted lock), and
  // focus restores through the chain.
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(await canvas.findByRole('button', { name: 'Open drawer' }));

    const openDialogButton = await screen.findByRole('button', { name: 'Open dialog' });
    await userEvent.click(openDialogButton);
    await screen.findByRole('dialog', { name: 'Confirm changes' });
    await expect(document.body.style.position).toBe('fixed');

    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Confirm changes' })).toBeNull(),
    );
    await expect(screen.getByRole('dialog', { name: 'Filters' })).toBeVisible();
    await expect(document.body.style.position).toBe('fixed');
    await expect(openDialogButton).toHaveFocus();

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Filters' })).toBeNull());
    await expect(document.body.style.position).toBe('');
    await expect(document.body.style.overflow).toBe('');
    await expect(canvas.getByRole('button', { name: 'Open drawer' })).toHaveFocus();
  },
};

export const SharedLockWithHostChrome: Story = {
  render: (args) => (
    <DialogDemo {...args} title="Confirm changes">
      <p style={{ margin: 0 }}>
        The page scroll lock is one shared counter: an app&apos;s own overlay
        (a nav drawer, a chat panel) can hold it through{' '}
        <code>acquireScrollLock</code> / <code>releaseScrollLock</code>, and
        closing that overlay under an open dialog must not unlock the page.
      </p>
    </DialogDemo>
  ),
  // The cross-module contract the imperative pair exists for: host chrome
  // (imagine a site nav drawer) pins the page, a dialog opens on top, the
  // chrome closes first — the page stays pinned until the dialog, the last
  // holder, closes. Two independent locks used to unlock it right here.
  play: async ({ canvas, userEvent }) => {
    acquireScrollLock();
    await expect(document.body.style.position).toBe('fixed');
    await expect(document.body.style.overflow).toBe('hidden');

    await userEvent.click(await canvas.findByRole('button', { name: 'Open dialog' }));
    await screen.findByRole('dialog', { name: 'Confirm changes' });

    releaseScrollLock();
    await expect(document.body.style.position).toBe('fixed');
    await expect(document.body.style.overflow).toBe('hidden');

    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Confirm changes' })).toBeNull(),
    );
    await expect(document.body.style.position).toBe('');
    await expect(document.body.style.overflow).toBe('');
  },
};

export const LongContent: Story = {
  render: (args) => (
    <DialogDemo
      {...args}
      title="Terms of service"
      description="The body scrolls while the header stays pinned."
    >
      {Array.from({ length: 12 }, (_, i) => (
        <p key={i} style={{ marginTop: 0 }}>
          Section {i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing
          elit. Integer posuere erat a ante venenatis dapibus posuere velit
          aliquet. Cras mattis consectetur purus sit amet fermentum.
        </p>
      ))}
    </DialogDemo>
  ),
};
