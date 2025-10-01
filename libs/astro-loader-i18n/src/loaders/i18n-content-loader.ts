import { glob, Loader } from "astro/loaders";
import { createContentLoader } from "./create-content-loader";

type GlobOptions = Parameters<typeof glob>[0];

/**
 * A loader function for handling internationalization (i18n) content in an Astro project.
 * This loader processes files matching the specified glob pattern, associates them with locales,
 * and augments their data with i18n-specific metadata such as locale, translation ID, and content path.
 *
 * @param options - Configuration options for the glob pattern to match files.
 * @returns A loader object with a custom `load` method for processing i18n content.
 *
 * @throws Will throw an error if the `i18n` configuration is missing in the Astro config.
 */
export function i18nContentLoader(options: GlobOptions): Loader {
  const globLoader = glob(options);
  return {
    name: "i18n-content-loader",
    load: createContentLoader(globLoader, options.base),
  };
}
