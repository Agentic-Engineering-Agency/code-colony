import type { BacklogIssue, DemoData, Id } from "./types";

export type GithubIssueJson = {
  number: number;
  title: string;
  body?: string | null;
  labels?: { name?: string | null }[] | null;
};

const labelToRegionEntries: { match: (label: string) => boolean; regionId: Id }[] = [
  { match: (label) => /front[\s-]?end|ui|design/.test(label), regionId: "frontend" },
  { match: (label) => /runtime|infra|deploy|ops/.test(label), regionId: "runtime" },
  { match: (label) => /memory|ledger|convex|honcho/.test(label), regionId: "memory" },
  { match: (label) => /test|qa|ci/.test(label), regionId: "testing" },
  { match: (label) => /market|loadout|skill|mcp/.test(label), regionId: "market" },
];

export function suggestRegionFromLabels(labelNames: readonly string[]): Id {
  for (const label of labelNames) {
    const lower = label.toLowerCase();
    const hit = labelToRegionEntries.find((entry) => entry.match(lower));
    if (hit) return hit.regionId;
  }
  return "hq";
}

export function parseGithubIssuesJson(stdout: string): BacklogIssue[] {
  if (!stdout.trim()) return [];
  let raw: unknown;
  try {
    raw = JSON.parse(stdout);
  } catch {
    return [];
  }
  if (!Array.isArray(raw)) return [];
  const issues: BacklogIssue[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const candidate = entry as GithubIssueJson;
    if (typeof candidate.number !== "number" || typeof candidate.title !== "string") continue;
    const labelNames = Array.isArray(candidate.labels)
      ? candidate.labels.map((label) => label?.name).filter((name): name is string => typeof name === "string")
      : [];
    issues.push({
      id: `backlog-gh-${candidate.number}`,
      source: "github",
      externalRef: `#${candidate.number}`,
      title: candidate.title,
      summary: typeof candidate.body === "string" && candidate.body.trim().length > 0 ? candidate.body.trim().slice(0, 240) : candidate.title,
      suggestedRegionId: suggestRegionFromLabels(labelNames),
      status: "new",
    });
  }
  return issues;
}

export function mergeGithubBacklog(data: DemoData, issues: readonly BacklogIssue[]): DemoData {
  const existingRefs = new Set(data.backlog.filter((entry) => entry.source === "github").map((entry) => entry.externalRef));
  const fresh = issues.filter((issue) => !existingRefs.has(issue.externalRef));
  if (fresh.length === 0) return data;
  return { ...data, backlog: [...data.backlog, ...fresh] };
}
