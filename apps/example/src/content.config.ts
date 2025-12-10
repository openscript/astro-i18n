import { defineCollection, z } from "astro:content";
import { extendI18nLoaderSchema, i18nContentLoader, i18nLoader, localized } from "astro-loader-i18n";
import { C } from "./site.config";

const filesCollection = defineCollection({
  loader: i18nLoader({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/files" }),
  schema: extendI18nLoaderSchema(
    z.object({
      title: z.string(),
    })
  ),
});
const folderCollection = defineCollection({
  loader: i18nLoader({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/folder" }),
  schema: extendI18nLoaderSchema(
    z.object({
      title: z.string(),
    })
  ),
});
const infileCollection = defineCollection({
  loader: i18nContentLoader({ pattern: "**/[^_]*.{yml,yaml}", base: "./src/content/infile" }),
  schema: ({ image }) =>
    extendI18nLoaderSchema(
      z.object({
        navigation: localized(
          z.array(
            z.object({
              path: z.string(),
              title: z.string(),
              icon: image(),
            })
          ),
          C.LOCALES
        ),
      })
    ),
});

export const collections = {
  files: filesCollection,
  folder: folderCollection,
  infile: infileCollection,
};
