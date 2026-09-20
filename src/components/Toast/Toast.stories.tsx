import type { Meta, StoryObj } from '@storybook/react-vite';
import { Toast, ToastProvider, useToast } from './Toast';
import { Button } from '../Button/Button';

/* ============================================
   STANDALONE TOAST STORIES
   ============================================ */

const meta = {
  title: 'Components/Toast',
  component: Toast,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    variant: {
      control: 'select',
      options: ['info', 'positive', 'warning', 'error', 'neutral'],
    },
    dismissible: { control: 'boolean' },
    icon: { control: 'text' },
  },
  args: {
    dismissible: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '380px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {
  args: {
    variant: 'info',
    title: 'Information',
    description: 'This is an informational notification.',
  },
};

export const Positive: Story = {
  args: {
    variant: 'positive',
    title: 'Success',
    description: 'Your changes have been saved successfully.',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    title: 'Warning',
    description: 'This action may have unintended consequences.',
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    title: 'Error',
    description: 'Something went wrong. Please try again.',
  },
};

export const TitleOnly: Story = {
  args: {
    variant: 'positive',
    title: 'Changes saved',
  },
};

export const DescriptionOnly: Story = {
  args: {
    variant: 'warning',
    description: 'Your session will expire in 5 minutes.',
  },
};

export const NonDismissible: Story = {
  args: {
    variant: 'info',
    title: 'Processing',
    description: 'Please wait while we process your request.',
    dismissible: false,
  },
};

export const Neutral: Story = {
  args: {
    variant: 'neutral',
    title: 'Note',
    description: 'This is a neutral notification.',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '380px' }}>
      <Toast variant="info" title="Information" description="This is an informational notification." />
      <Toast variant="positive" title="Success" description="Your changes have been saved." />
      <Toast variant="warning" title="Warning" description="This action may have consequences." />
      <Toast variant="error" title="Error" description="Something went wrong." />
      <Toast variant="neutral" title="Note" description="This is a neutral notification." />
    </div>
  ),
};

/* ============================================
   INTERACTIVE STORY WITH PROVIDER
   ============================================ */

const ToastTriggers = () => {
  const { toast } = useToast();

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      <Button
        label="Info toast"
        variant="secondary"
        onClick={() =>
          toast({
            variant: 'info',
            title: 'Information',
            description: 'This is an informational notification.',
          })
        }
      />
      <Button
        label="Success toast"
        variant="secondary"
        onClick={() =>
          toast({
            variant: 'positive',
            title: 'Saved',
            description: 'Your changes have been saved.',
          })
        }
      />
      <Button
        label="Warning toast"
        variant="secondary"
        onClick={() =>
          toast({
            variant: 'warning',
            title: 'Warning',
            description: 'This action may have consequences.',
          })
        }
      />
      <Button
        label="Error toast"
        variant="secondary"
        onClick={() =>
          toast({
            variant: 'error',
            title: 'Error',
            description: 'Something went wrong. Please try again.',
          })
        }
      />
      <Button
        label="Neutral toast"
        variant="tertiary"
        onClick={() =>
          toast({
            variant: 'neutral',
            title: 'Note',
            description: 'This is a neutral notification.',
          })
        }
      />
    </div>
  );
};

export const Interactive: Story = {
  render: () => (
    <ToastProvider position="bottom-right">
      <ToastTriggers />
    </ToastProvider>
  ),
};
