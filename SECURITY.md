# Security Policy

This repo holds the design system's source and its documentation site (`SITE_URL` in `scripts/brand.mjs` is the deployment authority), and publishes the package to npm as [`@robr0/design-system`](https://www.npmjs.com/package/@robr0/design-system). If you find a security issue in the site, the components, or the dependency chain, I'd like to hear about it.

## Reporting a vulnerability

- **Preferred:** [open a private vulnerability report](https://github.com/robritacca-dotcom/dragonspine/security/advisories/new). It stays between us until a fix ships.
- Please don't open a public issue for security problems.

You can expect a response within a few days. There is no supported-version table: only the latest published version is supported. Fixes land on `main`, which is what runs live, and ship in the next release of the package.
