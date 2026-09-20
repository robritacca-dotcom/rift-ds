'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import './TreeView.css';
import '../../fonts/material-symbols.css';

export interface TreeViewNode {
  /** Unique identifier for the node */
  id: string;
  /** Text shown on the row */
  label: string;
  /** Material Symbol name; defaults to `folder` for branches and `draft` for leaves */
  icon?: string;
  /** Child nodes; a non-empty list makes the node an expandable branch */
  children?: TreeViewNode[];
}

/** Props owned by TreeView itself — everything else falls through to the root <ul>. */
type TreeViewOwnProps = {
  /** Tree data to render */
  nodes: TreeViewNode[];
  /** IDs of initially expanded branches (uncontrolled) */
  defaultExpandedIds?: string[];
  /** Expanded branch IDs (controlled) — pair with `onExpandedChange` */
  expandedIds?: string[];
  /** Called with the full list of expanded branch IDs whenever a branch toggles */
  onExpandedChange?: (ids: string[]) => void;
  /** Selected node ID (controlled) — pair with `onSelect` */
  selectedId?: string;
  /** ID of the initially selected node (uncontrolled) */
  defaultSelectedId?: string;
  /**
   * Called with the node's ID when a row is selected via click, Enter, or
   * Space. Intentionally shadows the native `select` event handler, which
   * has no meaning on a tree widget.
   */
  onSelect?: (id: string) => void;
  /** Additional CSS classes */
  className?: string;
};

export interface TreeViewProps
  extends TreeViewOwnProps,
    Omit<React.ComponentPropsWithoutRef<'ul'>, keyof TreeViewOwnProps> {}

/** A node counts as a branch only when it actually has children to show. */
const isBranchNode = (node: TreeViewNode): boolean =>
  Array.isArray(node.children) && node.children.length > 0;

/**
 * TreeView renders a collapsible hierarchy — files, folders, and other
 * nested structures — as a WAI-ARIA tree. Branches expand and collapse,
 * one node can be selected, and a roving tabindex gives the whole tree a
 * single tab stop with full arrow-key navigation. Expansion and selection
 * each work controlled or uncontrolled.
 */
