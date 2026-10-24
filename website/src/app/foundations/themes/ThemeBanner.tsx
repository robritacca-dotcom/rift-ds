"use client";

import { useEffect, useRef, useState } from "react";
import {
  ShaderField,
  type ShaderParams,
} from "rift-ds/components/ShaderField/ShaderField";
import { shaderBackground } from "@/data/shader-background";
import styles from "./ThemeBanner.module.css";

/* The site field's look, refitted for a card-sized strip: the whole
   composition fitted to the banner (crop 0, the small-tile setting) and
   lifted in intensity, since a strip this short has to read at a glance. */
const BANNER_PARAMS: Partial<ShaderParams> = {
  ...shaderBackground.params,
  intensity: 0.85,
  crop: 0,
};

/**
 * A shader banner: the site's ambient field in the theme of the scope it
 * sits in. The theme gallery's cards and the specimen page both wear it.
 * The scope (see scoped-theme.ts), and ShaderField reads its
 * colours from the canvas's computed style, so every banner paints its own
 * theme's accents and surfaces whichever theme the page is wearing.
 *
 * The field mounts only while the card is on screen. Browsers cap live WebGL
 * contexts, the site background already holds one, and ShaderField releases
 * its context on unmount, so a gallery of any length stays under the cap.
 * A gradient of the same accents sits underneath as the resting state.
 */
export function ThemeBanner({ className }: { className?: string }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "120px" }
    );
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={frameRef}
      className={className ? `${styles.banner} ${className}` : styles.banner}
      aria-hidden="true"
    >
      <div className={styles.bannerFallback} />
      {visible && (
        <ShaderField params={BANNER_PARAMS} blobs={shaderBackground.blobs} />
      )}
    </div>
  );
}
