import type { BacklogIssue, DemoData, GovernanceState, Id, Job, RepositoryWorldScan } from "./types";

const demoSeed: Omit<DemoData, "repoScans" | "backlog"> = {
  company: { id: "company-agentic", name: "Agentic Engineering", purpose: "Build AI-native engineering systems with visible governance and memory.", reputation: 74, budget: 128000, trustLevel: 82 },
  projectWorld: { id: "world-code-colony", companyId: "company-agentic", name: "Code Colony", domain: "software", repoUrl: "https://github.com/Agentic-Engineering-Agency/code-colony", mapStatus: "active", slogan: "Where your repo becomes a living company." },
  regions: [
    { id: "hq", projectWorldId: "world-code-colony", name: "HQ", kind: "hq", colorVar: "--d-hq", riskLevel: 1, health: 91, trust: 88, position: { x: 42, y: 8 }, rooms: ["planning"], activeJobIds: ["job-spec-preview"] },
    { id: "frontend", projectWorldId: "world-code-colony", name: "Frontend District", kind: "frontend", colorVar: "--d-frontend", riskLevel: 2, health: 84, trust: 80, position: { x: 9, y: 31 }, rooms: ["ui-room"], activeJobIds: ["job-shell"] },
    { id: "runtime", projectWorldId: "world-code-colony", name: "Runtime Yard", kind: "runtime", colorVar: "--d-infra", riskLevel: 4, health: 69, trust: 62, position: { x: 62, y: 34 }, rooms: ["runtime-room"], activeJobIds: ["job-spec-preview"] },
    { id: "memory", projectWorldId: "world-code-colony", name: "Memory Archive", kind: "memory", colorVar: "--memory", riskLevel: 2, health: 76, trust: 73, position: { x: 34, y: 58 }, rooms: ["memory-room"], activeJobIds: [] },
    { id: "testing", projectWorldId: "world-code-colony", name: "Testing Grounds", kind: "testing", colorVar: "--d-test", riskLevel: 3, health: 71, trust: 70, position: { x: 8, y: 68 }, rooms: ["testing-room"], activeJobIds: ["job-qa"] },
    { id: "market", projectWorldId: "world-code-colony", name: "Marketplace Bazaar", kind: "marketplace", colorVar: "--d-data", riskLevel: 2, health: 79, trust: 68, position: { x: 70, y: 66 }, rooms: ["market-room"], activeJobIds: [] },
  ],
  rooms: [
    { id: "planning", regionId: "hq", name: "Planning Room", kind: "planning", purpose: "Specs, ADRs, risk gates", boardIds: ["ops-board"], occupantAgentIds: ["architect", "sentinel"], efficiency: 4 },
    { id: "ui-room", regionId: "frontend", name: "Interface Studio", kind: "engineering", purpose: "Pixel tabletop UI", boardIds: ["ops-board"], occupantAgentIds: ["frontend"], efficiency: 5 },
    { id: "runtime-room", regionId: "runtime", name: "Oh My Pi Dock", kind: "review", purpose: "Simulated runtime sessions", boardIds: ["ops-board"], occupantAgentIds: ["operator"], efficiency: 3 },
    { id: "memory-room", regionId: "memory", name: "Ledger Vault", kind: "vault", purpose: "Memory records and skill lessons", boardIds: ["memory-board"], occupantAgentIds: ["curator"], efficiency: 4 },
    { id: "testing-room", regionId: "testing", name: "QA Burrow", kind: "testing", purpose: "Checks and review traps", boardIds: ["ops-board"], occupantAgentIds: ["qa"], efficiency: 4 },
    { id: "market-room", regionId: "market", name: "Loadout Counter", kind: "market", purpose: "Skills, hooks, MCP packs", boardIds: ["market-board"], occupantAgentIds: [], efficiency: 3 },
  ],
  boards: [
    { id: "ops-board", roomId: "planning", name: "Operation Board", lanes: ["proposed", "approved", "running", "review", "learned"] },
    { id: "memory-board", roomId: "memory-room", name: "Memory Ledger", lanes: ["proposed", "approved", "review", "learned"] },
    { id: "market-board", roomId: "market-room", name: "Loadout Registry", lanes: ["proposed", "approved", "learned"] },
  ],
  specs: [
    { id: "spec-preview", title: "Build Spec-to-Diff Preview", problem: "Leads cannot see what an approved spec will produce before trusting a runtime session.", desiredOutcome: "A simulated Oh My Pi run shows event logs, a small diff, checks, risk/cost impact, and reviewable artifacts.", nonGoals: ["No real repo mutation in MVP", "No hosted sandbox dependency"], constraints: ["Must label simulation clearly", "Must feed memory and skill proposals"], acceptanceCriteria: ["Approve spec locally", "Assign Runtime Operator", "Show event log and diff", "Review artifact bundle", "Produce memory and skill proposal"], affectedRegionIds: ["runtime", "frontend", "memory"], riskLevel: 3, requiredSkills: ["runtime protocol", "React UI", "artifact review"], status: "needs_review" },
  ],
  architectureDecisions: [{ id: "adr-css-map", title: "Use CSS world map before PixiJS", context: "PixiJS is desirable but could slow the first vertical slice.", decision: "Ship React/CSS board with typed data and isolate a future Pixi adapter.", consequences: ["Working demo arrives sooner", "Map animation depth is limited"], tradeoffs: ["Less rendering power now", "Cleaner product validation loop"], affectedRegionIds: ["frontend"], status: "approved" }],
  approvals: [{ id: "approval-spec-preview", targetType: "spec", targetId: "spec-preview", status: "pending", requiredApprovals: 2, votes: [{ player: "Founder", decision: "approve", comment: "Good MVP cut: simulated runtime is acceptable." }] }],
  agents: [
    { id: "architect", name: "Product Architect", role: "Product Architect", department: "planning", specialty: "MVP scope and spec contracts", trust: 86, reputation: 78, traits: ["systems thinker", "spec-first"], skills: ["PRD distillation", "ADR review"], loadout: ["Spec rubric", "Risk lens"], status: "assigned", currentJobId: "job-spec-preview" },
    { id: "frontend", name: "Frontend Builder", role: "Frontend Engineer", department: "engineering", specialty: "Pixel tabletop UI", trust: 81, reputation: 72, traits: ["visual", "fast"], skills: ["React", "Design tokens"], loadout: ["Parchment cards", "Room tiles"], status: "running", currentJobId: "job-shell" },
    { id: "operator", name: "Runtime Operator", role: "Runtime Engineer", department: "ops", specialty: "Oh My Pi run previews", trust: 64, reputation: 69, traits: ["careful", "logs everything"], skills: ["Runtime protocol", "Diff summaries"], loadout: ["Local worker stub", "Cost ledger"], status: "running", currentJobId: "job-spec-preview" },
    { id: "sentinel", name: "Review Sentinel", role: "Reviewer", department: "review", specialty: "Artifact review", trust: 90, reputation: 83, traits: ["skeptical", "precise"], skills: ["Review rubric", "Risk calls"], loadout: ["Approval tokens", "Diff viewer"], status: "reviewing" },
    { id: "curator", name: "Memory Curator", role: "Memory Steward", department: "research", specialty: "Ledger hygiene", trust: 77, reputation: 71, traits: ["archival", "contextual"], skills: ["Memory policy", "Skill proposals"], loadout: ["Ledger vault", "Skill steward"], status: "learning" },
    { id: "qa", name: "QA Goblin", role: "QA Engineer", department: "review", specialty: "Finding edge-case traps", trust: 74, reputation: 80, traits: ["mischievous", "thorough"], skills: ["Vitest", "Build checks"], loadout: ["Trap checklist", "CI gong"], status: "assigned", currentJobId: "job-qa" },
  ],
  jobs: [
    { id: "job-spec-preview", title: "Spec-to-Diff Preview", specId: "spec-preview", agentEmployeeId: "operator", state: "running", affectedRegionIds: ["runtime", "memory"], risk: "medium", estimate: "1 turn" },
    { id: "job-shell", title: "Code Colony app shell", specId: "spec-preview", agentEmployeeId: "frontend", state: "review", affectedRegionIds: ["frontend"], risk: "low", estimate: "1 turn" },
    { id: "job-qa", title: "Vertical slice QA pass", specId: "spec-preview", agentEmployeeId: "qa", state: "approved", affectedRegionIds: ["testing"], risk: "medium", estimate: "1 turn" },
  ],
  runs: [{ id: "run-preview", jobId: "job-spec-preview", agentEmployeeId: "operator", runtime: "oh_my_pi", status: "review", ephemeral: true, artifactIds: ["artifact-preview"] }],
  events: [
    { id: "ev1", runId: "run-preview", type: "run.started", role: "system", content: "Simulated Oh My Pi runtime session created for approved spec.", timestamp: "09:12" },
    { id: "ev2", runId: "run-preview", type: "run.message", role: "agent", content: "Loaded spec, ADR, risk notes, and UI design token constraints.", timestamp: "09:13" },
    { id: "ev3", runId: "run-preview", type: "run.tool_call", role: "tool", content: "Prepared patch preview for src/domain/demoData.ts and app route wiring.", timestamp: "09:15" },
    { id: "ev4", runId: "run-preview", type: "run.artifact_created", role: "system", content: "Artifact bundle ready: 3 files changed, checks simulated pass.", timestamp: "09:18" },
  ],
  artifacts: [{ id: "artifact-preview", runId: "run-preview", title: "Spec-to-Diff Preview Bundle", changedFiles: ["src/domain/types.ts", "src/domain/demoData.ts", "src/components/RuntimePreview.tsx"], diff: "+ export type RuntimeEvent = ...\n+ const runPreview = { runtime: 'oh_my_pi', status: 'review' }\n+ <DiffPreview artifact={artifactPreview} />", testResult: "Simulated checks: typecheck pass, unit pass, build pass", reviewerVerdicts: [{ reviewer: "Review Sentinel", verdict: "approve", note: "Simulation is explicit and produces reviewable learning objects." }, { reviewer: "QA Goblin", verdict: "request_changes", note: "Add a visible mocked-data badge before production demos." }], status: "in_review" }],
  memories: [
    { id: "mem-1", scope: "project", kind: "decision", content: "MVP ships CSS/React world map first; PixiJS remains a future adapter.", provenanceMode: "strict", confidence: 0.94, status: "accepted" },
    { id: "mem-2", scope: "artifact", kind: "lesson", content: "Runtime previews must label simulated outputs before review actions are enabled.", provenanceMode: "moderate", confidence: 0.82, status: "proposed" },
  ],
  skillProposals: [{ id: "skill-1", skillId: "oh-my-pi-runtime-preview", kind: "checklist_update", proposedScope: "company_private", approvalTier: 1, sourceMemoryIds: ["mem-2"], sourceArtifactIds: ["artifact-preview"], diffSummary: "Add pre-review checklist item: verify simulated vs real runtime output is visually labeled.", evalStatus: "not_required", approvalStatus: "needs_approval" }],
  marketplace: [
    { id: "pkg-1", slug: "spec-governance-rubric", name: "Spec Governance Rubric", kind: "review_rubric", version: "0.1.0", description: "Approval criteria for high-risk specs and ADRs.", compatibleRuntimes: ["oh_my_pi", "mcp"], installScope: "company", trustTier: "first_party", reviewStatus: "approved" },
    { id: "pkg-2", slug: "runtime-operator-template", name: "Runtime Operator Template", kind: "agent_template", version: "0.1.0", description: "Agent loadout for local Oh My Pi run previews.", compatibleRuntimes: ["oh_my_pi"], installScope: "agent", trustTier: "first_party", reviewStatus: "approved" },
    { id: "pkg-3", slug: "mcp-review-pack", name: "MCP Review Pack", kind: "mcp_tool_pack", version: "0.0.3", description: "Tools for artifact summaries and governance comments.", compatibleRuntimes: ["mcp"], installScope: "runtime", trustTier: "verified", reviewStatus: "approved" },
  ],
  trustPolicies: [{ id: "trust-runtime", subjectType: "runtime", subjectId: "oh_my_pi", trustLevel: 3, allowedActions: ["preview_diff", "run_tests"], approvalRequiredActions: ["write_files", "open_pr"], forbiddenActions: ["push_main_without_review"] }],
  riskProfiles: [
    { regionId: "runtime", technicalDebt: 62, operationalRisk: 71, securitySensitivity: 58, testCoverageConfidence: 63, documentationQuality: 68 },
    { regionId: "frontend", technicalDebt: 38, operationalRisk: 31, securitySensitivity: 20, testCoverageConfidence: 74, documentationQuality: 81 },
  ],
  costLedger: [{ id: "cost-1", jobId: "job-spec-preview", agentRunId: "run-preview", modelProvider: "simulated", runtimeSeconds: 184, estimatedCostUsd: 1.42 }]
};

