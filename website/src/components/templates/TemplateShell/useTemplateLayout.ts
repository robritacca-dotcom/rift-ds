"use client";

import { useSyncExternalStore } from "react";
import {
  DEFAULT_TEMPLATE_LAYOUT,
  readTemplateLayout,
  subscribeTemplateLayout,
  type TemplateLayout,
} from "@/lib/templateLayout";

/** The visitor's template layout; the default on the server and first paint. */
export function useTemplateLayout(): TemplateLayout {
  return useSyncExternalStore(
    subscribeTemplateLayout,
    readTemplateLayout,
    () => DEFAULT_TEMPLATE_LAYOUT,
  );
}
