# Documentation website

The Next.js docs site for `@robr0/design-system`, deployed as robertritacca.com. It is an npm-workspace consumer of the component library at the repo root: install at the root (`npm install`), never with another package manager, or the workspace link to the library will not resolve.

## Getting started

```bash
# from the repo root
npm install
npm run dev --workspace website
```

Open [http://localhost:3000](http://localhost:3000). Pages live under `website/src/app/`; the home page is `website/src/app/page.tsx`.

Fonts are Nunito Sans via `next/font/google` (Open Sans loads the same way, scoped to `/covers` only). The root `CLAUDE.md` is the operating manual for the whole repo — read it before changing anything structural, including the registries and generated surfaces this site is built from.
