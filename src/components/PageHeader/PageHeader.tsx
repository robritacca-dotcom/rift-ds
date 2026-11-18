import React from 'react';
import type { LinkComponent } from '../../behaviors/LinkProvider';
import { Breadcrumb, type BreadcrumbItem } from '../Breadcrumb/Breadcrumb';
import { Heading } from '../Heading/Heading';
import './PageHeader.css';

/** Props owned by PageHeader itself; everything else falls through to the root `<header>`. */
type PageHeaderOwnProps = {
  /**
   * The page's title, its heading.
   * Note: this shadows the native `title` tooltip attribute, which PageHeader does not expose.
   */
  title: React.ReactNode;
  /** A sentence under the title on what the page is for or what it holds. */
  description?: React.ReactNode;
  /** The trail above the title, from the top of the app to this page; the last item is this page and takes no `href`. */
  breadcrumb?: BreadcrumbItem[];
  /** The page's own actions at the end of the title row: one primary Button, a secondary or two. On a narrow page they take the row under the text. */
  actions?: React.ReactNode;
  /** The heading's place in the outline. The page's title is its `h1`; a header inside a tab or a pane can be an `h2`. */
  headingLevel?: 1 | 2;
  /**
   * The component the breadcrumb's links render with, such as Next.js's
   * `Link`, so they navigate through the app's router; a plain `<a>` when
   * unset. This component can render on the server, so it never reads a
   * LinkProvider: pass the prop even under one.
   */
  linkComponent?: LinkComponent;
  /** Additional CSS classes */
  className?: string;
};

export interface PageHeaderProps
  extends PageHeaderOwnProps,
    Omit<React.ComponentPropsWithRef<'header'>, keyof PageHeaderOwnProps | 'children'> {}

/**
 * The top of a page: where it sits, what it is called, what it is for, and
 * what can be done from it. Breadcrumb, Heading and the page's own actions in
 * one layout that folds the actions under the text when the header is narrow.
 * Inside `<main>` the `<header>` is no landmark, so it takes no name of its
 * own; the heading names the page. Server-renderable.
 */
export function PageHeader({
  title,
  description,
  breadcrumb,
  actions,
  headingLevel = 1,
  linkComponent,
  className = '',
  ref,
  ...rest
}: PageHeaderProps) {
  const hasDescription = description != null && description !== false && description !== '';
  const hasActions = actions != null && actions !== false;
  const classes = ['ds-page-header', className].filter(Boolean).join(' ');
  return (
    <header {...rest} ref={ref} className={classes}>
      {breadcrumb && breadcrumb.length > 0 && (
        <Breadcrumb items={breadcrumb} linkComponent={linkComponent} className="ds-page-header__breadcrumb" />
      )}
      <div className="ds-page-header__row">
        <div className="ds-page-header__text">
          <Heading level={headingLevel} className="ds-page-header__title">
            {title}
          </Heading>
          {hasDescription && <p className="ds-page-header__description">{description}</p>}
        </div>
        {hasActions && <div className="ds-page-header__actions">{actions}</div>}
      </div>
    </header>
  );
}