const demoBacklog: BacklogIssue[] = [
  { id: "backlog-linear-pix-1", source: "linear", externalRef: "AE-101", title: "Render world map districts in PixiJS", summary: "Replace CSS region nodes with a PixiJS scene that preserves district colors and trust meters.", suggestedRegionId: "frontend", status: "new" },
  { id: "backlog-gh-runtime-7", source: "github", externalRef: "#7", title: "Wire real Oh My Pi worker behind RuntimeWorker contract", summary: "Implement an OhMyPiWorker that satisfies RuntimeWorker and shells out to a local sandbox.", suggestedRegionId: "runtime", status: "new" },
  { id: "backlog-manual-mem-3", source: "manual", externalRef: "OPS-MEM-3", title: "Persist memory ledger to Convex", summary: "Define a memory provider abstraction and back it with a Convex schema.", suggestedRegionId: "memory", status: "new" },
];

const demoRepositoryPaths = [
  "app/layout.tsx",
  "app/page.tsx",
  "app/globals.css",
  "src/components/CodeColonyApp.tsx",
  "src/domain/types.ts",
  "src/domain/demoData.ts",
  "__tests__/demoData.test.ts",
  ".github/workflows/ci.yml",
  "docs/implementation-plan.md",
  "docs/product/agent_company_sim_detailed_spec.md",
  "docs/design/tokens.css",
  "docs/design/components.css",
  "docs/design/themes.css",
  "public/assets/code-colony-logo.png",
  "package.json",
  "tsconfig.json",
  "eslint.config.mjs",
  "next.config.mjs",
] as const;

