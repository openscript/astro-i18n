import { describe, expect, it, vi, beforeEach } from "vitest";

describe("runtime.ts", () => {
  beforeEach(() => {
    vi.resetModules();
  });
  it("should have an empty current locale", async () => {
    const { currentLocale } = await vi.importActual<typeof import("../src/runtime.ts")>("../src/runtime.ts");
    expect(currentLocale.get()).toBe("");
  });
  it("should throw an error, if i18n was not initialized and used", async () => {
    const { useI18n } = await vi.importActual<typeof import("../src/runtime.ts")>("../src/runtime.ts");
    expect(() => useI18n("testComponent", {})).toThrowErrorMatchingSnapshot();
  });
  it("should set the current locale upon initialization of i18n", async () => {
    const { initializeI18n, currentLocale } = await vi.importActual<typeof import("../src/runtime.ts")>("../src/runtime.ts");
    initializeI18n({ defaultLocale: "en", translations: {} });
    expect(currentLocale.get()).toBe("en");
  });
  it("should create return an i18n instance", async () => {
    const { initializeI18n, useI18n } = await vi.importActual<typeof import("../src/runtime.ts")>("../src/runtime.ts");
    initializeI18n({ defaultLocale: "en", translations: {} });
    const i18n = useI18n("testComponent", { hello: "Hello" });
    expect(i18n).toBeDefined();
    expect(i18n).toEqual({ hello: "Hello" });
  });
  it("should throw an error if getI18nInstance is called before initialization", async () => {
    const { getI18nInstance } = await vi.importActual<typeof import("../src/runtime.ts")>("../src/runtime.ts");
    expect(() => getI18nInstance()).toThrowErrorMatchingSnapshot();
  });
  it("should return the i18n instance after initialization", async () => {
    const { initializeI18n, getI18nInstance } = await vi.importActual<typeof import("../src/runtime.ts")>("../src/runtime.ts");
    initializeI18n({ defaultLocale: "en", translations: {} });
    const instance = getI18nInstance();
    expect(instance).toBeDefined();
    expect(typeof instance).toBe("function");
  });
  it("should throw an error if getFormatterInstance is called before initialization", async () => {
    const { getFormatterInstance } = await vi.importActual<typeof import("../src/runtime.ts")>("../src/runtime.ts");
    expect(() => getFormatterInstance()).toThrowErrorMatchingSnapshot();
  });
  it("should return the formatter instance after initialization", async () => {
    const { initializeI18n, getFormatterInstance } = await vi.importActual<typeof import("../src/runtime.ts")>("../src/runtime.ts");
    initializeI18n({ defaultLocale: "en", translations: {} });
    const instance = getFormatterInstance();
    expect(instance).toBeDefined();
    expect(typeof instance.get).toBe("function");
  });
  it("should throw an error if useFormat is called before initialization", async () => {
    const { useFormat } = await vi.importActual<typeof import("../src/runtime.ts")>("../src/runtime.ts");
    expect(() => useFormat()).toThrowErrorMatchingSnapshot();
  });
  it("should return a formatter function after initialization", async () => {
    const { initializeI18n, useFormat } = await vi.importActual<typeof import("../src/runtime.ts")>("../src/runtime.ts");
    initializeI18n({ defaultLocale: "en", translations: {} });
    const formatter = useFormat();
    expect(formatter).toBeDefined();
    expect(typeof formatter).toBe("object");
  });
  it("should accept a custom get callback in initializeI18n", async () => {
    const { initializeI18n, getI18nInstance } = await vi.importActual<typeof import("../src/runtime.ts")>("../src/runtime.ts");
    const getMock = vi.fn().mockResolvedValue({
      testComponent: { hello: "Hallo" },
    });
    initializeI18n({
      defaultLocale: "en",
      translations: {},
      get: getMock,
    });
    const i18n = getI18nInstance();
    expect(i18n).toBeDefined();
    expect(typeof i18n).toBe("function");
  });
  it("should call the custom get callback when fetching translations for a new locale", async () => {
    const { initializeI18n, currentLocale, getI18nInstance } = await vi.importActual<typeof import("../src/runtime.ts")>("../src/runtime.ts");
    const getMock = vi.fn().mockResolvedValue({
      testComponent: { hello: "Hallo" },
    });
    initializeI18n({
      defaultLocale: "en",
      translations: {},
      get: getMock,
    });
    const i18n = getI18nInstance();
    // Register and subscribe to a component (subscription triggers the loading)
    const messages = i18n("testComponent", { hello: "Hello" });
    messages.subscribe(() => {});
    // Change to a locale that is not in the cache - this should trigger the get callback
    currentLocale.set("de");
    // Wait for the async get to be called
    await vi.waitFor(() => {
      expect(getMock).toHaveBeenCalled();
    });
    expect(getMock).toHaveBeenCalledWith("de", ["testComponent"]);
  });
  it("should throw an error if clearCache is called before initialization", async () => {
    const { clearCache } = await vi.importActual<typeof import("../src/runtime.ts")>("../src/runtime.ts");
    expect(() => clearCache()).toThrowErrorMatchingSnapshot();
  });
  it("should clear the entire cache when clearCache is called without arguments", async () => {
    const { initializeI18n, getI18nInstance, clearCache } = await vi.importActual<typeof import("../src/runtime.ts")>("../src/runtime.ts");
    initializeI18n({
      defaultLocale: "en",
      translations: {
        de: { testComponent: { hello: "Hallo" } },
        fr: { testComponent: { hello: "Bonjour" } },
      },
    });
    const i18n = getI18nInstance();
    expect(i18n.cache["de"]).toBeDefined();
    expect(i18n.cache["fr"]).toBeDefined();
    clearCache();
    expect(i18n.cache["de"]).toBeUndefined();
    expect(i18n.cache["fr"]).toBeUndefined();
  });
  it("should clear only a specific locale when clearCache is called with a locale", async () => {
    const { initializeI18n, getI18nInstance, clearCache } = await vi.importActual<typeof import("../src/runtime.ts")>("../src/runtime.ts");
    initializeI18n({
      defaultLocale: "en",
      translations: {
        de: { testComponent: { hello: "Hallo" } },
        fr: { testComponent: { hello: "Bonjour" } },
      },
    });
    const i18n = getI18nInstance();
    expect(i18n.cache["de"]).toBeDefined();
    expect(i18n.cache["fr"]).toBeDefined();
    clearCache("de");
    expect(i18n.cache["de"]).toBeUndefined();
    expect(i18n.cache["fr"]).toBeDefined();
  });
  it("should call the get callback again after cache is cleared for a locale", async () => {
    const { initializeI18n, currentLocale, getI18nInstance, clearCache } =
      await vi.importActual<typeof import("../src/runtime.ts")>("../src/runtime.ts");
    const getMock = vi.fn().mockResolvedValue({
      testComponent: { hello: "Hallo" },
    });
    initializeI18n({
      defaultLocale: "en",
      translations: {
        de: { testComponent: { hello: "Hallo (cached)" } },
      },
      get: getMock,
    });
    const i18n = getI18nInstance();
    // Register and subscribe to a component
    const messages = i18n("testComponent", { hello: "Hello" });
    messages.subscribe(() => {});
    // Change to German - should use cached translation, get should NOT be called
    currentLocale.set("de");
    expect(getMock).not.toHaveBeenCalled();
    // Clear the German cache
    clearCache("de");
    // Change to English first, then back to German to trigger a refetch
    currentLocale.set("en");
    currentLocale.set("de");
    // Wait for the async get to be called
    await vi.waitFor(() => {
      expect(getMock).toHaveBeenCalled();
    });
    expect(getMock).toHaveBeenCalledWith("de", ["testComponent"]);
  });
  it("should throw an error if useI18nAsync is called before initialization", async () => {
    const { useI18nAsync } = await vi.importActual<typeof import("../src/runtime.ts")>("../src/runtime.ts");
    await expect(useI18nAsync("testComponent", {})).rejects.toThrowErrorMatchingSnapshot();
  });
  it("should return translations using useI18nAsync", async () => {
    const { initializeI18n, useI18nAsync } = await vi.importActual<typeof import("../src/runtime.ts")>("../src/runtime.ts");
    initializeI18n({ defaultLocale: "en", translations: {} });
    const translations = await useI18nAsync("testComponent", { hello: "Hello" });
    expect(translations).toBeDefined();
    expect(translations).toEqual({ hello: "Hello" });
  });
  it("should call the get callback and await translations with useI18nAsync", async () => {
    const { initializeI18n, currentLocale, useI18nAsync } = await vi.importActual<typeof import("../src/runtime.ts")>("../src/runtime.ts");
    const getMock = vi.fn().mockResolvedValue({
      testComponent: { hello: "Hallo" },
    });
    initializeI18n({
      defaultLocale: "en",
      translations: {},
      get: getMock,
    });
    // Change to a locale that requires fetching
    currentLocale.set("de");
    const translations = await useI18nAsync("testComponent", { hello: "Hello" });
    expect(getMock).toHaveBeenCalledWith("de", ["testComponent"]);
    expect(translations.hello).toBe("Hallo");
  });
  it("should return cached translations with useI18nAsync without calling get", async () => {
    const { initializeI18n, currentLocale, useI18nAsync } = await vi.importActual<typeof import("../src/runtime.ts")>("../src/runtime.ts");
    const getMock = vi.fn().mockResolvedValue({});
    initializeI18n({
      defaultLocale: "en",
      translations: {
        de: { testComponent: { hello: "Hallo (cached)" } },
      },
      get: getMock,
    });
    currentLocale.set("de");
    const translations = await useI18nAsync("testComponent", { hello: "Hello" });
    expect(getMock).not.toHaveBeenCalled();
    expect(translations.hello).toBe("Hallo (cached)");
  });
  it("should refetch translations with useI18nAsync after cache is cleared", async () => {
    const { initializeI18n, currentLocale, clearCache, useI18nAsync } =
      await vi.importActual<typeof import("../src/runtime.ts")>("../src/runtime.ts");
    const getMock = vi.fn().mockResolvedValue({
      testComponent: { hello: "Hallo (fetched)" },
    });
    initializeI18n({
      defaultLocale: "en",
      translations: {
        de: { testComponent: { hello: "Hallo (cached)" } },
      },
      get: getMock,
    });
    currentLocale.set("de");
    // First call should use cache
    const cached = await useI18nAsync("testComponent", { hello: "Hello" });
    expect(cached.hello).toBe("Hallo (cached)");
    expect(getMock).not.toHaveBeenCalled();
    // Clear cache and fetch again
    clearCache("de");
    const fetched = await useI18nAsync("testComponent", { hello: "Hello" });
    expect(getMock).toHaveBeenCalledWith("de", ["testComponent"]);
    expect(fetched.hello).toBe("Hallo (fetched)");
  });
});
