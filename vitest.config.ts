/**
 * Dedicated Vitest config — Vitest auto-discovers `vite.config.ts` and would
 * try to evaluate the TanStack Start + Cloudflare plugin chain, which only
 * runs in ESM/Workers contexts. We skip that here and just register the
 * `@/*` alias for the existing test suites.
 */
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: [
      { find: /^@\//, replacement: new URL("./src/", import.meta.url).pathname },
    ],
  },
  test: {
    environment: "node",
    include: ["__tests__/**/*.test.ts"],
  },
});
