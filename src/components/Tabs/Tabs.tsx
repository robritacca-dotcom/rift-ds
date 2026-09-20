'use client';

import React from 'react';
import './Tabs.css';
import '../../fonts/material-symbols.css';

export interface Tab {
  /** Unique tab identifier */
  value: string;
  /** Display label */
  label: string;
  /** Optional Material Symbol icon name */
  icon?: string;
  /** Whether this tab is disabled */
  disabled?: boolean;
}

export interface TabsProps {
  /** Array of tab definitions */
  tabs: Tab[];
  /** Currently active tab value */
  activeTab: string;
  /** Callback when tab is selected */
  onTabChange?: (value: string) => void;
  /** Visual size */
  size?: 'default' | 'compact';
  /** Whether tabs fill the available width */
  fullWidth?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Accessible label for the tab list */
  ariaLabel?: string;
}

export const Tabs = ({
  tabs,
  activeTab,
  onTabChange,
  size = 'default',
  fullWidth = false,
  className = '',
  ariaLabel = 'Tabs',
}: TabsProps) => {
  const baseClass = 'ds-tabs';
  const sizeClass = `${baseClass}--${size}`;
  const fullWidthClass = fullWidth ? `${baseClass}--full-width` : '';

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

    if (targetTab && onTabChange) {
      onTabChange(targetTab.value);
      // Focus the new tab button
      const tabList = (e.target as HTMLElement).parentElement;
      const targetEl = tabList?.querySelector(`[data-tab-value="${targetTab.value}"]`) as HTMLElement;
      targetEl?.focus();
    }
  };

  return (
    <div className={classes} role="tablist" aria-label={ariaLabel}>
      {tabs.map((tab, index) => {
        const isActive = tab.value === activeTab;
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
            onClick={() => !tab.disabled && onTabChange?.(tab.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          >
            {tab.icon && (
              <span className={`${baseClass}__icon material-symbols-rounded`} aria-hidden="true">
                {tab.icon}
              </span>
            )}
            <span className={`${baseClass}__label`}>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