export const TreeView = React.forwardRef<HTMLUListElement, TreeViewProps>(
  (
    {
      nodes,
      defaultExpandedIds = [],
      expandedIds,
      onExpandedChange,
      selectedId,
      defaultSelectedId,
      onSelect,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-treeview';
    const baseId = React.useId();

    const [internalExpanded, setInternalExpanded] = useState<Set<string>>(
      () => new Set(defaultExpandedIds),
    );
    const [internalSelected, setInternalSelected] = useState<string | undefined>(
      defaultSelectedId,
    );
    const [focusedId, setFocusedId] = useState<string | undefined>(undefined);

    const expandedSet = useMemo(
      () => (expandedIds !== undefined ? new Set(expandedIds) : internalExpanded),
      [expandedIds, internalExpanded],
    );
    const selected = selectedId !== undefined ? selectedId : internalSelected;

    const itemRefs = useRef(new Map<string, HTMLLIElement>());

    // Stable per-node index for generated label ids (node ids are consumer
    // strings and may not be valid inside an id attribute).
    const indexById = useMemo(() => {
      const map = new Map<string, number>();
      let i = 0;
      const walk = (list: TreeViewNode[]) => {
        for (const node of list) {
          map.set(node.id, i);
          i += 1;
          if (node.children) walk(node.children);
        }
      };
      walk(nodes);
      return map;
    }, [nodes]);

    const parentById = useMemo(() => {
      const map = new Map<string, string | undefined>();
      const walk = (list: TreeViewNode[], parent?: string) => {
        for (const node of list) {
          map.set(node.id, parent);
          if (node.children) walk(node.children, node.id);
        }
      };
      walk(nodes);
      return map;
    }, [nodes]);

    // The flattened list of nodes currently visible (collapsed subtrees are
    // not rendered), in document order — the path Arrow keys walk.
    const visibleNodes = useMemo(() => {
      const out: TreeViewNode[] = [];
      const walk = (list: TreeViewNode[]) => {
        for (const node of list) {
          out.push(node);
          if (isBranchNode(node) && expandedSet.has(node.id)) walk(node.children!);
        }
      };
      walk(nodes);
      return out;
    }, [nodes, expandedSet]);

    // Roving tabindex: exactly one visible item is tabbable.
    const visibleIds = useMemo(
      () => new Set(visibleNodes.map((node) => node.id)),
      [visibleNodes],
    );
    const tabbableId =
      focusedId !== undefined && visibleIds.has(focusedId)
        ? focusedId
        : selected !== undefined && visibleIds.has(selected)
          ? selected
          : visibleNodes[0]?.id;

    const commitExpanded = useCallback(
      (next: Set<string>) => {
        if (expandedIds === undefined) setInternalExpanded(next);
        onExpandedChange?.(Array.from(next));
      },
      [expandedIds, onExpandedChange],
    );

    const toggleBranch = useCallback(
      (id: string) => {
        const next = new Set(expandedSet);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        commitExpanded(next);
      },
      [expandedSet, commitExpanded],
    );

    const selectNode = useCallback(
      (id: string) => {
        if (selectedId === undefined) setInternalSelected(id);
        onSelect?.(id);
      },
      [selectedId, onSelect],
    );

    const focusNode = useCallback((id: string | undefined) => {
      if (id === undefined) return;
      setFocusedId(id);
      itemRefs.current.get(id)?.focus();
    }, []);

    const handleKeyDown = (
      event: React.KeyboardEvent<HTMLLIElement>,
      node: TreeViewNode,
    ) => {
      const branch = isBranchNode(node);
      const expanded = expandedSet.has(node.id);
      const index = visibleNodes.findIndex((n) => n.id === node.id);
      let handled = true;

      switch (event.key) {
        case 'ArrowDown':
          focusNode(visibleNodes[index + 1]?.id);
          break;
        case 'ArrowUp':
          focusNode(visibleNodes[index - 1]?.id);
          break;
        case 'ArrowRight':
          if (branch && !expanded) {
            toggleBranch(node.id);
          } else if (branch && expanded) {
            focusNode(node.children![0]?.id);
          }
          break;
        case 'ArrowLeft':
          if (branch && expanded) {
            toggleBranch(node.id);
          } else {
            focusNode(parentById.get(node.id));
          }
          break;
        case 'Home':
          focusNode(visibleNodes[0]?.id);
          break;
        case 'End':
          focusNode(visibleNodes[visibleNodes.length - 1]?.id);
          break;
        case 'Enter':
        case ' ':
          selectNode(node.id);
          break;
        default:
          handled = false;
      }

      if (handled) {
        // Stop here so ancestor tree items never re-process the same key.
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const renderNode = (node: TreeViewNode, depth: number): React.ReactNode => {
      const branch = isBranchNode(node);
      const expanded = branch && expandedSet.has(node.id);
      const isSelected = selected === node.id;
      const labelId = `${baseId}-label-${indexById.get(node.id)}`;
      const icon = node.icon ?? (branch ? 'folder' : 'draft');

      const rowClasses = [
        `${baseClass}__row`,
        isSelected && `${baseClass}__row--selected`,
      ]
        .filter(Boolean)
        .join(' ');

      return (
        <li
          key={node.id}
          role="treeitem"
          aria-expanded={branch ? expanded : undefined}
          aria-selected={isSelected}
          aria-labelledby={labelId}
          tabIndex={node.id === tabbableId ? 0 : -1}
          className={`${baseClass}__item`}
          ref={(el) => {
            if (el) {
              itemRefs.current.set(node.id, el);
            } else {
              itemRefs.current.delete(node.id);
            }
          }}
          onKeyDown={(event) => handleKeyDown(event, node)}
          onFocus={(event) => {
            event.stopPropagation();
            setFocusedId(node.id);
          }}
          onClick={(event) => {
            event.stopPropagation();
            if (branch) toggleBranch(node.id);
            selectNode(node.id);
            focusNode(node.id);
          }}
        >
          <div
            className={rowClasses}
            style={{ '--ds-treeview-depth': depth } as React.CSSProperties}
          >
            {branch ? (
              <span
                className={`${baseClass}__chevron material-symbols-rounded`}
                aria-hidden="true"
              >
                chevron_right
              </span>
            ) : (
              <span
                className={`${baseClass}__chevron ${baseClass}__chevron--spacer`}
                aria-hidden="true"
              />
            )}
            <span
              className={`${baseClass}__icon material-symbols-rounded`}
              aria-hidden="true"
            >
              {icon}
            </span>
            <span id={labelId} className={`${baseClass}__label`}>
              {node.label}
            </span>
          </div>
          {expanded && (
            <ul role="group" className={`${baseClass}__group`}>
              {node.children!.map((child) => renderNode(child, depth + 1))}
            </ul>
          )}
        </li>
      );
    };

    const classes = [baseClass, className].filter(Boolean).join(' ');

    return (
      <ul {...rest} ref={ref} role="tree" className={classes}>
        {nodes.map((node) => renderNode(node, 0))}
      </ul>
    );
  },
);

TreeView.displayName = 'TreeView';
