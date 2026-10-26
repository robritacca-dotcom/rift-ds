import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import { Button } from '../components/Button/Button';
import { Carousel } from '../components/Carousel/Carousel';
import { DatePicker } from '../components/DatePicker/DatePicker';
import { DropdownMenu } from '../components/DropdownMenu/DropdownMenu';
import { Drawer } from '../components/Drawer/Drawer';
import { Input } from '../components/Input/Input';
import { SplitPane } from '../components/SplitPane/SplitPane';
import { Tabs } from '../components/Tabs/Tabs';
import { ToggleSwitch } from '../components/ToggleSwitch/ToggleSwitch';

/*
 * The reading-direction contract, proven at runtime. design.md's "Layout
 * follows the reading direction" paragraph states it, and
 * scripts/validate-logical-properties.mjs keeps physical sides and unmirrored
 * glyphs out of the source; these stories check what a parse cannot. Each
 * story with a play function sets dir="rtl" on its own wrapper, so it proves
 * that a dir anywhere up the tree is enough. The story-test run's second
 * project renders every other story with dir="rtl" on <html>, and
 * DirectionGlobalApplies is the proof that it does.
 */
const meta = {
  title: 'Foundations/Reading direction',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Renders in both story-test passes with no play function, and throws when
 * <html> does not carry the direction the toolbar asked for, so a broken
 * direction decorator fails the run rather than letting the right-to-left
 * pass quietly render left to right.
 */
export const DirectionGlobalApplies: Story = {
  render: (_args, context) => {
    const wanted = String(context.globals.direction ?? 'ltr');
    if (document.documentElement.dir !== wanted) {
      throw new Error(`<html dir> is "${document.documentElement.dir}", expected "${wanted}"`);
    }
    return <p>Reading direction: {wanted}</p>;
  },
};

const rtlBox = { dir: 'rtl' as const, style: { width: 480 } };

/** Logical sides: the input's leading icon and the switch's on position sit on the right. */
export const SidesFollowTheDirection: Story = {
  render: () => (
    <div {...rtlBox}>
      <Input label="بحث" iconLeft="search" />
      <ToggleSwitch label="مفعل" checked onCheckedChange={() => {}} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector<HTMLElement>('input')!;
    const icon = canvasElement.querySelector<HTMLElement>('.ds-input__icon')!;
    const field = input.getBoundingClientRect();
    // The leading icon sits at the field's right end, and the text starts after it.
    await expect(icon.getBoundingClientRect().left).toBeGreaterThan(field.left + field.width / 2);
    await expect(parseFloat(getComputedStyle(input).paddingRight)).toBeGreaterThan(
      parseFloat(getComputedStyle(input).paddingLeft),
    );
    const track = canvasElement.querySelector<HTMLElement>('.ds-toggle-switch__track')!.getBoundingClientRect();
    const thumb = canvasElement.querySelector<HTMLElement>('.ds-toggle-switch__thumb')!.getBoundingClientRect();
    // On is the inline end: the left in Arabic.
    await expect(thumb.left - track.left).toBeLessThan(track.right - thumb.right);
  },
};

/** Directional glyphs mirror; a "next" chevron points left. */
export const GlyphsMirror: Story = {
  render: () => (
    <div {...rtlBox}>
      <Button label="التالي" iconRight="arrow_forward" />
      <Button label="بحث" iconLeft="search" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const [arrow, search] = canvasElement.querySelectorAll<HTMLElement>('.ds-button__icon');
    await expect(getComputedStyle(arrow).scale).toBe('-1 1');
    await expect(getComputedStyle(search).scale).toBe('none');
  },
};

/** Arrow keys step in reading order: ArrowLeft is the next tab, the next day. */
export const ArrowKeysFollowTheDirection: Story = {
  render: function ArrowKeysStory() {
    const [tab, setTab] = useState('one');
    const [date, setDate] = useState('2026-01-15');
    return (
      <div {...rtlBox}>
        <Tabs
          tabs={[
            { value: 'one', label: 'الأول' },
            { value: 'two', label: 'الثاني' },
          ]}
          value={tab}
          onValueChange={setTab}
        />
        <DatePicker value={date} onDateSelect={setDate} />
      </div>
    );
  },
  play: async ({ canvas, userEvent }) => {
    canvas.getByRole('tab', { name: 'الأول' }).focus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(canvas.getByRole('tab', { name: 'الثاني' })).toHaveFocus();
    canvas.getByRole('button', { name: /January 15, 2026, selected/ }).focus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(canvas.getByRole('button', { name: /January 16, 2026/ })).toHaveFocus();
  },
};

/** The separator's keys and the first pane's share both read from the right. */
export const SplitPaneFromTheRight: Story = {
  render: () => (
    <div {...rtlBox} style={{ width: 480, height: 160 }}>
      <SplitPane defaultSplit={50}>
        <div>الأول</div>
        <div>الثاني</div>
      </SplitPane>
    </div>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    const separator = canvas.getByRole('separator');
    const first = () => canvasElement.querySelector<HTMLElement>('.ds-split-pane__pane')!;
    // The first pane is on the right.
    await expect(first().getBoundingClientRect().left).toBeGreaterThan(separator.getBoundingClientRect().left);
    separator.focus();
    const before = Number(separator.getAttribute('aria-valuenow'));
    await userEvent.keyboard('{ArrowLeft}');
    // Moving the separator left grows the first pane.
    await expect(Number(separator.getAttribute('aria-valuenow'))).toBeGreaterThan(before);
  },
};

/**
 * A start drawer opens on the right; a left drawer stays on the left. A
 * drawer is portaled to <body>, so like a real app this story sets the
 * direction on <html>.
 */
export const DrawerSides: Story = {
  render: function DrawerSidesStory() {
    const [side, setSide] = useState<'start' | 'left' | null>(null);
    return (
      <div {...rtlBox}>
        <Button label="start" onClick={() => setSide('start')} />
        <Button label="left" onClick={() => setSide('left')} />
        <Drawer open={side !== null} onOpenChange={() => setSide(null)} side={side ?? 'start'} title="درج" size="sm">
          <p>المحتوى</p>
        </Drawer>
      </div>
    );
  },
  play: async ({ canvas, userEvent }) => {
    const body = within(document.body);
    const before = document.documentElement.dir;
    document.documentElement.dir = 'rtl';
    try {
      await userEvent.click(canvas.getByRole('button', { name: 'start' }));
      const panel = await body.findByRole('dialog');
      await waitFor(() => expect(panel.getBoundingClientRect().right).toBeGreaterThan(window.innerWidth - 2));
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(body.queryByRole('dialog')).toBeNull());
      await userEvent.click(canvas.getByRole('button', { name: 'left' }));
      const left = await body.findByRole('dialog');
      await waitFor(() => expect(left.getBoundingClientRect().left).toBeLessThan(2));
      await userEvent.keyboard('{Escape}');
    } finally {
      document.documentElement.dir = before;
    }
  },
};

