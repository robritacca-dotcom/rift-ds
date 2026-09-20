import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Combobox } from './Combobox';

const countries = [
  { label: 'Australia', value: 'au' },
  { label: 'Brazil', value: 'br' },
  { label: 'Canada', value: 'ca' },
  { label: 'Denmark', value: 'dk' },
  { label: 'France', value: 'fr' },
  { label: 'Germany', value: 'de' },
  { label: 'Ireland', value: 'ie' },
  { label: 'Japan', value: 'jp' },
  { label: 'Netherlands', value: 'nl' },
  { label: 'New Zealand', value: 'nz' },
  { label: 'Norway', value: 'no' },
  { label: 'Portugal', value: 'pt' },
  { label: 'Spain', value: 'es' },
  { label: 'Sweden', value: 'se' },
  { label: 'United Kingdom', value: 'gb' },
  { label: 'United States', value: 'us' },
];

const meta = {
  title: 'Components/Combobox',
  component: Combobox,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'radio',
      options: ['default', 'compact'],
    },
    multiple: { control: 'boolean' },
    disabled: { control: 'boolean' },
    error: { control: 'boolean' },
    loading: { control: 'boolean' },
    clearable: { control: 'boolean' },
  },
  args: {
    label: 'Country',
    placeholder: 'Search countries…',
    options: countries,
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '360px', minHeight: '340px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Combobox>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Local state wrappers so the stories are actually interactive. */
const SingleTemplate: Story['render'] = (args) => {
  const [value, setValue] = useState<string | string[]>('');
  return <Combobox {...args} value={value} onChange={setValue} />;
};

const MultiTemplate: Story['render'] = (args) => {
  const [value, setValue] = useState<string | string[]>([]);
  return <Combobox {...args} value={value} onChange={setValue} />;
};

export const Default: Story = {
  render: SingleTemplate,
};

export const WithHelperText: Story = {
  args: {
    helperText: 'Start typing to narrow the list.',
  },
  render: SingleTemplate,
};

export const Clearable: Story = {
  args: {
    clearable: true,
  },
  render: SingleTemplate,
};

export const Multiple: Story = {
  args: {
    label: 'Countries',
    multiple: true,
    clearable: true,
    helperText: 'Select as many as you need — Backspace removes the last one.',
  },
  render: MultiTemplate,
};

export const Preselected: Story = {
  args: {
    label: 'Countries',
    multiple: true,
    clearable: true,
  },
  render: (args) => {
    const [value, setValue] = useState<string | string[]>(['ca', 'jp', 'pt']);
    return <Combobox {...args} value={value} onChange={setValue} />;
  },
};

export const Grouped: Story = {
  args: {
    label: 'Region',
    placeholder: 'Search regions…',
    groups: [
      {
        label: 'Europe',
        options: [
          { label: 'France', value: 'fr' },
          { label: 'Germany', value: 'de' },
          { label: 'Portugal', value: 'pt' },
          { label: 'Spain', value: 'es' },
        ],
      },
      {
        label: 'Americas',
        options: [
          { label: 'Brazil', value: 'br' },
          { label: 'Canada', value: 'ca' },
          { label: 'United States', value: 'us' },
        ],
      },
      {
        label: 'Asia Pacific',
        options: [
          { label: 'Australia', value: 'au' },
          { label: 'Japan', value: 'jp' },
          { label: 'New Zealand', value: 'nz' },
        ],
      },
    ],
  },
  render: SingleTemplate,
};

export const WithDescriptions: Story = {
  args: {
    label: 'Assign to',
    placeholder: 'Search teammates…',
    options: [
      { label: 'Ada Lovelace', value: 'ada', description: 'Engineering' },
      { label: 'Grace Hopper', value: 'grace', description: 'Engineering' },
      { label: 'Katherine Johnson', value: 'katherine', description: 'Research' },
      { label: 'Mary Jackson', value: 'mary', description: 'Research' },
      { label: 'Radia Perlman', value: 'radia', description: 'Networking' },
    ],
  },
  render: SingleTemplate,
};

export const WithDisabledOptions: Story = {
  args: {
    options: [
      { label: 'Australia', value: 'au' },
      { label: 'Brazil', value: 'br', disabled: true },
      { label: 'Canada', value: 'ca' },
      { label: 'Denmark', value: 'dk', disabled: true },
      { label: 'France', value: 'fr' },
    ],
    helperText: 'Some destinations are temporarily unavailable.',
  },
  render: SingleTemplate,
};

export const Loading: Story = {
  args: {
    loading: true,
    options: [],
    helperText: 'Fetching options…',
  },
  render: SingleTemplate,
};

export const Compact: Story = {
  args: {
    size: 'compact',
  },
  render: SingleTemplate,
};

export const ErrorState: Story = {
  args: {
    error: true,
    required: true,
    helperText: 'Please choose a country.',
  },
  render: SingleTemplate,
};

export const Disabled: Story = {
  args: {
    disabled: true,
    helperText: 'Country is locked for this account.',
  },
  render: SingleTemplate,
};
