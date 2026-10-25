import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';
import { AiButton } from '../components/AiButton/AiButton';
import { Button } from '../components/Button/Button';
import { ColorPicker } from '../components/ColorPicker/ColorPicker';
import { Combobox } from '../components/Combobox/Combobox';
import { Dropdown } from '../components/Dropdown/Dropdown';
import { DropdownMenu } from '../components/DropdownMenu/DropdownMenu';
import { FilterBar } from '../components/FilterBar/FilterBar';
import { HoverCard } from '../components/HoverCard/HoverCard';
import { InterruptCard } from '../components/InterruptCard/InterruptCard';
import { ModelPicker } from '../components/ModelPicker/ModelPicker';
import { Popover } from '../components/Popover/Popover';
import { RichDropdown } from '../components/RichDropdown/RichDropdown';
import { SourceChip } from '../components/SourceChip/SourceChip';
import { TimePicker } from '../components/TimePicker/TimePicker';
import { Tooltip } from '../components/Tooltip/Tooltip';

/**
 * Every anchored popup, opened inside a box that clips its overflow: the
 * shape of a table's scroll wrapper, a rail or a card. The shared
 * anchored-position behaviour (src/behaviors/useAnchoredPosition.ts) makes
 * each panel fixed, so it escapes the box; each story's play function
 * proves it, by checking that the panel reaches outside the box and is the
 * topmost thing drawn there.
 */
const meta = {
  title: 'Foundations/Anchored popups',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** A box that clips its overflow, with room around it for a panel to open into. */
const ClipBox = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: '200px 40px 360px' }}>
    <div
      data-testid="clip"
      style={{
        overflow: 'hidden',
        height: 52,
        width: 320,
        display: 'flex',
        alignItems: 'center',
        padding: '0 8px',
        border: '1px dashed var(--color-divider)',
      }}
    >
      {children}
    </div>
  </div>
);

/**
 * Waits for the panel matching `selector`, then asserts it reaches outside
 * the clip box and is drawn there, not cut off by it.
 */
async function expectEscapes(root: HTMLElement, selector: string) {
  const clip = root.querySelector<HTMLElement>('[data-testid="clip"]')!;
  await waitFor(() => {
    const panel = root.querySelector<HTMLElement>(selector);
    expect(panel).not.toBeNull();
    const p = panel!.getBoundingClientRect();
    const c = clip.getBoundingClientRect();
    expect(p.height).toBeGreaterThan(0);
    // The part of the panel outside the box: below it, or above it.
    const below = p.bottom > c.bottom + 1;
    const above = p.top < c.top - 1;
    expect(below || above).toBe(true);
    const y = below ? (Math.max(p.top, c.bottom) + p.bottom) / 2 : (p.top + Math.min(p.bottom, c.top)) / 2;
    const x = p.left + Math.min(p.width / 2, 12);
    // A tooltip takes no pointer events by design, which hides it from the
    // hit test; lift that for the instant of the check.
    const pointerEvents = panel!.style.pointerEvents;
    panel!.style.pointerEvents = 'auto';
    const hit = document.elementFromPoint(x, y);
    panel!.style.pointerEvents = pointerEvents;
    expect(hit && panel!.contains(hit)).toBe(true);
  });
}

const OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'review', label: 'In review' },
  { value: 'approved', label: 'Approved' },
  { value: 'published', label: 'Published' },
];

export const DropdownList: Story = {
  render: () => (
    <ClipBox>
      <Dropdown aria-label="Status" options={OPTIONS} defaultOpen />
    </ClipBox>
  ),
  play: ({ canvasElement }) => expectEscapes(canvasElement, '.ds-dropdown__menu'),
};

export const ComboboxList: Story = {
  render: () => (
    <ClipBox>
      <Combobox aria-label="Status" options={OPTIONS} />
    </ClipBox>
  ),
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.click(canvasElement.querySelector('input')!);
    await expectEscapes(canvasElement, '.ds-combobox__menu');
  },
};

export const RichDropdownList: Story = {
  render: () => (
    <ClipBox>
      <RichDropdown
        aria-label="Theme"
        options={[
          { value: 'editorial', label: 'Editorial', description: 'Serif headings, warm neutrals.' },
          { value: 'product', label: 'Product', description: 'One face, crisp greys.' },
        ]}
      />
    </ClipBox>
  ),
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.click(canvasElement.querySelector('.ds-rich-dropdown__trigger')!);
    await expectEscapes(canvasElement, '.ds-rich-dropdown__menu');
  },
};

