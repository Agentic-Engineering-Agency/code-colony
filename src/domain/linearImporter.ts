import type { BacklogIssue, DemoData } from "./types";
import { suggestRegionFromLabels } from "./githubImporter";

export type LinearIssueJson = {
  identifier: string;
  title: string;
  description?: string | null;
  labels?: { name?: string | null }[] | null;
};

export function parseLinearIssuesJson(stdout: string): BacklogIssue[] {
  if (!stdout.trim()) return [];
  let raw: unknown;
  try {
    raw = JSON.parse(stdout);
  } catch {
    return [];
  }
  const items = Array.isArray(raw) ? raw : Array.isArray((raw as { issues?: unknown[] })?.issues) ? (raw as { issues: unknown[] }).issues : [];
  const issues: BacklogIssue[] = [];
  for (const entry of items) {
    if (!entry || typeof entry !== "object") continue;
    const candidate = entry as LinearIssueJson;
    if (typeof candidate.identifier !== "string" || typeof candidate.title !== "string") continue;
    const labelNames = Array.isArray(candidate.labels)
      ? candidate.labels.map((label) => label?.name).filter((name): name is string => typeof name === "string")
      : [];
    issues.push({
      id: `backlog-linear-${candidate.identifier.toLowerCase()}`,
      source: "linear",
      externalRef: candidate.identifier,
      title: candidate.title,
      summary: typeof candidate.description === "string" && candidate.description.trim().length > 0 ? candidate.description.trim().slice(0, 240) : candidate.title,
      suggestedRegionId: suggestRegionFromLabels(labelNames),
      status: "new",
    });
  }
  return issues;
}

export function mergeLinearBacklog(data: DemoData, issues: readonly BacklogIssue[]): DemoData {
  const existingRefs = new Set(data.backlog.filter((entry) => entry.source === "linear").map((entry) => entry.externalRef));
  const fresh = issues.filter((issue) => !existingRefs.has(issue.externalRef));
  if (fresh.length === 0) return data;
  return { ...data, backlog: [...data.backlog, ...fresh] };
}
