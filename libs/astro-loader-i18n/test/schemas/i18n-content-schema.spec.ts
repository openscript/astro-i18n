import { expect, describe, it } from "vitest";
import { localized } from "../../src/astro-loader-i18n";
import { z } from "astro/zod";

describe("i18nContentSchema", () => {
  it("should accept a complete localized object or the base value", () => {
    const schema = localized(z.string(), ["en", "fr", "de"] as const);
    const content = { en: "Hello", fr: "Bonjour", de: "Hallo" };

    expect(schema.parse(content)).toEqual(content);
    expect(schema.parse("Hello")).toBe("Hello");
  });

  it.each(["en", "fr", "de"] as const)("should require the %s locale by default", (locale) => {
    const schema = localized(z.string(), ["en", "fr", "de"] as const);
    const content: Partial<Record<"en" | "fr" | "de", string>> = { en: "Hello", fr: "Bonjour", de: "Hallo" };
    delete content[locale];

    expect(schema.safeParse(content).success).toBe(false);
  });

  it("should allow missing locales when partial is set", () => {
    const schema = localized(z.string(), ["en", "fr", "de"] as const, true);

    expect(schema.parse({ en: "Hello" })).toEqual({ en: "Hello" });
    expect(schema.parse({})).toEqual({});
    expect(schema.parse("Hello")).toBe("Hello");
  });

  it.each([false, true])("should validate the base schema with partial=%s", (partial) => {
    const schema = localized(z.string().min(1), ["en", "fr", "de"] as const, partial);

    expect(schema.safeParse({ en: 123, fr: "Bonjour", de: "Hallo" }).success).toBe(false);
    expect(schema.safeParse({ en: "", fr: "Bonjour", de: "Hallo" }).success).toBe(false);
    expect(schema.safeParse(123).success).toBe(false);
    expect(schema.safeParse("").success).toBe(false);
  });
});
