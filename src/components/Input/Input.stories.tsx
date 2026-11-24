import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { Avatar } from '../Avatar/Avatar';
import { Input } from './Input';

const meta = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    value: { control: 'text' },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url'],
    },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    error: { control: 'boolean' },
    helperText: { control: 'text' },
    iconLeft: { control: 'text' },
    iconRight: { control: 'text' },
  },
  args: {
    onChange: fn(),
    onFocus: fn(),
    onBlur: fn(),
  },
  decorators: [
    (Story, { parameters }) => (
      <div style={{ width: parameters.frameWidth ?? '320px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Email',
    placeholder: 'Enter your email',
  },
};

export const WithValue: Story = {
  args: {
    label: 'Email',
    value: 'jordan@example.com',
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter password',
    helperText: 'Must be at least 8 characters',
  },
};

export const Required: Story = {
  args: {
    label: 'Full Name',
    placeholder: 'Enter your name',
    required: true,
  },
};

export const Error: Story = {
  args: {
    label: 'Email',
    value: 'invalid-email',
    error: true,
    helperText: 'Please enter a valid email address',
  },
};

export const WithIconLeft: Story = {
  args: {
    label: 'Search',
    placeholder: 'Search...',
    iconLeft: 'search',
  },
};

export const WithIconRight: Story = {
  args: {
    label: 'Email',
    placeholder: 'Enter your email',
    iconRight: 'mail',
  },
};

export const WithBothIcons: Story = {
  args: {
    label: 'Search',
    placeholder: 'Search...',
    iconLeft: 'search',
    iconRight: 'tune',
  },
};

/** Icon props also take a custom element — any icon set works when the SVG draws with `currentColor`. */
export const WithCustomIconNode: Story = {
  args: {
    label: 'Search',
    placeholder: 'Search...',
    iconLeft: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    ),
  },
};

export const Disabled: Story = {
  args: {
    label: 'Email',
    value: 'disabled@example.com',
    disabled: true,
  },
};

/** The compact size, for dense forms and toolbars. */
export const Compact: Story = {
  args: {
    label: 'Email',
    placeholder: 'Enter your email',
    helperText: 'We never share it',
    size: 'compact',
  },
};

export const NoLabel: Story = {
  args: {
    placeholder: 'No label input',
    'aria-label': 'Unlabelled input',
  },
};

/** Text inside the field, read as part of it: a scheme before an address. */
export const WithPrefix: Story = {
  args: { label: 'Website', prefix: 'https://', placeholder: 'example.com' },
};

/** A unit after the value. */
export const WithSuffix: Story = {
  args: { label: 'Weight', suffix: 'kg', inputMode: 'decimal', defaultValue: '2.5' },
};

/** A prefix and a suffix together, at the compact size. */
export const PrefixAndSuffixCompact: Story = {
  args: { label: 'Subdomain', size: 'compact', prefix: 'https://', suffix: '.example.app', defaultValue: 'northwind' },
};

/** A clear button while the field holds a value; it empties the field and hands focus back. */
export const Clearable: Story = {
  args: { label: 'Search orders', iconLeft: 'search', clearable: true, defaultValue: 'INV-2041', onClear: fn(), onValueChange: fn() },
  play: async ({ canvas, args }) => {
    const input = canvas.getByRole('textbox', { name: 'Search orders' });
    await userEvent.click(canvas.getByRole('button', { name: 'Clear' }));
    await expect(input).toHaveValue('');
    await expect(input).toHaveFocus();
    await expect(args.onClear).toHaveBeenCalled();
    await expect(args.onValueChange).toHaveBeenCalledWith('');
    await expect(canvas.queryByRole('button', { name: 'Clear' })).toBeNull();
    await userEvent.type(input, 'INV-2041');
  },
};

/** A clearable search field: the library's clear button replaces the browser's own cancel button, so the field offers one. */
export const ClearableSearch: Story = {
  args: { label: 'Search orders', type: 'search', iconLeft: 'search', clearable: true, defaultValue: 'INV-2041' },
  play: async ({ canvas }) => {
    const input = canvas.getByRole('searchbox', { name: 'Search orders' });
    await expect(canvas.getAllByRole('button', { name: 'Clear' })).toHaveLength(1);
    /* Chromium reports no computed style for this pseudo-element, so find the
       rule that hides it and prove its selector matches this field. */
    const rules = (list: CSSRuleList): CSSRule[] =>
      [...list].flatMap((rule) => ('cssRules' in rule ? [rule, ...rules((rule as CSSGroupingRule).cssRules)] : [rule]));
    const readable = (sheet: CSSStyleSheet) => {
      try {
        return rules(sheet.cssRules);
      } catch {
        return []; // a cross-origin sheet (a web font's) keeps its rules to itself
      }
    };
    const hiding = [...document.styleSheets]
      .flatMap(readable)
      .filter((rule): rule is CSSStyleRule => rule instanceof CSSStyleRule)
      .filter((rule) => rule.selectorText.includes('::-webkit-search-cancel-button') && rule.style.display === 'none');
    await expect(hiding.some((rule) => input.matches(rule.selectorText.replace('::-webkit-search-cancel-button', '')))).toBe(true);
  },
};

/** The newer error form: the message under the field, the helper text kept beside it. */
export const WithErrorText: Story = {
  args: {
    label: 'Email',
    type: 'email',
    defaultValue: 'sam@',
    helperText: 'We send receipts here.',
    errorText: 'Enter an email address like name@example.com.',
  },
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: 'Email' });
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input).toHaveAccessibleDescription(
      'Enter an email address like name@example.com. We send receipts here.',
    );
  },
};

