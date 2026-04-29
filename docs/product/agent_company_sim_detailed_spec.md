# Agentic Company Sim — PRD + Technical Architecture

## Document Status

**Status:** Draft v0.1  
**Primary audience:** Agentic Engineering founding/product/engineering team  
**Primary use:** Align product direction, define MVP scope, and guide first implementation milestones  
**Current priority:** Build a narrow vertical slice proving project-world generation, multiplayer governance, and a small spec-to-diff preview.

---

# Part I — Product Requirements Document

---

# 1. Product Overview

## 1.1 Product Name

**Working name:** Agentic Company Sim

Possible future names:

- Project World OS
- Agentic Engineering Company Sim
- Sisyphus Company OS
- AI Project Colony
- Agent Company Simulator

## 1.2 Product Thesis

Agentic Company Sim is a multiplayer AI company simulation where a real software project becomes a playable world. Players act as founders, leads, and operators. They generate and manage persistent agent-employees, equip them with Pi skills/plugins/hooks/tools/MCPs, govern work through specs and reviews, and execute real work through temporary Oh My Pi runtime sessions.

The product is not a game skin over a dashboard. It is a learning company simulator where real work produces durable organizational capability: specs, artifacts, reviews, memories, trust, risk signals, and self-improving skills.

## 1.3 One-Sentence Description

A multiplayer AI company sim where your repo becomes a living project world, your agents become persistent employees, and every spec, diff, review, failure, and lesson improves the company over time.

## 1.4 Problem Statement

AI coding and workflow agents are increasingly powerful, but coordinating them remains difficult. Current tools are often chat-centric, single-player, poorly visualized, weak on governance, and disconnected from long-term organizational memory.

Teams need a way to:

- Understand what many agents are doing.
- Coordinate humans and agents in multiplayer workflows.
- Require specs and approvals for high-risk work.
- Review artifacts collectively.
- Track risk, trust, and technical debt.
- Preserve lessons and project memory.
- Reuse and improve skills, tools, playbooks, and agent loadouts.
- Make agent orchestration understandable, visible, and engaging.

## 1.5 Product Vision

The long-term vision is a multiplayer operating environment for AI-native companies.

A company should be able to:

1. Import a project.
2. Turn it into a visual, navigable world.
3. Hire or generate persistent agent-employees.
4. Equip them with skills, tools, hooks, plugins, MCPs, rubrics, and workflows.
5. Assign jobs through rooms and boards.
6. Govern complex work with specs, ADRs, approvals, and milestones.
7. Execute work through sandboxed runtimes.
8. Review outputs together.
9. Learn from successes and failures.
10. Continuously improve agents and skills.

## 1.6 Differentiation

Agentic Company Sim differentiates from agent dashboards and coding assistants through:

1. **Project-as-world metaphor**  
   The repo/project becomes a visual, navigable game world.

2. **Multiplayer governance**  
   Human players approve specs, ADRs, artifacts, skill updates, and risk changes together.

3. **Persistent agent-employees**  
   Agents are not merely disposable sessions. They have memory, reputation, trust, loadouts, and growth.

4. **Disposable runtime sessions**  
   Real execution happens in temporary, auditable, sandboxed runs.

5. **Spec-first operating model**  
   Meaningful work begins with specs. Architecture-impacting work requires ADRs.

6. **Memory-driven learning**  
   Project memory, artifact memory, agent memory, company preferences, and relationship memory influence future work.

7. **Skill self-improvement**  
   Jobs produce lessons. Lessons produce skill updates. Approved updates improve future jobs.

8. **Marketplace as capability system**  
   Marketplace items include agent templates, Pi skills, Pi hooks, Pi plugins, Pi tools, MCP packs, prompt packs, review rubrics, workflows, boards, rooms, and domain packs.

---

# 2. Goals and Non-Goals

## 2.1 Product Goals

### Goal 1: Make projects legible as worlds

Users should be able to import a repo and see it transformed into a project world with regions, rooms, boards, risk hints, and suggested jobs.

### Goal 2: Make agent work governable

Users should be able to require specs, ADRs, approvals, review policies, budget caps, trust policies, and milestones before execution.

### Goal 3: Make agent orchestration multiplayer

Multiple players should be able to review specs, approve ADRs, review artifact bundles, assign agents, and handle incidents together.

### Goal 4: Make agents persistent and improvable

Agents should accumulate memory, reputation, trust, and specialization over time.

### Goal 5: Make work produce organizational learning

Every job should be able to produce artifacts, memories, risk updates, trust updates, and proposed skill improvements.

### Goal 6: Support real execution through Oh My Pi

The system should use Oh My Pi as the first implementation runtime for coding jobs, while preserving a runtime adapter architecture for Mastra, Convex agents, MCP tools, and future hosted sandboxes.

## 2.2 MVP Goals

The MVP should prove:

1. A repo can become a project world.
2. Multiple players can govern specs and reviews together.
3. A small Oh My Pi run can produce or simulate a patch/diff from an approved spec.
4. Artifact review can create memory and skill update proposals.
5. Basic marketplace/loadout concepts can be represented.

## 2.3 Non-Goals for MVP

The MVP explicitly does not include:

