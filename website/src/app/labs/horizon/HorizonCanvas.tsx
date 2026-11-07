"use client";

/**
 * The horizon behind the chat: an abstract planet limb at night, built as a
 * stack of soft light the way ShaderField builds the home page field. A
 * level arc, convex upward, crowns just below the middle of the stage, and
 * light gathers along it in wide one-sided Gaussian layers: a deep blue
 * scatter climbing into the dark, a pale veil, a broad amber halo over a
 * brighter core, and a coral underglow bleeding into the night side. Each
 * layer carries its own slow texture (curtains across the arc, bands along
 * it, soft veils on the dark side), so the band reads as many blended
 * layers rather than a picture. Below the limb the night side is a world
 * in perspective: broad land masses with meandering coasts, faster cloud
 * decks lit pink near the limb, wind bands along the curve, and one soft
 * beam fanning down from the sun, which sits fixed at the apex of the arc,
 * cooling as it goes; further down the night side settles into deep ocean
 * blue.
 *
 * It moves: a domain warp flows through the whole field, the textures drift
 * at their own speeds. The limb, the sun and its beam hold still. The bottom
 * of the stage fades into the page ground, and the top does too, more
 * gradually, so space reads as black. The grain
 * is the home page shader's own: an integer hash per pixel, animated, at
 * the same strength.
 *
 * The colours are the theme's accent tokens resolved from the live cascade
 * (cobalt for the scatter, amber and gold for the halo and core, coral for
 * the underglow) over the page ground, so a preset repaints it. A visitor
 * who prefers reduced motion gets one still frame.
 */

import React from "react";

const TOKENS = {
  ground: "--color-bg-page-primary",
  scatter: "--color-core-accent-cobalt",
  halo: "--color-core-accent-amber",
  rim: "--color-core-accent-coral",
  sun: "--color-core-accent-gold",
} as const;

/** Field seconds per wall second, as ShaderField's `speed` scales time. */
const SPEED = 1.6;

/** Grain strength: the home page field's 0.11 (shader-background.json), raised a fifth, then half again. */
const GRAIN = 0.198;

type Rgb = [number, number, number];

const VERTEX = /* glsl */ `#version 300 es
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}
`;

