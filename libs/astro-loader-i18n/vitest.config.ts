import { defineConfig, mergeConfig } from "vitest/config";
import sharedConfig from "../../vitest.config.ts";

export default mergeConfig(
  sharedConfig,
  defineConfig({
    root: import.meta.dirname,
    test: {
      coverage: {
        enabled: true,
        reportsDirectory: "./coverage",
      },
    },
  })
);
