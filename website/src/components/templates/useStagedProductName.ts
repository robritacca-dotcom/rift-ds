"use client";

import { useSyncExternalStore } from "react";

/**
 * The product name a template shows, overridable by the playground.
 *
 * The playground stages a template in a same-origin iframe and mirrors its
 * levers onto the frame's root element; its Product name lever rides along
 * as `data-product-name`. A template reads it here and falls back to its
 * own name, so the same screen at its own route is unchanged. An attribute
 * rather than a URL parameter, so typing a name never reloads the frame.
 */
const ATTR = "data-product-name";

const subscribe = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: [ATTR],
  });
  return () => observer.disconnect();
};

export function useStagedProductName(fallback: string): string {
  return useSyncExternalStore(
    subscribe,
    () => document.documentElement.getAttribute(ATTR) || fallback,
    () => fallback,
  );
}

export const STAGED_PRODUCT_NAME_ATTR = ATTR;
