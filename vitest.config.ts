import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/**/*.{test,spec}.?(c|m)[jt]s?(x)"],
    exclude: [
      ".sandcastle/**",
      "contracts/**",
      "node_modules/**",
      "**/node_modules/**",
      "tests/e2e/**",
      "tests/load/**",
    ],
  },
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "react",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
