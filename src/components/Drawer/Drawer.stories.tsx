import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Drawer } from './Drawer';
import { Button } from '../Button/Button';
import { Input } from '../Input/Input';
import { Checkbox } from '../Checkbox/Checkbox';

const meta = {
  title: 'Components/Drawer',
  component: Drawer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    side: {
      control: 'select',
      options: ['left', 'right', 'top', 'bottom'],
    },
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
    title: 'Drawer title',
  },
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Trigger + drawer wrapper so stories are openable. `renderFooter` receives a
 * `close` callback so footer actions can dismiss even when `dismissible` is off.
 */
const DrawerDemo = ({
  triggerLabel = 'Open drawer',
  renderFooter,
  ...props
}: Omit<React.ComponentProps<typeof Drawer>, 'open' | 'onOpenChange' | 'footer'> & {
  triggerLabel?: string;
  renderFooter?: (close: () => void) => React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button label={triggerLabel} variant="secondary" onClick={() => setOpen(true)} />
      <Drawer
        {...props}
        open={open}
        onOpenChange={setOpen}
        footer={renderFooter?.(() => setOpen(false))}
      />
    </>
  );
};

export const Default: Story = {
  render: (args) => (
    <DrawerDemo {...args} title="Order details" description="Everything about order #10482.">
      <p style={{ margin: 0 }}>
        The drawer body scrolls independently, so long content never pushes the
        header or footer out of view.
      </p>
    </DrawerDemo>
  ),
};

export const Left: Story = {
  render: (args) => (
    <DrawerDemo {...args} side="left" title="Navigation" triggerLabel="Open from left">
      <p style={{ margin: 0 }}>A left-anchored drawer suits navigation on narrow screens.</p>
    </DrawerDemo>
  ),
};

export const Top: Story = {
  render: (args) => (
    <DrawerDemo {...args} side="top" title="Announcement" triggerLabel="Open from top">
      <p style={{ margin: 0 }}>Top and bottom drawers are sized by viewport height.</p>
    </DrawerDemo>
  ),
};

export const Bottom: Story = {
  render: (args) => (
    <DrawerDemo {...args} side="bottom" title="Quick actions" triggerLabel="Open from bottom">
      <p style={{ margin: 0 }}>A bottom sheet is the familiar mobile pattern.</p>
    </DrawerDemo>
  ),
};

export const WithFooter: Story = {
  render: (args) => (
    <DrawerDemo
      {...args}
      title="Filters"
      description="Narrow the results list."
      renderFooter={(close) => (
        <>
          <Button label="Reset" variant="secondary" onClick={close} />
          <Button label="Apply" variant="primary" onClick={close} />
        </>
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Input label="Search" placeholder="Keyword…" />
        <Checkbox label="In stock only" />
        <Checkbox label="On sale" />
        <Checkbox label="Free shipping" />
      </div>
    </DrawerDemo>
  ),
};

export const Small: Story = {
  render: (args) => (
    <DrawerDemo {...args} size="sm" title="Small drawer" triggerLabel="Open small">
      <p style={{ margin: 0 }}>320px wide — enough for a compact detail panel.</p>
    </DrawerDemo>
  ),
};

export const Large: Story = {
  render: (args) => (
    <DrawerDemo {...args} size="lg" title="Large drawer" triggerLabel="Open large">
      <p style={{ margin: 0 }}>560px wide — room for forms or side-by-side content.</p>
    </DrawerDemo>
  ),
};

export const LongContent: Story = {
  render: (args) => (
    <DrawerDemo
      {...args}
      title="Activity log"
      renderFooter={(close) => <Button label="Close" variant="secondary" onClick={close} />}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {Array.from({ length: 30 }, (_, i) => (
          <p key={i} style={{ margin: 0 }}>
            Event {i + 1} — the body scrolls while the header and footer stay put.
          </p>
        ))}
      </div>
    </DrawerDemo>
  ),
};

export const NonDismissible: Story = {
  render: (args) => (
    <DrawerDemo
      {...args}
      title="Finish setup"
      description="Complete these steps before continuing."
      dismissible={false}
      triggerLabel="Open non-dismissible"
      renderFooter={(close) => <Button label="Done" variant="primary" onClick={close} />}
    >
      <p style={{ margin: 0 }}>
        ESC, the scrim, and the close button are all disabled — the footer action is
        the only way out.
      </p>
    </DrawerDemo>
  ),
};