const FRAGMENT = /* glsl */ `#version 300 es
precision highp float;

uniform vec2 u_size;     // drawing buffer, device px
uniform float u_time;    // field seconds
uniform float u_grain;
uniform float u_crown;  // the arc's apex, fraction of the stage from the bottom
uniform vec2 u_fade;    // the bottom fade, from solid ground to full strength
uniform vec3 u_ground;   // all colours arrive in linear RGB
uniform vec3 u_scatter;
uniform vec3 u_halo;
uniform vec3 u_rim;
uniform vec3 u_sun;

out vec4 outColor;

/* ShaderField's integer hash: no fract(sin()) patterning, no lines. */
uint ihash(uvec2 p) {
  p = p * uvec2(73333u, 7777u) ^ (p.yx >> 3u);
  uint h = p.x ^ (p.y * 2654435761u);
  h ^= h >> 15u;
  h *= 2246822519u;
  h ^= h >> 13u;
  return h;
}

float rnd(ivec2 p) {
  return float(ihash(uvec2(p)) >> 8) * (1.0 / 16777216.0);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  ivec2 c = ivec2(i) + 4096;
  return mix(
    mix(rnd(c), rnd(c + ivec2(1, 0)), u.x),
    mix(rnd(c + ivec2(0, 1)), rnd(c + ivec2(1, 1)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float s = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    s += a * vnoise(p);
    p = p * 2.02 + vec2(17.0, 9.0);
    a *= 0.5;
  }
  return s;
}

/* A one-sided Gaussian: one sigma toward the sky, another toward the dark. */
float lobe(float d, float skySigma, float darkSigma) {
  float s = d > 0.0 ? skySigma : darkSigma;
  return exp(-(d * d) / (2.0 * s * s));
}

void main() {
  float aspect = u_size.x / u_size.y;
  vec2 uv = gl_FragCoord.xy / u_size;
  vec2 p = vec2((uv.x - 0.5) * aspect, uv.y);
  float t = u_time;

  /* Domain warp: the whole field flows. */
  vec2 q = vec2(
    fbm(p * 1.4 + vec2(0.0, t * 0.03)),
    fbm(p * 1.4 + vec2(5.2, 1.3) - t * 0.024)
  );
  vec2 w = p + 0.07 * (q - 0.5);

  /* The limb: a level arc whose centre sits far below, held still. */
  float crown = u_crown;
  float radius = 5.0 * max(aspect, 1.0);
  vec2 centre = vec2(0.0, crown - radius);
  /* The limb itself takes only a whisper of the warp, so the line stays
     crisp while everything around it flows. */
  vec2 wl = p + 0.012 * (q - 0.5);
  float d = length(wl - centre) - radius;   // > 0 toward the sky

  /* The sun sits fixed at the apex of the arc, so the light is brightest
     there and falls away along the limb to either side. */
  float halfW = 0.5 * aspect;
  float sunX = exp(-pow(w.x, 2.0) / (2.0 * 0.28 * 0.28));
  float wide = exp(-pow(w.x, 2.0) / (2.0 * 0.75 * 0.75));
  float energy = 0.4 + 0.45 * wide + 0.9 * sunX;
  float side = clamp(abs(w.x) / halfW, 0.0, 1.0);

  /* Textures, each drifting at its own pace. Curtains run across the arc,
     bands run along it, veils lie soft over the dark side. */
  float curtain = fbm(vec2(w.x * 5.0 + t * 0.05, d * 1.2 - t * 0.02));
  float band = fbm(vec2(w.x * 1.2 - t * 0.035, d * 11.0 + t * 0.015));
  float veil = fbm(vec2(w.x * 2.2 + t * 0.02, d * 3.5 - t * 0.01) + q * 1.5);

  vec3 amber = mix(u_halo, u_sun, 0.35);
  vec3 light = vec3(0.0);

  /* 1. Deep scatter, climbing far into the dark. */
  light += u_scatter * lobe(d - 0.02, 0.24, 0.12) * (0.12 + 0.08 * curtain) * (0.7 + 0.5 * energy);
  /* 2. A pale veil just above the glow, broken into curtains. */
  light += mix(u_scatter, vec3(1.0), 0.35) * lobe(d - 0.05, 0.12, 0.05)
    * (0.06 + 0.16 * smoothstep(0.35, 0.8, curtain)) * energy;
  /* 3. The broad amber halo, banded along its length. */
  light += mix(amber, u_rim, side * 0.4) * lobe(d - 0.01, 0.07, 0.045)
    * (0.35 + 0.35 * band) * energy;
  /* 4. The brighter core, still soft. */
  light += mix(amber, u_sun, 0.3) * lobe(d, 0.02, 0.012) * (0.45 + 0.2 * band) * energy;
  /* 4b. The line: a hair of bright air right on the limb. */
  light += mix(amber, vec3(1.0), 0.35) * lobe(d - 0.002, 0.006, 0.003) * 0.55 * energy;
  /* 5. Coral underglow bleeding into the night side. */
  light += u_rim * lobe(d + 0.03, 0.05, 0.07) * (0.22 + 0.18 * veil) * (0.6 + 0.5 * energy);
  /* The night side swallows the sky layers gradually. */
  light *= 1.0 - 0.8 * smoothstep(0.0, -0.4, d);

  /* ------------------------------------------------------------ world */
  /* The surface is drawn in perspective: depth grows toward the limb, so
     every layer squeezes into the distance and opens toward the viewer.
     Each layer is low-frequency and wide, so it reads as a world under
     haze rather than a picture of one. */
  float below = max(-d, 0.0);
  float sky = max(d, 0.0);
  float onGround = smoothstep(0.002, -0.012, d);
  float z = 1.0 / (below * 2.4 + 0.08);
  vec2 sp = vec2(w.x * z * 0.55, z * 0.5);
  float drift = t * 0.018;

  /* Land: broad masses, warped by their own noise so the coasts meander. */
  vec2 lp = sp * 0.9 + vec2(drift * 0.4, drift);
  float land = fbm(lp + 1.4 * vec2(fbm(lp * 0.7 + 3.1), fbm(lp * 0.7 + 8.4)));
  land = smoothstep(0.42, 0.72, land);
  /* Cloud decks: a brighter, faster layer that swirls over the land. */
  vec2 cp = sp * 1.6 + vec2(-drift * 1.6, drift * 1.3);
  float cloud = fbm(cp + 2.0 * vec2(fbm(cp * 0.5 + q), fbm(cp * 0.5 - q + 5.0)));
  /* A finer deck on top, so the cloud has structure at two scales. */
  vec2 fp = sp * 3.4 + vec2(-drift * 2.4, drift * 1.8) + q * 0.8;
  float fine = fbm(fp + 1.2 * vec2(fbm(fp * 0.6 + 2.3), fbm(fp * 0.6 + 6.1)));
  cloud = smoothstep(0.42, 0.8, cloud);
  cloud = clamp(cloud + 0.55 * smoothstep(0.5, 0.85, fine), 0.0, 1.0);
  /* Wind bands: long soft streaks along the curve. */
  float streaks = fbm(vec2(sp.x * 0.35 - drift * 2.0, sp.y * 4.0));

  /* Light from the limb reaches into the world and dies off toward us. */
  float reach = exp(-below / 0.45);
  float near = exp(-below / 0.07);
  vec3 world = vec3(0.0);
  world += mix(u_ground, u_scatter, 0.5) * land * 0.14 * (0.35 + reach);
  world += mix(u_scatter, vec3(1.0), 0.3) * cloud * 0.48 * reach;
  world += mix(u_rim, amber, 0.4) * cloud * near * 0.6 * energy;
  world += u_scatter * streaks * 0.08 * reach;

  /* The beam: soft shafts fanning down from the sun at the apex. The
     source never moves and the shafts are fixed in angle; they are wide
     and heavily softened, and fall off with distance from the sun. */
  vec2 src = vec2(0.0, crown - 0.005);
  vec2 r = p - src;
  float ang = atan(r.x, -r.y);
  float shafts = smoothstep(0.2, 0.95, fbm(vec2(ang * 1.6, 3.7)));
  /* Narrow toward straight down, so it reads as one beam, not a fan. */
  float cone = exp(-pow(ang, 2.0) / (2.0 * 0.55 * 0.55));
  float dist = length(r);
  float beams = shafts * cone * exp(-dist / 0.6);
  vec3 beamColour = mix(mix(amber, u_sun, 0.3), u_scatter, smoothstep(0.08, 0.45, dist) * 0.7);
  world += beamColour * beams * 0.45 * (0.65 + 0.5 * cloud);

  /* The sun itself: a bloom at the apex, brightest on the limb, spilling a
     little into the sky and further across the ground. */
  float bloomSky = exp(-dot(r, r) / (2.0 * 0.09 * 0.09));
  float bloomWide = exp(-dot(r, r) / (2.0 * 0.28 * 0.28));
  vec3 sunLight = mix(u_sun, vec3(1.0), 0.35);
  light += sunLight * (bloomSky * 0.45 + bloomWide * 0.12);
  world += mix(u_sun, amber, 0.4) * bloomWide * 0.12;

  /* Ocean: away from the limb the night side settles into deep blue,
     brightest where there is no land, with the wind bands moving through
     it, so the lower stage reads as sea rather than a dark smudge. */
  float sea = smoothstep(0.02, 0.16, below) * (1.0 - 0.65 * land);
  vec3 deep = mix(u_scatter, u_ground, 0.2);
  vec3 ocean = deep * sea * (0.16 + 0.07 * streaks + 0.05 * veil + 0.14 * cloud) * onGround;
  /* The warm light cools as it reaches out over the sea. */
  world *= mix(vec3(1.0), normalize(u_scatter + 0.05) * 1.2, smoothstep(0.08, 0.3, below) * 0.5);

  light += world * onGround;

  /* The bottom of the stage dissolves into the page ground. */
  float fade = smoothstep(u_fade.x, u_fade.y, uv.y);
  /* The sea keeps its blue lower than the light does before it too
     reaches the ground. */
  float seaFade = smoothstep(u_fade.x * 0.5, u_fade.y * 0.65, uv.y);
  /* The top mirrors it, more gradually: from just above the glow the sky
     dissolves into the ground, so space reads as black. */
  float topFade = 1.0 - pow(smoothstep(crown + 0.03, 1.0, uv.y), 0.75);
  vec3 lin = u_ground + (light * fade + ocean * seaFade) * topFade;
  vec3 srgb = pow(max(lin, vec3(0.0)), vec3(1.0 / 2.2));

  /* The home page grain: animated integer-hash noise per pixel. */
  uvec2 gp = uvec2(gl_FragCoord.xy) + uvec2(
    uint(fract(t * 7.31) * 1024.0) * 7919u,
    uint(fract(t * 3.17) * 1024.0) * 104729u
  );
  float gr = float(ihash(gp) & 255u) / 255.0 - 0.5;
  srgb += gr * (1.0 / 255.0 + u_grain * 0.35);

  outColor = vec4(clamp(srgb, 0.0, 1.0), 1.0);
}
`;