/**
 * The quiet form: no border or fill at rest, only the icon and placeholder.
 * Hover it, focus it or type in it and the full field comes back.
 */
export const Quiet: Story = {
  args: { variant: 'quiet', iconLeft: 'edit_note', placeholder: 'Add a note', 'aria-label': 'Note' },
  play: async ({ canvas, canvasElement }) => {
    const input = canvas.getByRole('textbox', { name: 'Note' });
    const root = canvasElement.querySelector('.ds-input');
    await expect(getComputedStyle(input).borderTopColor).toBe('rgba(0, 0, 0, 0)');
    await expect(root).not.toHaveClass('ds-input--filled');
    await userEvent.type(input, 'Left early');
    await expect(root).toHaveClass('ds-input--filled');
    await userEvent.clear(input);
    await expect(root).not.toHaveClass('ds-input--filled');
  },
};

const STUDENTS = [
  { name: 'Amara Okafor', note: '' },
  { name: 'Ben Lindqvist', note: 'Arrived 10 minutes late' },
  { name: 'Chloé Martin', note: '' },
  { name: 'Diego Ramírez', note: '' },
  { name: 'Hana Sato', note: 'Dentist, back after lunch' },
];

/**
 * An attendance list where every row can take an optional note. Each row is a
 * `data-quiet-host`, so hovering anywhere on it reveals its field; a note
 * already written keeps its field showing.
 */
export const QuietInAList: Story = {
  parameters: { frameWidth: '560px' },
  render: () => (
    <ul
      aria-label="Attendance, period 2"
      style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column' }}
    >
      {STUDENTS.map((student) => (
        <li
          key={student.name}
          data-quiet-host
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--gap-300)',
            paddingBlock: 'var(--padding-100)',
            borderBlockEnd: 'var(--border-025) solid var(--color-bg-container-border)',
          }}
        >
          <Avatar name={student.name} size="sm" />
          <span style={{ flex: '0 0 9rem', font: 'var(--font-paragraph-size) var(--font-paragraph-family)', color: 'var(--color-text-primary)' }}>
            {student.name}
          </span>
          <div style={{ flex: '1 1 auto', minWidth: 0 }}>
            <Input
              variant="quiet"
              size="compact"
              iconLeft="edit_note"
              placeholder="Add a note"
              aria-label={`Note for ${student.name}`}
              defaultValue={student.note}
            />
          </div>
        </li>
      ))}
    </ul>
  ),
  play: async ({ canvas, canvasElement }) => {
    const empty = canvas.getByRole('textbox', { name: 'Note for Amara Okafor' });
    const written = canvas.getByRole('textbox', { name: 'Note for Ben Lindqvist' });
    await expect(getComputedStyle(empty).borderTopColor).toBe('rgba(0, 0, 0, 0)');
    await expect(written.closest('.ds-input')).toHaveClass('ds-input--filled');
    await expect(canvasElement.querySelectorAll('li[data-quiet-host]')).toHaveLength(STUDENTS.length);
  },
};

/** An error always shows the full field, quiet or not. */
export const QuietWithError: Story = {
  args: {
    variant: 'quiet',
    'aria-label': 'Note',
    placeholder: 'Add a note',
    errorText: 'Keep the note under 80 characters.',
  },
};
