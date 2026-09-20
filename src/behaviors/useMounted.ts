'use client';

import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

/**
 * False during SSR and the hydration render, true afterwards — the guard a
 * portal component needs before touching `document.body`. Uses
 * `useSyncExternalStore` rather than a mount effect so the client's first
 * render matches the server HTML without an extra render pass.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
