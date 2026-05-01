import {
  PersistentTextStreaming,
  StreamIdValidator,
} from "@convex-dev/persistent-text-streaming";
import type { StreamId } from "@convex-dev/persistent-text-streaming";
import { components } from "./_generated/api";
import { mutation, query, httpAction } from "./_generated/server";
import { v } from "convex/values";

/**
 * Persistent token streaming for the triage rationale. The HTTP action
 * registered in `convex/http.ts` streams chunks to the browser while the
 * component persists each chunk to a Convex table, enabling replay and
 * sharing of the same conversation.
 */
export const persistentTextStreaming = new PersistentTextStreaming(
  components.persistentTextStreaming,
);
export { StreamIdValidator };

/** Create a new stream record, returns a `StreamId` the client uses. */
export const createTriageStream = mutation({
  args: { issueSeedId: v.string() },
  returns: v.id("triageStreams"),
  handler: async (ctx, args) => {
    const streamId = await persistentTextStreaming.createStream(ctx);
    return await ctx.db.insert("triageStreams", {
      issueSeedId: args.issueSeedId,
      streamId,
    });
  },
});

/** Read the persisted body — useful for replay after the live stream ends. */
export const getTriageStreamBody = query({
  args: { streamId: StreamIdValidator },
  handler: async (ctx, args) => {
    return await persistentTextStreaming.getStreamBody(
      ctx,
      args.streamId as StreamId,
    );
  },
});

/**
 * HTTP action used by the browser to receive streamed chunks. The body
 * generation is intentionally a stub — wiring to Mastra's
 * `backlogTriageAgent` happens in AGE-55 (sandbox + Mastra integration).
 */
export const streamTriage = httpAction(async (ctx, request) => {
  const body = (await request.json()) as { streamId: string };
  const generate = async (
    _ctx: unknown,
    _req: Request,
    _streamId: string,
    chunkAppender: (chunk: string) => Promise<void>,
  ) => {
    await chunkAppender("Triage in progress…\n");
    await chunkAppender("(real Mastra streaming wires up in AGE-55)\n");
  };
  const response = await persistentTextStreaming.stream(
    ctx,
    request,
    body.streamId as StreamId,
    generate,
  );
  response.headers.set("Access-Control-Allow-Origin", "*");
  return response;
});
