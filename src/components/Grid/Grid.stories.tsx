import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Grid } from './Grid';
import { Panel } from '../Panel/Panel';
import { Stat } from '../Stat/Stat';
import { Input } from '../Input/Input';

const meta = {
  title: 'Components/Grid',
  component: Grid,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    columns: { control: 'select', options: [1, 2, 3, 4, 5, 6] },
    gap: { control: 'select', options: ['200', '300', '400', '500', '1000'] },
    align: { control: 'inline-radio', options: ['stretch', 'start', 'center', 'end'] },
  },
  args: {
    columns: 4,
    children: (
      <>
        <Panel bordered>
          <Stat icon="group" caption="This month" value="1,284" label="Active members" trend="up" delta="+8%" />
        </Panel>
        <Panel bordered>
          <Stat icon="shopping_cart" caption="This month" value="342" label="Orders" trend="up" delta="+3%" />
        </Panel>
        <Panel bordered>
          <Stat icon="schedule" caption="This month" value="2.4 days" label="Average lead time" />
        </Panel>
        <Panel bordered>
          <Stat icon="star" caption="This month" value="4.7" label="Average rating" trend="down" delta="-0.1" />
        </Panel>
      </>
    ),
  },
} satisfies Meta<typeof Grid>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A row of stat cards: four across with room, folding by the grid's own width. Cards in a row share its height. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const cells = [...canvasElement.querySelectorAll('.ds-grid > *')] as HTMLElement[];
    // Every card in the first row is as tall as the tallest.
    const top = cells[0].getBoundingClientRect().top;
    const firstRow = cells.filter((cell) => Math.abs(cell.getBoundingClientRect().top - top) < 1);
    const heights = new Set(firstRow.map((cell) => Math.round(cell.getBoundingClientRect().height)));
    await expect(heights.size).toBe(1);
  },
};

/** In a narrow container the grid drops columns rather than squeezing them below `minColumnWidth`. */
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '420px' }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const cells = [...canvasElement.querySelectorAll('.ds-grid > *')] as HTMLElement[];
    const top = cells[0].getBoundingClientRect().top;
    const firstRow = cells.filter((cell) => Math.abs(cell.getBoundingClientRect().top - top) < 1);
    await expect(firstRow.length).toBeLessThan(4);
  },
};

/** Two columns of fields in a form, folding to one when narrow. */
export const FieldGrid: Story = {
  args: {
    columns: 2,
    minColumnWidth: '14rem',
    gap: '400',
    children: (
      <>
        {['First name', 'Last name', 'Email', 'Phone'].map((label) => (
          <Input key={label} label={label} />
        ))}
      </>
    ),
  },
};
