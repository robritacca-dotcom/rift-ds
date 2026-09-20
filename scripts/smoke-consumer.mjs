#!/usr/bin/env node
/**
 * Pre-publish consumer smoke test. Packs dist/ into a tarball, scaffolds
 * a minimal Vite + React + TypeScript app in a temp directory, installs
 * the tarball, and runs `tsc` + `vite build`.
 *
 * Deliberately does NOT install recharts: the main barrel must build for
 * consumers without the optional peer (the regression this suite exists
 * to catch). Deep imports, the tokens.css subpath, and type resolution
 * are all exercised. Run by the release workflow before `npm publish`,
 * and runnable locally after `npm run build:lib`.
 */
import { execSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(repoRoot, 'dist');

const run = (cmd, cwd) => execSync(cmd, { cwd, stdio: 'inherit' });

const work = mkdtempSync(join(tmpdir(), 'ds-smoke-'));
console.log(`▸ Smoke test workspace: ${work}`);

try {
  run(`npm pack --pack-destination "${work}"`, distDir);
  const tarball = readdirSync(work).find((f) => f.endsWith('.tgz'));
  if (!tarball) throw new Error('npm pack produced no tarball');

  const app = join(work, 'app');
  mkdirSync(join(app, 'src'), { recursive: true });

  writeFileSync(
    join(app, 'package.json'),
    JSON.stringify(
      {
        name: 'ds-smoke-consumer',
        private: true,
        type: 'module',
        dependencies: {
          '@robr0/design-system': `file:../${tarball}`,
          react: '^19.0.0',
          'react-dom': '^19.0.0',
        },
        devDependencies: {
          '@types/react': '^19.0.0',
          '@types/react-dom': '^19.0.0',
          '@vitejs/plugin-react': '^5.0.0',
          typescript: '^5.9.0',
          vite: '^7.0.0',
        },
      },
      null,
      2
    )
  );

  writeFileSync(
    join(app, 'tsconfig.json'),
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          lib: ['ES2022', 'DOM', 'DOM.Iterable'],
          module: 'ESNext',
          moduleResolution: 'bundler',
          jsx: 'react-jsx',
          strict: true,
          noEmit: true,
          skipLibCheck: true,
        },
        include: ['src'],
      },
      null,
      2
    )
  );

  writeFileSync(
    join(app, 'vite.config.ts'),
    `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({ plugins: [react()] });
`
  );

  writeFileSync(
    join(app, 'index.html'),
    `<!doctype html><html><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>`
  );

  writeFileSync(
    join(app, 'src', 'main.tsx'),
    `import { createRoot } from 'react-dom/client';
import '@robr0/design-system/tokens/tokens.css';
import { Button, Badge, COMPONENT_COUNT } from '@robr0/design-system';
import { Alert } from '@robr0/design-system/components/Alert/Alert';

createRoot(document.getElementById('root')!).render(
  <main>
    <Button label={\`\${COMPONENT_COUNT} components\`} variant="primary" />
    <Badge label="smoke" variant="positive" />
    <Alert variant="info" title="Deep import" description="works" />
  </main>
);
`
  );

  run('npm install --no-fund --no-audit', app);
  run('npx tsc -p tsconfig.json', app);
  run('npx vite build', app);
  console.log('✓ Consumer smoke test passed — tarball installs, type-checks, and builds without recharts.');
} finally {
  rmSync(work, { recursive: true, force: true });
}
