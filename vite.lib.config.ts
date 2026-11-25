/**
 * Library build config — produces the publishable package output in
 * dist/ (invoked by scripts/build-package.mjs, i.e. `npm run build:lib`).
 * The main vite.config.ts stays the Vitest/Storybook test config.
 *
 * Output mirrors src/ one module per file (preserveModules), so the
 * dist exports map in scripts/package-manifest.mjs resolves the same
 * subpaths as the source form. CSS imports are externalized — left
 * verbatim in the emitted JS — and the raw .css files are copied in by
 * build-package.mjs, keeping the per-component `import './X.css'`
 * convention working for consumers' bundlers.
 *
 * Every module under src/components is an entry of its own, because the
 * ./components/* subpath lets a consumer deep-import any of them. Rollup
 * keeps a non-entry module's exports only as far as something inside the
 * build imports them: a component file that re-exports a helper the barrel
 * takes from the helper's own file (ErrorSummary's `fieldErrorsFrom`,
 * DataTable's period helpers) shipped without that export, so its .d.ts
 * promised a name its .js did not have. As an entry, a module keeps its
 * whole signature. validate-package-publish.mjs holds every subpath's .js
 * to the value exports its .d.ts declares.
 */
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

const componentsDir = join(dirname(fileURLToPath(import.meta.url)), 'src', 'components');

/** Every component-folder module, keyed by its output path: stories and tests excluded. */
const componentModules = Object.fromEntries(
  readdirSync(componentsDir, { withFileTypes: true })
    .filter((dir) => dir.isDirectory())
    .flatMap((dir) =>
      readdirSync(join(componentsDir, dir.name))
        .filter((file) => /\.tsx?$/.test(file) && !/\.(stories|test)\.tsx?$/.test(file) && !file.endsWith('.d.ts'))
        .map((file) => [
          `components/${dir.name}/${file.replace(/\.tsx?$/, '')}`,
          `src/components/${dir.name}/${file}`,
        ])
    )
);

export default defineConfig({
  // public/ holds website/Storybook showcase assets (hero images, logos) —
  // they are not part of the package.
  publicDir: false,
  plugins: [
    react(),
    dts({
      tsconfigPath: './tsconfig.app.json',
      entryRoot: 'src',
      outDir: 'dist',
      include: ['src'],
      // The scaffold templates are source a consumer copies, shipped beside the
      // bin by build-package.mjs, never types of the package.
      exclude: ['src/**/*.stories.tsx', 'src/**/*.stories.ts', 'src/**/*.test.ts', 'src/stories', 'src/cli'],
    }),
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: false,
    lib: {
      entry: {
        // First, so the explicit subpath entries below win a key they share.
        ...componentModules,
        index: 'src/index.ts',
        charts: 'src/charts.ts',
        'components/registry': 'src/components/registry.ts',
        'components/Attachment/fileTypes': 'src/components/Attachment/fileTypes.ts',
        'components/Mention/mentions': 'src/components/Mention/mentions.ts',
        'components/Attachment/useAttachments': 'src/components/Attachment/useAttachments.ts',
        'components/Avatar/demoAvatars': 'src/components/Avatar/demoAvatars.ts',
        'components/ShaderField/useShaderField': 'src/components/ShaderField/useShaderField.ts',
        'components/StreamingText/useStreamReveal': 'src/components/StreamingText/useStreamReveal.ts',
        'behaviors/useScrollLock': 'src/behaviors/useScrollLock.ts',
        'behaviors/LinkProvider': 'src/behaviors/LinkProvider.tsx',
        'behaviors/LocaleProvider': 'src/behaviors/LocaleProvider.tsx',
        'behaviors/shortcuts': 'src/behaviors/shortcuts.ts',
        'behaviors/deferComponent': 'src/behaviors/deferComponent.ts',
        // The chat widget's subpaths (scripts/package-manifest.mjs owns
        // the list; each carries its own optional peers, externalised below).
        'chat/index': 'src/chat/index.ts',
        'chat/server': 'src/chat/server.ts',
        'chat/actions': 'src/chat/actions.ts',
        'chat/upstash': 'src/chat/upstash.ts',
        'chat/demo': 'src/chat/demo.ts',
        'format/index': 'src/format/index.ts',
        'code/index': 'src/code/index.ts',
        'code/highlight': 'src/code/highlight.ts',
        'markdown/index': 'src/markdown/index.ts',
        'tokens/registry': 'src/tokens/registry.ts',
        'tokens/values': 'src/tokens/values.ts',
        'tokens/motion': 'src/tokens/motion.ts',
        'tokens/breakpoints': 'src/tokens/breakpoints.ts',
        // Doc-only helpers: not in the barrel, but reachable via the
        // ./components/* subpath export, so they need built output too.
        'components/ColourSwatch/ColourSwatch': 'src/components/ColourSwatch/ColourSwatch.tsx',
        'components/MotionSwatch/MotionSwatch': 'src/components/MotionSwatch/MotionSwatch.tsx',
        'components/SpacingSwatch/SpacingSwatch': 'src/components/SpacingSwatch/SpacingSwatch.tsx',
        'components/TypographySwatch/TypographySwatch': 'src/components/TypographySwatch/TypographySwatch.tsx',
      },
      formats: ['es'],
    },
    rollupOptions: {
      // Every peer and dependency stays external: bundled, an optional peer
      // would ship inside the tarball (and bill every consumer for it). The
      // list is OPTIONAL_PEER_PACKAGES in scripts/optional-peers.mjs
      // plus the two required peers, plus the runtime dependencies.
      external: (id) =>
        id.endsWith('.css') ||
        /^react($|\/)/.test(id) ||
        /^react-dom($|\/)/.test(id) ||
        /^recharts($|\/)/.test(id) ||
        /^shiki($|\/)/.test(id) ||
        /^react-markdown($|\/)/.test(id) ||
        /^remark-gfm($|\/)/.test(id) ||
        /^@anthropic-ai\/sdk($|\/)/.test(id) ||
        /^@upstash\/(ratelimit|redis)($|\/)/.test(id) ||
        // A runtime dependency: the consumer's install provides it, so the
        // tarball never carries a second copy.
        /^@tanstack\//.test(id),
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
      },
    },
  },
});
