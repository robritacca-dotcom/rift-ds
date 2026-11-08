"use client";

/**
 * ShaderScene, loaded only when a page asks for it.
 *
 * BlurBackground mounts from the root layout, so anything it imports
 * statically ships on every page. ShaderScene (its renderer and both
 * scenes' GLSL) is only ever drawn when the home page's switch picks
 * Horizon or the playground stages a scene into a frame, so it stays out
 * of that shared bundle and arrives as its own chunk. The home switch
 * calls `loadShaderScene` on hover and focus, so the chunk is usually in
 * hand before the click lands.
 *
 * One promise for the visit: every caller shares the same load, and a
 * failed load clears it so the next ask tries again.
 */
import { useEffect, useState } from "react";

type SceneModule = typeof import("rift-ds/components/ShaderScene/ShaderScene");

let loaded: SceneModule | null = null;
let pending: Promise<SceneModule> | null = null;

/** Starts loading ShaderScene (once); resolves with the module. */
export function loadShaderScene(): Promise<SceneModule> {
  pending ??= import("rift-ds/components/ShaderScene/ShaderScene").then(
    (module) => (loaded = module),
    (error: unknown) => {
      pending = null;
      throw error;
    },
  );
  return pending;
}

/** The ShaderScene module once `needed` has been true and it has loaded; null until then. */
export function useShaderSceneModule(needed: boolean): SceneModule | null {
  const [module, setModule] = useState<SceneModule | null>(loaded);
  useEffect(() => {
    if (!needed || module) return;
    let current = true;
    loadShaderScene().then(
      (next) => {
        if (current) setModule(next);
      },
      () => {},
    );
    return () => {
      current = false;
    };
  }, [needed, module]);
  return module;
}
