import { describe, expect, it, vi } from "vitest";
import integration from "../src/integration";
import { AstroIntegrationLogger, BaseIntegrationHooks } from "astro";

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
    const updateConfig = vi.fn();
    const mockParams = {
      config: { i18n: { defaultLocale: "en" } },
      logger: {} as AstroIntegrationLogger,
      updateConfig,
    };
    const i = integration({});
    const hook = i.hooks["astro:config:setup"];
    expect(hook).toBeDefined();
    if (hook) {
      hook(mockParams as unknown as Parameters<BaseIntegrationHooks["astro:config:setup"]>[0]);
    }
    expect(updateConfig.mock.calls.length).toBe(1);
    const content = updateConfig.mock.calls[0][0].vite.plugins[0].load("");
    expect(content).toBeUndefined();
    const virtualContent = updateConfig.mock.calls[0][0].vite.plugins[0].load("\0astro-nanostores-i18n:runtime") as string;
    expect(virtualContent).toContain('from "');
    expect(virtualContent).toContain('runtime.js"');
    expect(virtualContent).toContain('initializeI18n({ defaultLocale: "en", translations: {} })');
    expect(virtualContent).toContain(
      "export { useFormat, useI18n, useI18nAsync, currentLocale, getI18nInstance, getFormatterInstance, clearCache }"
    );
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
      updateConfig: vi.fn(),
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
    const updateConfig = vi.fn();
    const mockParams = {
      config: { i18n: { defaultLocale: "en" } },
      logger: {} as AstroIntegrationLogger,
      updateConfig,
    };
    const i = integration({ translationLoader: "./src/i18n/loader.ts" });
    const hook = i.hooks["astro:config:setup"];
    expect(hook).toBeDefined();
    if (hook) {
      hook(mockParams as unknown as Parameters<BaseIntegrationHooks["astro:config:setup"]>[0]);
    }
    expect(updateConfig.mock.calls.length).toBe(1);
    const virtualContent = updateConfig.mock.calls[0][0].vite.plugins[0].load("\0astro-nanostores-i18n:runtime") as string;
    expect(virtualContent).toContain('runtime.js"');
    expect(virtualContent).toContain('initializeI18n({ defaultLocale: "en", translations: {}, get: translationLoader })');
    expect(virtualContent).toContain('import translationLoader from "./src/i18n/loader.ts"');
  });
  it("should include translationLoader import in virtual module", () => {
    const updateConfig = vi.fn();
    const mockParams = {
      config: { i18n: { defaultLocale: "de" } },
      logger: {} as AstroIntegrationLogger,
      updateConfig,
    };
    const i = integration({ translationLoader: "./src/custom-loader.ts" });
    const hook = i.hooks["astro:config:setup"];
    if (hook) {
      hook(mockParams as unknown as Parameters<BaseIntegrationHooks["astro:config:setup"]>[0]);
    }
    const virtualContent = updateConfig.mock.calls[0][0].vite.plugins[0].load("\0astro-nanostores-i18n:runtime") as string;
    expect(virtualContent).toContain('import translationLoader from "./src/custom-loader.ts"');
    expect(virtualContent).toContain("get: translationLoader");
  });
  it("should not include translationLoader import when not provided", () => {
    const updateConfig = vi.fn();
    const mockParams = {
      config: { i18n: { defaultLocale: "en" } },
      logger: {} as AstroIntegrationLogger,
      updateConfig,
    };
    const i = integration({});
    const hook = i.hooks["astro:config:setup"];
    if (hook) {
      hook(mockParams as unknown as Parameters<BaseIntegrationHooks["astro:config:setup"]>[0]);
    }
    const virtualContent = updateConfig.mock.calls[0][0].vite.plugins[0].load("\0astro-nanostores-i18n:runtime") as string;
    expect(virtualContent).not.toContain("import translationLoader");
    expect(virtualContent).not.toContain("get: translationLoader");
  });
});
