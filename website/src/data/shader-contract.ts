/**
 * What a shader scene's GLSL is handed and must define, read from the
 * library's one record of it (src/components/ShaderScene/contract.json),
 * which scripts/validate-shader-contract.mjs holds to the engine. The
 * shaders guide prints its tables from here and types none of them.
 */

import contract from "../../../src/components/ShaderScene/contract.json";

/** One uniform every scene is handed. */
export interface ShaderUniform {
  name: string;
  type: string;
  /** Set when the uniform exists only for a scene that declares that field. */
  when?: string;
  description: string;
}

/** One GLSL function a scene can call. */
export interface ShaderHelper {
  signature: string;
  description: string;
}

export const SHADER_ENTRY: string = contract.entry;
export const SHADER_ENTRY_DESCRIPTION: string = contract.entryDescription;
export const SHADER_GLSL_VERSION: string = contract.glsl;
export const SHADER_UNIFORMS: ShaderUniform[] = contract.uniforms;
export const SHADER_HELPERS: ShaderHelper[] = contract.helpers;
export const SHADER_PARAM_UNIFORM: string = contract.paramUniform;
