/**
 * TanStack Start server function for `/api/repo/scan`.
 *
 * Wraps the same `runRepoScanRequest` core used by the Next.js handler. The
 * caller passes an optional `cwd`; `runRepoScanServerHandler` returns the
 * existing `{ status, body }` discriminated shape so the migration is
 * mechanically verifiable against the existing route tests.
 */
import { createServerFn } from "@tanstack/react-start";

import { demoData } from "../../src/domain/demoData";
import {
  runRepoScanRequest,
  type RepoRouteResponse,
} from "../../src/server/repoRouteCore";
import { createKeyedTtlMemo } from "../../src/server/ttlMemo";

export type RepoScanInput = { cwd?: string };

const REPO_SCAN_TTL_MS = 3_000;

const repoScanMemo = createKeyedTtlMemo<string, RepoRouteResponse>(
  (key) =>
    runRepoScanRequest({
      searchParams: new URLSearchParams(key === "__default__" ? undefined : { cwd: key }),
      data: demoData,
    }),
  { ttlMs: REPO_SCAN_TTL_MS },
);

export async function runRepoScanServerHandler(
  input: RepoScanInput = {},
): Promise<RepoRouteResponse> {
  const key = input.cwd ?? "__default__";
  return repoScanMemo.get(key);
}

export const repoScanServerFn = createServerFn({ method: "GET" })
  .inputValidator((input: RepoScanInput | undefined): RepoScanInput => input ?? {})
  .handler(async ({ data }) => runRepoScanServerHandler(data));
