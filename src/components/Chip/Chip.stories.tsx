import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Chip } from './Chip';

const meta = {
  title: 'Components/Chip',
  component: Chip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    icon: { control: 'text' },
    selected: { control: 'boolean' },
    disabled: { control: 'boolean' },
    size: {
      control: 'select',
      options: ['large', 'default', 'compact'],
    },
  },
  args: {
    label: 'Chip',
  },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

// Non-clickable label chip — the default
export const Default: Story = {
  args: {
    label: 'Chip',
  },
};

export const WithIcon: Story = {
  args: {
    label: 'Analytics',
    icon: 'monitoring',
  },
};

export const Large: Story = {
  args: {
    label: 'Large',
    icon: 'bolt',
    size: 'large',
  },
};

export const Compact: Story = {
  args: {
    label: 'Compact',
    icon: 'bolt',
    size: 'compact',
  },
};

// Clickable (assist-style) chip — renders a <button>
export const Clickable: Story = {
  args: {
    label: 'Book a demo',
    icon: 'calendar_month',
    onClick: () => {},
  },
};

export const Selected: Story = {
  args: {
    label: 'Selected',
    icon: 'check',
    selected: true,
    onClick: () => {},
  },
};

// Removable (input-style) chip — trailing close button
export const Removable: Story = {
  args: {
    label: 'design-system',
    onRemove: () => {},
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled',
    icon: 'block',
    disabled: true,
    onClick: () => {},
  },
};

// Filter chips toggling selection
export const FilterGroup: Story = {
  render: () => {
    const options = ['All', 'Components', 'Foundations', 'Patterns'];
    const [selected, setSelected] = useState('All');
    return (
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {options.map((option) => (
          <Chip
            key={option}
            label={option}
            selected={selected === option}
            onClick={() => setSelected(option)}
          />
        ))}
      </div>
    );
  },
};

// Input chips being removed from a set
export const InputGroup: Story = {
  render: () => {
    const [tags, setTags] = useState(['react', 'typescript', 'storybook']);
    return (
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {tags.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            removeLabel={`Remove ${tag}`}
            onRemove={() => setTags(tags.filter((t) => t !== tag))}
          />
        ))}
      </div>
    );
  },
};

// Every size × interactivity combination
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <Chip size="large" label="Label" />
        <Chip size="large" label="With icon" icon="monitoring" />
        <Chip size="large" label="Clickable" onClick={() => {}} />
        <Chip size="large" label="Selected" icon="check" selected onClick={() => {}} />
        <Chip size="large" label="Removable" onRemove={() => {}} />
        <Chip size="large" label="Disabled" disabled onClick={() => {}} />
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <Chip label="Label" />
        <Chip label="With icon" icon="monitoring" />
        <Chip label="Clickable" onClick={() => {}} />
        <Chip label="Selected" icon="check" selected onClick={() => {}} />
        <Chip label="Removable" onRemove={() => {}} />
        <Chip label="Disabled" disabled onClick={() => {}} />
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <Chip size="compact" label="Label" />
        <Chip size="compact" label="With icon" icon="monitoring" />
        <Chip size="compact" label="Clickable" onClick={() => {}} />
        <Chip size="compact" label="Selected" icon="check" selected onClick={() => {}} />
        <Chip size="compact" label="Removable" onRemove={() => {}} />
        <Chip size="compact" label="Disabled" disabled onClick={() => {}} />
      </div>
    </div>
  ),
};
