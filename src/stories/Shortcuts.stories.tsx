import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import { useRegisteredShortcuts, useShortcut } from '../behaviors/shortcuts';
import { formatShortcut, shortcutAria, shortcutKeys } from '../behaviors/shortcut-keys';
import { Button } from '../components/Button/Button';
import { Dialog } from '../components/Dialog/Dialog';
import { DropdownMenu } from '../components/DropdownMenu/DropdownMenu';
import { Input } from '../components/Input/Input';
import { Kbd } from '../components/Kbd/Kbd';

/*
 * The keyboard shortcut contract, proven at runtime. src/behaviors/shortcuts.ts
 * states the rules (who hears a key, and when), and
 * scripts/validate-overlay-listeners.mjs keeps every other key listener out
 * of the library and the site; these stories check the rules themselves:
 * a page shortcut fires, stays quiet in a text field and behind a modal, a
 * scoped one fires inside its element, a global one fires anywhere, a
 * sequence matches in order, and the help list reads what is live.
 */
const meta = {
  title: 'Foundations/Keyboard shortcuts',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Counter({ label, count }: { label: string; count: number }) {
  return (
    <p>
      {label}: <output data-testid={label}>{count}</output>
    </p>
  );
}

/** A page shortcut fires from the page, and stays quiet while focus is in a text field. */
export const PageShortcut: Story = {
  render: function PageShortcutStory() {
    const [count, setCount] = useState(0);
    useShortcut('shift+?', () => setCount((n) => n + 1), { description: 'Show shortcuts' });
    return (
      <div>
        <Counter label="help" count={count} />
        <Input label="Search" />
        <Button>Somewhere to focus</Button>
      </div>
    );
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Somewhere to focus' }));
    await userEvent.keyboard('?');
    await expect(canvas.getByTestId('help')).toHaveTextContent('1');
    await userEvent.click(canvas.getByLabelText('Search'));
    await userEvent.keyboard('?');
    await expect(canvas.getByTestId('help')).toHaveTextContent('1');
    await expect(canvas.getByLabelText('Search')).toHaveValue('?');
  },
};

/** While a modal is open, page shortcuts stay quiet, global ones fire, and Escape stays the modal's. */
export const ModalScoping: Story = {
  render: function ModalScopingStory() {
    const [open, setOpen] = useState(false);
    const [page, setPage] = useState(0);
    const [global, setGlobal] = useState(0);
    const [escaped, setEscaped] = useState(0);
    useShortcut('n', () => setPage((n) => n + 1));
    useShortcut('mod+j', () => setGlobal((n) => n + 1), { global: true });
    useShortcut('escape', () => setEscaped((n) => n + 1), { global: true });
    return (
      <div>
        <Counter label="page" count={page} />
        <Counter label="global" count={global} />
        <Counter label="escaped" count={escaped} />
        <Button onClick={() => setOpen(true)}>Open dialog</Button>
        <Dialog open={open} onOpenChange={setOpen} title="A modal">
          <p>Shortcuts behind this dialog are quiet.</p>
        </Dialog>
      </div>
    );
  },
  play: async ({ canvas, userEvent }) => {
    const body = within(document.body);
    await userEvent.click(canvas.getByRole('button', { name: 'Open dialog' }));
    await waitFor(() => expect(body.getByRole('dialog')).toBeVisible());
    await userEvent.keyboard('n');
    await expect(canvas.getByTestId('page')).toHaveTextContent('0');
    await userEvent.keyboard('{Control>}j{/Control}');
    await userEvent.keyboard('{Meta>}j{/Meta}');
    // One of the two is `mod` on this platform; the other is not bound.
    await expect(canvas.getByTestId('global')).toHaveTextContent('1');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull());
    // The dialog took Escape; the global escape shortcut did not also fire.
    await expect(canvas.getByTestId('escaped')).toHaveTextContent('0');
    await userEvent.keyboard('n');
    await expect(canvas.getByTestId('page')).toHaveTextContent('1');
  },
};

/** A scoped shortcut fires only while focus is inside its element. */
export const ScopedShortcut: Story = {
  render: function ScopedShortcutStory() {
    const panel = useRef<HTMLDivElement>(null);
    const [count, setCount] = useState(0);
    useShortcut('e', () => setCount((n) => n + 1), { scope: panel });
    return (
      <div>
        <Counter label="scoped" count={count} />
        <div ref={panel} style={{ padding: 'var(--padding-300)', border: 'var(--border-025) solid var(--color-divider)' }}>
          <Button>Inside the panel</Button>
        </div>
        <Button>Outside the panel</Button>
      </div>
    );
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Outside the panel' }));
    await userEvent.keyboard('e');
    await expect(canvas.getByTestId('scoped')).toHaveTextContent('0');
    await userEvent.click(canvas.getByRole('button', { name: 'Inside the panel' }));
    await userEvent.keyboard('e');
    await expect(canvas.getByTestId('scoped')).toHaveTextContent('1');
  },
};

