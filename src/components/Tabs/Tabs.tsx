'use client';

import React, { useState } from 'react';
import './Tabs.css';
import '../../fonts/material-symbols.css';

export interface Tab {
  /** Unique tab identifier */
  value: string;
  /** Display label */
  label: string;
  /** Optional icon — Material Symbol name (string) or custom element (ReactNode) */
  icon?: string | React.ReactNode;
  /** Whether this tab is disabled */
  disabled?: boolean;
}

/** Props owned by Tabs itself — everything else falls through to the tablist. */
type TabsOwnProps = {
  /** Array of tab definitions */
  tabs: Tab[];
  /**
   * Value of the selected tab, for a controlled set. Leave it undefined to let
   * the component keep its own selection, seeded from `defaultValue`.
   */
  value?: string;
  /**
   * Value of the tab selected on first render when the set is uncontrolled.
   * Falls back to the first enabled tab.
   */
  defaultValue?: string;
  /** Called with the value of the tab the user selects */
  onValueChange?: (value: string) => void;
  /**
   * Legacy name for `value`.
   *
   * @deprecated Use `value` instead.
   */
  activeTab?: string;
  /**
   * Legacy change callback; fires alongside `onValueChange`.
   *
   * @deprecated Use `onValueChange` instead.
   */
  onTabChange?: (value: string) => void;
  /** Visual size */
  size?: 'default' | 'compact';
  /** Whether tabs fill the available width */
  fullWidth?: boolean;
  /** Additional CSS classes */
  className?: string;
  /**
   * Legacy accessible-name prop for the tab list.
   *
   * @deprecated Pass the native `aria-label` attribute instead.
   */
  ariaLabel?: string;
};

export interface TabsProps
  extends TabsOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof TabsOwnProps | 'children'> {}

/**
 * Tabs switch between related views in one place.
 *
 * Forwards a ref to the `role="tablist"` element, which is the component's
 * only wrapper, and spreads unrecognised props onto it. The list is named
 * "Tabs" unless a native `aria-label` or `aria-labelledby` says otherwise.
 */
export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      tabs,
      value,
      defaultValue,
      onValueChange,
      activeTab,
      onTabChange,
      size = 'default',
      fullWidth = false,
      className = '',
      ariaLabel,
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-tabs';
    const sizeClass = `${baseClass}--${size}`;
    const fullWidthClass = fullWidth ? `${baseClass}--full-width` : '';

    // `activeTab` is the deprecated spelling of `value`.
    const controlledValue = value ?? activeTab;
    const isControlled = controlledValue !== undefined;
    const [internalValue, setInternalValue] = useState<string>(
      () => defaultValue ?? tabs.find((t) => !t.disabled)?.value ?? '',
    );
    const selectedValue = isControlled ? controlledValue : internalValue;

    const select = (next: string) => {
      if (!isControlled) setInternalValue(next);
      onValueChange?.(next);
      onTabChange?.(next);
    };

    const classes = [baseClass, sizeClass, fullWidthClass, className]
      .filter(Boolean)
      .join(' ');

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
      const enabledTabs = tabs.filter((t) => !t.disabled);
      const currentEnabledIndex = enabledTabs.findIndex((t) => t.value === tabs[index].value);

      let targetTab: Tab | undefined;

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          targetTab = enabledTabs[(currentEnabledIndex + 1) % enabledTabs.length];
          break;
        case 'ArrowLeft':
          e.preventDefault();
          targetTab = enabledTabs[(currentEnabledIndex - 1 + enabledTabs.length) % enabledTabs.length];
          break;
        case 'Home':
          e.preventDefault();
          targetTab = enabledTabs[0];
          break;
        case 'End':
          e.preventDefault();
          targetTab = enabledTabs[enabledTabs.length - 1];
          break;
      }

      if (targetTab) {
        select(targetTab.value);
        // Focus the new tab button
        const tabList = (e.target as HTMLElement).parentElement;
        const targetEl = tabList?.querySelector(
          `[data-tab-value="${CSS.escape(targetTab.value)}"]`,
        ) as HTMLElement | null;
        targetEl?.focus();
      }
    };

    return (
      <div
        aria-label={ariaLabel ?? 'Tabs'}
        {...rest}
        ref={ref}
        className={classes}
        role="tablist"
      >
        {tabs.map((tab, index) => {
          const isActive = tab.value === selectedValue;
          const tabClass = [
            `${baseClass}__tab`,
            isActive ? `${baseClass}__tab--active` : '',
            tab.disabled ? `${baseClass}__tab--disabled` : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <button
              key={tab.value}
              type="button"
              className={tabClass}
              role="tab"
              aria-selected={isActive}
              aria-disabled={tab.disabled}
              tabIndex={isActive ? 0 : -1}
              data-tab-value={tab.value}
              onClick={() => !tab.disabled && select(tab.value)}
              onKeyDown={(e) => handleKeyDown(e, index)}
            >
              {tab.icon &&
                (typeof tab.icon === 'string' ? (
                  <span className={`${baseClass}__icon material-symbols-rounded`} aria-hidden="true">
                    {tab.icon}
                  </span>
                ) : (
                  <span className={`${baseClass}__icon`} aria-hidden="true">
                    {tab.icon}
                  </span>
                ))}
              <span className={`${baseClass}__label`}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    );
  },
);

Tabs.displayName = 'Tabs';
