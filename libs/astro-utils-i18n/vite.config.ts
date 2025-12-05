import { defineConfig } from "vite";
import { nxViteTsPaths } from "@nx/vite/plugins/nx-tsconfig-paths.plugin";
import dts from "vite-plugin-dts";
import { codecovVitePlugin } from "@codecov/vite-plugin";

export default defineConfig({
  root: __dirname,
  cacheDir: "../../node_modules/.vite/libs/astro-utils-i18n",
  plugins: [
    nxViteTsPaths(),
    dts({ entryRoot: "src", tsconfigPath: "tsconfig.lib.json" }),
    codecovVitePlugin({
      enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
      bundleName: "astro-utils-i18n",
      uploadToken: process.env.CODECOV_TOKEN,
    }),
  ],
  build: {
    sourcemap: true,
    emptyOutDir: true,
    lib: {
      entry: "src/astro-utils-i18n.ts",
      name: "astro-utils-i18n",
      formats: ["es"],
    },
    rollupOptions: {
      external: ["astro/loaders", "astro/zod"],
      output: {
        globals: {
          "astro/loaders": "astroLoaders",
          "astro/zod": "astroZod",
        },
      },
    },
  },
});
