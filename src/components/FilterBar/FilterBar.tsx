'use client';

import React, { useCallback, useId, useRef, useState } from 'react';
import { CheckboxIndicator } from '../Checkbox/Checkbox';
import { ChosenMark } from '../Dropdown/Dropdown';
import { useLayer } from '../../behaviors/useLayer';
import { useAnchoredPosition } from '../../behaviors/useAnchoredPosition';
import './FilterBar.css';
import '../../fonts/material-symbols.css';

/** One choice inside a filter's popover. */
export interface FilterBarOption {
  /** Stored value, reported through `onValuesChange`. */
  value: string;
  /** Display label. */
  label: string;
}

/** One filter: a chip on the bar with a popover of options behind it. */
export interface FilterBarFilter {
  /** Stable key for this filter — the key under which its values are reported. */
  id: string;
  /** Chip label, e.g. "Status". */
  label: string;
  /** Icon shown before the label — Material Symbol name (string) or custom element (ReactNode). */
  icon?: string | React.ReactNode;
  /** The choices this filter offers. */
  options: FilterBarOption[];
  /**
   * Whether several options can be active at once. Defaults to true; set it
   * to false for a single-select filter, which closes on choice.
   */
  multiple?: boolean;
}

/** Props owned by FilterBar itself — everything else falls through to the root div. */
type FilterBarOwnProps = {
  /** The filters on the bar, in display order. */
  filters: FilterBarFilter[];
  /** Active options per filter id (controlled). Pair with `onValuesChange`. */
  values?: Record<string, string[]>;
  /** Active options per filter id (uncontrolled initial state). */
  defaultValues?: Record<string, string[]>;
  /**
   * Fires with the full active-filter map on every change. Filters with
   * nothing active are absent from the map, so an empty object means
   * unfiltered.
   */
  onValuesChange?: (values: Record<string, string[]>) => void;
  /** Label for the button that clears every filter at once. */
  clearLabel?: string;
  /** Accessible name of an active filter's own clear button, given the filter's label. Defaults to "Clear" followed by the label. */
  clearFilterLabel?: (filterLabel: string) => string;
  /** Component size */
  size?: 'default' | 'compact';
  /** Additional CSS classes */
  className?: string;
};

export interface FilterBarProps
  extends FilterBarOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof FilterBarOwnProps | 'children'> {}

/**
 * FilterBar — a row of filter chips for narrowing a collection: each chip
 * opens a popover of options, active filters show their choice and grow a
 * clear button, and a clear-all appears once anything is active. State is one
 * map of filter id to active values, controlled or uncontrolled, so wiring it
 * to a DataTable is a single callback. Popovers are real listboxes: arrow
 * keys move, Enter and Space toggle, Escape closes, focus never leaves the
 * chip.
 */
