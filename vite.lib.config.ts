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
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

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
      exclude: ['src/**/*.stories.tsx', 'src/**/*.stories.ts', 'src/stories'],
    }),
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: false,
    lib: {
      entry: {
        index: 'src/index.ts',
        charts: 'src/charts.ts',
        'components/registry': 'src/components/registry.ts',
        'components/Avatar/demoAvatars': 'src/components/Avatar/demoAvatars.ts',
        'components/ShaderField/useShaderField': 'src/components/ShaderField/useShaderField.ts',
        'components/StreamingText/useStreamReveal': 'src/components/StreamingText/useStreamReveal.ts',
        'behaviors/useScrollLock': 'src/behaviors/useScrollLock.ts',
        'tokens/registry': 'src/tokens/registry.ts',
        'tokens/motion': 'src/tokens/motion.ts',
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
      external: (id) =>
        id.endsWith('.css') ||
        /^react($|\/)/.test(id) ||
        /^react-dom($|\/)/.test(id) ||
        /^recharts($|\/)/.test(id),
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
      },
    },
  },
});
