/** Every scene the playground offers, in picker order: the site's Field look-alike (for its tile and its defaults; the live Field is ShaderField) and the library's ShaderScene scenes. */
import { field } from "./field";
import { SHADER_SCENES } from "rift-ds/components/ShaderScene/ShaderScene";

export const SCENES = [field, ...SHADER_SCENES];