type RepoWorldData = Pick<DemoData, "projectWorld" | "regions" | "rooms">;
const repoRegionIds = ["hq", "frontend", "runtime", "memory", "testing", "market"] as const;
type RegionId = (typeof repoRegionIds)[number];

function isRuntimeConfigPath(path: string) {
  return path === "package.json" || path === "tsconfig.json" || path === "eslint.config.mjs" || path === "next.config.mjs" || path.endsWith(".config.mjs");
}

const repoPathRules: { regionId: RegionId; matches: (path: string) => boolean }[] = [
  { regionId: "testing", matches: (path) => path.startsWith("__tests__/") || path.startsWith(".github/workflows/") },
  { regionId: "frontend", matches: (path) => path.startsWith("app/") || path.startsWith("src/components/") || path.startsWith("public/assets/") || path.startsWith("docs/design/") },
  { regionId: "hq", matches: (path) => path.startsWith("src/domain/") || path.startsWith("docs/product/") || path === "docs/implementation-plan.md" },
  { regionId: "runtime", matches: isRuntimeConfigPath },
];

function isRepoRegionId(id: string): id is RegionId {
  return repoRegionIds.some((regionId) => regionId === id);
}

export type RepositoryWorldScanOptions = { source: "seeded_inventory"; generatedAt?: string } | { source: "live_scan"; generatedAt: string };

