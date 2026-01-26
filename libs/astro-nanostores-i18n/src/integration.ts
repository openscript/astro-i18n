import { readFileSync } from "node:fs";
import type { ComponentsJSON } from "@nanostores/i18n";
import type { AstroIntegration } from "astro";
import { addVirtualImports, createResolver } from "astro-integration-kit";
import { name } from "../package.json";

type Options = {
  /**
   * Predefined translations to initialize the i18n store with.
   * This should be an object where keys are locale codes and values are
   * translation components in JSON format.
   *
   * @example
   * {
   *   "en": { "MyComponent": { "hello": "Hello" } },
   *   "fr": { "MyComponent": { "hello": "Bonjour" } }
   * }
   */
  translations?: Record<string, ComponentsJSON>;
  /**
   * Whether to automatically add middleware for locale detection.
   * If enabled, the middleware will set the current locale based on the URL pathname.
   * If disabled, you need to manage locale setting manually in your components or add your own middleware.
   *
   * @default false
   */
  addMiddleware?: boolean;
};

/**
 * Astro integration for nanostores-i18n.
 *
 * This integration sets up the i18n configuration and provides the necessary
 * stores for managing translations and locale settings.
 *
 * @returns {AstroIntegration} The Astro integration object.
 */
const createPlugin = (options: Options): AstroIntegration => {
  const { resolve } = createResolver(import.meta.url);
  return {
    name,
    hooks: {
      "astro:config:setup": (params) => {
        const { config, logger, addMiddleware } = params;

        if (!config.i18n) {
          logger.error(
            `The ${name} integration requires the i18n configuration in your Astro config. Please add it to your astro.config.ts file.`
          );
          return;
        }

        addVirtualImports(params, {
          name,
          imports: {
            [`${name}:runtime`]: `import { initializeI18n, useFormat, useI18n, currentLocale } from "${resolve("./runtime.js")}";

initializeI18n("${config.i18n.defaultLocale}", ${JSON.stringify(options.translations || {})});

export { useFormat, useI18n, currentLocale };
`,
          },
        });

        if (options.addMiddleware) {
          addMiddleware({
            entrypoint: `${name}/middleware`,
            order: "pre",
          });
        }
      },
      "astro:config:done": (params) => {
        const { injectTypes } = params;
        const virtualPath = resolve("./virtual.d.ts");
        const typeContent = readFileSync(virtualPath, "utf-8");
        injectTypes({
          filename: `${name}.d.ts`,
          content: typeContent,
        });
      },
    },
  };
};

export default createPlugin;