- Public paid marketplace publishing.
- External publisher onboarding.
- Deep fantasy/sci-fi theming.
- Complex agent stamina/morale systems.
- Supermemory integration.
- Fully autonomous public package publication.
- Full autonomous code merge/PR creation as the default behavior.
- Full non-software domain maturity.
- Polished cosmetics marketplace.
- Complex enterprise billing.

## 2.4 Not Deferred

The following are intentionally included in or near MVP scope:

- Honcho contextual memory integration.
- Basic marketplace/loadout registry.
- Basic skill/package registry.
- Sisyphus OS.
- Ultrawork policy model.
- Oh My Pi runtime path.
- Multiplayer approvals and reviews.
- Convex memory ledger.
- Project-world generation.

---

# 3. Target Users

## 3.1 Primary Initial User

**Agentic Engineering team**

Use cases:

- Dogfood on Muta.
- Dogfood on Triage.
- Coordinate internal agent workflows.
- Test Oh My Pi Sisyphus/Ultrawork-inspired setup.
- Validate project-world generation.
- Validate multiplayer governance.

## 3.2 Secondary Users

**AI-native development teams**

Characteristics:

- Already use coding agents.
- Use tools like Cursor, Claude Code, Oh My Pi-like tools, MCPs, or custom automations.
- Need more visibility, governance, memory, and coordination.

## 3.3 Tertiary Users

**Indie hackers and founders**

Characteristics:

- Small teams.
- High leverage from AI agents.
- Need help coordinating product, engineering, automation, and creative work.

## 3.4 Later Users

**Enterprises**

Need:

- Self-hosting.
- Audit logs.
- Private marketplace.
- Approval policies.
- Risk controls.
- Governance.

**Creators/operators/business teams**

Need:

- Non-software domains.
- Creative/media workflows.
- Automation workflows.
- Business ops and support workflows.

---

# 4. Core Concepts

## 4.1 Company

A company is the top-level multiplayer organization. It contains players, agents, projects, policies, memory, marketplace installs, and operating doctrine.

## 4.2 Project World

A project world is a visual/game representation of a real project.

For software, a project world is usually generated from a repo scan plus AI interview and manual edits.

## 4.3 Region

A region is a major area of the project world.

Examples:

- Frontend Region
- Backend Region
- Database Caverns
- Auth Gate
- Testing Grounds
- Docs Library
- CI/Automation Region
- Agent Runtime Region

## 4.4 Room

A room is a functional workspace inside a region.

Examples:

- Planning Room
- Engineering Room
- Testing Grounds
- Review Room
- Risk Room
- Incident Room
- Marketplace Terminal
- Training Room

## 4.5 Operation Board

A board is a structured control surface within a room.

Examples:

- Spec Board
- Approval Board
- Active Runs Board
- Artifact Bundle Board
- Diff Review Board
- Risk Board
- Memory Board
- Skill Update Board
- Agent Loadout Board

## 4.6 Agent Employee

An agent employee is a persistent company character with identity, role, loadout, memory, trust, reputation, and growth.

## 4.7 Agent Run

An agent run is a temporary execution session for a specific job. It may run through Oh My Pi, Mastra, a Convex agent, MCP tools, an external CLI, or a hosted sandbox.

## 4.8 Spec

A spec is the contract for meaningful work. It defines the problem, desired outcome, constraints, non-goals, acceptance criteria, affected regions, risks, required skills, and review policy.

## 4.9 ADR

An architecture decision record is required for architecture-impacting, long-horizon, complex, or high-risk work.

## 4.10 Artifact Bundle

An artifact bundle is the output package from a job.

It may include:

- Spec.
- Task breakdown.
- Patch/diff.
- Test output.
- Review notes.
- Risk delta.
- Memory proposals.
- Skill update proposals.

## 4.11 Sisyphus OS

Sisyphus is the visible company/project operating system. It is not a normal employee agent. It is the command layer, narrator, advisor, policy enforcer, planner, router, memory steward, and skill steward.

## 4.12 Ultrawork Mode

Ultrawork is a high-intensity mode for complex, long-horizon, or high-risk jobs. It requires approved specs, milestones, trust/risk policies, and budget caps.

---

# 5. User Experience Requirements

## 5.1 Company Onboarding

### Requirement

The user must be able to create a company through a guided onboarding wizard.

### Wizard Inputs

1. Company purpose.
2. Operating doctrine.
3. Default approval policy.
4. Default memory policy.
5. Default marketplace pack.

### Wizard Outputs

- Company profile.
- Operating doctrine.
- Approval policies.
- Memory policies.
- Default installed packages.
- Initial agent roster.
- Default trust policy.

### Acceptance Criteria

- User can create a company in under 5 minutes.
- User can select a default operating doctrine.
- User can install the default first-party package.
- System creates initial agents and policies.
- User lands in an empty or newly generated company home.

## 5.2 Project World Creation

### Requirement

The user must be able to create a project world through repo scan, AI interview, and manual edits.

### Flow

```txt
Create project world
  -> connect/import repo
  -> run repo scan
  -> answer AI interview
  -> generate map draft
  -> review/edit regions, rooms, boards, and risks
  -> approve project world
```

### Acceptance Criteria

