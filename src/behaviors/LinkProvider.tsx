'use client';

import React, { createContext, useContext } from 'react';

/**
 * The props a link component receives: every anchor attribute, the ref, and
 * an `href` that is always a string. Next.js's `Link` takes these as they
 * are; a router whose link takes `to` instead needs a one-line adapter:
 * `({ href, ...props }) => <RouterLink to={href} {...props} />`.
 */
export type LinkComponentProps = React.ComponentPropsWithRef<'a'> & { href: string };

/** A component that renders a link in place of a plain `<a>`, such as a router's. */
export type LinkComponent = React.ElementType<LinkComponentProps>;

const LinkContext = createContext<LinkComponent | null>(null);

export interface LinkProviderProps {
  /**
   * The link component every rift-ds link under this provider renders, such
   * as Next.js's `Link`. Named like the instance prop it stands in for.
   */
  linkComponent: LinkComponent;
  /** The part of the app whose links it applies to, usually the whole app. */
  children?: React.ReactNode;
}

/**
 * Sets the link component for every client-rendered rift-ds component below
 * it that takes an `href`, so their links navigate through the app's router
 * instead of reloading the page. A component's own `linkComponent` prop
 * wins over it. The link components that can render on the server cannot
 * read a provider and take the prop alone (design.md's Components intro
 * names them, and scripts/validate-component-contract.mjs keeps them off
 * the provider).
 */
export function LinkProvider({ linkComponent, children }: LinkProviderProps) {
  return <LinkContext.Provider value={linkComponent}>{children}</LinkContext.Provider>;
}

/**
 * The link component to render: the component's own `linkComponent` prop,
 * else the nearest LinkProvider's, else a plain `<a>`.
 */
// The hook shares the provider's private context, so the two live in one module.
// eslint-disable-next-line react-refresh/only-export-components
export function useLinkComponent(override?: LinkComponent): LinkComponent {
  const provided = useContext(LinkContext);
  return override ?? provided ?? 'a';
}
