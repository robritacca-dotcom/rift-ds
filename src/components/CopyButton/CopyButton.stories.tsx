import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { CopyButton } from './CopyButton';

const meta = {
  title: 'Components/CopyButton',
  component: CopyButton,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: ['secondary', 'tertiary'] },
    size: { control: 'radio', options: ['default', 'compact'] },
    iconOnly: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    value: 'npm install rift-ds',
    onCopied: fn(),
  },
} satisfies Meta<typeof CopyButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Copy' });
    await userEvent.click(button);
    await expect(args.onCopied).toHaveBeenCalledWith('npm install rift-ds');
    await expect(button).toHaveTextContent('Copied');
  },
};

export const Secondary: Story = {
  args: { variant: 'secondary', size: 'default', copyText: 'Copy link', value: () => 'https://example.com/docs/install' },
};

/** The neutral tone: the secondary outline in the neutral greys, for a utility control beside a title. */
export const Neutral: Story = {
  args: { variant: 'secondary', tone: 'neutral', copyText: 'Copy link', value: () => 'https://example.com/docs/install' },
};

export const IconOnly: Story = {
  args: { iconOnly: true, copyLabel: 'Copy install command' },
};

export const Disabled: Story = {
  args: { disabled: true },
};
