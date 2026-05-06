import { R2 } from "@convex-dev/r2";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireActiveOrganization } from "./auth";

/**
 * Cloudflare R2 binding. Configure with `npx convex env set`:
 *   R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ENDPOINT, R2_BUCKET, R2_TOKEN
 *
 * Bucket layout:
 *   og-image/<slug>.png      — landing OG cards
 *   demo-video/<name>.webm   — Code Colony demo recordings
 *   artifacts/<runId>/<file> — agent run artifacts (AGE-55+)
 */
export const r2 = new R2(components.r2);

/**
 * Generated upload + sync handlers. The browser hits the URL returned by
 * `generateUploadUrl` to PUT the file, then calls `syncMetadata` so Convex
 * records its existence.
 */
export const { generateUploadUrl, syncMetadata } = r2.clientApi<DataModel>({
  checkUpload: async (ctx, _bucket) => {
    await requireActiveOrganization(ctx);
  },
  onUpload: async (ctx, _bucket, key) => {
    await ctx.db.insert("r2Assets", { key, uploadedAt: Date.now() });
  },
});

/** Resolve the public, signed URL for an R2 object stored by the component. */
export const getAssetUrl = query({
  args: { key: v.string() },
  returns: v.string(),
  handler: async (_ctx, args) => {
    return await r2.getUrl(args.key);
  },
});

/**
 * Convenience wrapper used by the landing page to fetch the OG image URL
 * without leaking the internal R2 layout into the client.
 */
export const getOgImageUrl = query({
  args: { slug: v.string() },
  returns: v.string(),
  handler: async (_ctx, args) => {
    return await r2.getUrl(`og-image/${args.slug}.png`);
  },
});

/** Same for the demo video file. */
export const getDemoVideoUrl = query({
  args: { name: v.string() },
  returns: v.string(),
  handler: async (_ctx, args) => {
    return await r2.getUrl(`demo-video/${args.name}.webm`);
  },
});

/** Convenience: record an artifact bundle's primary file (AGE-55 prep). */
export const registerArtifactFile = mutation({
  args: { runSeedId: v.string(), filename: v.string(), key: v.string() },
  returns: v.id("r2Assets"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("r2Assets", {
      key: args.key,
      uploadedAt: Date.now(),
      runSeedId: args.runSeedId,
      filename: args.filename,
    });
  },
});
