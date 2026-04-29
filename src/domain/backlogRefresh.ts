import type { BacklogIssue, DemoData } from "./types";
import { mergeGithubBacklog, parseGithubIssuesJson } from "./githubImporter";
import { mergeLinearBacklog, parseLinearIssuesJson } from "./linearImporter";

export type BacklogRefreshFetchers = {
  fetchGithubIssuesJson?: () => Promise<string | null>;
  fetchLinearIssuesJson?: () => Promise<string | null>;
};

export type BacklogRefreshReport = {
  githubAdded: number;
  linearAdded: number;
  errors: string[];
};

export type BacklogRefreshResult = {
  data: DemoData;
  report: BacklogRefreshReport;
};

export async function refreshBacklogFromImporters(data: DemoData, fetchers: BacklogRefreshFetchers): Promise<BacklogRefreshResult> {
  const report: BacklogRefreshReport = { githubAdded: 0, linearAdded: 0, errors: [] };
  let next = data;

  if (fetchers.fetchGithubIssuesJson) {
    try {
      const stdout = await fetchers.fetchGithubIssuesJson();
      if (stdout) {
        const parsed: BacklogIssue[] = parseGithubIssuesJson(stdout);
        const merged = mergeGithubBacklog(next, parsed);
        report.githubAdded = merged.backlog.length - next.backlog.length;
        next = merged;
      }
    } catch (error) {
      report.errors.push(`github: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (fetchers.fetchLinearIssuesJson) {
    try {
      const stdout = await fetchers.fetchLinearIssuesJson();
      if (stdout) {
        const parsed: BacklogIssue[] = parseLinearIssuesJson(stdout);
        const merged = mergeLinearBacklog(next, parsed);
        report.linearAdded = merged.backlog.length - next.backlog.length;
        next = merged;
      }
    } catch (error) {
      report.errors.push(`linear: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return { data: next, report };
}