- System can ingest repo structure or a representative file tree.
- System proposes regions.
- System proposes rooms and boards.
- System proposes risk hints.
- User can manually edit generated map.
- Multiple users can comment/approve the generated map.

## 5.3 World Map

### Requirement

The product must show a hybrid node graph + isometric project map.

### Required Map Elements

- Regions as nodes/districts.
- Rooms as buildings/cards inside regions.
- Agent avatars.
- Risk indicators.
- Trust/health indicators.
- Sisyphus annotations.
- Active jobs.
- Pending approvals.
- Incident markers.

### Acceptance Criteria

- User can click a region and inspect its details.
- User can enter a room.
- User can open a board from a room.
- User can see live updates from Convex.
- User can see at least one Sisyphus annotation.

## 5.4 Spec Governance

### Requirement

The user must be able to create a feature intent, have Sisyphus draft a spec, and approve/reject/request changes with other players.

### Acceptance Criteria

- User can create a feature intent.
- Sisyphus generates a spec draft.
- Spec includes problem, desired outcome, non-goals, constraints, acceptance criteria, affected regions, risks, and required skills.
- Users can comment on spec.
- Users can approve, reject, or request changes.
- Approval status is visible in Planning Room and Sisyphus feed.

## 5.5 ADR Governance

### Requirement

Architecture-impacting work must be detected and routed through ADR approval.

### Acceptance Criteria

- Sisyphus can flag architecture impact.
- System can create ADR draft.
- ADR includes context, options, tradeoffs, recommendation, affected regions.
- Users can approve/reject/request changes.
- Execution is blocked until required approval is complete.

## 5.6 Agent Management

### Requirement

Users must be able to generate, inspect, and customize persistent agent-employees.

### Agent Customization Modes

Simple mode:

- Name.
- Role.
- Responsibilities.
- Autonomy level.
- Risk style.
- Primary skills.

Advanced mode:

- Pi skills.
- Pi hooks.
- Pi plugins.
- Pi tools.
- MCP packs.
- Review rubrics.
- Runtime preference.
- Model routing.
- Trust policy.
- Memory policy.
- Approval policy.
- Ultrawork eligibility.

### Acceptance Criteria

- User can create a custom agent from natural language.
- System proposes role, loadout, runtime, trust, memory, and rubrics.
- User can edit basic settings.
- Advanced settings can be hidden behind expandable controls.

## 5.7 Runtime Execution Preview

### Requirement

The system should support a narrow spec-to-diff preview through Oh My Pi or a simulated local worker.

### Acceptance Criteria

- Approved spec can trigger an agent run.
- Run status appears in the world and Engineering Room.
- Run produces a patch/diff or simulated patch/diff.
- Artifact bundle appears in Review Room.
- User can review artifact bundle.

## 5.8 Artifact Review

### Requirement

Users must be able to review artifact bundles together.

### Acceptance Criteria

- Artifact bundle contains spec, diff/patch, summary, risk notes, and optional test notes.
- Users can comment.
- Users can approve/reject/request changes.
- Review decision updates job status.
- Review can generate memory and skill update proposals.

## 5.9 Marketplace and Loadouts

### Requirement

The product must support a basic capability registry and loadout system.

### V1 Package Types

- Agent Templates.
- Prompt Packs / Playbooks.
- Pi Skills.
- Pi Hooks.
- Pi Plugins.
- Pi Tools.
- MCP Packs.
- Review / Eval Rubrics.

### Acceptance Criteria

- User can view installed packages.
- User can install first-party default pack.
- User can equip agent with package references.
- System can display required permissions.
- System can distinguish package kinds.

## 5.10 Memory

### Requirement

The product must record project/artifact memory in Convex and contextual agent/company/relationship memory in Honcho.

### Acceptance Criteria

- Specs and artifact summaries are saved as memory records.
- Risk/trust changes require source references.
- Agent/company/relationship memories can be stored in Honcho.
- Convex keeps provider references.
- Agents/system can propose memory edits.
- Strict memories require human approval.

## 5.11 Skill Self-Improvement

### Requirement

Jobs should be able to generate skill update proposals.

### Acceptance Criteria

- A review or failure can generate a skill update proposal.
- Proposal includes source memories/artifacts/jobs.
- Proposal has a publishing scope.
- Proposal has approval tier.
- Low-risk proposals can be auto-approved by policy.
- Higher-risk proposals require approval.

## 5.12 Failure and Incidents

### Requirement

Job failure must produce actionable failure artifacts and, when appropriate, incidents.

### Acceptance Criteria

- Failed jobs show error and retry options.
- Medium/high failures create incident records.
- Failure includes category, severity, affected regions, root cause hypothesis, and suggested next actions.
- Failure can propose memory and skill updates.
- World map reflects failure severity.

---

# 6. MVP Scope

## 6.1 MVP Must-Haves

1. Company onboarding wizard.
2. Project world creation via repo scan + AI interview + manual edits.
3. PixiJS hybrid graph/isometric world map.
4. Convex-backed project world state.
5. Multiplayer spec approval flow.
6. Sisyphus narrator feed.
7. Sisyphus advisor panel.
8. Sisyphus world annotations.
9. Basic persistent agent model.
10. Basic marketplace/loadout registry.
11. Spec-first feature job.
12. Artifact bundle review.
13. Convex memory ledger.
14. Honcho contextual memory integration.
15. Skill update proposal model.
16. Oh My Pi or simulated spec-to-diff preview.

