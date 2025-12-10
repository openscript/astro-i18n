import { createContentPath, createTranslationId, getAllUniqueKeys, pruneLocales } from "astro-utils-i18n";
import { glob, Loader, LoaderContext } from "astro/loaders";

const UNDETERMINED_LOCALE = "und";
const IMAGE_IMPORT_PREFIX = "__ASTRO_IMAGE_";
type GlobOptions = Parameters<typeof glob>[0];

// Helper to find all __ASTRO_IMAGE_ prefixed strings in an object tree
function findAssetImports(obj: unknown, assets: string[] = []): string[] {
  if (typeof obj === "string" && obj.startsWith(IMAGE_IMPORT_PREFIX)) {
    assets.push(obj.replace(IMAGE_IMPORT_PREFIX, ""));
  } else if (Array.isArray(obj)) {
    obj.forEach((item) => findAssetImports(item, assets));
  } else if (obj && typeof obj === "object") {
    Object.values(obj).forEach((value) => findAssetImports(value, assets));
  }
  return assets;
}

export function createContentLoader(loader: Loader, base?: GlobOptions["base"]) {
  return async (context: LoaderContext) => {
    if (!context.config.i18n) throw new Error("i18n configuration is missing in your astro config");

    const { locales } = context.config.i18n;
    const localeCodes = locales.flatMap((locale) => (typeof locale === "string" ? locale : locale.codes));

    const parseData = context.parseData;
    const parseDataProxy: typeof parseData = (props) => {
      if (!props.filePath) return parseData(props);
      const locale = UNDETERMINED_LOCALE;
      const translationId = createTranslationId(props.filePath);
      const contentPath = createContentPath(props.filePath, base);
      const basePath = context.config.base;
      return parseData({ ...props, data: { ...props.data, locale, translationId, contentPath, basePath } });
    };
    context.parseData = parseDataProxy;

    // Create a proxy for the store to intercept set/delete/keys calls and transform entries on the fly
    // This ensures entry manipulation happens both on initial load AND during hot reload
    const originalStore = context.store;
    // Track which original IDs map to which locale-suffixed IDs
    const idToLocaleIds = new Map<string, string[]>();

    // On subsequent runs, rebuild the mapping from existing store entries
    // Entries are stored as "originalId/locale", so we can reconstruct the mapping
    for (const key of originalStore.keys()) {
      const lastSlashIndex = key.lastIndexOf("/");
      if (lastSlashIndex !== -1) {
        const potentialLocale = key.substring(lastSlashIndex + 1);
        if (localeCodes.includes(potentialLocale)) {
          const originalId = key.substring(0, lastSlashIndex);
          const existing = idToLocaleIds.get(originalId) || [];
          existing.push(key);
          idToLocaleIds.set(originalId, existing);
        }
      }
    }

    const storeProxy = new Proxy(originalStore, {
      get(target, prop, receiver) {
        if (prop === "get") {
          // Don't proxy get() - let the glob loader think entries don't exist by original ID
          // This forces re-parsing on each run, which ensures images are correctly transformed
          // The performance cost is acceptable because content files are typically small
          return (key: string) => {
            // Only return the entry if it's not a locale-transformed ID
            // This way, original IDs won't find cached entries and will be re-parsed
            if (idToLocaleIds.has(key)) {
              return undefined;
            }
            return target.get(key);
          };
        }
        if (prop === "set") {
          return (entry: Parameters<typeof originalStore.set>[0]) => {
            const entryLocales = Array.from(getAllUniqueKeys(entry.data)).filter((key) => localeCodes.includes(key));
            if (entryLocales.length === 0) {
              return target.set(entry);
            } else {
              let result = false;
              const localeIds: string[] = [];
              entryLocales.forEach((locale) => {
                const entryData = pruneLocales(entry.data, entryLocales, locale);
                const localeId = `${entry.id}/${locale}`;
                localeIds.push(localeId);
                const setResult = target.set({ ...entry, id: localeId, data: { ...entryData, locale } });
                if (setResult) result = true;

                // Manually register asset imports for this locale entry
                // This is needed because the store's set() returns early if digest matches,
                // skipping the addAssetImports call. We need to ensure images are registered on every run.
                // Find __ASTRO_IMAGE_ prefixed strings in the pruned data
                if (entry.filePath) {
                  const assetImports = findAssetImports(entryData);
                  if (assetImports.length > 0) {
                    (target as unknown as { addAssetImports: (assets: string[], filePath: string) => void }).addAssetImports(
                      assetImports,
                      entry.filePath
                    );
                  }
                }
              });
              // Track the mapping from original ID to locale-suffixed IDs
              idToLocaleIds.set(entry.id, localeIds);
              return result;
            }
          };
        }
        if (prop === "delete") {
          return (key: string) => {
            // Check if this ID was transformed into locale-suffixed IDs
            const localeIds = idToLocaleIds.get(key);
            if (localeIds) {
              localeIds.forEach((localeId) => target.delete(localeId));
              idToLocaleIds.delete(key);
            } else {
              // Fallback: delete the key as-is (might be a non-i18n entry)
              target.delete(key);
            }
          };
        }
        if (prop === "keys") {
          // Return original IDs (without locale suffix) so glob loader's untouchedEntries works correctly
          return () => {
            const originalIds = new Set<string>();
            for (const key of target.keys()) {
              // Check if this key is a locale-suffixed ID
              const lastSlashIndex = key.lastIndexOf("/");
              if (lastSlashIndex !== -1) {
                const potentialLocale = key.substring(lastSlashIndex + 1);
                if (localeCodes.includes(potentialLocale)) {
                  originalIds.add(key.substring(0, lastSlashIndex));
                  continue;
                }
              }
              // Not a locale-suffixed ID, return as-is
              originalIds.add(key);
            }
            return Array.from(originalIds);
          };
        }
        const value = Reflect.get(target, prop, receiver);
        // Bind methods to the original target to preserve private field access
        if (typeof value === "function") {
          return value.bind(target);
        }
        return value;
      },
    });
    context.store = storeProxy;

    await loader.load(context);
  };
}
