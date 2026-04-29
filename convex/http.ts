import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { authComponent, createAuth } from "./auth";
import { streamTriage } from "./streaming";

/**
 * Convex HTTP entrypoint. Mounts:
 *   - Better Auth at `/api/auth/*` (sign-up, sign-in, session, etc.)
 *   - Persistent text streaming at `POST /chat-stream` for triage rationale.
 */
const http = httpRouter();

authComponent.registerRoutes(http, createAuth);

http.route({
  path: "/chat-stream",
  method: "POST",
  handler: streamTriage,
});

http.route({
  path: "/chat-stream",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
      },
    });
  }),
});

export default http;
