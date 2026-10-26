# Building with rift-ds

You are building React UI with rift-ds 1.14.0. Follow this file before writing any code with it. It was generated from the library's registries, so every name in it exists.

## Start a Next.js app

In a Next.js app router project (a fresh `create-next-app` is one), three commands give a themed first page:

```bash
npm install rift-ds
npx rift-ds init app
npx rift-ds init block dashboard
```

1. `init app` writes `components/rift/`: the wrapper that routes every link through Next's `Link`, the script that applies the stored colour mode before first paint, and the base theme's font. It prints the root layout to use. Make `app/layout.tsx` exactly that, keeping its metadata, and drop any `globals.css` import `create-next-app` left there: its body colours and font cover the library's.
2. `init block <name>` copies in a whole starting page built from the library, laid out for desktop and phone: `app-shell`, `dashboard` and `sign-in`. With no name it lists them. The files are the project's own from then on, so change them freely.
3. Start every new screen from a block, or inside the `AppShell` the app shell and dashboard blocks write to `components/blocks/`, never from a blank file, then fill it with library components.

The init commands only add files and never overwrite one, so they are safe to run again.

## Install anywhere else

```bash
npm install rift-ds
```

- Required peers: `react` ^19.0.0 and `react-dom` ^19.0.0. It brings its own runtime dependencies, `@tanstack/react-table` ^9.3.1 and `@tanstack/react-virtual` ^3.14.15 (the engine and the windowing under `DataTable`), which install with it, so add nothing else for them.
- `recharts` ^3.0.0 is optional. Install it only if you import from `rift-ds/charts`.
- It is ESM-only. Use a bundler that handles CSS and font imports (Vite, Next.js, webpack), with TypeScript's `moduleResolution` set to `"bundler"` or `"nodenext"`.

## Setup by hand

What `init app` does, for an app it does not cover:

```tsx
import 'rift-ds/tokens/tokens.css'; // once, at the app root
import 'rift-ds/tokens/base.css'; // the reset and page the components are tuned against
import { Button } from 'rift-ds';
```

- `base.css` paints the page (`body` on `--color-bg-page-primary`, `--color-text-primary` and `--font-family-primary`) and resets box sizing and margins; without it, components render too padded.
- The base theme's typeface is not bundled. It is designed around Nunito Sans: load that (or your own) and set `--font-family-primary` to it. A shipped theme bundles its own faces, and the icon font always ships.
- Dark mode is `data-theme="dark"` on `<html>`. `colorModeScript()` from `rift-ds/components/ThemeToggle/colorMode` applies the stored choice before first paint, and `ThemeToggle` changes it. A shipped theme is `data-brand` on `<html>`, with `rift-ds/tokens/presets/presets.css` imported once.
- In a routed app, wrap the tree in `LinkProvider` from `rift-ds/behaviors/LinkProvider` with the router's link, or every component link reloads the page. A component rendered by a Server Component cannot read it, so pass `linkComponent` on that instance instead.
- For an app not in US English, wrap the tree in `LocaleProvider` from `rift-ds/behaviors/LocaleProvider` with its locale, or every number, date and calendar reads as `en-US`. A component rendered by a Server Component cannot read it, so pass `locale` on that instance instead. Translate the words through each component's label props.
- Wrap the tree in `ToastProvider` only if you call `useToast` (both from the `Toast` module). No other component needs a provider.

## AI chat

Do not build a chat UI by hand. `npx rift-ds init chat` scaffolds the package's chat widget into a Next.js app router project: the routes, the mount and an env example. It never overwrites a file, and it ends by printing the optional peers to install and the steps to wire it in. Follow that output. In any other framework, use the panel over your own endpoint or the headless engine instead: https://rift-ds.com/docs/chat covers both and the protocol, and every prop is on https://rift-ds.com/components/ai-chat.

## Rules

- Use a library component before building your own, and never restyle one from outside. If it looks wrong, change a token.
- Never write a raw colour, spacing, radius, font value or duration. Use the semantic token for the role, not the nearest value.
- Never write a token name from memory. Check it in the token reference below, or read the names from `tokenRegistry` in `rift-ds/tokens/registry`: a misspelt `var()` resolves to nothing and fails without a sound.
- `--color-action-primary-bg` marks the primary action, focus, and checked or selected state. Never decoration.
- Status colours come from the `--color-status-*` family, such as `--color-status-error-text`.
- The only shadows are `--shadow-floating`, `--shadow-modal` and `--shadow-table-pinned`.
- Size an icon by setting `--icon-size` to an `--icon-size-*` step, never `font-size`.
- Never guess a prop. Check it in the `.d.ts` files in `node_modules/rift-ds`, which work offline, or in the component's contract, linked from the catalogue below.

## Look it up

- Every component, with its import and a link to its prop contract: https://rift-ds.com/skill/rift-design-system/references/components.md
- Every token, with its value in light and dark: https://rift-ds.com/skill/rift-design-system/references/tokens.md
- MCP endpoint, no key needed: https://rift-ds.com/api/mcp
- If the project uses `.claude/skills/`, `npx rift-ds init` installs the full skills there.