## 6.2 MVP Should-Haves

1. Basic ADR generation and approval.
2. Basic risk/trust indicators.
3. Basic agent reputation.
4. Basic runtime cost ledger.
5. Basic failure/incident flow.
6. Test confidence job prototype.
7. Local worker fallback.

## 6.3 MVP Could-Haves

1. Cloudflare sandbox experiment.
2. Mastra workflow prototype.
3. Basic Ultrawork plan object.
4. Basic MCP package representation.
5. Agent avatar customization.

## 6.4 MVP Won’t-Haves

1. Paid public marketplace.
2. Deep fantasy/sci-fi theming.
3. Complex stamina/morale.
4. Supermemory.
5. Fully autonomous merging.
6. Enterprise billing.
7. Full non-software domain support.

---

# 7. Success Metrics

## 7.1 Product Validation Metrics

- Time to create first company.
- Time to generate first project world.
- Percentage of generated regions accepted vs edited.
- Number of multiplayer approval actions completed.
- Number of artifact bundles reviewed.
- Number of memory records created per job.
- Number of skill update proposals created per job.
- Number of jobs that begin from approved specs.

## 7.2 Dogfooding Metrics

- Number of Agentic Engineering internal projects represented as worlds.
- Number of real specs created.
- Number of real diffs generated or assisted.
- Number of accepted/rejected agent outputs.
- Number of useful memories retrieved in later jobs.
- Number of skill improvements accepted.

## 7.3 Qualitative Success Criteria

The first demo is successful if viewers understand and believe:

1. The project became a world.
2. Multiplayer review/governance feels valuable.
3. Agents feel like persistent company members.
4. Specs improve agent execution and review quality.
5. Memory and skill improvement create compounding value.

---

# Part II — Technical Architecture Document

---

# 8. Architecture Overview

## 8.1 High-Level Architecture

```txt
React App Shell
  auth
  routing
  marketplace
  review panels
  diff views
  settings
  spec/ADR editors

PixiJS World Layer
  hybrid graph/isometric map
  project regions
  rooms
  agent avatars
  annotations
  status/risk visuals

Convex Backend
  multiplayer state
  company/project world
  agents
  jobs/specs/approvals
  marketplace registry
  memory ledger
  event log
  artifact metadata

Honcho Memory Layer
  agent memory
  player/company preferences
  relationship memory
  contextual recall

Oh My Pi Runtime
  implementation agents
  Pi skills/hooks/plugins/tools/MCPs
  Sisyphus/Ultrawork-inspired Pi OS
  disposable agent runs

Mastra
  planner/supervisor workflows where useful
  spec/job decomposition
  workflow orchestration

Cloudflare Runtime Path
  Workers / Durable Objects / Workflows
  Sandboxes / Containers for hosted execution
  R2/D1/Queues as needed
```

## 8.2 Architectural Principles

1. Convex is the authoritative app/world state for V1.
2. Honcho is a contextual memory provider, not the canonical ledger.
3. Persistent agents are separate from runtime sessions.
4. Runtime execution is adapter-based.
5. Specs are first-class objects.
6. Approvals are first-class objects.
7. Artifacts are immutable or versioned.
8. Skill updates are versioned and approval-gated.
9. Marketplace packages declare permissions.
10. Hosted runtime should be designed for but not required for first demo.

---

# 9. Frontend Architecture

## 9.1 Stack

- React.
- PixiJS.
- `@pixi/react` or equivalent React-Pixi integration.
- Convex React client.
- TypeScript.
- React overlays for boards and forms.

## 9.2 Frontend Layers

### App Shell

Responsibilities:

- Layout.
- Routing.
- Auth state.
- Company/project selection.
- Panels and modals.
- Marketplace.
- Settings.
- Spec/ADR editor.
- Artifact review.

### Pixi World Canvas

Responsibilities:

- Project world visualization.
- Map navigation.
- Region and room rendering.
- Agent avatar rendering.
- World event rendering.
- Visual annotations.

### React Board Overlays

Responsibilities:

- Complex interactive surfaces.
- Tables.
- Forms.
- Diff viewers.
- Approval panels.
- Review panels.
- Memory and skill proposals.

## 9.3 Frontend State

Use Convex queries/subscriptions for canonical state.

Use local React state for:

- UI selection.
- Camera position.
- Open panels.
- Form drafts.
- Temporary interactions.

Use Pixi internal state only for rendering/animation concerns.

---

# 10. Backend Architecture

## 10.1 Convex Responsibilities

Convex owns:

- Companies.
- Players.
- Memberships.
- Project worlds.
- Regions.
- Rooms.
- Boards.
- Jobs.
- Specs.
- ADRs.
- Approval requests.
- Agent employees.
- Runtime metadata.
- Marketplace packages.
- Package installs.
- Memory ledger.
- Artifact metadata.
- Trust policies.
- Risk profiles.
- Skill update proposals.
- Incidents.
- Sisyphus events.
- World annotations.

