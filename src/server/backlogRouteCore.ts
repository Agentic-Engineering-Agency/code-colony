import type { BacklogRefreshFetchers, BacklogRefreshReport } from "../domain/backlogRefresh";
import type { BacklogIssue, DemoData } from "../domain/types";
import { refreshBacklogFromImporters } from "../domain/backlogRefresh";
import { BACKLOG_REFRESH_SOURCES, buildBacklogFetchers, isBacklogRefreshSource, type BacklogRefreshSource } from "./backlogSources";

export type BacklogRouteSuccessBody = { repo: string; source: BacklogRefreshSource; report: BacklogRefreshReport; backlog: BacklogIssue[] };
export type BacklogRouteErrorBody = { error: string; allowed: readonly string[] };
export type BacklogRouteResponse =
  | { status: 200; body: BacklogRouteSuccessBody }
  | { status: 400; body: BacklogRouteErrorBody };

export type BacklogRouteOptions = {
  searchParams: URLSearchParams;
  data: DemoData;
  defaultRepo: string;
  fetchersFor?: (source: BacklogRefreshSource, repo: string) => BacklogRefreshFetchers;
};

export async function runBacklogRefreshRequest({ searchParams, data, defaultRepo, fetchersFor }: BacklogRouteOptions): Promise<BacklogRouteResponse> {
  const repo = searchParams.get("repo") ?? defaultRepo;
  const sourceParam = searchParams.get("source") ?? "all";
  if (!isBacklogRefreshSource(sourceParam)) {
    return { status: 400, body: { error: `unsupported source: ${sourceParam}`, allowed: BACKLOG_REFRESH_SOURCES } };
  }
  const fetchers = (fetchersFor ?? buildBacklogFetchers)(sourceParam, repo);
  const result = await refreshBacklogFromImporters(data, fetchers);
  return {
    status: 200,
    body: { repo, source: sourceParam, report: result.report, backlog: result.data.backlog },
  };
}
