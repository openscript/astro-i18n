import { Components, createI18n, formatter, type TranslationLoader, type Translations } from "@nanostores/i18n";
import { atom } from "nanostores";

export const currentLocale = atom("");
let i18nInstance: ReturnType<typeof createI18n>;
let formatterInstance: ReturnType<typeof formatter>;

const throwNotInitialized = (): never => {
  throw new Error("i18n not initialized. Call initializeI18n first.");
};

export interface InitializeI18nOptions {
  defaultLocale: string;
  translations: Record<string, Components>;
  get?: TranslationLoader;
}

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

export const getI18nInstance = () => {
  if (!i18nInstance) throwNotInitialized();
  return i18nInstance;
};

export const getFormatterInstance = () => {
  if (!formatterInstance) throwNotInitialized();
  return formatterInstance;
};

export const useFormat = () => {
  return getFormatterInstance().get();
};

export const useI18n = <Body extends Translations>(componentName: string, baseTranslations: Body) => {
  return getI18nInstance()(componentName, baseTranslations).get();
};

/**
 * Clears the translation cache. This can be useful when translations change
 * and need to be refetched on the next render.
 *
 * @param locale - Optional. If provided, only clears the cache for the specified locale.
 *                 If not provided, clears the entire cache (except the base locale).
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