export const FilterBar = React.forwardRef<HTMLDivElement, FilterBarProps>(
  (
    {
      filters,
      values,
      defaultValues,
      onValuesChange,
      clearLabel = 'Clear all',
      clearFilterLabel = (filterLabel: string) => `Clear ${filterLabel}`,
      size = 'default',
      className = '',
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-filter-bar';
    const generatedId = useId();

    const [uncontrolledValues, setUncontrolledValues] = useState<Record<string, string[]>>(
      defaultValues ?? {},
    );
    const [openId, setOpenId] = useState<string | null>(null);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const filterRefs = useRef(new Map<string, HTMLDivElement>());
    // The open filter's chip and listbox: one popover is open at a time, so
    // one placement follows whichever chip opened it.
    const openChipRef = useRef<HTMLSpanElement | null>(null);
    const openPanelRef = useRef<HTMLUListElement | null>(null);

    // Placed against the chip by the shared anchored-position behaviour, as
    // Dropdown's list is: fixed, at least the chip's width, flipped above
    // when there is no room below, capped to the room it has.
    useAnchoredPosition({
      open: openId !== null,
      target: openId,
      anchorRef: openChipRef,
      panelRef: openPanelRef,
      side: 'bottom',
      align: 'start',
      gapProperty: '--gap-050',
      fitHeight: true,
      matchWidth: true,
    });

    const activeValues = values ?? uncontrolledValues;

    const applyValues = (next: Record<string, string[]>) => {
      if (values === undefined) setUncontrolledValues(next);
      onValuesChange?.(next);
    };

    const closePopover = useCallback(() => {
      setOpenId(null);
      setFocusedIndex(-1);
    }, []);

    /* A press outside the open filter closes its popover, through the shared
       layer stack, so it never also closes a Dialog the bar sits in. */
    useLayer({
      open: openId !== null,
      onDismiss: closePopover,
      dismissOnOutsidePress: true,
      getElements: () => [openId ? filterRefs.current.get(openId) : null],
    });

    const toggleOption = (filter: FilterBarFilter, optionValue: string) => {
      const current = activeValues[filter.id] ?? [];
      let nextForFilter: string[];
      if (filter.multiple === false) {
        nextForFilter = current[0] === optionValue ? [] : [optionValue];
      } else {
        nextForFilter = current.includes(optionValue)
          ? current.filter((v) => v !== optionValue)
          : [...current, optionValue];
      }
      const next = { ...activeValues };
      if (nextForFilter.length > 0) next[filter.id] = nextForFilter;
      else delete next[filter.id];
      applyValues(next);
      if (filter.multiple === false) closePopover();
    };

    const clearFilter = (filterId: string) => {
      const next = { ...activeValues };
      delete next[filterId];
      applyValues(next);
      if (openId === filterId) closePopover();
    };

    const handleTriggerClick = (filter: FilterBarFilter) => {
      setFocusedIndex(-1);
      setOpenId((current) => (current === filter.id ? null : filter.id));
    };

    const handleTriggerKeyDown = (e: React.KeyboardEvent, filter: FilterBarFilter) => {
      const isOpen = openId === filter.id;
      switch (e.key) {
        case 'Enter':
        case ' ':
          // preventDefault stops the synthesised click from re-toggling.
          e.preventDefault();
          if (!isOpen) {
            setOpenId(filter.id);
            setFocusedIndex(0);
          } else if (focusedIndex >= 0) {
            toggleOption(filter, filter.options[focusedIndex].value);
          } else {
            closePopover();
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (!isOpen) {
            setOpenId(filter.id);
            setFocusedIndex(0);
          } else {
            setFocusedIndex((prev) => Math.min(prev + 1, filter.options.length - 1));
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (isOpen) setFocusedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Home':
          if (isOpen) {
            e.preventDefault();
            setFocusedIndex(0);
          }
          break;
        case 'End':
          if (isOpen) {
            e.preventDefault();
            setFocusedIndex(filter.options.length - 1);
          }
          break;
        case 'Escape':
          // Handled: the layer stack leaves a prevented Escape alone, so
          // closing the popover does not also close a Dialog around it.
          if (isOpen) {
            e.preventDefault();
            closePopover();
          }
          break;
        case 'Tab':
          closePopover();
          break;
      }
    };

    /** Chip caption: bare label, "Label: Option" for one, "Label: n" for more. */
    const summarize = (filter: FilterBarFilter) => {
      const active = activeValues[filter.id] ?? [];
      if (active.length === 0) return filter.label;
      if (active.length === 1) {
        const option = filter.options.find((o) => o.value === active[0]);
        return `${filter.label}: ${option?.label ?? active[0]}`;
      }
      return `${filter.label}: ${active.length}`;
    };

    const anyActive = filters.some((f) => (activeValues[f.id] ?? []).length > 0);

    const classes = [baseClass, size === 'compact' && `${baseClass}--compact`, className]
      .filter(Boolean)
      .join(' ');

    return (
      <div {...rest} ref={ref} className={classes}>
        {filters.map((filter) => {
          const isOpen = openId === filter.id;
          const active = activeValues[filter.id] ?? [];
          const isActive = active.length > 0;
          const listboxId = `${generatedId}-${filter.id}-listbox`;
          const activeDescendant =
            isOpen && focusedIndex >= 0
              ? `${generatedId}-${filter.id}-option-${focusedIndex}`
              : undefined;

          const chipClasses = [
            `${baseClass}__chip`,
            isActive && `${baseClass}__chip--active`,
            isOpen && `${baseClass}__chip--open`,
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <div
              key={filter.id}
              className={`${baseClass}__filter`}
              ref={(node) => {
                if (node) filterRefs.current.set(filter.id, node);
                else filterRefs.current.delete(filter.id);
              }}
            >
              <span
                className={chipClasses}
                ref={
                  isOpen
                    ? (node) => {
                        openChipRef.current = node;
                      }
                    : undefined
                }
              >
                <button
                  type="button"
                  className={`${baseClass}__trigger`}
                  aria-haspopup="listbox"
                  aria-expanded={isOpen}
                  aria-controls={isOpen ? listboxId : undefined}
                  aria-activedescendant={activeDescendant}
                  onClick={() => handleTriggerClick(filter)}
                  onKeyDown={(e) => handleTriggerKeyDown(e, filter)}
                >
                  {filter.icon &&
                    (typeof filter.icon === 'string' ? (
                      <span
                        className={`${baseClass}__icon material-symbols-rounded`}
                        aria-hidden="true"
                      >
                        {filter.icon}
                      </span>
                    ) : (
                      <span className={`${baseClass}__icon`} aria-hidden="true">
                        {filter.icon}
                      </span>
                    ))}
                  <span className={`${baseClass}__summary`}>{summarize(filter)}</span>
                  <span
                    className={`${baseClass}__caret material-symbols-rounded`}
                    aria-hidden="true"
                  >
                    expand_more
                  </span>
                </button>
                {isActive && (
                  <button
                    type="button"
                    className={`${baseClass}__chip-clear`}
                    aria-label={clearFilterLabel(filter.label)}
                    onClick={() => clearFilter(filter.id)}
                  >
                    <span className="material-symbols-rounded" aria-hidden="true">
                      close
                    </span>
                  </button>
                )}
              </span>
              {isOpen && (
                <ul
                  ref={openPanelRef}
                  id={listboxId}
                  className={`${baseClass}__panel`}
                  role="listbox"
                  aria-label={filter.label}
                  aria-multiselectable={filter.multiple !== false || undefined}
                >
                  {filter.options.map((option, index) => {
                    const selected = active.includes(option.value);
                    const optionClasses = [
                      `${baseClass}__option`,
                      selected && `${baseClass}__option--selected`,
                      index === focusedIndex && `${baseClass}__option--focused`,
                    ]
                      .filter(Boolean)
                      .join(' ');
                    return (
                      <li
                        key={option.value}
                        id={`${generatedId}-${filter.id}-option-${index}`}
                        className={optionClasses}
                        role="option"
                        aria-selected={selected}
                        onClick={() => toggleOption(filter, option.value)}
                      >
                        {/* Picked independently: the checkbox's own box leads
                            each row. One at a time: the chosen mark trails
                            the selected row, the listbox convention. */}
                        {filter.multiple !== false && (
                          <CheckboxIndicator
                            className={`${baseClass}__option-check`}
                            checked={selected}
                            size="compact"
                          />
                        )}
                        {option.label}
                        {filter.multiple === false && selected && <ChosenMark />}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
        {anyActive && (
          <button
            type="button"
            className={`${baseClass}__clear-all`}
            onClick={() => applyValues({})}
          >
            {clearLabel}
          </button>
        )}
      </div>
    );
  },
);

FilterBar.displayName = 'FilterBar';
