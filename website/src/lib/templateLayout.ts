/**
 * The template screens' shell layout, one of the three app shell modes
 * (rift-ds's shell recipe): `flush`, the rail on the shell colour behind a
 * hairline with the content crisp beside it; `floating`, the glass rail
 * with centred content; `inset`, the flush rail with the content in a
 * raised inset surface.
 *
 * Two scopes, each its own choice with its own default, because the two
 * kinds of screen open best in different modes: `templates`, every
 * app-shell template (TemplateShell reads it), inset by default; and
 * `chat`, the chat home, flush by default. The chat home alone carries a
 * backdrop for its flush layout, blur by default (the live site chat's
 * look) or solid: blur says a chat rests above something, and a template is
 * always the floor of its page, so it has none. The sidebar footer's switch
 * writes its screen's scope.
 * The page width (TemplateWidth) is a choice of its own for the templates,
 * set beside the layout and independent of it.
 * Each is kept in localStorage so it follows the visitor between screens of
 * its kind and survives a reload. Same-tab changes reach every reader
 * through a window event; other tabs through the storage event.
 */
import type { AppSidebarLayout } from "rift-ds/components/AppSidebar/AppSidebar";
import type { ChatBackdrop } from "rift-ds/chat";

export type TemplateLayout = AppSidebarLayout;
export type TemplateLayoutScope = "templates" | "chat";

export const TEMPLATE_LAYOUTS: readonly { value: TemplateLayout; label: string; icon: string }[] = [
  { value: "flush", label: "Flush", icon: "vertical_split" },
  { value: "floating", label: "Floating", icon: "view_sidebar" },
  { value: "inset", label: "Inset", icon: "space_dashboard" },
];

/**
 * How wide a template's page runs, an axis apart from the layout (the shell
 * recipe's width axis): `contained` centres the content at the screen's own
 * width, `full` runs it the whole column, in any of the three layouts.
 */
export type TemplateWidth = "contained" | "full";

export const TEMPLATE_WIDTHS: readonly { value: TemplateWidth; label: string; icon: string }[] = [
  { value: "contained", label: "Contained", icon: "width_normal" },
  { value: "full", label: "Full width", icon: "width_full" },
];

export const DEFAULT_TEMPLATE_WIDTH: TemplateWidth = "contained";

/** The chat home's flush backdrops. */
export const CHAT_BACKDROPS: readonly { value: ChatBackdrop; label: string; icon: string }[] = [
  { value: "solid", label: "Solid", icon: "rectangle" },
  { value: "blur", label: "Blur", icon: "blur_on" },
];

/** Each scope's opening mode, before the visitor picks one. */
export const DEFAULT_LAYOUTS: Record<TemplateLayoutScope, TemplateLayout> = {
  templates: "inset",
  chat: "flush",
};

/** The chat home's opening flush backdrop. */
export const DEFAULT_CHAT_BACKDROP: ChatBackdrop = "blur";

const LAYOUT_KEYS: Record<TemplateLayoutScope, string> = {
  templates: "template-layout",
  chat: "chat-layout",
};
const CHAT_BACKDROP_KEY = "chat-backdrop";
const WIDTH_KEY = "template-width";
const CHANGE_EVENT = "template-layout-change";

const isLayout = (value: string | null): value is TemplateLayout =>
  TEMPLATE_LAYOUTS.some((layout) => layout.value === value);

const isWidth = (value: string | null): value is TemplateWidth =>
  TEMPLATE_WIDTHS.some((width) => width.value === value);

const isBackdrop = (value: string | null): value is ChatBackdrop =>
  CHAT_BACKDROPS.some((backdrop) => backdrop.value === value);

function read<T extends string>(key: string, valid: (value: string | null) => value is T, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return valid(stored) ? stored : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* private mode: the pick only lasts until the next change event */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** The scope's stored layout, or its default when none (or an unknown one) is kept. */
export function readTemplateLayout(scope: TemplateLayoutScope = "templates"): TemplateLayout {
  return read(LAYOUT_KEYS[scope], isLayout, DEFAULT_LAYOUTS[scope]);
}

export function setTemplateLayout(layout: TemplateLayout, scope: TemplateLayoutScope = "templates") {
  write(LAYOUT_KEYS[scope], layout);
}

/** The templates' stored page width, or the default when none (or an unknown one) is kept. */
export function readTemplateWidth(): TemplateWidth {
  return read(WIDTH_KEY, isWidth, DEFAULT_TEMPLATE_WIDTH);
}

export function setTemplateWidth(width: TemplateWidth) {
  write(WIDTH_KEY, width);
}

/** The chat home's stored flush backdrop, or the default when none (or an unknown one) is kept. */
export function readChatBackdrop(): ChatBackdrop {
  return read(CHAT_BACKDROP_KEY, isBackdrop, DEFAULT_CHAT_BACKDROP);
}

/** Stores the chat home's flush backdrop; readers hear it through the same change event as the layout. */
export function setChatBackdrop(backdrop: ChatBackdrop) {
  write(CHAT_BACKDROP_KEY, backdrop);
}

export function subscribeTemplateLayout(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}
