/**
 * Vite config used by `npm run dev:tanstack` and `npm run build:tanstack`.
 *
 * The Next.js App Router under `app/{layout,page,api}` is unaffected; TanStack
 * Start scans `app/routes/` for its own route tree (configured below). Both
 * stacks share the same `app/` directory but never share a routing convention
 * because Next only treats `page.tsx` / `route.ts` / etc. as routes, while
 * TanStack scans `routes/` and writes `routeTree.gen.ts`.
 *
 * Cloudflare Workers output: the `cloudflare()` plugin from `@cloudflare/vite-plugin`
 * binds the SSR environment to the `wrangler.jsonc` config in the worktree root.
 */
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  plugins: [
    tanstackStart({
      srcDirectory: "app",
      router: {
        routesDirectory: "routes",
        generatedRouteTree: "routeTree.gen.ts",
      },
    }),
    react(),
    cloudflare({
      viteEnvironment: { name: "ssr" },
    }),
  ],
});
