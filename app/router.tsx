/**
 * TanStack Start router entry. `@tanstack/start-plugin-core`'s vite plugin
 * resolves this file by name (`router.{ts,tsx}` under `srcDirectory`) and
 * imports `getRouter` from it via the `#tanstack-router-entry` virtual module
 * to drive both the SSR Worker bundle and the client bundle.
 *
 * AGE-44 introduced the `app/routes/` tree and `app/routeTree.gen.ts` but
 * never scaffolded this entry; AGE-72's `vite build` is what surfaces the
 * gap because deploy-time bundling needs a router to wire. Keep this file
 * minimal: no app behavior lives here, only the tanstack-required wiring.
 */
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  return createRouter({
    routeTree,
    scrollRestoration: true,
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
