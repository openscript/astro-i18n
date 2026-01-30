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
            [`${name}:runtime`]: `import { initializeI18n, useFormat, useI18n, currentLocale, getI18nInstance, getFormatterInstance, clearCache } from "${resolve("./runtime.js")}";

initializeI18n({ defaultLocale: "${config.i18n.defaultLocale}", translations: ${JSON.stringify(options.translations || {})} });

export { useFormat, useI18n, currentLocale, getI18nInstance, getFormatterInstance, clearCache };
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
        injectTypes({
          filename: `${name}.d.ts`,
          content: `declare module "${name}:runtime" {
  import type { Components, TranslationLoader, Translations } from '@nanostores/i18n';
  export interface InitializeI18nOptions {
    defaultLocale: string;
    translations: Record<string, Components>;
    get?: TranslationLoader;
  }
  export declare const currentLocale: import('nanostores').PreinitializedWritableAtom<string> & object;
  export declare const initializeI18n: (options: InitializeI18nOptions) => void;
  export declare const useFormat: () => import('@nanostores/i18n').Formatter;
  export declare const useI18n: <Body extends Translations>(componentName: string, baseTranslations: Body) => Body;
  export declare const getI18nInstance: () => ReturnType<typeof import('@nanostores/i18n').createI18n>;
  export declare const getFormatterInstance: () => ReturnType<typeof import('@nanostores/i18n').formatter>;
  export declare const clearCache: (locale?: string) => void;
}
`,
        });
      },
    },
  };
};

export default createPlugin;
