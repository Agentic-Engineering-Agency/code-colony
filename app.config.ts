/**
 * Compatibility shim. TanStack Start v1.121+ moved to a Vite-based config
 * (`vite.config.mts`) and no longer reads `app.config.ts` directly. We keep
 * this file because the AGE-44 specification asked for it; it forwards to
 * the actual Vite config so editors / tooling that still expect the legacy
 * filename find a single source of truth.
 *
 * `vite.config.ts` was renamed to `vite.config.mts` in AGE-72 so Vite 8's
 * Rolldown config loader treats it as ESM (the TanStack Start vite plugin
 * is ESM-only); the import below tracks the new filename.
 */
export { default } from "./vite.config.mjs";