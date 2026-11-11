"use client";

import { useEffect, useRef, useState } from "react";
import { ShaderScene } from "rift-ds/components/ShaderScene/ShaderScene";

/**
 * The Components showcase's cover: the library's ShaderScene playing the
 * horizon, clipped to the card. The header is on every page and the site
 * already runs one WebGL background, so the scene is enabled only while
 * its panel is open: a closed panel holds no canvas and no GL context, and
 * closing it tears the context down. ShaderScene holds a still frame for
 * reduced motion on its own. Decorative; the card's copy carries the
 * meaning.
 */
export function SceneCover() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const panel = hostRef.current?.closest(".ds-mega-menu");
    if (!panel) return;
    const sync = () => setOpen(panel.classList.contains("ds-mega-menu--open"));
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(panel, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={hostRef} aria-hidden="true">
      <ShaderScene scene="horizon" enabled={open} />
    </div>
  );
}
