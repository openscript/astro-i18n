# astro-loader-i18n

[![NPM Downloads](https://img.shields.io/npm/dw/astro-loader-i18n)](https://npmjs.org/astro-loader-i18n)
[![npm bundle size](https://img.shields.io/bundlephobia/min/astro-loader-i18n)](https://npmjs.org/astro-loader-i18n)

`astro-loader-i18n` is a **content loader** for internationalized content in [Astro](https://astro.build). It builds on top of Astro’s [`glob()` loader](https://docs.astro.build/en/reference/content-loader-reference/#glob-loader) and helps manage translations by detecting locales, mapping content, and enriching `getStaticPaths`.

## Features

### ✅ Automatic locale detection

- Extracts locale information from file names or folder structures:
  <details>
    <summary>📂 Folder structure example</summary>

    ```plaintext
    . (project root)
    ├── README.md
    └── src
        └── content
            └── pages
                ├── de-CH
                │   ├── about.mdx
                │   └── projects.mdx
                └── zh-CN
                    ├── about.mdx
                    └── projects.mdx
    ```
  </details>
  <details>
    <summary>📄 File name suffix example</summary>

    ```plaintext
    . (project root)
    └── src
        └── content
            └── pages
                ├── about.de-CH.mdx
                ├── about.zh-CN.mdx
                ├── projects.de-CH.mdx
                └── projects.zh-CN.mdx
    ```
  </details>

- Supports nested folders:
  <details>
    <summary>📂 Nested folder structure example</summary>

    ```plaintext
    . (project root)
    └── src
        └── content
            └── pages
                ├── de-CH
                │   ├── about.mdx
                │   └── projects
                │       ├── project1.mdx
                │       └── project2.mdx
                └── zh-CN
                    ├── about.mdx
                    └── projects
                        ├── project1.mdx
                        └── project2.mdx
    ```
  </details>

### ✅ Translation mapping
- Generates a translation identifier to easily match different language versions of content.

### ✅ Schema support
- Helps to define schemas for your localized content.
- Add `translationId` and `locale` to the schema by using `extendI18nLoaderSchema`. You need this when using `i18nLoader` or `i18nContentLoader`.
- When you have multiple locales in a single file, you can use `localized` to define the necessary schema. This is useful when using `i18nContentLoader`.

### ✅ `getStaticPaths()` helpers included
- Includes a helper utility called `i18nPropsAndParams`
  - Helps to fill and translate URL params like `[...locale]/[files]/[slug]`, whereas `[...locale]` is the locale, `[files]` is a translated segment and `[slug]` is the slug of the title.
  - Adds a `translations` object to each entry, which contains paths to the corresponding content of all existing translations.

### ✅ Type safety
- Keeps `Astro.props` type-safe.

## Usage

1. Install the package `astro-loader-i18n`:
   <details open>
    <summary>npm</summary>

    ```bash
    npm install astro-loader-i18n
    ```
   </details>
   <details>
     <summary>yarn</summary>

     ```bash
     yarn add astro-loader-i18n
     ```
   </details>
   <details>
     <summary>pnpm</summary>

     ```bash
     pnpm add astro-loader-i18n
     ```
   </details>

2. Configure locales, a default locale and segments for example in a file called `site.config.ts`:

   ```typescript
   export const C = {
     LOCALES: ["de-CH", "zh-CN"],
     DEFAULT_LOCALE: "de-CH" as const,
     SEGMENT_TRANSLATIONS: {
       "de-CH": {
         files: "dateien",
       },
       "zh-CN": {
         files: "files",
       },
     },
   };
   ```

3. Configure i18n in `astro.config.ts`:

   ```typescript
   import { defineConfig } from "astro/config";
   import { C } from "./src/site.config";

   export default defineConfig({
     i18n: {
       locales: C.LOCALES,
       defaultLocale: C.DEFAULT_LOCALE,
     },
   });
   ```

4. Define collections using `astro-loader-i18n` in `content.config.ts`. Don't forget to use `extendI18nLoaderSchema` or `localized` to extend the schema with the i18n specific properties:

   ```typescript
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

   /*
    Example of a content file:
    navigation:
      de-CH:
        - path: /projekte
          title: Projekte
        - path: /ueber-mich
          title: Über mich
      zh-CN:
        - path: /zh/projects
          title: 项目
        - path: /zh/about-me
          title: 关于我
   */
   const infileCollection = defineCollection({
     loader: i18nContentLoader({ pattern: "**/[^_]*.{yml,yaml}", base: "./src/content/infile" }),
     schema: extendI18nLoaderSchema( // `extendI18nLoaderSchema` defines `translationId` and `locale` for you in the schema.
       z.object({
         navigation: localized( // `localized` defines an object with the locale as key and applies the schema you provide to the value.
           z.array(
             z.object({
               path: z.string(),
               title: z.string(),
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
   ```

5. Create content files in the defined structure:
   > ⚠️ WARNING
   > The content files need to be structured according to the locales defined in `astro.config.ts`.

   ```
   . (project root)
   └── src
       └── content
           └── pages
               ├── about.de-CH.mdx
               ├── about.zh-CN.mdx
               ├── projects.de-CH.mdx
               └── projects.zh-CN.mdx
   ```

6. Retrieve the `locale` and `translationId` identifier during rendering:

   ```typescript
   import { getCollection } from "astro:content";

   const pages = await getCollection("files");
   console.log(pages["data"].locale); // e.g. de-CH
   console.log(pages["data"].translationId); // e.g. src/content/files/about.mdx
   ```

7. Use `i18nPropsAndParams` to provide params and get available translations paths via the page props:

   ```typescript
   import { i18nPropsAndParams } from "astro-loader-i18n";
   import sluggify from "limax"; // sluggify is used to create a slug from the title

   export const getStaticPaths = async ({ routePattern }) => {
     // ⚠️ If you are using Astro <5.14.0, you need to hardcode the routePattern here.
     // see https://github.com/withastro/astro/pull/13520
     // const routePattern = "[...locale]/[files]/[slug]";
     const filesCollection = await getCollection("files");

     return i18nPropsAndParams(filesCollection, {
       defaultLocale: C.DEFAULT_LOCALE,
       routePattern,
       segmentTranslations: C.SEGMENT_TRANSLATIONS,
       // `generateSegments` is a function that generates per entry individual segments.
       generateSegments: (entry) => ({ slug: sluggify(entry.data.title) }),
     });
   };
   ```

8. Use `Astro.props.translations` to provide a same site language switcher.

### In-file localized content

Sometimes to have multilingual content in a single file is more convenient. For example data for menus or galleries. This allows sharing untranslated content across locales.

Use the `i18nContentLoader` loader to load in-file localized content.

1. Create a collection:
   <details>
     <summary>📄 Infile collection example</summary>

      ```plaintext
     . (project root)
     └── src
         └── content
             └── navigation
                 ├── footer.yml
                 └── main.yml
     ```

   </details>
   <details>
     <summary>📄 Content of <code>main.yml</code></summary>

     ```yaml
     # src/content/navigation/main.yml
     navigation:
       de-CH:
         - path: /projekte
           title: Projekte
         - path: /ueber-mich
           title: Über mich
       zh-CN:
         - path: /zh/projects
           title: 项目
         - path: /zh/about-me
           title: 关于我
     ```

   </details>

1. Use `extendI18nLoaderSchema` and `localized` to define the schema:

   ```typescript
   const infileCollection = defineCollection({
     loader: i18nContentLoader({ pattern: "**/[^_]*.{yml,yaml}", base: "./src/content/infile" }),
     schema: extendI18nLoaderSchema( // `extendI18nLoaderSchema` defines `translationId` and `locale` for you in the schema.
       z.object({
         navigation: localized( // `localized` defines an object with the locale as key and applies the schema you provide to the value.
           z.array(
             z.object({
               path: z.string(),
               title: z.string(),
             })
           ),
           C.LOCALES
         ),
       })
     ),
   });
   ```

1. When you get the collection, you will receive for each locale the localized content. For example if you have two locales `de-CH` and `zh-CN` with two files `main.yml` and `footer.yml`, you will get four entries in the collection:

   ```typescript
   import { getCollection } from "astro:content";

   const navigation = await getCollection("infile");
   console.log(navigation[0].data.locale); // e.g. de-CH
   console.log(navigation[0].data.translationId); // e.g. src/content/infile/main.yml
   console.log(navigation[0].data.navigation); // e.g. [{ path: "/projekte", title: "Projekte" }, ...]
   ```

### Virtual i18n collections

Sometimes you want to translate a page that is not based on i18n content. For example an index page or a 404 page.

`createI18nCollection` allows you to create a virtual collection that is not based on any content:

```typescript
export const getStaticPaths = async () => {
  const routePattern = "[...locale]/[files]";
  const collection = createI18nCollection({ locales: C.LOCALES, routePattern });

  return i18nPropsAndParams(collection, {
    defaultLocale: C.DEFAULT_LOCALE,
    routePattern,
    segmentTranslations: C.SEGMENT_TRANSLATIONS,
  });
};
```

## API

Below you can find a description of all exported functions and types.

### `i18nLoader`

`i18nLoader` parses i18n information from file names or folder structures.

As this is a wrapper around the `glob()` loader, you can use all options from the `glob()` loader. See the [Astro documentation](https://docs.astro.build/en/reference/content-loader-reference/#glob-loader) for more information.

It adds the following properties to an entrys `data` object:

- `locale`: The locale of the entry. This is either the folder name or the file name suffix.
- `translationId`: The translation identifier. This helps to identify the same content in different languages.
- `contentPath`: The path to the file relative to the content base path. This is useful if you want to add the folder names into the path. For example `src/content/pages/de-CH/deeply/nested/about.mdx` it would be `deeply/nested`.
- `basePath`: The base path from the Astro config. This is a workaround, because from `getStaticPaths()` you don't have access to the base path and you need it for generating paths.

### `i18nContentLoader`

`i18nContentLoader` creates multiple entries based on yaml or json files that contain i18n text fields.

See [i18nLoader](#i18nloader) for more information.

### `localized`

`localized` is a helper function to define a schema for in-file localized content. It takes a schema and an array of locales and returns a schema that is an object with the locale as key and the schema as value.

Parameters:
- `schema`: The schema to apply to the value of the object.
- `locales`: An array of locales to use as keys for the object.
- `partial`: Optional. If `true`, not all locales need to be defined in the schema.

### `extendI18nLoaderSchema`

`extendI18nLoaderSchema` is a helper function to extend the schema of the `i18nLoader` and `i18nContentLoader`. It adds the `translationId`, `locale`, `contentPath` and `basePath` properties to the schema.

### `i18nLoaderSchema`

`i18nLoaderSchema` is a schema that is used by the `i18nLoader` and `i18nContentLoader`. It defines the properties that are added to the entrys `data` object.

### `i18nPropsAndParams`

`i18nPropsAndParams` is a helper function to generate the `params` and `props` object for `getStaticPaths()` and to provide the translations object to the page props.

Parameters:
- `collection`: The collection to use. This can be a collection from `getCollection()` or a virtual collection created with `createI18nCollection()`.
- `options`: An object with the following properties:
  - `defaultLocale`: The default locale to use.
  - `routePattern`: The route pattern to use. This is the pattern that is used in the `getStaticPaths()` function. Unfortunately there is no way to access the routePattern, that's why we need to define it here again.
  - `segmentTranslations`: An object with the segment translations. This is used to translate the segments in the URL.
  - `generateSegments`: (Optional) A function that generates the segments for each entry. This is useful if you want to generate slugs or other segments.
  - `localeParamName`: (Optional) The name of the locale parameter in the URL. This is used to generate the URL for the translations object.
  - `prefixDefaultLocale`: (Optional) If `true`, the default locale will be prefixed to the URL. This is useful if you want to have a clean URL for the default locale.

It returns an object with `params` and `props`. `props` contains additionally a `translations` object with the paths to the corresponding content of all existing translations. The `translatedPath` is the current entry path.

### `createI18nCollection`

`createI18nCollection` creates a virtual collection that is not based on any content. This is useful if you want to create a collection for a page that is not based on i18n content.

### `resolvePath`

`resolvePath` is a helper function that connects path segments and deals with slashes.

## Examples

Made by the author of `astro-loader-i18n`:

- Test project ([Source](https://github.com/openscript/astro-loader-i18n/tree/main/apps/example)): Minimal example of how to use `astro-loader-i18n` with Astro.
- Astro Theme International ([Demo](https://openscript.github.io/astro-theme-international/) / [Source](https://github.com/openscript/astro-theme-international)): A demo theme with the goal to be as international as possible.
- r.obin.ch ([Demo](https://r.obin.ch) / [Source](https://github.com/openscript/r.obin.ch)): A personal website with a blog and projects, built with Astro and `astro-loader-i18n`.

Made by the community:
- eCamp3 ([Demo](https://www.ecamp3.ch) / [Source](https://github.com/ecamp/ecamp-site)): A website of an application for camp planning.

## Roadmap

- [x] Add `i18nFileLoader` that is based on Astros `file()` loader
- [ ] Improve types of params returned by `i18nPropsAndParams`
- [ ] Include a language switcher Astro component

## Wish list

To make internationalization easier, **Astro** could offer the following features:

- [x] Provide routing information to `getStaticPaths()` such as the `routePattern` to avoid manual repetition. Also see this pull request: https://github.com/withastro/astro/pull/13520
- [ ] Allow to define custom parameters for `getStaticPaths()` like `paginate` from integrations and loaders. This makes integrating additional helpers for building `getStaticPaths()` way easier.
- [ ] Allow to define different schemas for input (this already exists, today) and output of a loader. This is useful if a loader transforms the data. Currently the schema wouldn't match the output of the loader anymore.
- [ ] Allow to define additional custom properties from loaders apart from the `data` object, that are available inside `getStaticPaths()` and while rendering. This is useful if a loader calculates additional properties that later used in the template and are not necessarily part of the data object to avoid collisions with the user provided data.
