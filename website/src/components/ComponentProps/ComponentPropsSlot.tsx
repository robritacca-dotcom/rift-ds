"use client";

import { createContext, useContext } from "react";

/**
 * Carries a component page's server-rendered Props section down to where the
 * page shows it. The component pages are client components, and the prop
 * reference (website/src/data/component-api.generated.ts) is far too large
 * to bundle into them, so the section is rendered on the server by
 * ComponentPageLayout, which each component page's layout.tsx wraps its
 * children in, and handed through this context as finished markup. ComponentInstallStrip reads it, which is how
 * every component page gets the section with no page work.
 */
const ComponentPropsContext = createContext<React.ReactNode>(null);

export function ComponentPropsProvider({
  section,
  children,
}: {
  /** The rendered Props section for the current component page, or null off one. */
  section: React.ReactNode;
  children: React.ReactNode;
}) {
  return <ComponentPropsContext.Provider value={section}>{children}</ComponentPropsContext.Provider>;
}

/** The current component page's rendered Props section. */
export const useComponentProps = (): React.ReactNode => useContext(ComponentPropsContext);
