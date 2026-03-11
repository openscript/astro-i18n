import { z } from "astro/zod";

/**
 * Schema definition for the i18n loader configuration.
 * This schema validates the structure of the i18n loader object.
 *
 * Properties:
 * - `translationId` (string): A unique identifier for the translation.
 * - `locale` (string): The locale code (e.g., "en", "fr", "es") for the translation.
 * - `contentPath` (string): The path from the contents root to the content file.
 * - `basePath` (string): The base directory path of your website. This is used by i18nPropsAndParams to provide paths with a base path.
 */
export const i18nLoaderSchema = z.object({
  translationId: z.string(),
  locale: z.string(),
  contentPath: z.string(),
  basePath: z.string(),
});

/**
 * Extends the base `i18nLoaderSchema` with additional schema definitions.
 *
 * @template Z - A Zod object schema that will be merged with the base schema.
 * @param schema - The Zod schema to extend the base `i18nLoaderSchema`.
 * @returns A new schema resulting from merging the base `i18nLoaderSchema` with the provided schema.
 */
export const extendI18nLoaderSchema = <Z extends z.ZodObject>(schema: Z) => i18nLoaderSchema.merge(schema);

const i18nLoaderEntrySchema = z.object({
  data: i18nLoaderSchema,
  filePath: z.string().optional(),
});
export type I18nLoaderEntry = z.infer<typeof i18nLoaderEntrySchema>;

const i18nLoaderCollectionSchema = z.array(i18nLoaderEntrySchema);
export type I18nLoaderCollection = z.infer<typeof i18nLoaderCollectionSchema>;

export function checkI18nLoaderCollection(obj: unknown): asserts obj is I18nLoaderCollection {
  const result = i18nLoaderCollectionSchema.safeParse(obj);

  if (!result.success) {
    throw new Error(
      `Invalid collection entry was provided to astro-i18n-loader. Did you forget to use "extendI18nLoaderSchema" to extend the schema in your "content.config.js" definition? Validation failed with:\n\n${result.error}`
    );
  }
}
