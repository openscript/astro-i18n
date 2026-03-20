import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { onRequest } from "../src/middleware";
import { APIContext } from "astro";

// Use vi.hoisted to ensure proper hoisting of mock variables
const { mockCurrentLocaleSet, mockNext } = vi.hoisted(() => ({
  mockCurrentLocaleSet: vi.fn(),
  mockNext: vi.fn(),
}));

vi.mock("astro:middleware", () => ({
  defineMiddleware: <T extends (...args: unknown[]) => unknown>(fn: T): T => fn,
}));

vi.mock("astro:config/client", () => ({
  i18n: {
    locales: ["en", "es", { codes: ["fr", "fr-CA"] }],
    defaultLocale: "en",
  },
}));

vi.mock("astro-nanostores-i18n/runtime", () => ({
  currentLocale: {
    set: mockCurrentLocaleSet,
  },
}));

describe("middleware.ts", async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should set the current locale based on the URL pathname", async () => {
    await onRequest({ url: { pathname: "/es/some-page" } } as APIContext, mockNext);
    expect(mockCurrentLocaleSet).toHaveBeenCalledWith("es");
    expect(mockNext).toHaveBeenCalled();
  });

  it("should handle default locale when no locale in pathname", async () => {
    await onRequest({ url: { pathname: "/some-page" } } as APIContext, mockNext);
    expect(mockCurrentLocaleSet).toHaveBeenCalledWith("en");
    expect(mockNext).toHaveBeenCalled();
  });

  it("should handle French locale", async () => {
    await onRequest({ url: { pathname: "/fr/some-page" } } as APIContext, mockNext);
    expect(mockCurrentLocaleSet).toHaveBeenCalledWith("fr");
    expect(mockNext).toHaveBeenCalled();
  });

  it("should handle French Canadian locale", async () => {
    await onRequest({ url: { pathname: "/fr-CA/some-page" } } as APIContext, mockNext);
    expect(mockCurrentLocaleSet).toHaveBeenCalledWith("fr-CA");
    expect(mockNext).toHaveBeenCalled();
  });

  it("should handle without prefix", async () => {
    await onRequest({ url: { pathname: "es" } } as APIContext, mockNext);
    expect(mockCurrentLocaleSet).toHaveBeenCalledWith("es");
    expect(mockNext).toHaveBeenCalled();
  });
});
