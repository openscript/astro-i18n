declare module "astro-nanostores-i18n:runtime" {
  import type { Components, TranslationLoader, Translations } from "@nanostores/i18n";
  export interface InitializeI18nOptions {
    defaultLocale: string;
    translations: Record<string, Components>;
    get?: TranslationLoader;
  }
  export declare const currentLocale: import("nanostores").PreinitializedWritableAtom<string> & object;
  export declare const initializeI18n: (options: InitializeI18nOptions) => void;
  export declare const useFormat: () => import("@nanostores/i18n").Formatter;
  export declare const useI18n: <Body extends Translations>(componentName: string, baseTranslations: Body) => Body;
  export declare const useI18nAsync: <Body extends Translations>(componentName: string, baseTranslations: Body) => Promise<Body>;
  export declare const getI18nInstance: () => ReturnType<typeof import("@nanostores/i18n").createI18n>;
  export declare const getFormatterInstance: () => ReturnType<typeof import("@nanostores/i18n").formatter>;
  export declare const clearCache: (locale?: string) => void;
}
