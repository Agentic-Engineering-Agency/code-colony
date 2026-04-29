import type { DemoData, RepositoryWorldScan } from "../domain/types";
import { createRepositoryWorldScan } from "../domain/demoData";
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
};

export async function runRepoScanRequest({ searchParams, data, now, fetcher }: RepoRouteOptions): Promise<RepoRouteResponse> {
  const cwdParam = searchParams.get("cwd");
  const cwd = cwdParam ?? null;
  const resolvedFetcher = fetcher ?? createGitListingFetcher({ cwd: cwdParam ?? undefined });
  const paths = await resolvedFetcher();
  if (!paths) {
    return { status: 502, body: { error: "git ls-files unavailable", cwd } };
  }
  const generatedAt = (now ?? (() => new Date().toISOString()))();
  const scan = createRepositoryWorldScan(data, paths, { source: "live_scan", generatedAt });
  return { status: 200, body: { cwd, scan } };
}
