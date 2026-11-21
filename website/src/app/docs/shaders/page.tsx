"use client";

import { useState } from "react";
import Link from "next/link";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import { CodeBlock } from "rift-ds/components/CodeBlock/CodeBlock";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import {
  SHADER_PASSES,
  ShaderScene,
  shaderSceneDefaults,
  type ShaderSceneValues,
} from "rift-ds/components/ShaderScene/ShaderScene";
import { Slider } from "rift-ds/components/Slider/Slider";
import { Table } from "rift-ds/components/Table/Table";
import { PACKAGE_NAME } from "@/config/brand.generated";
import {
  SHADER_ENTRY,
  SHADER_ENTRY_DESCRIPTION,
  SHADER_GLSL_VERSION,
  SHADER_HELPERS,
  SHADER_PARAM_UNIFORM,
  SHADER_UNIFORMS,
} from "@/data/shader-contract";
import { emberScene } from "../../../../../src/cli/templates/blocks/components/blocks/emberScene";
import s from "./page.module.css";

/* The shaders guide: how to paint a scene of your own with ShaderScene.
   The worked scene is the file the shader-scene block ships, shown and run
   from that one source, and the contract tables are read from the
   library's record of it (@/data/shader-contract), so nothing here is a
   second copy. */

const WAYS_SNIPPET = `import { ShaderScene } from '${PACKAGE_NAME}/components/ShaderScene/ShaderScene';
import { ember } from './ember';

// One the library ships, by id.
<ShaderScene scene="horizon" />

// One of your own, the same way.
<ShaderScene scene={ember} />`;

const BLOCK_SNIPPET = `npx ${PACKAGE_NAME} init block shader-scene`;

const list = (values: string[]) => values.map((value) => `'${value}'`).join(", ");

/* The block's scene, written out as the file a reader would keep. */
const SCENE_SNIPPET = `import type { ShaderSceneSource } from '${PACKAGE_NAME}/components/ShaderScene/ShaderScene';

export const ember: ShaderSceneSource = {
  mode: '${emberScene.mode}',
  colours: [${list(emberScene.colours)}],
  params: [
${emberScene.params
  .map(
    (param) =>
      `    { key: '${param.key}', label: '${param.label}', min: ${param.min}, max: ${param.max}, step: ${param.step}, default: ${param.default} },`
  )
  .join("\n")}
  ],
  glsl: \`${emberScene.glsl}\`,
};`;

const PLACE_SNIPPET = `<div style={{ position: 'relative', overflow: 'hidden', height: 360 }}>
  <ShaderScene scene={ember} params={{ glow: 1.4 }} />
  <h1 style={{ position: 'relative' }}>Your content, over the scene</h1>
</div>`;

const BOTH_MODES_SNIPPET = `// 0 on a dark ground, 1 on a light one.
float day = smoothstep(0.1, 0.45, dot(u_ground, vec3(0.2126, 0.7152, 0.0722)));
vec3 water = mix(u_col[0], u_col[1], day);`;

const ERROR_SNIPPET = `const [status, setStatus] = useState<ShaderSceneStatus>('pending');
const [log, setLog] = useState<string>();

<ShaderScene scene={ember} onStatusChange={setStatus} onError={setLog} />

// A mistake on the scene's second line arrives marked 1:2,
// string 1 (your GLSL), line 2.`;

const LIVE_SNIPPET = `const values = useRef<ShaderSceneValues>({
  speed: 1.6,
  scene: shaderSceneDefaults(ember.params),
  passes: Object.fromEntries(
    SHADER_PASSES.map((pass) => [pass.id, { on: pass.on, params: shaderSceneDefaults(pass.params) }])
  ),
});

<ShaderScene scene={ember} liveRef={values} />
<Slider label="Glow" min={0} max={2} step={0.01} defaultValue={1}
  onValueChange={(glow) => { values.current.scene.glow = glow; }} />`;

/* What the live scene reads each frame: the block's scene and every pass
   at their defaults, with the fades off so the light fills the stage. */
const initialValues = (): ShaderSceneValues => ({
  speed: 1.6,
  scene: shaderSceneDefaults(emberScene.params),
  passes: Object.fromEntries(
    SHADER_PASSES.map((pass) => [
      pass.id,
      { on: pass.id.startsWith("fade") ? false : pass.on, params: shaderSceneDefaults(pass.params) },
    ])
  ),
});

