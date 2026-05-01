import { Crons } from "@convex-dev/crons";
import { components, internal } from "./_generated/api";
import { internalMutation, internalAction } from "./_generated/server";
import { v } from "convex/values";

/** Dynamic cron scheduler. Register with `crons.register(ctx, ...)`. */
export const crons = new Crons(components.crons);

/** 5-minute self-ping that exercises the `/api/health` Convex probe. */
export const healthPing = internalAction({
  args: {},
  handler: async () => {
    const url = process.env.SITE_URL;
    if (!url) {
      console.log("crons.healthPing: SITE_URL unset, skipping");
      return;
    }
    const res = await fetch(new URL("/api/health", url));
    console.log(`crons.healthPing: ${res.status}`);
  },
});

/**
 * Idempotent registrar for the recurring jobs we want running in every
 * deployment. Run once after deploy: `npx convex run crons:registerAll`.
 */
export const registerAll = internalMutation({
  args: {},
  handler: async (ctx) => {
    await crons.register(
      ctx,
      { kind: "interval", ms: 5 * 60 * 1000 },
      internal.dynamicCrons.healthPing,
      {},
      "health-ping",
    );
  },
});

export const cancelOne = internalMutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    await crons.delete(ctx, { name: args.name });
  },
});
