/**
 * The template family's shell layout: the floating rail with centred
 * content, or the flush rail with the content in an inset surface. One
 * choice for every template (TemplateShell reads it, the sidebar footer's
 * switch writes it), kept in localStorage so it follows the visitor between
 * templates and survives a reload. Same-tab changes reach every reader
 * through a window event; other tabs through the storage event.
 */
import type { AppSidebarLayout } from "rift-ds/components/AppSidebar/AppSidebar";

export type TemplateLayout = Extract<AppSidebarLayout, "floating" | "inset">;

export const TEMPLATE_LAYOUTS: readonly { value: TemplateLayout; label: string; icon: string }[] = [
  { value: "floating", label: "Floating", icon: "view_sidebar" },
  { value: "inset", label: "Inset", icon: "space_dashboard" },
];

export const DEFAULT_TEMPLATE_LAYOUT: TemplateLayout = "inset";

const STORAGE_KEY = "template-layout";
const CHANGE_EVENT = "template-layout-change";

const isLayout = (value: string | null): value is TemplateLayout =>
  TEMPLATE_LAYOUTS.some((layout) => layout.value === value);

/** The stored layout, or the default when none (or an unknown one) is kept. */
export function readTemplateLayout(): TemplateLayout {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isLayout(stored) ? stored : DEFAULT_TEMPLATE_LAYOUT;
  } catch {
    return DEFAULT_TEMPLATE_LAYOUT;
  }
}

export function setTemplateLayout(layout: TemplateLayout) {
  try {
    localStorage.setItem(STORAGE_KEY, layout);
  } catch {
    /* private mode: the pick only lasts until the next change event */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeTemplateLayout(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}
