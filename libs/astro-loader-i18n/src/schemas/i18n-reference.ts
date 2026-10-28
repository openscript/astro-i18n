import { z } from "astro/zod";

export type I18nReferenceIdFormat = "suffix" | "folder" | "file";

export type I18nReferenceOptions = {
  /**
   * Id layout of the referenced collection:
   * - `suffix` (default): `{id}{locale}`, e.g. `example.en.md` -> `exampleen` (i18nLoader)
   * - `folder`: `{locale}/{id}`, e.g. `en/example.md` -> `en/example` (i18nLoader)
   * - `file`: `{id}/{locale}` (i18nContentLoader, i18nFileLoader)
   */
  idFormat?: I18nReferenceIdFormat;
};

type Pending = { collection: string; id: string; idFormat: I18nReferenceIdFormat };

// Marks values that still need the entry's locale, which is only known at object level.
const pending = new WeakSet<object>();

/**
 * Like Astro's `reference()`, but the locale of the referencing entry is appended to the referenced id.
 * Requires the schema to be wrapped with `extendI18nLoaderSchema`.
 */
export const i18nReference = <Collection extends string>(collection: Collection, options: I18nReferenceOptions = {}) => {
  const idFormat = options.idFormat ?? "suffix";

  return z.union([z.string(), z.object({ id: z.string(), collection: z.string() })]).transform((value) => {
    const result: Pending =
      typeof value === "string" ? { collection, id: value, idFormat } : { collection: value.collection, id: value.id, idFormat };
    pending.add(result);
    return result as unknown as { collection: Collection; id: string };
  });
};

const createId = (id: string, locale: string, idFormat: I18nReferenceIdFormat) => {
  // Astro's glob slugifies ids, which lowercases the locale; ids built by the in-file loaders keep its case.
  switch (idFormat) {
    case "suffix":
      return `${id}${locale.toLowerCase()}`;
    case "folder":
      return `${locale.toLowerCase()}/${id}`;
    case "file":
      return `${id}/${locale}`;
  }
};

export const resolveI18nReferences = <T>(data: T, locale: string): T => {
  if (Array.isArray(data)) return data.map((item) => resolveI18nReferences(item, locale)) as T;
  if (typeof data !== "object" || data === null) return data;

  if (pending.has(data)) {
    const { collection, id, idFormat } = data as unknown as Pending;
    return { collection, id: createId(id, locale, idFormat) } as T;
  }

  if (Object.getPrototypeOf(data) !== Object.prototype) return data;

  return Object.fromEntries(Object.entries(data).map(([key, value]) => [key, resolveI18nReferences(value, locale)])) as T;
};
