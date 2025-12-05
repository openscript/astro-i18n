import { file, Loader } from "astro/loaders";
import { createContentLoader } from "./create-content-loader";

type FileOptions = Parameters<typeof file>;

/**
 * A loader function for handling internationalization (i18n) content in an Astro project.
 * This loader processes a single data file (yaml, json) and augments their data with
 * i18n-specific metadata such as locale, translation ID, and content path.
 *
 * @param fileName - The name of the file to be processed.
 * @param options - Configuration options for matching the file.
 * @returns A loader object with a custom `load` method for processing i18n content.
 *
 * @throws Will throw an error if the `i18n` configuration is missing in the Astro config.
 */
export function i18nFileLoader(fileName: FileOptions[0], options?: FileOptions[1]): Loader {
  const fileLoader = file(fileName, options);
  const load = createContentLoader(fileLoader);
  return {
    name: "i18n-file-loader",
    load,
  };
}