## 10.2 External Worker Responsibilities

Runtime workers own:

- Oh My Pi sessions.
- Repo checkout/access.
- Git operations.
- Worktrees.
- Tests.
- Diff generation.
- Sandboxed command execution.
- Artifact upload.
- Runtime event streaming.

## 10.3 Mastra Responsibilities

Mastra may own:

- Spec drafting workflows.
- Job decomposition.
- Supervisor/planner agents.
- Workflow-local memory.
- Future workflow marketplace packages.

## 10.4 Honcho Responsibilities

Honcho owns contextual memory for:

- Agent memory.
- Player/company preferences.
- Relationship memory.
- Collaboration patterns.
- Natural-language contextual recall.

Convex stores references to Honcho memory objects.

---

# 11. Data Model

## 11.1 Core Tables

- `companies`
- `players`
- `companyMemberships`
- `projectWorlds`
- `worldRegions`
- `rooms`
- `operationBoards`
- `jobs`
- `specs`
- `architectureDecisions`
- `approvalRequests`
- `agentEmployees`
- `agentRuntimePolicies`
- `agentRuns`
- `runtimeEvents`
- `artifactBundles`
- `artifacts`
- `marketplacePackages`
- `packageInstalls`
- `trustPolicies`
- `regionRiskProfiles`
- `memoryRecords`
- `skillUpdateProposals`
- `jobFailures`
- `incidents`
- `runtimeCostLedger`
- `sisyphusEvents`
- `worldAnnotations`

## 11.2 Company

```ts
type Company = {
  id: string;
  name: string;
  purpose: string;
  operatingDoctrineId: string;
  defaultApprovalPolicyId: string;
  defaultMemoryPolicyId: string;
  reputation: number;
  budget?: number;
  trustLevel: number;
  createdAt: number;
  updatedAt: number;
};
```

## 11.3 Project World

```ts
type ProjectWorld = {
  id: string;
  companyId: string;
  name: string;
  domain: "software" | "business_ops" | "creative" | "automation" | "mixed";
  creationMode: "manual" | "repo_scan" | "task_import" | "ai_interview" | "hybrid";
  repoUrl?: string;
  sourcePaths: string[];
  interviewSummary?: string;
  mapStatus: "draft" | "approved" | "active";
  mapProjection: "repo_graph" | "workflow_graph" | "customer_journey" | "manual" | "hybrid";
  createdAt: number;
  updatedAt: number;
};
```

## 11.4 Region

```ts
type WorldRegion = {
  id: string;
  companyId: string;
  projectWorldId: string;
  name: string;
  kind:
    | "frontend"
    | "backend"
    | "database"
    | "infra"
    | "docs"
    | "tests"
    | "agents"
    | "workflow"
    | "customer_segment"
    | "manual_zone"
    | "unknown";
  sourceRefs: SourceRef[];
  riskLevel: number;
  exploredLevel: number;
  health: number;
  position: { x: number; y: number };
  createdAt: number;
  updatedAt: number;
};
```

## 11.5 Room

```ts
type Room = {
  id: string;
  companyId: string;
  projectWorldId: string;
  regionId: string;
  name: string;
  kind:
    | "planning"
    | "engineering"
    | "testing"
    | "review"
    | "risk"
    | "incident"
    | "marketplace"
    | "training"
    | "research"
    | "creative"
    | "automation";
  boardIds: string[];
  position?: { x: number; y: number };
  createdAt: number;
  updatedAt: number;
};
```

## 11.6 Operation Board

```ts
type OperationBoard = {
  id: string;
  companyId: string;
  projectWorldId: string;
  roomId: string;
  kind:
    | "jobs"
    | "specs"
    | "approvals"
    | "runs"
    | "artifacts"
    | "skills"
    | "incidents"
    | "metrics"
    | "workflow"
    | "memory"
    | "risk";
  title: string;
  createdAt: number;
  updatedAt: number;
};
```

## 11.7 Job

```ts
type JobType =
  | "repo_cartography"
  | "build_feature"
  | "fix_bug"
  | "write_tests"
  | "review_pr"
  | "architecture_decision"
  | "research_market"
  | "write_campaign"
  | "build_workflow"
  | "triage_support"
  | "draft_sales_sequence";

type Job = {
  id: string;
  companyId: string;
  projectWorldId: string;
  regionIds: string[];
  roomId?: string;
  type: JobType;
  title: string;
  description: string;
  priority: number;
  assignedAgentIds: string[];
  requiredSkillIds: string[];
  status:
    | "queued"
    | "spec_drafting"
    | "needs_spec_approval"
    | "ready"
    | "active"
    | "blocked"
    | "review"
    | "done"
    | "failed"
    | "cancelled";
  specId?: string;
  artifactBundleIds: string[];
  createdAt: number;
  updatedAt: number;
};
```

## 11.8 Spec

```ts
type Spec = {
  id: string;
  companyId: string;
  projectWorldId: string;
  jobId: string;
  title: string;
  problem: string;
  desiredOutcome: string;
  nonGoals: string[];
  constraints: string[];
  acceptanceCriteria: string[];
  affectedRegionIds: string[];
  riskNotes: string[];
  requiredSkillIds: string[];
  reviewPolicyId?: string;
  status: "draft" | "needs_review" | "approved" | "rejected" | "superseded";
  createdBy: { type: "human" | "agent" | "system"; id: string };
  approvedByPlayerIds: string[];
  createdAt: number;
  updatedAt: number;
};
```

