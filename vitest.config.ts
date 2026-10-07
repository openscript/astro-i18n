import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
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
