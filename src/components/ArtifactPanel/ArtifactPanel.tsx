'use client';

import React, { useId, useState } from 'react';
import { IconButton } from '../IconButton/IconButton';
import { CodeBlock, type CodeBlockProps, type CodeLine } from '../CodeBlock/CodeBlock';
import { SegmentedControl } from '../SegmentedControl/SegmentedControl';
import './ArtifactPanel.css';
import '../../fonts/material-symbols.css';
import { mirrorClass } from '../../behaviors/direction';

/** Which face of the artifact is on stage. */
export type ArtifactPanelView = 'preview' | 'code';

/** Props owned by ArtifactPanel itself — everything else falls through to the root `<section>`. */
type ArtifactPanelOwnProps = {
  /** The artifact's name, shown in the header and used as the panel's accessible name. Collides with the native `title` tooltip attribute on purpose: a panel has a heading, not a tooltip. Required for the `panel` layout; an `inline` example may leave it out, and is then named by `viewLabel`. */
  title?: React.ReactNode;
  /**
   * Where it sits. `panel` (the default) fills the box a host gives it,
   * beside a conversation, and the host paints the card. `inline` is a
   * self-contained frame in the flow of a page, sized by its content: its
   * own card, a centred preview stage, and the source a switch away, the
   * live example of a component's documentation.
   */
  layout?: 'panel' | 'inline';
  /** The source highlighted, as `highlight()` from `rift-ds/code/highlight` returns it, passed to the code view's CodeBlock. Offers the Code view on its own; `code`, when also given, is the text the copy button copies. */
  lines?: CodeLine[];
  /** A quiet line beside the name: what kind of thing this is, or which version. */
  meta?: React.ReactNode;
  /** Leading mark in the header — Material Symbol name (string) or custom element (ReactNode). */
  icon?: string | React.ReactNode;
  /** The preview, as live React content. Wins over `html` and `src`. */
  children?: React.ReactNode;
  /** The preview, as a complete HTML document drawn in a sandboxed frame. Wins over `src`. A document that honours `prefers-color-scheme` follows the `color-scheme` of the page around the panel, so set that with your theme and the preview turns light or dark with it. */
  html?: string;
  /** The preview, as a URL drawn in a sandboxed frame: a deployed page, a site. */
  src?: string;
  /** The frame's `sandbox` tokens for `html` and `src`. The default lets a document run its own scripts and forms in an origin of its own, with no reach into the host page; widen it only for a source you trust. */
  sandbox?: string;
  /** Accessible name for the preview frame. Defaults to the title when that is a string. */
  frameTitle?: string;
  /** The artifact's source. Given, the header offers a Code view beside the preview (or shows the code alone when there is no preview). */
  code?: string;
  /** The source's language, shown on the code view. */
  language?: string;
  /** The view on stage, when the host owns the state. */
  view?: ArtifactPanelView;
  /** The view the panel opens on when it keeps its own state. */
  defaultView?: ArtifactPanelView;
  /** Fires with the chosen view. */
  onViewChange?: (view: ArtifactPanelView) => void;
  /** Whether the host is showing the panel at its expanded size. The panel never sizes itself: this only picks the toggle's icon and name. */
  expanded?: boolean;
  /** Fires with the next state when the expand toggle is pressed. The toggle renders only when this is given. */
  onExpandedChange?: (expanded: boolean) => void;
  /** Fires when the close button is pressed. The button renders only when this is given. */
  onClose?: () => void;
  /** Extra header controls, seated ahead of the expand and close buttons: a download, a share, a version menu. */
  actions?: React.ReactNode;
  /** Label for the preview segment of the view switch. */
  previewLabel?: string;
  /** Label for the code segment of the view switch. */
  codeLabel?: string;
  /** Accessible name for the view switch. */
  viewLabel?: string;
  /** Accessible name for the expand toggle while the panel is at its resting size. */
  expandLabel?: string;
  /** Accessible name for the expand toggle while the panel is expanded. */
  collapseLabel?: string;
  /** Accessible name for the close button. */
  closeLabel?: string;
  /** The words the code view's CodeBlock writes, merged over its English defaults: the copy button's name and text ("Copy code", "Copy", "Copied") and the code region's name ("Code: <language>"). */
  codeBlockLabels?: Pick<CodeBlockProps, 'copyLabel' | 'copyText' | 'copiedLabel' | 'codeLabel'>;
  /** Additional CSS classes */
  className?: string;
};

export interface ArtifactPanelProps
  extends ArtifactPanelOwnProps,
    Omit<React.ComponentPropsWithoutRef<'section'>, keyof ArtifactPanelOwnProps> {}

const baseClass = 'ds-artifact-panel';

