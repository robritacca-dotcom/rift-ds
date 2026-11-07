"use client";

/**
 * A template's shader slot, following the playground's pick
 * (lib/shaders/staged). With a lib/shaders scene staged, the slot paints it
 * with ShaderScene; otherwise it renders the template's own shader through
 * `field`, handed Field's staged settings when the playground has moved
 * them. At the template's own route nothing is staged, so the slot is
 * exactly the template's own shader.
 */

import type React from "react";
import { SHADER_SCENES, ShaderScene, type ShaderSceneId } from "rift-ds/components/ShaderScene/ShaderScene";
import { useStagedFieldParams, useStagedSceneId, useStagedValues } from "@/lib/shaders/staged";

export default function StagedShader({
  className,
  field,
}: {
  /** The slot's own box: it positions the surface the way it positions the field. */
  className?: string;
  /** The template's own shader, given Field's staged settings when there are any. */
  field: (params: Record<string, number> | undefined) => React.ReactNode;
}) {
  const sceneId = useStagedSceneId();
  const params = useStagedFieldParams();
  const values = useStagedValues();
  const scene = sceneId && sceneId !== "field" ? SHADER_SCENES.find((s) => s.id === sceneId) : undefined;
  if (!scene) return <>{field(params)}</>;
  return (
    <div className={className}>
      <ShaderScene scene={scene.id as ShaderSceneId} liveRef={values} />
    </div>
  );
}
