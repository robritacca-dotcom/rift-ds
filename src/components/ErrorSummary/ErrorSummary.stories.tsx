import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';
import { ErrorSummary, fieldErrorsFrom } from './ErrorSummary';
import { Button } from '../Button/Button';
import { Input } from '../Input/Input';

const meta = {
  title: 'Components/ErrorSummary',
  component: ErrorSummary,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    headingLevel: { control: 'inline-radio', options: [2, 3, 4] },
  },
  args: {
    focusOnMount: false,
    errors: [
      { id: 'summary-story-name', message: 'Enter your legal business name.' },
      { id: 'summary-story-email', message: 'Enter an email address like name@example.com.' },
    ],
  },
} satisfies Meta<typeof ErrorSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** One error: the heading says so in the singular. */
export const SingleError: Story = {
  args: { errors: [{ id: 'summary-story-card', message: 'The card number is too short.' }] },
};

/** A wizard step with a line of guidance under the heading. */
export const WithDescription: Story = {
  args: { description: 'Fix these to continue to payment.', headingLevel: 3 },
};

/**
 * A long form wired end to end: submit with empty fields, the summary takes
 * focus, and a link moves focus to its field. The server's
 * `{ field: message }` shape becomes both the list and each field's
 * `errorText` through `fieldErrorsFrom`.
 */
export const OnSubmit: Story = {
  args: { errors: [], focusOnMount: true },
  render: function Render(args) {
    const [record, setRecord] = useState<Record<string, string[]>>({});
    const formRef = useRef<HTMLFormElement>(null);
    const { errors, errorText } = fieldErrorsFrom(record, {
      order: ['name', 'email'],
      idFor: (name) => `on-submit-${name}`,
    });
    return (
      <form
        ref={formRef}
        noValidate
        style={{ display: 'grid', gap: 'var(--gap-400)', maxInlineSize: '420px' }}
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const next: Record<string, string[]> = {};
          if (!data.get('name')) next.name = ['Enter your legal business name.'];
          if (!String(data.get('email') ?? '').includes('@')) next.email = ['Enter an email address like name@example.com.'];
          setRecord(next);
        }}
      >
        <ErrorSummary {...args} errors={errors} />
        <Input id="on-submit-name" name="name" label="Legal business name" errorText={errorText.name} />
        <Input id="on-submit-email" name="email" type="email" label="Email" errorText={errorText.email} />
        <Button variant="primary" label="Continue" onClick={() => formRef.current?.requestSubmit()} />
      </form>
    );
  },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Continue' }));
    const summary = await canvas.findByRole('region', { name: 'There are 2 problems' });
    await waitFor(() => expect(summary).toHaveFocus());
    await userEvent.click(canvas.getByRole('link', { name: 'Enter an email address like name@example.com.' }));
    await expect(canvas.getByRole('textbox', { name: 'Email' })).toHaveFocus();
  },
};
