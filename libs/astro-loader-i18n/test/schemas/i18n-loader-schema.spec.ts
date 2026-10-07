import { expect, describe, it } from "vitest";
import { extendI18nLoaderSchema } from "../../src/astro-loader-i18n";
import { z } from "astro/zod";
import { checkI18nLoaderCollection } from "../../src/schemas/i18n-loader-schema";

describe("i18nLoaderSchema", () => {
  it("should extend the schema", () => {
    const schema = extendI18nLoaderSchema(z.object({ title: z.string() }));
    const content = { translationId: "post", locale: "en", contentPath: "post.en.md", basePath: "/blog", title: "Hello" };

    expect(schema.parse(content)).toEqual(content);
  });

  it.each(["translationId", "locale", "contentPath", "basePath", "title"] as const)("should require and validate %s", (field) => {
    const schema = extendI18nLoaderSchema(z.object({ title: z.string() }));
    const content: Partial<Record<typeof field, string>> = {
      translationId: "post",
      locale: "en",
      contentPath: "post.en.md",
      basePath: "/blog",
      title: "Hello",
    };
    delete content[field];

    expect(schema.safeParse(content).success).toBe(false);
    expect(schema.safeParse({ ...content, [field]: 123 }).success).toBe(false);
  });

  it("should preserve constraints from the extended schema", () => {
    const schema = extendI18nLoaderSchema(z.object({ title: z.string().min(1) }));

    expect(schema.safeParse({ translationId: "post", locale: "en", contentPath: "post.en.md", basePath: "/blog", title: "" }).success).toBe(
      false
    );
  });

  it("should accept a valid loader collection", () => {
    const collection = [
      { data: { translationId: "post", locale: "en", contentPath: "post.en.md", basePath: "/blog" }, filePath: "content/post.en.md" },
    ];

    expect(() => checkI18nLoaderCollection(collection)).not.toThrow();
  });
  it("should throw an error when checkI18nLoaderCollection fails", () => {
    const invalidData = [
      { data: { translationId: "1", locale: "en", contentPath: "" } },
      { data: { translationId: "2", locale: "fr" } },
      { data: { translationId: "3" } },
    ];

    expect(() => checkI18nLoaderCollection(invalidData)).toThrowErrorMatchingSnapshot();
  });
});
