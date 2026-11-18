import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { Wizard } from './Wizard';
import { Input } from '../Input/Input';
import { RadioGroup } from '../RadioButton/RadioButton';
import { DescriptionList } from '../DescriptionList/DescriptionList';

const meta = {
  title: 'Components/Wizard',
  component: Wizard,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  args: {
    onFinish: fn(),
    onStepChange: fn(),
    summary: 'Estimated total: $1,240.00',
    steps: [
      { id: 'details', label: 'Details', description: 'Name and owner', content: <Input label="Project name" defaultValue="Website refresh" /> },
      {
        id: 'plan',
        label: 'Plan',
        description: 'Pick a plan',
        content: (
          <RadioGroup
            label="Plan"
            defaultValue="team"
            options={[
              { value: 'starter', label: 'Starter' },
              { value: 'team', label: 'Team' },
            ]}
          />
        ),
      },
      {
        id: 'review',
        label: 'Review',
        description: 'Check and confirm',
        content: (
          <DescriptionList
            layout="inline"
            items={[
              { term: 'Project', details: 'Website refresh' },
              { term: 'Plan', details: 'Team' },
            ]}
          />
        ),
      },
    ],
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '720px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Wizard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Steps with Back and Continue, Finish on the last, and a running total; focus follows the reader to each step's heading. */
export const Default: Story = {
  play: async ({ canvas, args, userEvent }) => {
    await expect(canvas.getByRole('heading', { name: 'Details' })).toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: 'Back' })).toBeNull();
    await userEvent.click(canvas.getByRole('button', { name: 'Continue' }));
    await expect(canvas.getByRole('heading', { name: 'Plan' })).toHaveFocus();
    await expect(args.onStepChange).toHaveBeenLastCalledWith(1);
    await userEvent.click(canvas.getByRole('button', { name: 'Continue' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Finish' }));
    await expect(args.onFinish).toHaveBeenCalledTimes(1);
    await userEvent.click(canvas.getByRole('button', { name: 'Back' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Back' }));
  },
};

/** Continue is held until the step's field has a value: the host owns the check and passes `canAdvance`. */
export const HeldUntilValid: Story = {
  render: (args) => {
    const [name, setName] = useState('');
    return (
      <Wizard
        {...args}
        canAdvance={name.trim() !== ''}
        steps={[
          {
            id: 'details',
            label: 'Details',
            content: <Input label="Project name" value={name} onValueChange={setName} required />,
          },
          ...args.steps.slice(1),
        ]}
      />
    );
  },
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByRole('button', { name: 'Continue' })).toBeDisabled();
    await userEvent.type(canvas.getByRole('textbox', { name: /Project name/ }), 'Launch');
    await expect(canvas.getByRole('button', { name: 'Continue' })).toBeEnabled();
  },
};
