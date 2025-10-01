export { i18nContentLoader } from "./loaders/i18n-content-loader";
export { i18nFileLoader } from "./loaders/i18n-file-loader";
export { i18nLoader } from "./loaders/i18n-loader";
export { localized } from "./schemas/i18n-content-schema";
export { extendI18nLoaderSchema, i18nLoaderSchema } from "./schemas/i18n-loader-schema";
export { i18nPropsAndParams, i18nProps } from "./props-and-params/i18n-props-and-params";
export { createI18nCollection } from "./collections/create-i18n-collection";

import { resolvePath as _resolvePath } from "astro-utils-i18n";

type resolvePathType = (...paths: Array<string | number | undefined>) => string;

export const resolvePath: resolvePathType = _resolvePath;