/** A sequence matches its keys in order, and a handled key never reaches a shortcut. */
export const Sequence: Story = {
  render: function SequenceStory() {
    const [inbox, setInbox] = useState(0);
    const [single, setSingle] = useState(0);
    useShortcut('g i', () => setInbox((n) => n + 1));
    useShortcut('i', () => setSingle((n) => n + 1));
    return (
      <div>
        <Counter label="inbox" count={inbox} />
        <Counter label="single" count={single} />
        <Button>Focus here</Button>
        <Button onKeyDown={(event) => event.preventDefault()}>Handles its own keys</Button>
      </div>
    );
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Focus here' }));
    await userEvent.keyboard('gi');
    // The longer match wins: G then I opens the inbox, not the single I.
    await expect(canvas.getByTestId('inbox')).toHaveTextContent('1');
    await expect(canvas.getByTestId('single')).toHaveTextContent('0');
    await userEvent.keyboard('i');
    await expect(canvas.getByTestId('single')).toHaveTextContent('1');
    canvas.getByRole('button', { name: 'Handles its own keys' }).focus();
    await userEvent.keyboard('i');
    await expect(canvas.getByTestId('single')).toHaveTextContent('1');
  },
};

function HelpList() {
  const shortcuts = useRegisteredShortcuts();
  return (
    <ul aria-label="Keyboard shortcuts">
      {shortcuts.map((item) => (
        <li key={item.description} style={{ display: 'flex', gap: 'var(--gap-300)', alignItems: 'center' }}>
          <Kbd keys={item.shortcuts[0]} size="compact" />
          <span>{item.description}</span>
        </li>
      ))}
    </ul>
  );
}

/** The help list is built from what is live: a shortcut that unmounts leaves it. */
export const HelpListReadsTheRegistry: Story = {
  render: function HelpListStory() {
    const [showEditor, setShowEditor] = useState(true);
    useShortcut('mod+k', () => {}, { description: 'Open the command palette', global: true });
    return (
      <div>
        {showEditor && <EditorShortcuts />}
        <Button onClick={() => setShowEditor(false)}>Close the editor</Button>
        <HelpList />
      </div>
    );
  },
  play: async ({ canvas, userEvent }) => {
    const list = canvas.getByRole('list', { name: 'Keyboard shortcuts' });
    await expect(within(list).getByText('Save the draft')).toBeInTheDocument();
    await expect(within(list).getByText('Open the command palette')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Close the editor' }));
    await waitFor(() => expect(within(list).queryByText('Save the draft')).toBeNull());
  },
};

function EditorShortcuts() {
  useShortcut('mod+s', () => {}, { description: 'Save the draft', allowInInput: true });
  return null;
}

/** A menu writes an item's `keys` for the platform and announces them. */
export const MenuHints: Story = {
  render: () => (
    <DropdownMenu
      trigger="Actions"
      items={[
        { label: 'Copy', keys: 'mod+c' },
        { label: 'Command palette', keys: 'mod+shift+p' },
        { label: 'Literal hint', shortcut: 'F2' },
      ]}
    />
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Actions' }));
    const copy = await within(document.body).findByRole('menuitem', { name: /Copy/ });
    await expect(copy).toHaveAttribute('aria-keyshortcuts', 'Meta+C Control+C');
    await expect(within(document.body).getByText('F2')).toBeInTheDocument();
  },
};

/** The grammar draws the same shortcut for each platform. */
export const Grammar: Story = {
  render: () => <Kbd keys="mod+shift+p" />,
  play: async () => {
    await expect(shortcutKeys('mod+shift+p', 'apple')).toEqual([['⇧', '⌘', 'P']]);
    await expect(shortcutKeys('mod+shift+p', 'other')).toEqual([['Ctrl', 'Shift', 'P']]);
    await expect(formatShortcut('mod+shift+p', 'apple')).toBe('⇧⌘P');
    await expect(formatShortcut('mod+shift+p', 'other')).toBe('Ctrl+Shift+P');
    await expect(formatShortcut('g i', 'other')).toBe('G I');
    await expect(shortcutAria('alt+arrowup', 'other')).toBe('Alt+ArrowUp');
    await expect(shortcutAria('g i', 'other')).toBeUndefined();
    await expect(shortcutKeys('ctrl+c', 'other', { ctrl: 'Strg' })).toEqual([['Strg', 'C']]);
  },
};
