import type { BacklogRefreshFetchers } from "../domain/backlogRefresh";
import { createGithubIssuesFetcher, createLinearIssuesFetcher, type CommandRunner } from "./backlogFetchers";

export const BACKLOG_REFRESH_SOURCES = ["github", "linear", "all"] as const;
export type BacklogRefreshSource = (typeof BACKLOG_REFRESH_SOURCES)[number];

export function isBacklogRefreshSource(value: string): value is BacklogRefreshSource {
  return (BACKLOG_REFRESH_SOURCES as readonly string[]).includes(value);
}

export type BacklogFetcherFactories = {
  github?: (repo: string, runner?: CommandRunner) => BacklogRefreshFetchers["fetchGithubIssuesJson"];
  linear?: (runner?: CommandRunner, args?: readonly string[]) => BacklogRefreshFetchers["fetchLinearIssuesJson"];
};

const defaultFactories: Required<BacklogFetcherFactories> = {
  github: (repo, runner) => createGithubIssuesFetcher(repo, runner),
  linear: (runner, args) => createLinearIssuesFetcher(runner, args),
};

export function buildBacklogFetchers(source: BacklogRefreshSource, repo: string, factories: BacklogFetcherFactories = defaultFactories): BacklogRefreshFetchers {
  const useFactories = { ...defaultFactories, ...factories };
  const fetchers: BacklogRefreshFetchers = {};
  if (source === "github" || source === "all") {
    fetchers.fetchGithubIssuesJson = useFactories.github(repo);
  }
  if (source === "linear" || source === "all") {
    fetchers.fetchLinearIssuesJson = useFactories.linear();
  }
  return fetchers;
}
