/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as aggregate from "../aggregate.js";
import type * as auth from "../auth.js";
import type * as authEnv from "../authEnv.js";
import type * as authSchema from "../authSchema.js";
import type * as cache from "../cache.js";
import type * as counter from "../counter.js";
import type * as dodoPayments from "../dodoPayments.js";
import type * as dynamicCrons from "../dynamicCrons.js";
import type * as http from "../http.js";
import type * as llmCache from "../llmCache.js";
import type * as migrations from "../migrations.js";
import type * as r2 from "../r2.js";
import type * as rateLimiter from "../rateLimiter.js";
import type * as resendEmails from "../resendEmails.js";
import type * as retrier from "../retrier.js";
import type * as seed from "../seed.js";
import type * as steel from "../steel.js";
import type * as streaming from "../streaming.js";
import type * as system from "../system.js";
import type * as timeline from "../timeline.js";
import type * as triage from "../triage.js";
import type * as trustLedger from "../trustLedger.js";
import type * as waitlist from "../waitlist.js";
import type * as webhookSender from "../webhookSender.js";
import type * as workflow from "../workflow.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  aggregate: typeof aggregate;
  auth: typeof auth;
  authEnv: typeof authEnv;
  authSchema: typeof authSchema;
  cache: typeof cache;
  counter: typeof counter;
  dodoPayments: typeof dodoPayments;
  dynamicCrons: typeof dynamicCrons;
  http: typeof http;
  llmCache: typeof llmCache;
  migrations: typeof migrations;
  r2: typeof r2;
  rateLimiter: typeof rateLimiter;
  resendEmails: typeof resendEmails;
  retrier: typeof retrier;
  seed: typeof seed;
  steel: typeof steel;
  streaming: typeof streaming;
  system: typeof system;
  timeline: typeof timeline;
  triage: typeof triage;
  trustLedger: typeof trustLedger;
  waitlist: typeof waitlist;
  webhookSender: typeof webhookSender;
  workflow: typeof workflow;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  workflow: import("@convex-dev/workflow/_generated/component.js").ComponentApi<"workflow">;
  rateLimiter: import("@convex-dev/rate-limiter/_generated/component.js").ComponentApi<"rateLimiter">;
  actionCache: import("@convex-dev/action-cache/_generated/component.js").ComponentApi<"actionCache">;
  actionRetrier: import("@convex-dev/action-retrier/_generated/component.js").ComponentApi<"actionRetrier">;
  aggregate: import("@convex-dev/aggregate/_generated/component.js").ComponentApi<"aggregate">;
  shardedCounter: import("@convex-dev/sharded-counter/_generated/component.js").ComponentApi<"shardedCounter">;
  migrations: import("@convex-dev/migrations/_generated/component.js").ComponentApi<"migrations">;
  persistentTextStreaming: import("@convex-dev/persistent-text-streaming/_generated/component.js").ComponentApi<"persistentTextStreaming">;
  crons: import("@convex-dev/crons/_generated/component.js").ComponentApi<"crons">;
  betterAuth: import("@convex-dev/better-auth/_generated/component.js").ComponentApi<"betterAuth">;
  r2: import("@convex-dev/r2/_generated/component.js").ComponentApi<"r2">;
  agent: import("@convex-dev/agent/_generated/component.js").ComponentApi<"agent">;
  resend: import("@convex-dev/resend/_generated/component.js").ComponentApi<"resend">;
  dodopayments: import("@dodopayments/convex/_generated/component.js").ComponentApi<"dodopayments">;
  llmCache: import("@mzedstudio/llm-cache/_generated/component.js").ComponentApi<"llmCache">;
  steel: import("@steel-dev/convex/_generated/component.js").ComponentApi<"steel">;
  agentReady: import("@waynesutton/agent-ready/_generated/component.js").ComponentApi<"agentReady">;
  convexOrchestrator: import("@akshatgiri/convex-orchestrator/_generated/component.js").ComponentApi<"convexOrchestrator">;
  timeline: import("convex-timeline/_generated/component.js").ComponentApi<"timeline">;
  webhookSender: import("convex-webhook-sender/_generated/component.js").ComponentApi<"webhookSender">;
};