/** A menu aligned to its trigger's start lines up with the trigger's right edge. */
export const PopupsAlignToTheStart: Story = {
  render: () => (
    <div {...rtlBox} style={{ width: 480, display: 'flex', justifyContent: 'center', paddingBlock: 40 }}>
      <DropdownMenu trigger="الإجراءات" items={[{ label: 'نسخ' }, { label: 'حذف' }]} />
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: 'الإجراءات' });
    await userEvent.click(trigger);
    const menu = await within(document.body).findByRole('menu');
    await waitFor(() =>
      expect(Math.abs(menu.getBoundingClientRect().right - trigger.getBoundingClientRect().right)).toBeLessThan(2),
    );
  },
};

/** The carousel's track moves toward the start: the second slide comes in from the left. */
export const CarouselMovesRight: Story = {
  render: () => (
    <div {...rtlBox}>
      <Carousel aria-label="شرائح">
        <div style={{ height: 80 }}>1</div>
        <div style={{ height: 80 }}>2</div>
      </Carousel>
    </div>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const track = canvasElement.querySelector<HTMLElement>('.ds-carousel__track')!;
    // The dots are the carousel's tab stop; ArrowLeft is the next slide.
    canvasElement.querySelector<HTMLElement>('[role="tab"][tabindex="0"]')!.focus();
    await userEvent.keyboard('{ArrowLeft}');
    await waitFor(() => expect(new DOMMatrix(getComputedStyle(track).transform).m41).toBeGreaterThan(0));
  },
};
