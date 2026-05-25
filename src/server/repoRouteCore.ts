import type { DemoData, RepositoryWorldScan } from "../domain/types";
import { createRepositoryWorldScan } from "../domain/demoData";
import { postHog, type PostHogClient } from "../observability/posthog";
import { createGitListingFetcher } from "./repoScanFetchers";

export type RepoRouteSuccessBody = { cwd: string | null; scan: RepositoryWorldScan };
export type RepoRouteErrorBody = { error: string; cwd: string | null };
export type RepoRouteResponse =
  | { status: 200; body: RepoRouteSuccessBody }
  | { status: 502; body: RepoRouteErrorBody };

export type RepoListingFetcher = () => Promise<readonly string[] | null>;

export type RepoRouteOptions = {
  searchParams: URLSearchParams;
  data: DemoData;
  now?: () => string;
  fetcher?: RepoListingFetcher;
  telemetry?: PostHogClient;
};

export async function runRepoScanRequest({ searchParams, data, now, fetcher, telemetry = postHog }: RepoRouteOptions): Promise<RepoRouteResponse> {
  const cwdParam = searchParams.get("cwd");
  const cwd = cwdParam ?? null;
  const resolvedFetcher = fetcher ?? createGitListingFetcher({ cwd: cwdParam ?? undefined });
  const paths = await resolvedFetcher();
  if (!paths) {
    await telemetry.capture({
      event: "repo_onboarding_started",
      properties: {
        repo: data.projectWorld.repoUrl,
        cwd,
        status: "scan_failed",
      },
    });
    return { status: 502, body: { error: "git ls-files unavailable", cwd } };
  }
  const generatedAt = (now ?? (() => new Date().toISOString()))();
  const scan = createRepositoryWorldScan(data, paths, { source: "live_scan", generatedAt });
  await telemetry.capture({
    event: "repo_onboarding_completed",
    properties: {
      repo: data.projectWorld.repoUrl,
      cwd,
      total_files: scan.totalFiles,
      mapped_districts: scan.districts.filter((district) => district.fileCount > 0).length,
      unmapped_count: scan.unmappedPaths.length,
      note_count: scan.notes.length,
    },
  });
  return { status: 200, body: { cwd, scan } };
}
