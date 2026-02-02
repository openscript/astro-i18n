import { Components, createI18n, formatter, translationsLoading, type TranslationLoader, type Translations } from "@nanostores/i18n";
import { atom } from "nanostores";

/**
 * A reactive store containing the current locale code.
 * This store is automatically updated when the locale changes.
 *
 * @example
 * ```ts
 * import { currentLocale } from 'astro-nanostores-i18n:runtime';
 *
 * // Get the current locale
 * const locale = currentLocale.get(); // e.g., 'en', 'de', 'fr'
 *
 * // Subscribe to locale changes
 * currentLocale.subscribe((locale) => {
 *   console.log('Locale changed to:', locale);
 * });
 * ```
 */
export const currentLocale = atom("");
let i18nInstance: ReturnType<typeof createI18n>;
let formatterInstance: ReturnType<typeof formatter>;

const throwNotInitialized = (): never => {
  throw new Error("i18n not initialized. Call initializeI18n first.");
};

/**
 * Options for initializing the i18n system.
 */
export interface InitializeI18nOptions {
  /**
   * The default locale code to use (e.g., 'en', 'de').
   * This will be set as the base locale for translations.
   */
  defaultLocale: string;
  /**
   * Pre-loaded translations organized by locale.
   * Keys are locale codes, values are translation components.
   */
  translations: Record<string, Components>;
  /**
   * Optional callback function to dynamically fetch translations.
   * Called when translations for a locale are not in the cache.
   *
   * @param code - The locale code to fetch translations for.
   * @param components - Array of component names that need translations.
   * @returns A promise resolving to the translations object.
   *
   * @example
   * ```ts
   * get: async (code, components) => {
   *   const response = await fetch(`/translations/${code}.json`);
   *   return response.json();
   * }
   * ```
   */
  get?: TranslationLoader;
}

/**
 * Initializes the i18n system with the provided options.
 * This must be called before using any other i18n functions.
 *
 * @param options - Configuration options for i18n initialization.
 *
 * @example
 * ```ts
 * import { initializeI18n } from 'astro-nanostores-i18n:runtime';
 *
 * initializeI18n({
 *   defaultLocale: 'en',
 *   translations: {
 *     en: { MyComponent: { hello: 'Hello' } },
 *     de: { MyComponent: { hello: 'Hallo' } },
 *   },
 *   get: async (code) => {
 *     const response = await fetch(`/api/translations/${code}`);
 *     return response.json();
 *   },
 * });
 * ```
 */
export const initializeI18n = (options: InitializeI18nOptions) => {
  const { defaultLocale, translations, get } = options;
  currentLocale.set(defaultLocale);
  if (!i18nInstance) {
    i18nInstance = createI18n(currentLocale, {
      baseLocale: defaultLocale,
      /* v8 ignore next */
      get: get ?? (async () => ({})),
      cache: translations,
      isSSR: true,
    });
  }
  formatterInstance = formatter(currentLocale);
};

/**
 * Returns the underlying nanostores i18n instance.
 * Useful for advanced use cases where direct access to the i18n instance is needed.
 *
 * @returns The i18n instance created by `createI18n`.
 * @throws Error if called before `initializeI18n`.
 *
 * @example
 * ```ts
 * import { getI18nInstance } from 'astro-nanostores-i18n:runtime';
 *
 * const i18n = getI18nInstance();
 * const messages = i18n('MyComponent', { hello: 'Hello' });
 * ```
 */
export const getI18nInstance = () => {
  if (!i18nInstance) throwNotInitialized();
  return i18nInstance;
};

/**
 * Returns the underlying nanostores formatter instance.
 * Useful for advanced use cases where direct access to the formatter is needed.
 *
 * @returns The formatter instance created by `formatter`.
 * @throws Error if called before `initializeI18n`.
 *
 * @example
 * ```ts
 * import { getFormatterInstance } from 'astro-nanostores-i18n:runtime';
 *
 * const formatterStore = getFormatterInstance();
 * formatterStore.subscribe((fmt) => {
 *   console.log(fmt.number(1234.56));
 * });
 * ```
 */
export const getFormatterInstance = () => {
  if (!formatterInstance) throwNotInitialized();
  return formatterInstance;
};

/**
 * Returns a formatter object for the current locale with methods to format
 * numbers, dates, and relative times using the Intl API.
 *
 * @returns A formatter object with `number`, `time`, and `relativeTime` methods.
 * @throws Error if called before `initializeI18n`.
 *
 * @example
 * ```ts
 * import { useFormat } from 'astro-nanostores-i18n:runtime';
 *
 * const { number, time, relativeTime } = useFormat();
 *
 * number(1234.56); // '1,234.56' (in en locale)
 * time(new Date()); // 'January 30, 2026'
 * relativeTime(-1, 'day'); // 'yesterday'
 * ```
 */
export const useFormat = () => {
  return getFormatterInstance().get();
};

/**
 * Returns translations for a specific component in the current locale.
 * This is the primary way to access translations in your components.
 *
 * @param componentName - A unique identifier for the component's translations.
 * @param baseTranslations - The base (default) translations for the component.
 * @returns The translations object for the current locale.
 * @throws Error if called before `initializeI18n`.
 *
 * @example
 * ```ts
 * import { useI18n } from 'astro-nanostores-i18n:runtime';
 *
 * const t = useI18n('MyComponent', {
 *   hello: 'Hello',
 *   goodbye: 'Goodbye',
 * });
 *
 * console.log(t.hello); // 'Hello' (or translated value for current locale)
 * ```
 */
export const useI18n = <Body extends Translations>(componentName: string, baseTranslations: Body) => {
  return getI18nInstance()(componentName, baseTranslations).get();
};

/**
 * Async version of useI18n that waits for translations to be loaded.
 * Use this when you have a dynamic translation loader configured and need
 * to ensure translations are fetched before rendering.
 *
 * @param componentName - A unique identifier for the component's translations.
 * @param baseTranslations - The base (default) translations for the component.
 * @returns A promise that resolves to the translations object for the current locale.
 * @throws Error if called before `initializeI18n`.
 *
 * @example
 * ```ts
 * import { useI18nAsync } from 'astro-nanostores-i18n:runtime';
 *
 * const t = await useI18nAsync('MyComponent', {
 *   hello: 'Hello',
 *   goodbye: 'Goodbye',
 * });
 *
 * console.log(t.hello); // 'Hello' (or translated value for current locale)
 * ```
 */
export const useI18nAsync = async <Body extends Translations>(componentName: string, baseTranslations: Body): Promise<Body> => {
  const i18n = getI18nInstance();
  const store = i18n(componentName, baseTranslations);
  const unsubscribe = store.listen(() => {});
  await translationsLoading(i18n);
  unsubscribe();
  return store.get();
};

/**
 * Clears the translation cache. This can be useful when translations change
 * and need to be refetched on the next render.
 *
 * @param locale - Optional. If provided, only clears the cache for the specified locale.
 *                 If not provided, clears the entire cache.
 * @throws Error if called before `initializeI18n`.
 *
 * @example
 * ```ts
 * import { clearCache, currentLocale } from 'astro-nanostores-i18n:runtime';
 *
 * // Clear cache for a specific locale
 * clearCache('de');
 *
 * // Clear the entire cache
 * clearCache();
 *
 * // Force refetch by changing locale
 * currentLocale.set('de');
 * ```
 */
export const clearCache = (locale?: string) => {
  if (!i18nInstance) throwNotInitialized();
  const cache = i18nInstance.cache;
  if (locale) {
    delete cache[locale];
  } else {
    for (const key in cache) {
      delete cache[key];
    }
  }
};
