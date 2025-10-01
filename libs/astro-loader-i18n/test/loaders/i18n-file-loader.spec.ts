import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoaderContext } from "astro/loaders";
import { createLoaderContext } from "../__mocks__/loader-context";
import { contentFixture } from "../__fixtures__/collections";
import { i18nFileLoader } from "../../src/loaders/i18n-file-loader";

vi.mock("astro/loaders", () => {
  return {
    file: () => {
      return {
        load: vi.fn().mockImplementation(async (context: LoaderContext) => {
          contentFixture.forEach(async (entry) => {
            context.store.set({ ...entry, data: await context.parseData(entry) });
          });
        }),
      };
    },
  };
});

describe("i18nFileLoader", () => {
  let context: LoaderContext;

  beforeEach(() => {
    context = createLoaderContext();
  });

  it("should put common translation id and locale in data", async () => {
    const loader = i18nFileLoader("/content/gallery/space.yml");
    await loader.load(context);

    const entries = context.store.entries();
    expect(entries).toMatchSnapshot();
  });

  it("should throw error if i18n config is missing", async () => {
    const loader = i18nFileLoader("/content/gallery/space.yml");
    context.config.i18n = undefined;

    await expect(loader.load(context)).rejects.toThrowErrorMatchingSnapshot();
  });
});
