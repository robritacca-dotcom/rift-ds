"use client";

import { useSyncExternalStore } from "react";
import type { ChatBackdrop } from "rift-ds/chat";
import {
  DEFAULT_CHAT_BACKDROP,
  DEFAULT_LAYOUTS,
  readChatBackdrop,
  readTemplateLayout,
  subscribeTemplateLayout,
  type TemplateLayout,
  type TemplateLayoutScope,
} from "@/lib/templateLayout";

/** The visitor's layout for a scope of screens; the scope's default on the server and first paint. */
export function useTemplateLayout(scope: TemplateLayoutScope = "templates"): TemplateLayout {
  return useSyncExternalStore(
    subscribeTemplateLayout,
    () => readTemplateLayout(scope),
    () => DEFAULT_LAYOUTS[scope],
  );
}

/** The chat home's flush backdrop; the default on the server and first paint. */
export function useChatBackdrop(): ChatBackdrop {
  return useSyncExternalStore(subscribeTemplateLayout, readChatBackdrop, () => DEFAULT_CHAT_BACKDROP);
}
