import { useState, type CSSProperties, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { ActionBar } from './ActionBar';
import { Button } from '../Button/Button';
import { Checkbox } from '../Checkbox/Checkbox';

const meta = {
  title: 'Components/ActionBar',
  component: ActionBar,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    sticky: { control: 'boolean' },
    blur: { control: 'boolean' },
  },
  args: {
    summary: '23 students still to mark',
    actions: (
      <>
        <Button label="Save draft" variant="secondary" />
        <Button label="Submit to office" variant="primary" />
      </>
    ),
  },
} satisfies Meta<typeof ActionBar>;

export default meta;
type Story = StoryObj<typeof meta>;

const STUDENTS = [
  'Amara Okafor', 'Ben Hughes', 'Chen Wei', 'Dara Byrne', 'Elif Demir', 'Finn Larsen',
  'Grace Mensah', 'Hiro Tanaka', 'Isla Murray', 'Jonah Weiss', 'Kavya Rao', 'Leo Moreau',
  'Maya Cohen', 'Nico Rossi', 'Omar Haddad', 'Priya Shah', 'Quinn Doyle', 'Rosa Lima',
  'Sami Nieminen', 'Tara Walsh', 'Uma Patel', 'Viktor Novak', 'Wren Ellis', 'Yusuf Kaya',
];

const rowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'var(--gap-300)',
  paddingBlock: 'var(--padding-300)',
  paddingInline: 'var(--padding-500)',
  borderBlockEnd: 'var(--border-025) solid var(--color-divider)',
  fontFamily: 'var(--font-paragraph-family)',
  fontSize: 'var(--font-paragraph-size)',
  lineHeight: 'var(--font-paragraph-line-height)',
  color: 'var(--color-text-primary)',
};

/** The register, a long list inside a 480px scroll container, with the bar as its last child. */
function Register({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        maxWidth: 560,
        height: 480,
        overflow: 'auto',
        borderRadius: 'var(--radius-400)',
        border: 'var(--border-025) solid var(--color-bg-container-border)',
        background: 'var(--color-bg-page-primary)',
      }}
    >
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {STUDENTS.map((name, i) => (
          <li key={name} style={rowStyle}>
            <span>{name}</span>
            <span style={{ color: 'var(--color-text-secondary)' }}>{i % 3 === 0 ? 'Marked' : 'To mark'}</span>
          </li>
        ))}
      </ul>
      {children}
    </div>
  );
}

/** Docked to the bottom of the scroll container, the rows dissolving under the blur as they pass. */
export const Default: Story = {
  render: (args) => (
    <Register>
      <ActionBar {...args} />
    </Register>
  ),
};

/** Without the blur: a solid bar on the page surface, parted from the rows by a hairline. */
export const WithoutBlur: Story = {
  args: { blur: false },
  render: Default.render,
};

/** Not sticky: the bar sits in flow after the last row and scrolls with the list. */
export const InFlow: Story = {
  args: { sticky: false },
  render: Default.render,
};

/** One action, no summary: the action keeps the end edge. */
export const ActionOnly: Story = {
  args: { summary: undefined, actions: <Button label="Submit to office" variant="primary" /> },
  render: Default.render,
};

/** A narrow bar: the actions wrap below the summary and hold the end edge. */
export const Narrow: Story = {
  render: (args) => (
    <div style={{ maxWidth: 320 }}>
      <Register>
        <ActionBar {...args} />
      </Register>
    </div>
  ),
};

function LiveCount() {
  const [marked, setMarked] = useState<string[]>([]);
  const left = STUDENTS.length - marked.length;
  return (
    <div
      style={{
        maxWidth: 560,
        height: 480,
        overflow: 'auto',
        borderRadius: 'var(--radius-400)',
        border: 'var(--border-025) solid var(--color-bg-container-border)',
        background: 'var(--color-bg-page-primary)',
      }}
    >
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {STUDENTS.map((name) => (
          <li key={name} style={rowStyle}>
            <Checkbox
              label={name}
              checked={marked.includes(name)}
              onCheckedChange={(checked) =>
                setMarked((m) => (checked ? [...m, name] : m.filter((n) => n !== name)))
              }
            />
          </li>
        ))}
      </ul>
      <ActionBar
        summary={left === 0 ? 'Every student marked' : `${left} students still to mark`}
        actions={<Button label="Submit to office" variant="primary" disabled={left > 0} />}
      />
    </div>
  );
}

/** The summary is a polite live region: marking a student changes the count, and the new line is announced. */
export const LiveSummary: Story = {
  render: () => <LiveCount />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const summary = canvasElement.querySelector('.ds-action-bar__summary');
    await expect(summary).toHaveAttribute('aria-live', 'polite');
    await expect(summary).toHaveAttribute('aria-atomic', 'true');
    const first = canvas.getByRole('checkbox', { name: STUDENTS[0] });
    await userEvent.click(first);
    await expect(summary).toHaveTextContent(`${STUDENTS.length - 1} students still to mark`);
    await userEvent.click(first);
    await expect(summary).toHaveTextContent(`${STUDENTS.length} students still to mark`);
  },
};
