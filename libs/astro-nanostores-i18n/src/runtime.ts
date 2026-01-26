import { Components, createI18n, formatter, type Translations } from "@nanostores/i18n";
import { atom } from "nanostores";

export const currentLocale = atom("");
let i18nInstance: ReturnType<typeof createI18n>;
let formatterInstance: ReturnType<typeof formatter>;

const throwNotInitialized = (): never => {
  throw new Error("i18n not initialized. Call initializeI18n first.");
};

export const initializeI18n = (defaultLocale: string, translations: Record<string, Components>) => {
  currentLocale.set(defaultLocale);
  if (!i18nInstance) {
    i18nInstance = createI18n(currentLocale, {
      baseLocale: defaultLocale,
      /* v8 ignore next */
      get: async () => ({}),
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
