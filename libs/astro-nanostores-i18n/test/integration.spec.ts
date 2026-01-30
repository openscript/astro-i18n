import { describe, expect, it, vi } from "vitest";
import integration from "../src/integration";
import { AstroIntegrationLogger, BaseIntegrationHooks } from "astro";
import { addVirtualImports } from "astro-integration-kit";

vi.mock("astro-integration-kit", () => {
  return {
    addVirtualImports: vi.fn(),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    createResolver: (_base: string) => ({
      resolve: (path: string) => [path].join("/"),
    }),
  };
});

describe("integration.ts", () => {
  it("should have a valid integration export", () => {
    expect(integration).toBeDefined();
    expect(typeof integration).toBe("function");
  });
  it("should log an error if i18n config is missing", () => {
    const mockParams = {
      config: {},
      logger: {
        error: (message: string) => {
          expect(message).toContain("The astro-nanostores-i18n integration requires the i18n configuration");
        },
      },
    };
    const i = integration({});
    const hook = i.hooks["astro:config:setup"];
    expect(hook).toBeDefined();
    if (hook) {
      hook(mockParams as Parameters<BaseIntegrationHooks["astro:config:setup"]>[0]);
    }
  });
  it("should register virtual module", () => {
    const mockParams = {
      config: { i18n: { defaultLocale: "en" } },
      logger: {} as AstroIntegrationLogger,
    };
    const i = integration({});
    const hook = i.hooks["astro:config:setup"];
    expect(hook).toBeDefined();
    if (hook) {
      hook(mockParams as Parameters<BaseIntegrationHooks["astro:config:setup"]>[0]);
    }
    expect(vi.mocked(addVirtualImports).mock.calls.length).toBe(1);
    expect(vi.mocked(addVirtualImports).mock.calls[0][1]).toMatchSnapshot();
  });
  it("should inject the types for the virtual module", () => {
    const mockParams = {
      injectTypes: (params: { filename: string; content: string }) => {
        expect(params.filename).toBe("astro-nanostores-i18n.d.ts");
        expect(params.content).toMatchSnapshot();
      },
    };
    const i = integration({});
    const hook = i.hooks["astro:config:done"];
    expect(hook).toBeDefined();
    if (hook) {
      hook(mockParams as Parameters<BaseIntegrationHooks["astro:config:done"]>[0]);
    }
  });
  it("should add middleware if configured", () => {
    const mockParams = {
      addMiddleware: vi.fn(),
      config: { i18n: { defaultLocale: "en" } },
    };
    const i = integration({ addMiddleware: true });
    const hook = i.hooks["astro:config:setup"];
    expect(hook).toBeDefined();
    if (hook) {
      hook(mockParams as unknown as Parameters<BaseIntegrationHooks["astro:config:setup"]>[0]);
    }
    expect(mockParams.addMiddleware).toHaveBeenCalledWith({
      entrypoint: "astro-nanostores-i18n/middleware",
      order: "pre",
    });
  });
  it("should register virtual module with translationLoader when provided", () => {
    vi.mocked(addVirtualImports).mockClear();
    const mockParams = {
      config: { i18n: { defaultLocale: "en" } },
      logger: {} as AstroIntegrationLogger,
    };
    const i = integration({ translationLoader: "./src/i18n/loader.ts" });
    const hook = i.hooks["astro:config:setup"];
    expect(hook).toBeDefined();
    if (hook) {
      hook(mockParams as Parameters<BaseIntegrationHooks["astro:config:setup"]>[0]);
    }
    expect(vi.mocked(addVirtualImports).mock.calls.length).toBe(1);
    expect(vi.mocked(addVirtualImports).mock.calls[0][1]).toMatchSnapshot();
  });
  it("should include translationLoader import in virtual module", () => {
    vi.mocked(addVirtualImports).mockClear();
    const mockParams = {
      config: { i18n: { defaultLocale: "de" } },
      logger: {} as AstroIntegrationLogger,
    };
    const i = integration({ translationLoader: "./src/custom-loader.ts" });
    const hook = i.hooks["astro:config:setup"];
    if (hook) {
      hook(mockParams as Parameters<BaseIntegrationHooks["astro:config:setup"]>[0]);
    }
    const imports = vi.mocked(addVirtualImports).mock.calls[0][1].imports as Record<string, string>;
    const virtualModuleContent = imports["astro-nanostores-i18n:runtime"];
    expect(virtualModuleContent).toContain('import translationLoader from "./src/custom-loader.ts"');
    expect(virtualModuleContent).toContain("get: translationLoader");
  });
  it("should not include translationLoader import when not provided", () => {
    vi.mocked(addVirtualImports).mockClear();
    const mockParams = {
      config: { i18n: { defaultLocale: "en" } },
      logger: {} as AstroIntegrationLogger,
    };
    const i = integration({});
    const hook = i.hooks["astro:config:setup"];
    if (hook) {
      hook(mockParams as Parameters<BaseIntegrationHooks["astro:config:setup"]>[0]);
    }
    const imports = vi.mocked(addVirtualImports).mock.calls[0][1].imports as Record<string, string>;
    const virtualModuleContent = imports["astro-nanostores-i18n:runtime"];
    expect(virtualModuleContent).not.toContain("import translationLoader");
    expect(virtualModuleContent).not.toContain("get: translationLoader");
  });
});
