/**
 * Sandbox-runner's own Vitest config. Required so Vitest does not walk up the
 * tree and pick up the repo-root `vitest.config.ts`, which resolves modules
 * against the root `node_modules/` (not present when CI installs only this
 * workspace).
 */
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["__tests__/**/*.test.ts", "src/**/*.test.ts"],
  },
});
