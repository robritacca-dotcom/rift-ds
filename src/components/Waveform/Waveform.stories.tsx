import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Waveform } from './Waveform';

const meta = {
  title: 'Components/Waveform',
  component: Waveform,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    state: {
      control: 'select',
      options: ['idle', 'listening', 'speaking'],
    },
    bars: { control: { type: 'number', min: 1, max: 24 } },
    size: {
      control: 'select',
      options: ['default', 'compact'],
    },
    label: { control: 'text' },
  },
  args: {
    state: 'speaking',
  },
} satisfies Meta<typeof Waveform>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
      <Waveform state="idle" />
      <Waveform state="listening" />
      <Waveform state="speaking" />
    </div>
  ),
};

export const Compact: Story = {
  args: {
    state: 'speaking',
    size: 'compact',
  },
};

export const WideWave: Story = {
  args: {
    state: 'speaking',
    bars: 16,
  },
};

export const Tinted: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
      <Waveform
        state="speaking"
        style={{ '--ds-waveform-color': 'var(--color-core-accent-mint)' } as React.CSSProperties}
        label="Agent speaking"
      />
      <Waveform
        state="speaking"
        style={{ '--ds-waveform-color': 'var(--color-core-accent-violet)' } as React.CSSProperties}
        label="Agent speaking"
      />
    </div>
  ),
};

export const ControlledLevels: Story = {
  render: () => {
    const Demo = () => {
      const [levels, setLevels] = useState([0.3, 0.6, 0.9, 0.5, 0.7, 0.4, 0.2]);
      useEffect(() => {
        const id = setInterval(
          () => setLevels((prev) => prev.map(() => 0.1 + Math.random() * 0.9)),
          250,
        );
        return () => clearInterval(id);
      }, []);
      return <Waveform levels={levels} label="Live input level" />;
    };
    return <Demo />;
  },
};
