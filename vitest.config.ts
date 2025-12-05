import { defineConfig } from "vitest/config";
import { nxViteTsPaths } from "@nx/vite/plugins/nx-tsconfig-paths.plugin";

export default defineConfig({
  plugins: [nxViteTsPaths()],
  test: {
    globals: true,
    environment: "node",
    coverage: {
      reporter: ["text", "json", "html", "lcov"],
      exclude: ["node_modules/", "**/test/**", "**/*.spec.ts", "**/*.test.ts"],
    },
    reporters: ["verbose"],
    include: ["test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
  },
});
