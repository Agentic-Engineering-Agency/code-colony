/**
 * Convex Components mount point. See ADR `docs/adr/0004-convex-components.md`
 * for the rationale behind each pick. The export is consumed by the Convex
 * runtime at deploy time and the generated `components.<name>` symbols are
 * exposed via `convex/_generated/api`.
 */
import { defineApp } from "convex/server";
import workflow from "@convex-dev/workflow/convex.config";
import rateLimiter from "@convex-dev/rate-limiter/convex.config";
import actionCache from "@convex-dev/action-cache/convex.config";
import actionRetrier from "@convex-dev/action-retrier/convex.config";
import aggregate from "@convex-dev/aggregate/convex.config";
import shardedCounter from "@convex-dev/sharded-counter/convex.config";
import migrations from "@convex-dev/migrations/convex.config";
import persistentTextStreaming from "@convex-dev/persistent-text-streaming/convex.config";
import crons from "@convex-dev/crons/convex.config";
import betterAuth from "@convex-dev/better-auth/convex.config";
import r2 from "@convex-dev/r2/convex.config";
import agent from "@convex-dev/agent/convex.config";
import resend from "@convex-dev/resend/convex.config";
import dodopayments from "@dodopayments/convex/convex.config";
import llmCache from "@mzedstudio/llm-cache/convex.config";
import steel from "@steel-dev/convex/convex.config";
import agentReady from "@waynesutton/agent-ready/convex.config";
import orchestrator from "@akshatgiri/convex-orchestrator/convex.config";
import timeline from "convex-timeline/convex.config";
import webhookSender from "convex-webhook-sender/convex.config";

const app = defineApp();
app.use(workflow);
app.use(rateLimiter);
app.use(actionCache);
app.use(actionRetrier);
app.use(aggregate);
app.use(shardedCounter);
app.use(migrations);
app.use(persistentTextStreaming);
app.use(crons);
app.use(betterAuth);
app.use(r2);
app.use(agent);
app.use(resend);
app.use(dodopayments);
app.use(llmCache, { name: "llmCache" });
app.use(steel);
app.use(agentReady);
app.use(orchestrator);
app.use(timeline);
app.use(webhookSender);

export default app;
