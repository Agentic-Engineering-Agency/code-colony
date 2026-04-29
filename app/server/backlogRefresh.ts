/**
 * TanStack Start server function for `/api/backlog/refresh`.
 *
 * Mirrors the Next.js handler: keys the TTL memo on `repo`+`source` so the
 * GitHub / Linear importers do not get hammered when the UI polls.
 */
import { createServerFn } from "@tanstack/react-start";

import { demoData } from "../../src/domain/demoData";
import {
  runBacklogRefreshRequest,
  type BacklogRouteResponse,
} from "../../src/server/backlogRouteCore";
import { createKeyedTtlMemo } from "../../src/server/ttlMemo";

export type BacklogRefreshInput = { repo?: string; source?: string };

const DEFAULT_REPO = "Agentic-Engineering-Agency/code-colony";
const BACKLOG_TTL_MS = 3_000;

const backlogRefreshMemo = createKeyedTtlMemo<string, BacklogRouteResponse>(
  (key) =>
    runBacklogRefreshRequest({
      searchParams: new URLSearchParams(key),
      data: demoData,
      defaultRepo: DEFAULT_REPO,
    }),
  { ttlMs: BACKLOG_TTL_MS },
);

export async function runBacklogRefreshServerHandler(
  input: BacklogRefreshInput = {},
): Promise<BacklogRouteResponse> {
  const key = new URLSearchParams({
    repo: input.repo ?? DEFAULT_REPO,
    source: input.source ?? "all",
  }).toString();
  return backlogRefreshMemo.get(key);
}

export const backlogRefreshServerFn = createServerFn({ method: "GET" })
  .inputValidator(
    (input: BacklogRefreshInput | undefined): BacklogRefreshInput => input ?? {},
  )
  .handler(async ({ data }) => runBacklogRefreshServerHandler(data));
