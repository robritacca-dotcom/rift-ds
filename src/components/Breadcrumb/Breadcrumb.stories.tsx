import type { Meta, StoryObj } from '@storybook/react-vite';
import { Breadcrumb } from './Breadcrumb';

const meta = {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    maxItems: { control: { type: 'number', min: 2, max: 10 } },
  },
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Components', href: '/components' },
      { label: 'Breadcrumb' },
    ],
  },
};

export const Long: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Products', href: '/products' },
      { label: 'Category', href: '/products/category' },
      { label: 'Subcategory', href: '/products/category/sub' },
      { label: 'Item detail' },
    ],
  },
};

export const Collapsed: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Section', href: '/section' },
      { label: 'Category', href: '/section/category' },
      { label: 'Components', href: '/section/category/components' },
      { label: 'Breadcrumb' },
    ],
    maxItems: 3,
  },
};

export const TwoItems: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Current page' },
    ],
  },
};

export const AllVariants: Story = {
  args: { items: [] },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Each nav is a landmark, so several on one page need distinct names —
          exactly what a consumer rendering more than one has to do. */}
      <Breadcrumb
        ariaLabel="Two levels"
        items={[
          { label: 'Home', href: '/' },
          { label: 'Breadcrumb' },
        ]}
      />
      <Breadcrumb
        ariaLabel="Three levels"
        items={[
          { label: 'Home', href: '/' },
          { label: 'Components', href: '/components' },
          { label: 'Breadcrumb' },
        ]}
      />
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Section', href: '/section' },
          { label: 'Category', href: '/section/category' },
          { label: 'Components', href: '/section/category/components' },
          { label: 'Breadcrumb' },
        ]}
        maxItems={3}
        ariaLabel="Collapsed to three"
      />
    </div>
  ),
};
