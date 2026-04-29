import { mutation, type MutationCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { demoData } from "../src/domain/demoData";

/**
 * Idempotently upserts the seeded `demoData` into Convex tables, keyed by
 * each row's domain `seedId` (e.g. `"hq"`, `"job-spec-preview"`, `"AE-101"`).
 *
 * Run from the CLI once the dev deployment is up:
 *   npx convex run seed:seedFromDemoData
 *
 * Re-runs are safe: existing rows are matched on the `by_seed_id` index and
 * fully replaced.
 */

type WithSeedId = { seedId: string };

type SeededTable = "companies" | "projectWorlds" | "regions" | "rooms" | "operationBoards" | "jobs" | "specs" | "agentEmployees" | "agentRuns" | "runtimeEvents" | "artifactBundles" | "memories" | "backlogIssues";

async function upsert<TableName extends SeededTable>(
  ctx: MutationCtx,
  tableName: TableName,
  doc: Omit<Doc<TableName>, "_id" | "_creationTime"> & WithSeedId,
) {
  // Cast through `any` is bounded: every table in the registry below has a
  // `by_seed_id` index on a `seedId` field, validated by the schema.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const q = ctx.db.query(tableName as any) as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existing = (await q.withIndex("by_seed_id", (b: any) => b.eq("seedId", doc.seedId)).first()) as { _id: Doc<TableName>["_id"] } | null;
  if (existing) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await ctx.db.replace(existing._id, doc as any);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await ctx.db.insert(tableName as any, doc as any);
  }
}


export const seedFromDemoData = mutation({
  args: {},
  handler: async (ctx) => {
    await upsert(ctx, "companies", {
      seedId: demoData.company.id,
      name: demoData.company.name,
      purpose: demoData.company.purpose,
      reputation: demoData.company.reputation,
      budget: demoData.company.budget,
      trustLevel: demoData.company.trustLevel,
    });

    await upsert(ctx, "projectWorlds", {
      seedId: demoData.projectWorld.id,
      companySeedId: demoData.projectWorld.companyId,
      name: demoData.projectWorld.name,
      domain: demoData.projectWorld.domain,
      repoUrl: demoData.projectWorld.repoUrl,
      mapStatus: demoData.projectWorld.mapStatus,
      slogan: demoData.projectWorld.slogan,
    });

    for (const region of demoData.regions) {
      await upsert(ctx, "regions", {
        seedId: region.id,
        projectWorldSeedId: region.projectWorldId,
        name: region.name,
        kind: region.kind,
        colorVar: region.colorVar,
        riskLevel: region.riskLevel,
        health: region.health,
        trust: region.trust,
        position: region.position,
        rooms: region.rooms,
        activeJobIds: region.activeJobIds,
      });
    }

    for (const room of demoData.rooms) {
      await upsert(ctx, "rooms", {
        seedId: room.id,
        regionSeedId: room.regionId,
        name: room.name,
        kind: room.kind,
        purpose: room.purpose,
        boardIds: room.boardIds,
        occupantAgentIds: room.occupantAgentIds,
        efficiency: room.efficiency,
      });
    }

    for (const board of demoData.boards) {
      await upsert(ctx, "operationBoards", {
        seedId: board.id,
        roomSeedId: board.roomId,
        name: board.name,
        lanes: board.lanes,
      });
    }

    for (const spec of demoData.specs) {
      await upsert(ctx, "specs", {
        seedId: spec.id,
        title: spec.title,
        problem: spec.problem,
        desiredOutcome: spec.desiredOutcome,
        nonGoals: spec.nonGoals,
        constraints: spec.constraints,
        acceptanceCriteria: spec.acceptanceCriteria,
        affectedRegionIds: spec.affectedRegionIds,
        riskLevel: spec.riskLevel,
        requiredSkills: spec.requiredSkills,
        status: spec.status,
      });
    }

    for (const job of demoData.jobs) {
      await upsert(ctx, "jobs", {
        seedId: job.id,
        title: job.title,
        specSeedId: job.specId,
        agentEmployeeSeedId: job.agentEmployeeId,
        state: job.state,
        affectedRegionIds: job.affectedRegionIds,
        risk: job.risk,
        estimate: job.estimate,
      });
    }

    for (const agent of demoData.agents) {
      await upsert(ctx, "agentEmployees", {
        seedId: agent.id,
        name: agent.name,
        role: agent.role,
        department: agent.department,
        specialty: agent.specialty,
        trust: agent.trust,
        reputation: agent.reputation,
        traits: agent.traits,
        skills: agent.skills,
        loadout: agent.loadout,
        status: agent.status,
        currentJobSeedId: agent.currentJobId,
      });
    }

    for (const run of demoData.runs) {
      await upsert(ctx, "agentRuns", {
        seedId: run.id,
        jobSeedId: run.jobId,
        agentEmployeeSeedId: run.agentEmployeeId,
        runtime: run.runtime,
        status: run.status,
        artifactSeedIds: run.artifactIds,
      });
    }

    for (const event of demoData.events) {
      await upsert(ctx, "runtimeEvents", {
        seedId: event.id,
        runSeedId: event.runId,
        type: event.type,
        role: event.role,
        content: event.content,
        timestamp: event.timestamp,
      });
    }

    for (const artifact of demoData.artifacts) {
      await upsert(ctx, "artifactBundles", {
        seedId: artifact.id,
        runSeedId: artifact.runId,
        title: artifact.title,
        changedFiles: artifact.changedFiles,
        diff: artifact.diff,
        testResult: artifact.testResult,
        reviewerVerdicts: artifact.reviewerVerdicts,
        status: artifact.status,
      });
    }

    for (const memory of demoData.memories) {
      await upsert(ctx, "memories", {
        seedId: memory.id,
        scope: memory.scope,
        kind: memory.kind,
        content: memory.content,
        provenanceMode: memory.provenanceMode,
        confidence: memory.confidence,
        status: memory.status,
      });
    }

    for (const issue of demoData.backlog) {
      await upsert(ctx, "backlogIssues", {
        seedId: issue.id,
        source: issue.source,
        externalRef: issue.externalRef,
        title: issue.title,
        summary: issue.summary,
        suggestedRegionSeedId: issue.suggestedRegionId,
        status: issue.status,
        ingestedJobSeedId: issue.ingestedJobId,
      });
    }

    return { ok: true };
  },
});