export function parseGitListingOutput(stdout: string): string[] {
  if (!stdout) return [];
  const separator = stdout.includes("\0") ? "\0" : "\n";
  return stdout.split(separator).map((entry) => entry.trim()).filter(Boolean);
}

export function createRepositoryWorldScan(data: RepoWorldData, rawPaths: readonly string[]): RepositoryWorldScan;
export function createRepositoryWorldScan(data: RepoWorldData, rawPaths: readonly string[], options: RepositoryWorldScanOptions): RepositoryWorldScan;
export function createRepositoryWorldScan(data: RepoWorldData, rawPaths: readonly string[], options: RepositoryWorldScanOptions = { source: "seeded_inventory" }): RepositoryWorldScan {
  const paths = [...new Set(rawPaths.map((path) => path.trim()).filter(Boolean))].sort();
  const pathsByRegion = new Map<RegionId, string[]>();
  const unmappedPaths: string[] = [];

  for (const path of paths) {
    const rule = repoPathRules.find((candidate) => candidate.matches(path));
    if (!rule) {
      unmappedPaths.push(path);
      continue;
    }
    pathsByRegion.set(rule.regionId, [...(pathsByRegion.get(rule.regionId) ?? []), path]);
  }

  const districts = data.regions.map((region) => {
    const regionPaths = isRepoRegionId(region.id) ? (pathsByRegion.get(region.id) ?? []) : [];
    const rooms = data.rooms.filter((room) => room.regionId === region.id);
    return {
      regionId: region.id,
      fileCount: regionPaths.length,
      samplePaths: regionPaths.slice(0, 4),
      generatedRoomNames: rooms.map((room) => room.name),
      coverageSignals: regionPaths.length === 0 ? ["No repository paths mapped to this district yet."] : [],
    };
  });

  const notes: string[] = [];
  if (!paths.some((path) => path.startsWith("__tests__/") || path.startsWith(".github/workflows/"))) {
    notes.push("No tests or CI workflow paths were found in the imported inventory.");
  }
  if (!paths.some((path) => path.startsWith("src/domain/") || path.startsWith("docs/product/") || path === "docs/implementation-plan.md")) {
    notes.push("No product, implementation, or domain contract paths were found in the imported inventory.");
  }
  if (!paths.some(isRuntimeConfigPath)) {
    notes.push("No runtime or configuration paths were found in the imported inventory.");
  }
  if (unmappedPaths.length > 0) {
    notes.push(`${unmappedPaths.length} imported path${unmappedPaths.length === 1 ? "" : "s"} need manual district mapping.`);
  }

  return {
    id: `repo-scan-${options.source}`,
    projectWorldId: data.projectWorld.id,
    source: options.source,
    generatedAt: options.generatedAt ?? "2026-04-29",
    totalFiles: paths.length,
    districts,
    unmappedPaths,
    notes,
  };
}

