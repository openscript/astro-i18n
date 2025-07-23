import { glob, Loader, LoaderContext } from "astro/loaders";
import { createContentPath, createTranslationId, parseLocale } from "astro-utils-i18n";

type GlobOptions = Parameters<typeof glob>[0];

/**
 * Creates a custom i18n loader for Astro projects.
 *
 * @param options - Configuration options for the glob loader.
 * @returns A loader that integrates i18n functionality into the Astro build process.
 *
 * @throws If the `i18n` configuration is missing in the Astro config.
 */
export function i18nLoader(options: GlobOptions): Loader {
  const globLoader = glob(options);
  return {
    name: "i18n-loader",
    load: async (context: LoaderContext) => {
      if (!context.config.i18n) throw new Error("i18n configuration is missing in your astro config");

      const { locales, defaultLocale } = context.config.i18n;
      const localeCodes = locales.flatMap((locale) => (typeof locale === "string" ? locale : locale.codes));

      const parseData = context.parseData;
      const parseDataProxy: typeof parseData = (props) => {
        if (!props.filePath) return parseData(props);
        const locale = parseLocale(props.filePath, localeCodes, defaultLocale);
        const translationId = createTranslationId(props.filePath, locale);
        const contentPath = createContentPath(props.filePath, options.base, locale);
        const basePath = context.config.base;
        return parseData({ ...props, data: { ...props.data, locale, translationId, contentPath, basePath } });
      };
      context.parseData = parseDataProxy;

      await globLoader.load(context);
    },
  };
}