export const TimePickerList: Story = {
  render: () => (
    <ClipBox>
      <TimePicker aria-label="Start time" />
    </ClipBox>
  ),
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.click(canvasElement.querySelector('.ds-timepicker__trigger')!);
    await expectEscapes(canvasElement, '.ds-timepicker__menu');
  },
};

export const ModelPickerPanel: Story = {
  render: () => (
    <ClipBox>
      <ModelPicker
        models={[
          { value: 'fast', label: 'Fast', description: 'Quick answers.' },
          { value: 'deep', label: 'Deep', description: 'Slower, more careful.' },
        ]}
      />
    </ClipBox>
  ),
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.click(canvasElement.querySelector('.ds-model-picker__trigger')!);
    await expectEscapes(canvasElement, '.ds-model-picker__panel');
  },
};

export const DropdownMenuPanel: Story = {
  render: () => (
    <ClipBox>
      <DropdownMenu
        trigger={<Button label="Columns" variant="secondary" size="compact" />}
        defaultOpen
        items={[
          { label: 'Name', checked: true, onClick: () => {} },
          { label: 'Owner', checked: false, onClick: () => {} },
          { label: 'Due date', checked: true, onClick: () => {} },
        ]}
      />
    </ClipBox>
  ),
  play: ({ canvasElement }) => expectEscapes(canvasElement, '.ds-dropdown-menu__panel'),
};

export const PopoverPanel: Story = {
  render: () => (
    <ClipBox>
      <Popover open aria-label="Details" content={<span>Popover content that needs room.</span>}>
        <Button label="Details" variant="secondary" size="compact" />
      </Popover>
    </ClipBox>
  ),
  play: ({ canvasElement }) => expectEscapes(canvasElement, '.ds-popover__panel'),
};

export const ColorPickerPanel: Story = {
  render: () => (
    <ClipBox>
      <ColorPicker aria-label="Colour" />
    </ClipBox>
  ),
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.click(canvasElement.querySelector('.ds-colorpicker__trigger')!);
    await expectEscapes(canvasElement, '.ds-colorpicker__panel');
  },
};

export const FilterBarPanel: Story = {
  render: () => (
    <ClipBox>
      <FilterBar filters={[{ id: 'status', label: 'Status', options: OPTIONS }]} />
    </ClipBox>
  ),
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.click(canvasElement.querySelector('.ds-filter-bar__trigger')!);
    await expectEscapes(canvasElement, '.ds-filter-bar__panel');
  },
};

export const TooltipBubble: Story = {
  render: () => (
    <ClipBox>
      <Tooltip content="Tooltips escape too">
        <Button label="Hover" variant="secondary" size="compact" />
      </Tooltip>
    </ClipBox>
  ),
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.hover(canvasElement.querySelector('.ds-button')!);
    await expectEscapes(canvasElement, '.ds-tooltip__panel');
  },
};

export const HoverCardPanel: Story = {
  render: () => (
    <ClipBox>
      <HoverCard content={<span>A hover card with more to say than fits.</span>}>
        <Button label="Hover" variant="secondary" size="compact" />
      </HoverCard>
    </ClipBox>
  ),
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.hover(canvasElement.querySelector('.ds-button')!);
    await expectEscapes(canvasElement, '.ds-hover-card__panel');
  },
};

export const SourceChipPreview: Story = {
  render: () => (
    <ClipBox>
      <SourceChip index={1} title="Field guide" excerpt="A preview of the source behind the claim." />
    </ClipBox>
  ),
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.hover(canvasElement.querySelector('.ds-source-chip')!);
    await expectEscapes(canvasElement, '.ds-source-chip__preview');
  },
};

export const AiButtonRequest: Story = {
  render: () => (
    <ClipBox>
      <AiButton
        label="Agent"
        size="compact"
        status="waiting"
        requestPlacement="bottom"
        request={<InterruptCard bare title="Allow file edit?" options={[{ value: 'ok', label: 'Allow' }]} />}
      />
    </ClipBox>
  ),
  play: ({ canvasElement }) => expectEscapes(canvasElement, '.ds-ai-button__request'),
};
