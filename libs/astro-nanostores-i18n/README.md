# astro-nanostores-i18n

[![NPM Downloads](https://img.shields.io/npm/dw/astro-nanostores-i18n)](https://npmjs.org/astro-nanostores-i18n)
[![npm bundle size](https://img.shields.io/bundlephobia/min/astro-nanostores-i18n)](https://npmjs.org/astro-nanostores-i18n)

`astro-nanostores-i18n` is an integration of [@nanostores/i18n](https://github.com/nanostores/i18n) into [Astro](https://astro.build/).

## Usage

1. Install the package `astro-nanostores-i18n`:
   <details open>
    <summary>npm</summary>

    ```bash
    npm install astro-nanostores-i18n @nanostores/i18n nanostores
    ```
   </details>
   <details>
     <summary>yarn</summary>

     ```bash
     yarn add astro-nanostores-i18n @nanostores/i18n nanostores
     ```
   </details>
   <details>
     <summary>pnpm</summary>

     ```bash
     pnpm add astro-nanostores-i18n @nanostores/i18n nanostores
     ```
   </details>
1. Add the integration to your `astro.config.mjs`:

   ```javascript
   import { defineConfig } from 'astro/config';
   import nanostoresI18n from 'astro-nanostores-i18n';
   import zhCN from "./src/translations/zh-CN.json";

   export default defineConfig({
     i18n: {
       defaultLocale: "de-CH",
       locales: ["de-CH", "zh-CN"],
     },
     integrations: [
       nanostoresI18n({
         /**
          * Predefined translations to initialize the i18n store with.
          * This should be an object where keys are locale codes and values are
          * translation components in JSON format.
          */
         translations: {
           "zh-CN": zhCN,
         },
         /**
          * Whether to automatically add middleware for locale detection.
         * If enabled, the middleware will set the current locale based on the URL pathname.
         * If disabled, you need to manage locale setting manually in your components or add your own middleware.
         *
         * @default false
         */
         addMiddleware: true,
       }),
     ],
   });
   ```
1. Use the `useI18n` in your Astro pages or components:
   ```tsx
   ---
   import Page from "../layouts/Page.astro";
   import { useI18n, useFormat, currentLocale } from "astro-nanostores-i18n:runtime";
   import { count, params } from "@nanostores/i18n";

   // Override the current locale if needed.
   // If you have enabled the middleware, this is usually not necessary.
   currentLocale.set("zh-CN");

   // Name the constant `messages` to be able to use the extraction script.
   const messages = useI18n("example", {
     message: "Irgend eine Nachricht.",
     param: params("Eine Nachricht mit einem Parameter: {irgendwas}"),
     count: count({
       one: "Ein Eintrag",
       many: "{count} Einträge",
     }),
   });

   const format = useFormat();
   ---

   <Page>
     <h1>astro-nanostores-i18n</h1>
     <p>{messages.message}</p>
     <p>{messages.param({ irgendwas: "Something" })}</p>
     <p>{format.time(new Date())}</p>
   </Page>
   ```

### Using with other component frameworks (React, Vue, Solid, ...)

While `useI18n` and `useFormat` work well within Astro components, you can use `getI18nInstance` and `getFormatterInstance` to access the underlying `@nanostores/i18n` instances directly. This allows you to build custom hooks or composables for your preferred framework.

#### Example

```ts
import { useStore } from "@nanostores/react"; // or "@nanostores/vue" for Vue, etc.
import type { Translations } from "@nanostores/i18n";
import { getI18nInstance } from "astro-nanostores-i18n:runtime";

export function useI18n<Body extends Translations>(
  componentName: string,
  baseTranslations: Body
): Body {
  const i18n = getI18nInstance();
  const translations = useStore(i18n(componentName, baseTranslations));
  return translations;
}
```

### Extracting translations

`astro-nanostores-i18n` provides a script to extract translations from your Astro components. You can add the following script to your `package.json`:

```json
{
  "scripts": {
    "i18n:extract": "extract-messages"
  }
}
```

Then you can run the script to extract messages from your Astro components:

```bash
npm run i18n:extract
```

It has the following options:

```txt
Usage: extract-messages [options]

Options:
  --identifier <name> Variable name to extract messages from (default: "messages")
  --glob <pattern>    Glob pattern for finding Astro files (default: "./src/**/*.astro")
  --out <path>        Output path for messages file (default: "./src/translations/extract.json")
  --help, -h          Show this help message
```

## Resources

- https://lou.gg/blog/astro-integrations-explained
- https://hideoo.dev/notes/starlight-plugin-share-data-with-astro-runtime/
