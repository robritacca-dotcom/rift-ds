/**
 * Waits for a WebGL program to finish linking without making the page wait
 * for it.
 *
 * A browser compiles and links a shader away from the main thread, and the
 * first question that needs the answer (`COMPILE_STATUS`, `LINK_STATUS`, a
 * uniform's location, a draw) stops the main thread until the work is done.
 * On a driver that translates the shader first (Direct3D on Windows) that
 * is a tenth of a second for a small program and seconds for a large one,
 * during which the page answers no press, scroll or key.
 *
 * `KHR_parallel_shader_compile` adds the one question that never waits:
 * whether the work has finished. This asks it once a frame and calls `done`
 * when the answer is yes, so every status read after it returns at once.
 * The rule for a caller: after `linkProgram`, touch nothing about the
 * program or its shaders until `done` runs, and read the statuses there.
 *
 * Without the extension `done` runs at once and the caller's status read
 * waits as it always did. On a context that is lost before the link ends
 * `done` still runs: the statuses then read as failed, which is the truth.
 *
 * Returns a cancel, for a caller that unmounts first; a cancelled wait
 * never calls `done`. `scripts/validate-shader-linking.mjs` holds every
 * `linkProgram` in the library and the site to this.
 */
export function whenProgramLinked(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  done: () => void
): () => void {
  const parallel = gl.getExtension('KHR_parallel_shader_compile');
  if (!parallel) {
    done();
    return () => {};
  }
  let frame = 0;
  const ask = () => {
    if (gl.isContextLost() || gl.getProgramParameter(program, parallel.COMPLETION_STATUS_KHR)) {
      frame = 0;
      done();
      return;
    }
    frame = requestAnimationFrame(ask);
  };
  ask();
  return () => cancelAnimationFrame(frame);
}
