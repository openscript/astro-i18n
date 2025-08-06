# astro-i18n


[![codecov](https://codecov.io/github/openscript/astro-i18n/graph/badge.svg?token=O2UYXUDEOT)](https://codecov.io/github/openscript/astro-i18n)

This monorepo contains tools to help you with i18n in Astro projects.

## Packages

### Public packages

- [astro-loader-i18n](libs/astro-loader-i18n) is a **content loader** for internationalized content in [Astro](https://astro.build). It builds on top of Astro’s [`glob()` loader](https://docs.astro.build/en/reference/content-loader-reference/#glob-loader) and helps manage translations by detecting locales, mapping content, and enriching `getStaticPaths`.
- [astro-nanostores-i18n](libs/astro-nanostores-i18n) is an integration of [@nanostores/i18n](https://github.com/nanostores/i18n) into [Astro](https://astro.build/).

### Private packages

- [astro-utils-i18n](libs/astro-utils-i18n): A set of utilities for i18n in Astro projects. It provides functions to manage translations, extract messages, and more.