export default function ShadersPage() {
  /* The sliders write this ref and the scene reads it every frame, so a
     drag moves the picture and renders nothing. */
  const [values] = useState(() => ({ current: initialValues() }));

  return (
    <>
        <div className={s.dsContent}>
          <PageBreadcrumb />

          <div className={`${s.pageHeader} animate-in`}>
            <h1 className={s.pageTitle}>Shaders</h1>
          </div>

          <div className={`${s.introSection} animate-in animate-delay-1`}>
            <p className={s.subDisplay}>A scene of your own, in your theme&rsquo;s colours</p>
            <p className={s.introBody}>
              <Link href="/components/shader-scene" className={s.inlineLink}>Shader scene</Link>{" "}
              paints a WebGL2 scene behind a page. Pick one the library ships, or write your own
              in GLSL and pass it the same way. Yours gets everything the library&rsquo;s get: the
              theme&rsquo;s colours, the finishing passes, light mode, reduced motion and a
              fallback when WebGL2 cannot run.
            </p>
          </div>

          <section id="ways-in" className={`${s.section} animate-in animate-delay-2`}>
            <SectionTitle title="Three ways in" />
            <p className={s.sectionNote}>
              The <code>scene</code> prop takes an id or a scene. Bringing your own is the same
              line of code as picking one.
            </p>
            <CodeBlock code={WAYS_SNIPPET} language="tsx" showCopy />
            <p className={s.sectionNote}>
              Or start from a working file. The{" "}
              <Link href="/docs/blocks" className={s.inlineLink}>shader scene block</Link> writes a
              scene and a page that stages it with a slider for each setting, and both are yours
              to change.
            </p>
            <CodeBlock code={BLOCK_SNIPPET} language="bash" showCopy />
          </section>

          <section id="a-scene" className={`${s.section} animate-in animate-delay-3`}>
            <SectionTitle title="A scene" />
            <p className={s.sectionNote}>
              A scene is three things: the colours it reads, its settings, and the GLSL that
              paints it. This is the one the block writes, a bed of light that rises in slow
              tongues.
            </p>
            <CodeBlock code={SCENE_SNIPPET} language="ts" showCopy />
            <p className={s.sectionNote}>
              Keep it in a file of its own or write it inline. The scene is compared by what it
              says, so an inline object compiles once and again only when it changes.
            </p>
          </section>

          <section id="try-it" className={s.section}>
            <SectionTitle title="Try it" />
            <p className={s.sectionNote}>
              That scene, running. Each slider is one of the settings it declares.
            </p>
            <div className={s.lab}>
              <div className={s.stage}>
                <ShaderScene scene={emberScene} liveRef={values} />
              </div>
              <div className={s.controls}>
                {emberScene.params.map((param) => (
                  <Slider
                    key={param.key}
                    label={param.label}
                    min={param.min}
                    max={param.max}
                    step={param.step}
                    defaultValue={param.default}
                    showValue
                    onValueChange={(value) => {
                      values.current.scene[param.key] = value;
                    }}
                  />
                ))}
              </div>
            </div>
          </section>

          <section id="placing-it" className={s.section}>
            <SectionTitle title="Placing it" />
            <p className={s.sectionNote}>
              The scene fills its positioned ancestor and nothing else, so the ancestor decides
              where it sits and clips it. It is scenery: it takes no pointer events and is hidden
              from assistive tech, and content goes over it.
            </p>
            <CodeBlock code={PLACE_SNIPPET} language="tsx" showCopy />
          </section>

          <section id="contract" className={s.section}>
            <SectionTitle title="What your GLSL gets" />
            <p className={s.sectionNote}>
              Write one function, <code>{SHADER_ENTRY}</code>, in {SHADER_GLSL_VERSION}.{" "}
              {SHADER_ENTRY_DESCRIPTION} Everything in these two tables is declared before your
              code runs, so you call it by name and import nothing.
            </p>
            <Table
              bordered
              size="compact"
              caption="The uniforms every scene is handed"
              captionHidden
              columns={[
                { key: "name", header: "Uniform", width: "22%" },
                { key: "type", header: "Type", width: "16%" },
                { key: "what", header: "What it holds" },
              ]}
              rows={SHADER_UNIFORMS.map((uniform) => ({
                id: uniform.name,
                cells: {
                  name: <code className={s.defKey}>{uniform.name}</code>,
                  type: <code className={s.defKey}>{uniform.type}</code>,
                  what: uniform.when
                    ? `${uniform.description} Only for a scene that sets ${uniform.when}.`
                    : uniform.description,
                },
              }))}
            />
            <Table
              bordered
              size="compact"
              caption="The GLSL functions every scene can call"
              captionHidden
              columns={[
                { key: "signature", header: "Function", width: "38%" },
                { key: "what", header: "What it gives" },
              ]}
              rows={SHADER_HELPERS.map((helper) => ({
                id: helper.signature,
                cells: {
                  signature: <code className={s.defKey}>{helper.signature}</code>,
                  what: helper.description,
                },
              }))}
            />
            <p className={s.sectionNote}>
              Return the ground plus your light, <code>u_ground + light</code>, in linear colour.
              The fades, the grain and light mode all work from that sum.
            </p>
          </section>

          <section id="colours" className={s.section}>
            <SectionTitle title="Colours" />
            <p className={s.sectionNote}>
              A scene never holds a colour. It names custom properties in <code>colours</code>,
              and they arrive in the GLSL as <code>u_col[0]</code>, <code>u_col[1]</code> and so
              on, in that order. Name the ambient roles, <code>--color-ambient-1</code> onward,
              and the scene follows the theme, the colour mode and any preset. A custom property
              of your own works too, set anywhere above the scene.
            </p>
            <p className={s.sectionNote}>
              Colours are read where the scene sits and read again when the theme changes on the
              root element. One with no value falls back to the text colour, and a development
              warning names it.
            </p>
          </section>

          <section id="settings" className={s.section}>
            <SectionTitle title="Settings" />
            <p className={s.sectionNote}>
              Each entry in <code>params</code> becomes <code>{SHADER_PARAM_UNIFORM}</code>,
              declared for you. Do not declare it again in your GLSL. Set values through the{" "}
              <code>params</code> prop, which merges over the defaults, so passing one key changes
              one thing and compiles nothing. A key must be a GLSL identifier and must not repeat
              a name from the table above.
            </p>
            <p className={s.sectionNote}>
              The label, range and step are there for a host that draws controls. For sliders,
              write to a ref the scene reads every frame, so a drag renders nothing:
            </p>
            <CodeBlock code={LIVE_SNIPPET} language="tsx" showCopy />
          </section>

          <section id="passes" className={s.section}>
            <SectionTitle title="Finishing passes" />
            <p className={s.sectionNote}>
              The same passes run over your scene as over the library&rsquo;s, each switched and
              tuned through the <code>passes</code> prop. The fades melt the scene into the page
              at its top and bottom edges; turn them off for a scene that fills a framed stage.
            </p>
            <Table
              bordered
              size="compact"
              caption="The finishing passes"
              captionHidden
              columns={[
                { key: "id", header: "Pass", width: "22%" },
                { key: "label", header: "What it does", width: "28%" },
                { key: "on", header: "By default", width: "18%" },
                { key: "params", header: "Settings" },
              ]}
              rows={SHADER_PASSES.map((pass) => ({
                id: pass.id,
                cells: {
                  id: <code className={s.defKey}>{pass.id}</code>,
                  label: pass.label,
                  on: pass.on ? "On" : "Off",
                  params: <code className={s.defKey}>{pass.params.map((param) => param.key).join(", ")}</code>,
                },
              }))}
            />
          </section>

          <section id="light-and-dark" className={s.section}>
            <SectionTitle title="Light and dark" />
            <p className={s.sectionNote}>
              Most scenes only add light, which reads on a dark ground and washes out on a light
              one. Say so with <code>mode: &apos;dark&apos;</code>: on a light page the scene
              computes its light against a near-black ground of its own, and that light is laid
              onto the page as a pale tint.
            </p>
            <p className={s.sectionNote}>
              A scene that paints both modes itself leaves <code>mode</code> out and reads the
              ground to tell which it is on:
            </p>
            <CodeBlock code={BOTH_MODES_SNIPPET} language="glsl" showCopy />
          </section>

          <section id="type" className={s.section}>
            <SectionTitle title="Printing type" />
            <p className={s.sectionNote}>
              Give a scene a ramp of characters in <code>glyphs</code>, thin to heavy, and it is
              drawn into a texture in the theme&rsquo;s code face and handed over as{" "}
              <code>u_glyphs</code>. Type and other fine detail want more than one buffer pixel
              per CSS pixel, so raise <code>pixelRatio</code> to 2 for those scenes and scale
              anything sized in CSS pixels by <code>u_ratio</code>. Soft light does not need it,
              and every extra pixel is paid for each frame.
            </p>
          </section>

          <section id="errors" className={s.section}>
            <SectionTitle title="When it does not compile" />
            <p className={s.sectionNote}>
              A scene that fails to compile paints nothing, reports <code>unavailable</code> and
              hands the compiler&rsquo;s log to <code>onError</code>. Line numbers count from the
              first line of your own <code>glsl</code>, written <code>1:line</code>. The log
              reaches the console as well.
            </p>
            <CodeBlock code={ERROR_SNIPPET} language="tsx" showCopy />
            <p className={s.sectionNote}>
              In development, the mistakes a compiler does not explain are warned about before it
              runs: a key that is not an identifier, a uniform declared twice, too many colours
              and a colour with no value.
            </p>
          </section>

          <section id="cost" className={s.section}>
            <SectionTitle title="Keeping it cheap" />
            <p className={s.sectionNote}>
              The component holds every scene to the same budget: thirty frames a second, one
              buffer pixel per CSS pixel unless the scene asks for more, and a loop that stops
              when the scene scrolls out of view. Under reduced motion it holds a still frame
              that still answers its settings. What is left to you is the cost of one pixel, so
              count your noise calls: <code>fbm</code> is four lookups, and a scene that calls it
              a dozen times fills a wide band slowly on a laptop.
            </p>
            <p className={s.sectionNote}>
              Where WebGL2 cannot run, the scene stays empty and whatever sits under it shows, so
              lay a fallback beneath it or drive one from <code>onStatusChange</code>.
            </p>
          </section>

          <section id="agents" className={s.section}>
            <SectionTitle title="With an agent" />
            <p className={s.sectionNote}>
              <code>npx {PACKAGE_NAME} init</code> installs a skill that teaches a coding agent
              this page: the contract, the colour roles and the checks to run. Ask it for a scene
              by describing the picture. See{" "}
              <Link href="/docs/get-started" className={s.inlineLink}>Get started</Link> for the
              skills and the MCP endpoint.
            </p>
          </section>
        </div>
    </>
  );
}
