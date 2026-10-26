'use client';

/**
 * `useColorMode`, the client half of colour mode (see `colorMode.tsx`): the
 * visitor's setting and the one way to change it.
 */
import { useCallback, useSyncExternalStore } from 'react';
import {
  DEFAULT_COLOR_MODE_STORAGE_KEY,
  isColorModeSetting,
  type ColorModeOptions,
  type ColorModeSetting,
} from './colorMode';

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme-setting'],
  });
  window.addEventListener('storage', callback);
  return () => {
    observer.disconnect();
    window.removeEventListener('storage', callback);
  };
}

function getSnapshot(): ColorModeSetting {
  const value = document.documentElement.getAttribute('data-theme-setting');
  return isColorModeSetting(value) ? value : 'system';
}

/** The server renders `system`: the pre-paint script sets the real value before hydration reads it. */
function getServerSnapshot(): ColorModeSetting {
  return 'system';
}

/**
 * The visitor's colour-mode setting and the one way to change it. Setting it
 * resolves `system` against the operating system, writes both attributes on
 * `<html>` and stores the choice; every instance updates through the
 * attribute, so no two controls can disagree.
 */
export function useColorMode({
  storageKey = DEFAULT_COLOR_MODE_STORAGE_KEY,
}: ColorModeOptions = {}): [setting: ColorModeSetting, setSetting: (setting: ColorModeSetting) => void] {
  const setting = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setSetting = useCallback(
    (next: ColorModeSetting) => {
      const root = document.documentElement;
      root.setAttribute('data-theme-setting', next);
      const resolved =
        next === 'system'
          ? window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light'
          : next;
      root.setAttribute('data-theme', resolved);
      try {
        localStorage.setItem(storageKey, next);
      } catch {
        // Storage unavailable: the choice lasts the page, which is all a private window allows.
      }
    },
    [storageKey],
  );

  return [setting, setSetting];
}
