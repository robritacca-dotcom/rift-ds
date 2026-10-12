import { componentMetadata, type ComponentMeta } from "rift-ds/components/registry";
import { chatWidgetRegistry } from "rift-ds/chat";

/**
 * Every page under /components, as one list: the library components from
 * src/components/registry.json, then the chat widget from
 * src/chat/registry.json, which joins the category it names. The sidebar,
 * the index sections, the page metadata, the install strip and the FAB
 * summaries all read this list rather than the component registry alone,
 * so the widget's page is a component page everywhere a visitor meets it
 * while COMPONENT_COUNT still counts only components. The validators that
 * hold component pages (website-surfaces, page-titles, page-summaries,
 * component-md) merge the two registries the same way.
 */
const widgetPages: ComponentMeta[] = chatWidgetRegistry.widgets.map((widget) => ({
  name: widget.name,
  label: widget.label,
  slug: widget.slug,
  description: widget.description,
  category: widget.category,
  client: true,
}));

export const componentPages: readonly ComponentMeta[] = [...componentMetadata, ...widgetPages];

const widgetSlugs = new Set(widgetPages.map((widget) => widget.slug));

/** True for a /components slug that is the chat widget rather than a library component. */
export const isWidgetSlug = (slug: string): boolean => widgetSlugs.has(slug);
