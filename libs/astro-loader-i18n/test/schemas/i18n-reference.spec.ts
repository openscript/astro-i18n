import { describe, expect, it } from "vitest";
import { z } from "astro/zod";
import { extendI18nLoaderSchema, i18nReference } from "../../src/astro-loader-i18n";

const base = { translationId: "post", locale: "de", contentPath: "post.de.md", basePath: "/blog" };

describe("i18nReference", () => {
  it("appends the locale as suffix by default", () => {
    const schema = extendI18nLoaderSchema(z.object({ example: i18nReference("example") }));

    expect(schema.parse({ ...base, example: "intro" }).example).toEqual({ collection: "example", id: "introde" });
  });

  it("lowercases the locale for slugified ids", () => {
    const schema = extendI18nLoaderSchema(z.object({ example: i18nReference("example") }));

    expect(schema.parse({ ...base, locale: "de-CH", example: "intro" }).example).toEqual({ collection: "example", id: "introde-ch" });
  });

  it("prepends the locale in folder format", () => {
    const schema = extendI18nLoaderSchema(z.object({ example: i18nReference("example", { idFormat: "folder" }) }));

    expect(schema.parse({ ...base, locale: "de-CH", example: "intro" }).example).toEqual({ collection: "example", id: "de-ch/intro" });
  });

  it("appends the locale with a slash in file format and keeps its case", () => {
    const schema = extendI18nLoaderSchema(z.object({ example: i18nReference("example", { idFormat: "file" }) }));

    expect(schema.parse({ ...base, locale: "de-CH", example: "intro" }).example).toEqual({ collection: "example", id: "intro/de-CH" });
  });

  it("accepts the object form", () => {
    const schema = extendI18nLoaderSchema(z.object({ example: i18nReference("example") }));

    expect(schema.parse({ ...base, example: { collection: "other", id: "intro" } }).example).toEqual({ collection: "other", id: "introde" });
  });

  it("resolves arrays and optional references", () => {
    const schema = extendI18nLoaderSchema(z.object({ list: z.array(i18nReference("example")), maybe: i18nReference("example").optional() }));
    const result = schema.parse({ ...base, locale: "en", list: ["a", "b"] });

    expect(result.list).toEqual([
      { collection: "example", id: "aen" },
      { collection: "example", id: "ben" },
    ]);
    expect(result.maybe).toBeUndefined();
  });
});
