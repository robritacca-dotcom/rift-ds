'use client';

/**
 * A virtualised table body's rows: only the rows in view and a few either
 * side are drawn, between two spacer rows that hold the scroll height of
 * the rest. Each drawn row is measured as it lands, so rows of any height
 * scroll true. The virtualiser lives here, apart from DataTable, because
 * the React Compiler leaves a component that calls it unoptimised, and
 * this keeps that to the rows alone. Internal: DataTable draws it.
 */

import { useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

export interface VirtualRowsProps {
  /** How many rows (and open details) there are. */
  count: number;
  /** A stable key per item. */
  itemKey: (index: number) => string;
  /** A row's height before it is measured. */
  estimate: number;
  /** Rows drawn past each edge of the view. */
  overscan: number;
  /** The element the rows scroll inside. */
  frame: HTMLDivElement | null;
  /** The frame's height on the server, where there is nothing to measure. */
  frameHeight: number;
  /** How many columns a spacer row spans. */
  columnCount: number;
  /** Draws one item, given its index and the ref that measures it. */
  renderItem: (index: number, measure: (node: Element | null) => void) => React.ReactNode;
  /** Hands the table a way to scroll an item into view, for the keyboard. */
  onScroller: (scrollTo: (index: number) => void) => void;
}

export function VirtualRows({
  count,
  itemKey,
  estimate,
  overscan,
  frame,
  frameHeight,
  columnCount,
  renderItem,
  onScroller,
}: VirtualRowsProps) {
  // eslint-disable-next-line react-hooks/incompatible-library -- the virtualiser is why this component stands apart
  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => frame,
    estimateSize: () => estimate,
    overscan,
    getItemKey: itemKey,
    initialRect: { width: 0, height: frameHeight },
  });
  useEffect(() => {
    onScroller((index) => virtualizer.scrollToIndex(index, { align: 'auto' }));
  }, [onScroller, virtualizer]);

  const drawn = virtualizer.getVirtualItems();
  const before = drawn.length ? drawn[0].start : 0;
  const after = drawn.length ? virtualizer.getTotalSize() - drawn[drawn.length - 1].end : 0;
  return (
    <>
      {before > 0 && (
        <tr aria-hidden="true" className="ds-data-table__spacer">
          <td colSpan={columnCount} style={{ height: before }} />
        </tr>
      )}
      {drawn.map((item) => renderItem(item.index, virtualizer.measureElement))}
      {after > 0 && (
        <tr aria-hidden="true" className="ds-data-table__spacer">
          <td colSpan={columnCount} style={{ height: after }} />
        </tr>
      )}
    </>
  );
}
