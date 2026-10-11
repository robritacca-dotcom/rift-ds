'use client';

import React, { useLayoutEffect, useRef } from 'react';
import '../../fonts/material-symbols.css';
import './Mention.css';
import { mentionListboxId, mentionOptionId, splitMentions } from './mentions';
import type { MentionItem, MentionSource } from './mentions';

/* The data shapes and helpers live in a React-free module with a subpath
   of its own (`rift-ds/components/Mention/mentions`), so a Server Component
   or a route handler can run them without crossing this file's client
   boundary. They are re-exported here as well, because this file is what
   the package barrel resolves to. A star, deliberately: the docs parser
   that builds the props tables drops this module's first component when
   the same names are re-exported one by one. */
// eslint-disable-next-line react-refresh/only-export-components
export * from './mentions';

/* ============================================
   MENTION — the inline tag
   ============================================ */

type MentionOwnProps = {
  /** The character that opened the mention, drawn a step quieter than the name. */
  trigger?: string;
  /** Additional CSS classes */
  className?: string;
  /** The name: a person, a file, a skill. */
  children?: React.ReactNode;
};

export interface MentionProps
  extends MentionOwnProps,
    Omit<React.ComponentPropsWithoutRef<'span'>, keyof MentionOwnProps> {}

/**
 * Mention is a reference written into a sentence: `@` and a name for an
 * entity, `/` and a name for a skill. It is colour and nothing else, with
 * no padding, fill or weight of its own, so the same tag reads correctly
 * inside a message and can be laid exactly over the text of an input while
 * it is being typed.
 */
export const Mention = React.forwardRef<HTMLSpanElement, MentionProps>(
  ({ trigger = '@', className = '', children, ...rest }, ref) => (
    <span
      {...rest}
      ref={ref}
      className={['ds-mention', className].filter(Boolean).join(' ')}
      data-trigger={trigger}
    >
      <span className="ds-mention__trigger">{trigger}</span>
      {children}
    </span>
  ),
);

Mention.displayName = 'Mention';

/* ============================================
   MENTION TEXT — a string with its mentions drawn
   ============================================ */

type MentionTextOwnProps = {
  /** The plain text, exactly as it was typed or sent. */
  text: string;
  /** The sources whose items count as mentions in this text. */
  sources: MentionSource[];
  /** Additional CSS classes */
  className?: string;
};

export interface MentionTextProps
  extends MentionTextOwnProps,
    Omit<React.ComponentPropsWithoutRef<'span'>, keyof MentionTextOwnProps | 'children'> {}

/**
 * MentionText draws a plain string with every mention in it as a Mention
 * tag: the sent half of the pattern, for a message that was typed with
 * mentions in it. The text is the only record. Nothing else needs storing.
 */
export const MentionText = React.forwardRef<HTMLSpanElement, MentionTextProps>(
  ({ text, sources, className = '', ...rest }, ref) => (
    <span
      {...rest}
      ref={ref}
      className={['ds-mention-text', className].filter(Boolean).join(' ')}
    >
      {splitMentions(text, sources).map((segment, index) =>
        segment.type === 'mention' ? (
          // Segments never reorder: the text is re-split whole on every change
          <Mention key={index} trigger={segment.trigger}>
            {segment.item.label}
          </Mention>
        ) : (
          <React.Fragment key={index}>{segment.text}</React.Fragment>
        ),
      )}
    </span>
  ),
);

MentionText.displayName = 'MentionText';

/* ============================================
   MENTION MENU — the list a trigger opens
   ============================================ */

type MentionMenuOwnProps = {
  /** The items to list, already filtered and ordered. */
  items: MentionItem[];
  /** The `id` of the highlighted item: the one Enter would choose. */
  activeId?: string;
  /** Fires with an item's `id` when the pointer moves onto it. */
  onActiveChange?: (id: string) => void;
  /** Fires with the item a person chose. */
  onSelect?: (item: MentionItem) => void;
  /** The text typed so far. The part of each label that matches it is drawn stronger. */
  query?: string;
  /** Accessible name for the list. */
  label?: string;
  /** Shown in place of the list when `items` is empty. Without it an empty menu renders nothing. */
  emptyText?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
};

export interface MentionMenuProps
  extends MentionMenuOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof MentionMenuOwnProps | 'children'> {}

