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
    messages.subscribe(() => { });
    // Change to a locale that is not in the cache - this should trigger the get callback
    currentLocale.set("de");
    // Wait for the async get to be called
    await vi.waitFor(() => {
      expect(getMock).toHaveBeenCalled();
    });
    expect(getMock).toHaveBeenCalledWith("de", ["testComponent"]);
  });
});
