import { defineConfig } from "vite";
import { codecovVitePlugin } from "@codecov/vite-plugin";
import { nxViteTsPaths } from "@nx/vite/plugins/nx-tsconfig-paths.plugin";
import dts from "vite-plugin-dts";

export default defineConfig({
  root: __dirname,
  cacheDir: "../../node_modules/.vite/libs/astro-nanostores-i18n",
  plugins: [
    nxViteTsPaths(),
    dts({ entryRoot: "src", tsconfigPath: "tsconfig.lib.json" }),
    codecovVitePlugin({
      enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
      bundleName: "astro-nanostores-i18n",
      uploadToken: process.env.CODECOV_TOKEN,
    }),
  ],
  build: {
    target: "es2022",
    sourcemap: true,
    emptyOutDir: true,
    lib: {
      entry: {
        integration: "src/integration.ts",
        runtime: "src/runtime.ts",
        middleware: "src/middleware.ts",
        "bin/extract": "src/bin/extract.ts",
      },
      formats: ["es"],
    },
    rollupOptions: {
      external: [
        "astro:middleware",
        "astro:config/client",
        "astro-integration-kit",
        "astro-nanostores-i18n:runtime",
        "node:fs/promises",
        "node:vm",
        "node:util",
        "@astrojs/compiler",
        "@astrojs/compiler/utils",
        "nanostores",
        "@nanostores/i18n",
        "fast-glob",
        "typescript",
      ],
      output: {
        globals: {},
      },
    },
  },
});