## 11.9 Architecture Decision

```ts
type ArchitectureDecision = {
  id: string;
  companyId: string;
  projectWorldId: string;
  jobId?: string;
  title: string;
  context: string;
  optionsConsidered: {
    title: string;
    description: string;
    pros: string[];
    cons: string[];
    riskNotes: string[];
  }[];
  recommendation: string;
  tradeoffs: string[];
  affectedRegionIds: string[];
  status: "draft" | "needs_review" | "approved" | "rejected" | "superseded";
  approvedByPlayerIds: string[];
  createdAt: number;
  updatedAt: number;
};
```

## 11.10 Approval Request

```ts
type ApprovalRequest = {
  id: string;
  companyId: string;
  projectWorldId: string;

  targetType:
    | "spec"
    | "architecture_decision"
    | "artifact_bundle"
    | "skill_update"
    | "trust_policy"
    | "runtime_permission"
    | "ultrawork_plan"
    | "marketplace_install";

  targetId: string;

  status:
    | "pending"
    | "approved"
    | "rejected"
    | "changes_requested"
    | "expired";

  policy: {
    requiredApprovals: number;
    requiredRoles?: CompanyRole[];
    quorum?: {
      minVotes: number;
      approvalThreshold: number;
    };
    deadlineAt?: number;
  };

  votes: {
    playerId: string;
    decision: "approve" | "reject" | "request_changes";
    comment?: string;
    createdAt: number;
  }[];

  createdAt: number;
  updatedAt: number;
};
```

## 11.11 Agent Employee

```ts
type AgentEmployee = {
  id: string;
  companyId: string;
  name: string;
  avatarId: string;
  skinId?: string;

  department:
    | "engineering"
    | "research"
    | "creative"
    | "automation"
    | "ops"
    | "review"
    | "planning";

  role: string;
  responsibilities: string[];
  nonGoals: string[];

  level: number;
  reputation: number;
  traits: string[];

  equippedPackageIds: string[];
  trustPolicyId: string;
  memoryPolicyId: string;
  runtimePolicyId: string;

  status:
    | "idle"
    | "assigned"
    | "running"
    | "blocked"
    | "reviewing"
    | "learning"
    | "recovering";

  createdAt: number;
  updatedAt: number;
};
```

## 11.12 Agent Run

```ts
type RuntimeAdapter =
  | "oh_my_pi"
  | "mastra"
  | "convex_agent"
  | "external_cli"
  | "mcp";

type AgentRun = {
  id: string;
  companyId: string;
  projectWorldId: string;
  jobId: string;
  agentEmployeeId: string;
  runtime: RuntimeAdapter;

  status:
    | "queued"
    | "starting"
    | "working"
    | "needs_approval"
    | "blocked"
    | "review"
    | "done"
    | "failed";

  ephemeral: true;
  worktreeId?: string;
  containerId?: string;
  sandboxId?: string;
  threadId?: string;
  artifactIds: string[];

  startedAt?: number;
  endedAt?: number;
  createdAt: number;
  updatedAt: number;
};
```

---

# 12. Runtime Worker Protocol

## 12.1 Commands

```ts
type RuntimeCommand =
  | {
      type: "start_run";
      runId: string;
      jobId: string;
      agentId: string;
      runtime: RuntimeAdapter;
      contextPacket: JobContextPacket;
    }
  | { type: "pause_run"; runId: string }
  | { type: "resume_run"; runId: string }
  | { type: "cancel_run"; runId: string }
  | {
      type: "resolve_approval";
      approvalId: string;
      approved: boolean;
      comment?: string;
    };
```

## 12.2 Events

```ts
type RuntimeEvent =
  | { type: "run.started"; runId: string }
  | { type: "run.status"; runId: string; status: AgentRun["status"] }
  | { type: "run.message"; runId: string; role: "agent" | "tool" | "system"; content: string }
  | { type: "run.tool_call"; runId: string; tool: string; input: unknown; approvalRequired: boolean }
  | { type: "run.tool_result"; runId: string; tool: string; result: unknown }
  | { type: "run.artifact_created"; runId: string; artifactId: string }
  | { type: "run.failed"; runId: string; failureId: string }
  | { type: "run.completed"; runId: string; artifactBundleId: string };
```

## 12.3 Context Packet

```ts
type JobContextPacket = {
  jobId: string;
  specId?: string;
  affectedRegionIds: string[];
  acceptanceCriteria: string[];
  relevantArchitectureDecisions: string[];
  relevantRiskMemories: string[];
  relevantArtifactSummaries: string[];
  agentOperatingNotes: string[];
  playerPreferences: string[];
  collaborationNotes: string[];
  approvalPolicy: string;
  budgetPolicy: string;
  milestonePolicy?: string;
};
```

---

# 13. Memory Architecture

## 13.1 Provider Split

Convex:

- Canonical memory ledger.
- Project memory.
- Artifact memory.
- Specs.
- ADRs.
- Risk records.
- Trust changes.
- Review records.
- Provider references.

