import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "happy-dom",
    globals: true,
  },
  resolve: {
    alias: {
      "@": "/Users/poom-work/codingZone/business/tattoo-project/src",
    },
  },
});
