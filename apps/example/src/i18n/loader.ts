import type { TranslationLoader } from "@nanostores/i18n";
import extractJson from "../translations/extract.json";
import zhCN from "../translations/zh-CN.json";

/**
 * Simulates async translation loading.
 * In a real application, this would fetch translations from an API or database.
 *
 * This loader prefixes all translations with [ASYNC LOADER] to demonstrate
 * that translations are being loaded from this function.
 */
const loader: TranslationLoader = async (locale) => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Load translations and mark them as coming from the async loader
  const baseTranslations = locale === "zh-CN" ? zhCN : extractJson;

  // Add [ASYNC LOADER] prefix to all translations to prove they came from the loader
  const loaderData = JSON.parse(JSON.stringify(baseTranslations));

  Object.keys(loaderData).forEach((key) => {
    const component = loaderData[key];
    if (typeof component === "object" && component !== null) {
      Object.keys(component).forEach((prop) => {
        const value = component[prop];
        if (typeof value === "string") {
          component[prop] = `[ASYNC LOADER] ${value}`;
        }
      });
    }
  });

  return loaderData;
};

export default loader;
