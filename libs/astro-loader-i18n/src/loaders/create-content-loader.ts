import { createContentPath, createTranslationId, getAllUniqueKeys, pruneLocales } from "astro-utils-i18n";
import { glob, Loader, LoaderContext } from "astro/loaders";

const UNDETERMINED_LOCALE = "und";
type GlobOptions = Parameters<typeof glob>[0];

export function createContentLoader(loader: Loader, base?: GlobOptions["base"]) {
  return async (context: LoaderContext) => {
    if (!context.config.i18n) throw new Error("i18n configuration is missing in your astro config");

    const { locales } = context.config.i18n;
    const localeCodes = locales.flatMap((locale) => (typeof locale === "string" ? locale : locale.codes));

    const parseData = context.parseData.bind(context);
    const parseDataProxy: typeof parseData = (props) => {
      if (!props.filePath) return parseData(props);
      const locale = UNDETERMINED_LOCALE;
      const translationId = createTranslationId(props.filePath);
      const contentPath = createContentPath(props.filePath, base);
      const basePath = context.config.base;
      return parseData({ ...props, data: { ...props.data, locale, translationId, contentPath, basePath } });
    };
    context.parseData = parseDataProxy;

    const storeSet = context.store.set.bind(context.store);
    const storeSetProxy: typeof storeSet = (entry) => {
      const entryLocales = Array.from(getAllUniqueKeys(entry.data)).filter((key) => localeCodes.includes(key));

      if (entryLocales.length === 0) {
        return storeSet(entry);
      } else {
        const results: boolean[] = [];
        entryLocales.forEach((locale) => {
          const entryData = pruneLocales(entry.data, entryLocales, locale);
          results.push(storeSet({ ...entry, id: `${entry.id}/${locale}`, data: { ...entryData, locale } }));
        });
        return results.every((result) => result);
      }
    };
    context.store.set = storeSetProxy;

    const storeDelete = context.store.delete.bind(context.store);
    const storeDeleteProxy: typeof storeDelete = (key) => {
      // Check if this key ends with a locale code (e.g., "about/de-CH" or "about/zh-CN")
      const endsWithLocale = localeCodes.some((locale) => key.endsWith(`/${locale}`));
      if (endsWithLocale) {
        // Don't delete locale-specific entries - they will be recreated if needed
        return false;
      }
      return storeDelete(key);
    };
    context.store.delete = storeDeleteProxy;

    await loader.load(context);
  };
}
