import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { PageHeader } from './PageHeader';
import { Button } from '../Button/Button';

const meta = {
  title: 'Components/PageHeader',
  component: PageHeader,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    level: { control: 'inline-radio', options: [1, 2] },
  },
  args: {
    title: 'Projects',
    description: 'Everything your team is working on, with who owns it and when it is due.',
    breadcrumb: [{ label: 'Workspace', href: '#' }, { label: 'Projects' }],
    actions: (
      <>
        <Button label="Export" variant="secondary" />
        <Button label="New project" iconLeft="add" />
      </>
    ),
  },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The full header: where the page sits, its title and purpose, and its actions. */
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { level: 1, name: 'Projects' })).toBeInTheDocument();
    await expect(canvas.getByRole('navigation')).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'New project' })).toBeInTheDocument();
  },
};

/** Only a title: the rest is optional. */
export const TitleOnly: Story = {
  args: { breadcrumb: undefined, description: undefined, actions: undefined },
};

/** In a narrow column the actions take the row under the text and share it. */
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '360px' }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const text = canvasElement.querySelector('.ds-page-header__text')!.getBoundingClientRect();
    const actions = canvasElement.querySelector('.ds-page-header__actions')!.getBoundingClientRect();
    await expect(actions.top).toBeGreaterThanOrEqual(text.bottom - 1);
  },
};

/** A header inside a tab or a pane, one level down the outline. */
export const SecondLevel: Story = {
  args: { level: 2, breadcrumb: undefined, title: 'Members', description: 'People with access to this project.' },
};
