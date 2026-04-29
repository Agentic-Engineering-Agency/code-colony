import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const governanceState = v.union(
  v.literal("proposed"),
  v.literal("approved"),
  v.literal("running"),
  v.literal("review"),
  v.literal("learned"),
);

const runtimeAdapter = v.union(
  v.literal("oh_my_pi"),
  v.literal("mastra"),
  v.literal("convex_agent"),
  v.literal("external_cli"),
  v.literal("mcp"),
);

const voteDecision = v.union(
  v.literal("approve"),
  v.literal("reject"),
  v.literal("request_changes"),
);

const riskLevel = v.union(v.literal("low"), v.literal("medium"), v.literal("high"));

export default defineSchema({
  companies: defineTable({
    seedId: v.string(),
    name: v.string(),
    purpose: v.string(),
    reputation: v.number(),
    budget: v.number(),
    trustLevel: v.number(),
  }).index("by_seed_id", ["seedId"]),

  projectWorlds: defineTable({
    seedId: v.string(),
    companySeedId: v.string(),
    name: v.string(),
    domain: v.union(v.literal("software"), v.literal("mixed")),
    repoUrl: v.string(),
    mapStatus: v.union(v.literal("draft"), v.literal("approved"), v.literal("active")),
    slogan: v.string(),
  }).index("by_seed_id", ["seedId"]),

  regions: defineTable({
    seedId: v.string(),
    projectWorldSeedId: v.string(),
    name: v.string(),
    kind: v.union(
      v.literal("hq"),
      v.literal("frontend"),
      v.literal("runtime"),
      v.literal("memory"),
      v.literal("testing"),
      v.literal("marketplace"),
    ),
    colorVar: v.string(),
    riskLevel: v.number(),
    health: v.number(),
    trust: v.number(),
    position: v.object({ x: v.number(), y: v.number() }),
    rooms: v.array(v.string()),
    activeJobIds: v.array(v.string()),
  }).index("by_seed_id", ["seedId"]),

  rooms: defineTable({
    seedId: v.string(),
    regionSeedId: v.string(),
    name: v.string(),
    kind: v.union(
      v.literal("planning"),
      v.literal("engineering"),
      v.literal("review"),
      v.literal("risk"),
      v.literal("market"),
      v.literal("testing"),
      v.literal("vault"),
    ),
    purpose: v.string(),
    boardIds: v.array(v.string()),
    occupantAgentIds: v.array(v.string()),
    efficiency: v.number(),
  }).index("by_seed_id", ["seedId"]),

  operationBoards: defineTable({
    seedId: v.string(),
    roomSeedId: v.string(),
    name: v.string(),
    lanes: v.array(governanceState),
  }).index("by_seed_id", ["seedId"]),

  jobs: defineTable({
    seedId: v.string(),
    title: v.string(),
    specSeedId: v.string(),
    agentEmployeeSeedId: v.string(),
    state: governanceState,
    affectedRegionIds: v.array(v.string()),
    risk: riskLevel,
    estimate: v.string(),
  }).index("by_seed_id", ["seedId"]).index("by_state", ["state"]),

  specs: defineTable({
    seedId: v.string(),
    title: v.string(),
    problem: v.string(),
    desiredOutcome: v.string(),
    nonGoals: v.array(v.string()),
    constraints: v.array(v.string()),
    acceptanceCriteria: v.array(v.string()),
    affectedRegionIds: v.array(v.string()),
    riskLevel: v.number(),
    requiredSkills: v.array(v.string()),
    status: v.union(v.literal("draft"), v.literal("needs_review"), v.literal("approved"), v.literal("rejected")),
  }).index("by_seed_id", ["seedId"]),

  architectureDecisions: defineTable({
    seedId: v.string(),
    title: v.string(),
    context: v.string(),
    decision: v.string(),
    consequences: v.array(v.string()),
    tradeoffs: v.array(v.string()),
    affectedRegionIds: v.array(v.string()),
    status: v.union(
      v.literal("draft"),
      v.literal("needs_review"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("superseded"),
    ),
  }).index("by_seed_id", ["seedId"]),

  approvals: defineTable({
    seedId: v.string(),
    targetType: v.union(
      v.literal("spec"),
      v.literal("architecture_decision"),
      v.literal("artifact_bundle"),
      v.literal("skill_update"),
    ),
    targetSeedId: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("changes_requested"),
    ),
    requiredApprovals: v.number(),
    votes: v.array(
      v.object({
        player: v.string(),
        decision: voteDecision,
        comment: v.optional(v.string()),
      }),
    ),
  }).index("by_seed_id", ["seedId"]),

  agentEmployees: defineTable({
    seedId: v.string(),
    name: v.string(),
    role: v.string(),
    department: v.union(
      v.literal("engineering"),
      v.literal("research"),
      v.literal("ops"),
      v.literal("review"),
      v.literal("planning"),
    ),
    specialty: v.string(),
    trust: v.number(),
    reputation: v.number(),
    traits: v.array(v.string()),
    skills: v.array(v.string()),
    loadout: v.array(v.string()),
    status: v.union(
      v.literal("idle"),
      v.literal("assigned"),
      v.literal("running"),
      v.literal("blocked"),
      v.literal("reviewing"),
      v.literal("learning"),
    ),
    currentJobSeedId: v.optional(v.string()),
  }).index("by_seed_id", ["seedId"]),

  agentRuns: defineTable({
    seedId: v.string(),
    jobSeedId: v.string(),
    agentEmployeeSeedId: v.string(),
    runtime: runtimeAdapter,
    status: v.union(
      v.literal("queued"),
      v.literal("starting"),
      v.literal("working"),
      v.literal("needs_approval"),
      v.literal("blocked"),
      v.literal("review"),
      v.literal("done"),
      v.literal("failed"),
    ),
    artifactSeedIds: v.array(v.string()),
  }).index("by_seed_id", ["seedId"]).index("by_job", ["jobSeedId"]),

  runtimeEvents: defineTable({
    seedId: v.string(),
    runSeedId: v.string(),
    type: v.union(
      v.literal("run.started"),
      v.literal("run.status"),
      v.literal("run.message"),
      v.literal("run.tool_call"),
      v.literal("run.tool_result"),
      v.literal("run.artifact_created"),
      v.literal("run.completed"),
    ),
    role: v.optional(v.union(v.literal("agent"), v.literal("tool"), v.literal("system"))),
    content: v.string(),
    timestamp: v.string(),
  }).index("by_seed_id", ["seedId"]).index("by_run", ["runSeedId"]),

  artifactBundles: defineTable({
    seedId: v.string(),
    runSeedId: v.string(),
    title: v.string(),
    changedFiles: v.array(v.string()),
    diff: v.string(),
    testResult: v.string(),
    reviewerVerdicts: v.array(
      v.object({
        reviewer: v.string(),
        verdict: v.union(v.literal("approve"), v.literal("request_changes"), v.literal("reject")),
        note: v.string(),
      }),
    ),
    status: v.union(v.literal("in_review"), v.literal("approved"), v.literal("changes_requested")),
  }).index("by_seed_id", ["seedId"]).index("by_run", ["runSeedId"]),

  memories: defineTable({
    seedId: v.string(),
    scope: v.union(
      v.literal("company"),
      v.literal("project"),
      v.literal("region"),
      v.literal("room"),
      v.literal("agent"),
      v.literal("job"),
      v.literal("artifact"),
      v.literal("architecture"),
    ),
    kind: v.union(
      v.literal("fact"),
      v.literal("decision"),
      v.literal("lesson"),
      v.literal("risk"),
      v.literal("trust"),
      v.literal("artifact_summary"),
      v.literal("architecture_rationale"),
    ),
    content: v.string(),
    provenanceMode: v.union(
      v.literal("strict"),
      v.literal("moderate"),
      v.literal("soft"),
      v.literal("ephemeral"),
    ),
    confidence: v.number(),
    status: v.union(v.literal("accepted"), v.literal("proposed")),
  }).index("by_seed_id", ["seedId"]),

  skillProposals: defineTable({
    seedId: v.string(),
    skillId: v.string(),
    kind: v.union(
      v.literal("new_skill"),
      v.literal("prompt_update"),
      v.literal("checklist_update"),
      v.literal("example_added"),
      v.literal("anti_pattern_added"),
      v.literal("rubric_update"),
      v.literal("tool_usage_rule"),
      v.literal("hook_update"),
      v.literal("plugin_update"),
      v.literal("mcp_update"),
    ),
    proposedScope: v.union(
      v.literal("agent_private"),
      v.literal("project_private"),
      v.literal("company_private"),
      v.literal("marketplace_draft"),
    ),
    approvalTier: v.number(),
    sourceMemorySeedIds: v.array(v.string()),
    sourceArtifactSeedIds: v.array(v.string()),
    diffSummary: v.string(),
    evalStatus: v.union(
      v.literal("not_required"),
      v.literal("pending"),
      v.literal("passed"),
      v.literal("failed"),
    ),
    approvalStatus: v.union(
      v.literal("draft"),
      v.literal("needs_approval"),
      v.literal("approved"),
      v.literal("rejected"),
    ),
  }).index("by_seed_id", ["seedId"]),

  marketplacePackages: defineTable({
    seedId: v.string(),
    slug: v.string(),
    name: v.string(),
    kind: v.string(),
    version: v.string(),
    description: v.string(),
    compatibleRuntimes: v.array(runtimeAdapter),
    installScope: v.union(
      v.literal("company"),
      v.literal("project_world"),
      v.literal("region"),
      v.literal("room"),
      v.literal("agent"),
      v.literal("runtime"),
    ),
    trustTier: v.union(
      v.literal("first_party"),
      v.literal("verified"),
      v.literal("community"),
      v.literal("untrusted"),
    ),
    reviewStatus: v.union(
      v.literal("draft"),
      v.literal("approved"),
      v.literal("deprecated"),
      v.literal("blocked"),
    ),
  }).index("by_seed_id", ["seedId"]),

  trustPolicies: defineTable({
    seedId: v.string(),
    subjectType: v.union(
      v.literal("agent"),
      v.literal("skill"),
      v.literal("room"),
      v.literal("region"),
      v.literal("runtime"),
    ),
    subjectSeedId: v.string(),
    trustLevel: v.number(),
    allowedActions: v.array(v.string()),
    approvalRequiredActions: v.array(v.string()),
    forbiddenActions: v.array(v.string()),
  }).index("by_seed_id", ["seedId"]),

  riskProfiles: defineTable({
    regionSeedId: v.string(),
    technicalDebt: v.number(),
    operationalRisk: v.number(),
    securitySensitivity: v.number(),
    testCoverageConfidence: v.number(),
    documentationQuality: v.number(),
  }).index("by_region", ["regionSeedId"]),

  costLedger: defineTable({
    seedId: v.string(),
    jobSeedId: v.string(),
    agentRunSeedId: v.string(),
    modelProvider: v.string(),
    runtimeSeconds: v.number(),
    estimatedCostUsd: v.number(),
  }).index("by_seed_id", ["seedId"]),

  repoScans: defineTable({
    seedId: v.string(),
    projectWorldSeedId: v.string(),
    source: v.union(v.literal("seeded_inventory"), v.literal("live_scan")),
    generatedAt: v.string(),
    totalFiles: v.number(),
    districts: v.array(
      v.object({
        regionSeedId: v.string(),
        fileCount: v.number(),
        samplePaths: v.array(v.string()),
        generatedRoomNames: v.array(v.string()),
        coverageSignals: v.array(v.string()),
      }),
    ),
    unmappedPaths: v.array(v.string()),
    notes: v.array(v.string()),
  }).index("by_seed_id", ["seedId"]),

  backlogIssues: defineTable({
    seedId: v.string(),
    source: v.union(v.literal("linear"), v.literal("github"), v.literal("manual")),
    externalRef: v.string(),
    title: v.string(),
    summary: v.string(),
    suggestedRegionSeedId: v.string(),
    status: v.union(v.literal("new"), v.literal("ingested"), v.literal("rejected")),
    ingestedJobSeedId: v.optional(v.string()),
  }).index("by_seed_id", ["seedId"]).index("by_external_ref", ["source", "externalRef"]),
});