Honcho:

- Agent memory.
- Player/company preferences.
- Relationship memory.
- Collaboration patterns.
- Contextual recall.

Mastra:

- Workflow-local observational memory.

Oh My Pi:

- Runtime/session memory.

## 13.2 Memory Record

```ts
type MemoryScope =
  | "company"
  | "project"
  | "region"
  | "room"
  | "agent"
  | "player"
  | "relationship"
  | "job"
  | "artifact"
  | "architecture";

type MemoryKind =
  | "fact"
  | "decision"
  | "lesson"
  | "risk"
  | "trust"
  | "preference"
  | "relationship"
  | "artifact_summary"
  | "performance_note"
  | "architecture_rationale";

type ProvenanceMode = "strict" | "moderate" | "soft" | "ephemeral";

type MemoryRecord = {
  id: string;
  companyId: string;
  projectWorldId?: string;
  regionId?: string;
  roomId?: string;
  agentId?: string;
  playerId?: string;

  scope: MemoryScope;
  kind: MemoryKind;
  content: string;
  provenanceMode: ProvenanceMode;
  sourceRefs: SourceRef[];
  confidence: number;
  sensitivity: "low" | "medium" | "high";
  visibility: "private" | "team" | "company" | "system";

  providerRefs: {
    provider: "convex" | "honcho" | "mastra" | "pi_runtime" | "supermemory";
    externalId: string;
  }[];

  createdAt: number;
  updatedAt: number;
};
```

## 13.3 Memory Edit Policy

Default behavior:

- Agents can propose memory edits.
- System can auto-update soft memories.
- Strict memories need human approval.
- Founders/leads can override based on policy.

---

# 14. Marketplace Architecture

## 14.1 Package Kinds

```ts
type MarketplacePackageKind =
  | "agent_template"
  | "prompt_pack"
  | "pi_skill"
  | "pi_plugin"
  | "pi_hook"
  | "pi_tool"
  | "mcp_server"
  | "mcp_tool_pack"
  | "review_rubric"
  | "mastra_workflow"
  | "ui_board"
  | "room"
  | "domain_pack"
  | "skin";
```

## 14.2 Package Schema

```ts
type MarketplacePackage = {
  id: string;
  slug: string;
  name: string;
  kind: MarketplacePackageKind;

  publisherId: string;
  version: string;
  description: string;

  compatibleDomains: WorkDomain[];
  compatibleRuntimes: RuntimeAdapter[];
  requiredPermissions: Permission[];

  installScope:
    | "company"
    | "project_world"
    | "region"
    | "room"
    | "agent"
    | "runtime";

  exposedCapabilities: Capability[];
  dependencies: string[];

  trustTier: "first_party" | "verified" | "community" | "untrusted";
  reviewStatus: "draft" | "approved" | "deprecated" | "blocked";

  createdAt: number;
  updatedAt: number;
};
```

## 14.3 Package Installation

```ts
type PackageInstall = {
  id: string;
  companyId: string;
  projectWorldId?: string;
  packageId: string;
  version: string;
  installScope: MarketplacePackage["installScope"];
  targetId: string;
  status: "installed" | "disabled" | "pending_approval" | "failed";
  installedByPlayerId: string;
  createdAt: number;
  updatedAt: number;
};
```

---

# 15. Skill Self-Improvement Architecture

## 15.1 Skill Update Proposal

```ts
type SkillPublishingScope =
  | "agent_private"
  | "project_private"
  | "company_private"
  | "marketplace_draft"
  | "public_marketplace";

type SkillUpdateProposal = {
  id: string;
  skillId: string;
  proposedBy:
    | { type: "agent"; id: string }
    | { type: "player"; id: string }
    | { type: "system"; id: "skill_steward" };

  kind:
    | "new_skill"
    | "prompt_update"
    | "checklist_update"
    | "example_added"
    | "anti_pattern_added"
    | "rubric_update"
    | "tool_usage_rule"
    | "hook_update"
    | "plugin_update"
    | "mcp_update";

  proposedScope: SkillPublishingScope;
  approvalTier: 0 | 1 | 2 | 3 | 4;

  sourceMemoryIds: string[];
  sourceArtifactIds: string[];
  sourceJobIds: string[];

  diffSummary: string;
  beforeVersion: string;
  proposedVersion: string;

  evalStatus: "not_required" | "pending" | "passed" | "failed";
  approvalStatus:
    | "draft"
    | "auto_approved"
    | "needs_approval"
    | "approved"
    | "rejected"
    | "reverted";

  createdAt: number;
  updatedAt: number;
};
```

## 15.2 Approval Tiers

Tier 0: Auto-merge low-risk prompt/checklist/example updates.  
Tier 1: Lead approval for behavior-changing skills.  
Tier 2: Eval-gated approval for rubrics and quality-critical behavior.  
Tier 3: Maintainer approval for Pi hooks/plugins/tools/MCP changes.  
Tier 4: Marketplace publication review for external distribution.

---

# 16. Trust, Risk, and Cost Architecture

## 16.1 Trust Policy