const renderLabel = (label: string, query: string) => {
  const needle = query.trim().toLowerCase();
  const at = needle === '' ? -1 : label.toLowerCase().indexOf(needle);
  if (at < 0) return label;
  return (
    <>
      {label.slice(0, at)}
      <span className="ds-mention-menu__match">{label.slice(at, at + needle.length)}</span>
      {label.slice(at + needle.length)}
    </>
  );
};

/**
 * MentionMenu is the list a trigger character opens. It never takes focus:
 * the caret stays in the field the person is typing in, which owns the
 * arrow keys and points `aria-activedescendant` at the highlighted row
 * (`mentionOptionId` builds the id). The menu draws the rows, follows the
 * pointer, and reports a choice.
 *
 * Composer wires all of this itself through its `mentions` prop. Reach for
 * MentionMenu directly to build the pattern on another field.
 */
export const MentionMenu = React.forwardRef<HTMLDivElement, MentionMenuProps>(
  (
    {
      items,
      activeId,
      onActiveChange,
      onSelect,
      query = '',
      label = 'Suggestions',
      emptyText,
      className = '',
      id,
      onMouseDown,
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-mention-menu';
    const generatedId = React.useId();
    const menuId = id ?? generatedId;
    const listRef = useRef<HTMLDivElement | null>(null);

    /* Keep the highlighted row in view by moving the list alone. scrollIntoView
       would walk every scrollable ancestor and could shift the page under a
       person who is only pressing an arrow key. */
    useLayoutEffect(() => {
      const list = listRef.current;
      if (!list || activeId === undefined) return;
      const row = list.querySelector<HTMLElement>('[aria-selected="true"]');
      if (!row) return;
      const top = row.offsetTop;
      const bottom = top + row.offsetHeight;
      if (top < list.scrollTop) list.scrollTop = top;
      else if (bottom > list.scrollTop + list.clientHeight) {
        list.scrollTop = bottom - list.clientHeight;
      }
    }, [activeId, items]);

    if (items.length === 0 && !emptyText) return null;

    /* A press on the menu must not blur the field it serves: focus leaving
       is what closes the menu, and the click would land on nothing. */
    const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
      onMouseDown?.(event);
      event.preventDefault();
    };

    return (
      <div
        {...rest}
        ref={ref}
        id={menuId}
        className={[baseClass, query.trim() !== '' ? `${baseClass}--filtered` : '', className]
          .filter(Boolean)
          .join(' ')}
        onMouseDown={handleMouseDown}
      >
        {items.length === 0 ? (
          <div className={`${baseClass}__empty`} role="status">
            {emptyText}
          </div>
        ) : (
          <div
            ref={listRef}
            id={mentionListboxId(menuId)}
            className={`${baseClass}__list`}
            role="listbox"
            aria-label={label}
            /* A region that can scroll has to be reachable from the keyboard
               on its own terms. In normal use the field owns the keys and
               takes Tab as "choose", so this stop is only ever met by
               someone who went looking for it. */
            tabIndex={0}
          >
            {items.map((item) => {
              const active = item.id === activeId;
              return (
                <div
                  key={item.id}
                  id={mentionOptionId(menuId, item.id)}
                  className={[
                    `${baseClass}__option`,
                    active ? `${baseClass}__option--active` : '',
                    item.disabled ? `${baseClass}__option--disabled` : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  role="option"
                  aria-selected={active}
                  aria-disabled={item.disabled || undefined}
                  /* Move, not enter: a list scrolling under a resting pointer
                     must not steal the highlight from the arrow keys */
                  onMouseMove={
                    item.disabled || active ? undefined : () => onActiveChange?.(item.id)
                  }
                  onClick={item.disabled ? undefined : () => onSelect?.(item)}
                >
                  {item.icon !== undefined && (
                    <span className={`${baseClass}__icon`} aria-hidden="true">
                      {typeof item.icon === 'string' ? (
                        <span className="material-symbols-rounded">{item.icon}</span>
                      ) : (
                        item.icon
                      )}
                    </span>
                  )}
                  <span className={`${baseClass}__label`}>{renderLabel(item.label, query)}</span>
                  {item.description && (
                    <span className={`${baseClass}__description`}>{item.description}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  },
);

MentionMenu.displayName = 'MentionMenu';
