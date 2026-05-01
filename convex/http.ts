import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { authComponent, createAuth } from "./auth";
import { streamTriage } from "./streaming";
import { registerRoutes } from "@waynesutton/agent-ready";
import { components } from "./_generated/api";

/**
 * Convex HTTP entrypoint. Mounts:
 *   - Better Auth at `/api/auth/*` (sign-up, sign-in, session, etc.)
 *   - Persistent text streaming at `POST /chat-stream` for triage rationale.
 */
const http = httpRouter();

authComponent.registerRoutes(http, createAuth);

// Agent Ready — serves llms.txt, agents.md, sitemap.xml, etc.
// TODO(AGE-63): run `npx agent-ready setup` to scaffold config and go-live.
registerRoutes(http, components.agentReady);

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