```ts
type TrustPolicy = {
  id: string;
  companyId: string;
  subjectType: "agent" | "skill" | "room" | "region" | "runtime";
  subjectId: string;
  trustLevel: 0 | 1 | 2 | 3 | 4 | 5;
  allowedActions: string[];
  approvalRequiredActions: string[];
  forbiddenActions: string[];
  createdAt: number;
  updatedAt: number;
};
```

## 16.2 Region Risk Profile

```ts
type RegionRiskProfile = {
  regionId: string;
  technicalDebt: number;
  operationalRisk: number;
  securitySensitivity: number;
  testCoverageConfidence: number;
  documentationQuality: number;
  lastIncidentAt?: number;
  updatedAt: number;
};
```

## 16.3 Runtime Cost Ledger

```ts
type RuntimeCostLedgerEntry = {
  id: string;
  companyId: string;
  jobId?: string;
  agentRunId?: string;
  modelProvider?: string;
  model?: string;
  tokensIn?: number;
  tokensOut?: number;
  runtimeSeconds?: number;
  estimatedCostUsd: number;
  createdAt: number;
};
```

---

# 17. Deployment Architecture

## 17.1 Desired Production Target

Ideal production target:

- Fully hosted cloud app.
- Prefer Cloudflare products.
- Hosted sandboxes for runtime execution.

Fallback MVP target:

- Hosted web app + local worker.

Development target:

- Self-hosted/local stack for testing.

## 17.2 Cloudflare-Oriented Path

Potential components:

- Cloudflare Pages/Workers for web/API.
- Durable Objects for multiplayer coordination.
- Cloudflare Workflows for durable orchestration.
- Cloudflare Sandboxes/Containers for isolated runtime execution.
- R2 for artifacts/logs.
- Queues for job dispatch.

## 17.3 Local Worker Fallback

Local worker responsibilities:

- Access local repo.
- Run Oh My Pi.
- Create worktrees.
- Run tests.
- Produce diffs.
- Stream runtime events.
- Upload artifacts.

## 17.4 Migration Strategy

Design runtime worker protocol so local worker and hosted sandbox workers implement the same interface.

This allows:

```txt
local worker first
  -> Cloudflare sandbox worker later
  -> fully hosted execution eventually
```

---

# 18. MVP Implementation Plan

## Milestone 1: Project World Genesis

Goal:

Turn a repo into a multiplayer project world.

Build:

- Company onboarding.
- Project creation.
- Repo structure ingestion.
- AI interview flow.
- Region/room/board generation.
- PixiJS map rendering.
- Manual edits.
- Multiplayer approval of map draft.
- Sisyphus narrator feed.

## Milestone 2: Spec Governance

Goal:

Turn founder intent into a spec and approve it together.

Build:

- Feature intent creation.
- Spec draft generation.
- Spec editor.
- Approval request model.
- Approve/reject/request changes UI.
- Sisyphus advisor panel.
- Spec memory records.

## Milestone 3: Spec-to-Diff Preview

Goal:

Approved spec produces a patch/diff through Oh My Pi or simulated runtime.

Build:

- Agent assignment.
- Agent run model.
- Runtime worker protocol.
- Local/simulated worker.
- Artifact bundle model.
- Review Room UI.
- Diff/test/risk summary.

## Milestone 4: Memory + Skill Learning

Goal:

Reviews and failures create memory and skill update proposals.

Build:

- Convex memory ledger.
- Honcho provider integration.
- Memory proposal UI.
- Skill update proposal UI.
- Approval tiers.
- Skill proposal from review/failure.

## Milestone 5: Hosted Runtime Path

Goal:

Move from local worker to hosted sandbox execution.

Build:

- Cloudflare Sandbox/Container experiment.
- Artifact storage.
- Runtime event streaming.
- Budget/compute tracking.
- Runtime worker compatibility.

---

# 19. Open Technical Questions

1. Can Cloudflare Sandboxes/Containers reliably host Oh My Pi runtime sessions?
2. Should Convex remain primary if Cloudflare Durable Objects handle multiplayer coordination?
3. What is the minimum viable Honcho integration for V1?
4. Should repo scanning happen locally, in Convex action, in Cloudflare sandbox, or in external worker?
5. How should runtime workers authenticate back to Convex?
6. How should artifacts be stored across Convex, R2, and local development?
7. What are the minimum Pi hooks/tools required for spec-to-diff preview?
8. How do we safely run user repos in hosted sandboxes?
9. What is the MVP package manifest format?
10. How strict should executable marketplace package review be in private/team contexts?

---

# 20. Recommended Immediate Next Steps

1. Create Convex schema draft for core tables.
2. Build static PixiJS project map prototype with mock regions/rooms/agents.
3. Implement company onboarding wizard.
4. Implement repo structure ingestion using a mocked/sample repo tree.
5. Implement generated project world draft.
6. Implement multiplayer approval request model.
7. Implement spec editor and spec approval flow.
8. Implement artifact bundle schema and review panel.
9. Implement local/simulated runtime worker protocol.
10. Integrate Honcho behind memory provider interface.

The highest-leverage first build target is:

```txt
Milestone 1 + Milestone 2:
  repo-to-project-world
  + multiplayer spec approval
```

This proves the unique product before depending on hosted runtime complexity.