export const demoData: DemoData = { ...demoSeed, repoScans: [createRepositoryWorldScan(demoSeed, demoRepositoryPaths)], backlog: demoBacklog };

export function moveJob(data: DemoData, jobId: Id, state: GovernanceState): DemoData {
  return { ...data, jobs: data.jobs.map((job) => (job.id === jobId ? { ...job, state } : job)) };
}

export function voteOnApproval(data: DemoData, approvalId: Id, decision: "approve" | "reject" | "request_changes"): DemoData {
  const status = decision === "approve" ? "approved" : decision === "reject" ? "rejected" : "changes_requested";
  return { ...data, approvals: data.approvals.map((approval) => approval.id === approvalId ? { ...approval, status, votes: [...approval.votes, { player: "You", decision, comment: decision === "approve" ? "Approved for simulated runtime preview." : "Needs another pass." }] } : approval) };
}

export function approveArtifactLearning(data: DemoData): DemoData {
  return { ...data, memories: data.memories.map((memory) => memory.id === "mem-2" ? { ...memory, status: "accepted" } : memory), skillProposals: data.skillProposals.map((skill) => skill.id === "skill-1" ? { ...skill, approvalStatus: "approved" } : skill) };
}


function regionToAgentId(suggestedRegionId: Id): Id {
  switch (suggestedRegionId) {
    case "frontend":
      return "frontend";
    case "runtime":
      return "operator";
    case "memory":
      return "curator";
    case "testing":
      return "qa";
    default:
      return "architect";
  }
}

export function ingestBacklogIssue(data: DemoData, issueId: Id): DemoData {
  const issue = data.backlog.find((entry) => entry.id === issueId);
  if (!issue || issue.status !== "new") return data;
  const jobId = `job-from-${issue.id}`;
  if (data.jobs.some((existing) => existing.id === jobId)) return data;
  const newJob: Job = { id: jobId, title: issue.title, specId: "spec-preview", agentEmployeeId: regionToAgentId(issue.suggestedRegionId), state: "proposed", affectedRegionIds: [issue.suggestedRegionId], risk: "medium", estimate: "tbd" };
  return {
    ...data,
    jobs: [...data.jobs, newJob],
    backlog: data.backlog.map((entry) => entry.id === issueId ? { ...entry, status: "ingested" as const, ingestedJobId: jobId } : entry),
  };
}

export function rejectBacklogIssue(data: DemoData, issueId: Id): DemoData {
  return { ...data, backlog: data.backlog.map((entry) => entry.id === issueId && entry.status === "new" ? { ...entry, status: "rejected" as const } : entry) };
}