/** Resolves the colour tokens to linear RGB through the cascade at `host`. */
function readTokens(host: HTMLElement) {
  const probe = document.createElement("span");
  probe.style.display = "none";
  host.appendChild(probe);
  const dot = document.createElement("canvas");
  dot.width = 1;
  dot.height = 1;
  const ctx = dot.getContext("2d", { willReadFrequently: true });
  const lin = (c: number) => Math.pow(c / 255, 2.2);
  const read = (token: string): Rgb => {
    if (!ctx) return [0.2, 0.2, 0.2];
    probe.style.color = `var(${token})`;
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = getComputedStyle(probe).color;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return [lin(r), lin(g), lin(b)];
  };
  const out = Object.fromEntries(
    Object.entries(TOKENS).map(([key, token]) => [key, read(token)])
  ) as Record<keyof typeof TOKENS, Rgb>;
  probe.remove();
  return out;
}

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

type HorizonCanvasProps = {
  className?: string;
  /** Where the arc's apex (and the sun) sits, as a fraction of the stage from the bottom. */
  crown?: number;
  /** The bottom fade: solid ground below the first fraction, full strength above the second. */
  fade?: [number, number];
};

export default function HorizonCanvas({
  className,
  crown = 0.4,
  fade = [0.06, 0.36],
}: HorizonCanvasProps) {
  const [fadeFrom, fadeTo] = fade;
  const hostRef = React.useRef<HTMLDivElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    const gl = canvas?.getContext("webgl2", { antialias: false, alpha: false });
    if (!host || !canvas || !gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram();
    if (!vs || !fs || !program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const u = (name: string) => gl.getUniformLocation(program, name);
    const uSize = u("u_size");
    const uTime = u("u_time");
    gl.uniform1f(u("u_grain"), GRAIN);
    gl.uniform1f(u("u_crown"), crown);
    gl.uniform2f(u("u_fade"), fadeFrom, fadeTo);
    const colourUniforms = {
      ground: u("u_ground"),
      scatter: u("u_scatter"),
      halo: u("u_halo"),
      rim: u("u_rim"),
      sun: u("u_sun"),
    };

    const applyColours = () => {
      const colours = readTokens(host);
      for (const key of Object.keys(colourUniforms) as (keyof typeof TOKENS)[]) {
        gl.uniform3fv(colourUniforms[key], colours[key]);
      }
    };

    const resize = () => {
      const ratio = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.max(1, Math.round(host.clientWidth * ratio));
      canvas.height = Math.max(1, Math.round(host.clientHeight * ratio));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uSize, canvas.width, canvas.height);
    };

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();
    let frame = 0;
    const draw = () => {
      const seconds = still ? 20 : (performance.now() - start) / 1000 + 20;
      gl.uniform1f(uTime, seconds * SPEED);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!still) frame = requestAnimationFrame(draw);
    };

    applyColours();
    resize();
    draw();

    const sizeObserver = new ResizeObserver(() => {
      resize();
      if (still) draw();
    });
    sizeObserver.observe(host);
    const themeObserver = new MutationObserver(() => {
      applyColours();
      if (still) draw();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "data-brand", "style"],
    });

    return () => {
      cancelAnimationFrame(frame);
      sizeObserver.disconnect();
      themeObserver.disconnect();
      gl.deleteVertexArray(vao);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [crown, fadeFrom, fadeTo]);

  return (
    <div ref={hostRef} className={className} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
