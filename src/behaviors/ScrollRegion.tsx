'use client';

/**
 * A scroll container that is a keyboard stop only while it actually
 * scrolls. A table wider than its column scrolls sideways, and a keyboard
 * user can only scroll what can take focus, so while it overflows the
 * wrapper becomes `role="region"`, named by the caption inside it, with
 * `tabIndex={0}`. While it fits it is a plain div: a focus stop that
 * scrolls nothing would only be one more Tab press. Overflow is measured
 * on mount and whenever the wrapper or its content resizes.
 *
 * Internal to the library (not a published subpath); Table's bordered
 * wrapper is the first user, so Table itself stays server-renderable.
 */

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';

export function ScrollRegion({
  className,
  style,
  children,
}: {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const captionId = useId();
  const [overflows, setOverflows] = useState(false);
  const [labelledBy, setLabelledBy] = useState<string | undefined>();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const caption = node.querySelector('caption');
    if (caption) {
      if (!caption.id) caption.id = captionId;
      setLabelledBy(caption.id);
    }
    const measure = () => setOverflows(node.scrollWidth > node.clientWidth + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    if (node.firstElementChild) observer.observe(node.firstElementChild);
    return () => observer.disconnect();
  }, [captionId]);

  return (
    <div
      ref={ref}
      className={className}
      style={style}
      role={overflows ? 'region' : undefined}
      aria-labelledby={overflows ? labelledBy : undefined}
      tabIndex={overflows ? 0 : undefined}
    >
      {children}
    </div>
  );
}