/**
 * ArtifactPanel is the surface a chat opens beside the conversation to show
 * something it made: a dashboard, a document, a page, a site. A header names
 * the artifact and carries its controls; the body is the preview, drawn from
 * live React content, a sandboxed HTML document or a URL, with the source one
 * switch away when there is any.
 *
 * Surface-less like AgentRail and ThreadPanel: it fills the box the host
 * gives it and the host paints the card around it. Where it sits and how
 * large it runs are the host's too, so `expanded` and `onClose` only report
 * intent.
 */
export const ArtifactPanel = React.forwardRef<HTMLElement, ArtifactPanelProps>(
  (
    {
      title,
      layout = 'panel',
      lines,
      meta,
      icon,
      children,
      html,
      src,
      sandbox = 'allow-scripts allow-forms',
      frameTitle,
      code,
      language,
      view,
      defaultView,
      onViewChange,
      expanded = false,
      onExpandedChange,
      onClose,
      actions,
      previewLabel = 'Preview',
      codeLabel = 'Code',
      viewLabel = 'Artifact view',
      expandLabel = 'Expand the artifact',
      collapseLabel = 'Collapse the artifact',
      closeLabel = 'Close the artifact',
      codeBlockLabels,
      className = '',
      ...rest
    },
    ref
  ) => {
    const titleId = useId();
    const hasPreview = Boolean(children) || html !== undefined || Boolean(src);
    const hasCode = code !== undefined || lines !== undefined;

    const [ownView, setOwnView] = useState<ArtifactPanelView>(defaultView ?? 'preview');
    const wanted = view ?? ownView;
    /* A view the artifact cannot show falls back to the one it can, so a
       host swapping artifacts under a standing choice never lands on an
       empty body. */
    const current: ArtifactPanelView =
      wanted === 'code' ? (hasCode ? 'code' : 'preview') : hasPreview ? 'preview' : 'code';

    const changeView = (next: string) => {
      const chosen = next === 'code' ? 'code' : 'preview';
      setOwnView(chosen);
      onViewChange?.(chosen);
    };

    const frameName = frameTitle ?? (typeof title === 'string' ? title : previewLabel);

    return (
      <section
        ref={ref}
        aria-label={title ? undefined : viewLabel}
        {...rest}
        className={[baseClass, layout === 'inline' ? `${baseClass}--inline` : '', className].filter(Boolean).join(' ')}
        aria-labelledby={title ? titleId : undefined}
      >
        <header className={`${baseClass}__header`}>
          <div className={`${baseClass}__heading`}>
            {icon !== undefined &&
              (typeof icon === 'string' ? (
                <span className={`${baseClass}__icon material-symbols-rounded ${mirrorClass(icon)}`} aria-hidden="true">
                  {icon}
                </span>
              ) : (
                <span className={`${baseClass}__icon`}>{icon}</span>
              ))}
            {title && (
              <h2 className={`${baseClass}__title`} id={titleId}>
                {title}
              </h2>
            )}
            {meta && <span className={`${baseClass}__meta`}>{meta}</span>}
          </div>
          <div className={`${baseClass}__controls`}>
            {hasPreview && hasCode && (
              <SegmentedControl
                size="compact"
                tone="neutral"
                aria-label={viewLabel}
                segments={[
                  { value: 'preview', label: previewLabel },
                  { value: 'code', label: codeLabel },
                ]}
                value={current}
                onValueChange={changeView}
              />
            )}
            {actions}
            {onExpandedChange && (
              <IconButton
                icon={expanded ? 'collapse_content' : 'expand_content'}
                variant="tertiary"
                label={expanded ? collapseLabel : expandLabel}
                tooltipPosition="bottom"
                aria-pressed={expanded}
                onClick={() => onExpandedChange(!expanded)}
              />
            )}
            {onClose && (
              <IconButton
                icon="close"
                variant="tertiary"
                label={closeLabel}
                tooltipPosition="bottom"
                onClick={onClose}
              />
            )}
          </div>
        </header>

        <div className={`${baseClass}__body`} data-view={current}>
          {current === 'code' && hasCode ? (
            <div className={`${baseClass}__code`}>
              <CodeBlock {...codeBlockLabels} code={code} lines={lines} language={language} />
            </div>
          ) : children ? (
            <div className={`${baseClass}__content`}>{children}</div>
          ) : html !== undefined ? (
            <iframe
              className={`${baseClass}__frame`}
              title={frameName}
              srcDoc={html}
              sandbox={sandbox}
              referrerPolicy="no-referrer"
            />
          ) : src ? (
            <iframe
              className={`${baseClass}__frame`}
              title={frameName}
              src={src}
              sandbox={sandbox}
              referrerPolicy="no-referrer"
              loading="lazy"
            />
          ) : null}
        </div>
      </section>
    );
  }
);

ArtifactPanel.displayName = 'ArtifactPanel';
