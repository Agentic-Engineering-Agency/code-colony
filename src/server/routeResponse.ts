import { buildCacheControl } from "./cacheControl";

export interface JsonRouteResponseInit {
  status: number;
  cacheSeconds: number;
}

/**
 * Build a JSON Response for a Next.js route handler with a Cache-Control header
 * derived from a single `cacheSeconds` knob. Negative seconds emit `no-store`,
 * matching `buildCacheControl`. Centralising this keeps the (status, body, cache)
 * triple consistent across every route.
 */
export function jsonRouteResponse<T>(body: T, init: JsonRouteResponseInit): Response {
  return Response.json(body, {
    status: init.status,
    headers: { "Cache-Control": buildCacheControl(init.cacheSeconds) },
  });
}
