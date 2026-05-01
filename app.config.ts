/**
 * Compatibility shim. TanStack Start v1.121+ moved to a Vite-based config
 * (`vite.config.ts`) and no longer reads `app.config.ts` directly. We keep
 * this file because the AGE-44 specification asked for it; it forwards to
 * the actual Vite config so editors / tooling that still expect the legacy
 * filename find a single source of truth.
 */
export { default } from "./vite.config";
