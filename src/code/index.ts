/**
 * rift-ds/code: pure helpers for showing code, with no dependencies.
 *
 * `packageManagerTabs` writes the tabs a CodeBlock shows for a command a
 * reader runs with their own package manager, so a page never hand-types
 * four variants of the same install line. Pair it with CodeBlock's `syncKey`
 * and every install block on the page follows the reader's pick.
 *
 * Highlighting lives apart, in `rift-ds/code/highlight`, because it needs
 * the optional shiki peer; importing this module never pulls it in.
 */
import type { CodeBlockTab } from '../components/CodeBlock/CodeBlock';

export type { CodeBlockTab, CodeLine, CodeToken, CodeTokenRole } from '../components/CodeBlock/CodeBlock';

/** A package manager `packageManagerTabs` can write a command for. */
export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';

/** What to write: packages to install, or a package binary to run once. */
export type PackageCommand =
  | {
      /** Packages to add, e.g. `'rift-ds'` or `['rift-ds', 'shiki']`. */
      install: string | string[];
      /** Add them as development dependencies. */
      dev?: boolean;
    }
  | {
      /** A package binary and its arguments to run without installing, e.g. `'rift-ds init'`. */
      run: string;
    };

const INSTALL: Record<PackageManager, string> = {
  npm: 'npm install',
  pnpm: 'pnpm add',
  yarn: 'yarn add',
  bun: 'bun add',
};
const DEV_FLAG: Record<PackageManager, string> = { npm: '--save-dev', pnpm: '-D', yarn: '-D', bun: '-d' };
const RUN: Record<PackageManager, string> = { npm: 'npx', pnpm: 'pnpm dlx', yarn: 'yarn dlx', bun: 'bunx' };

/** The same command for each package manager, as CodeBlock tabs (npm, pnpm, yarn and bun unless `managers` narrows them). */
export function packageManagerTabs(
  command: PackageCommand,
  managers: PackageManager[] = ['npm', 'pnpm', 'yarn', 'bun'],
): CodeBlockTab[] {
  return managers.map((manager) => {
    let code: string;
    if ('run' in command) {
      code = `${RUN[manager]} ${command.run}`;
    } else {
      const packages = Array.isArray(command.install) ? command.install.join(' ') : command.install;
      code = [INSTALL[manager], command.dev ? DEV_FLAG[manager] : '', packages].filter(Boolean).join(' ');
    }
    return { value: manager, label: manager, code };
  });
}
