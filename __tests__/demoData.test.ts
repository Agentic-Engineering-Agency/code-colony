import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { approveArtifactLearning, createRepositoryWorldScan, demoData, ingestBacklogIssue, moveJob, parseGitListingOutput, rejectBacklogIssue, voteOnApproval } from "../src/domain/demoData";

describe("Code Colony demo state", () => {
  it("moves jobs across operation-board lanes", () => {
    const updated = moveJob(demoData, "job-qa", "running");
    expect(updated.jobs.find((job) => job.id === "job-qa")?.state).toBe("running");
    expect(demoData.jobs.find((job) => job.id === "job-qa")?.state).toBe("approved");
  });

  it("records governance votes and status", () => {
    const updated = voteOnApproval(demoData, "approval-spec-preview", "request_changes");
    const approval = updated.approvals[0];
    expect(approval.status).toBe("changes_requested");
    expect(approval.votes.at(-1)?.player).toBe("You");
  });

  it("approves artifact learning objects", () => {
    const updated = approveArtifactLearning(demoData);
    expect(updated.memories.find((memory) => memory.id === "mem-2")?.status).toBe("accepted");
    expect(updated.skillProposals[0].approvalStatus).toBe("approved");
  });

  it("maps repository paths into world districts", () => {
    const scan = createRepositoryWorldScan(demoData, [
      "app/page.tsx",
      "src/components/CodeColonyApp.tsx",
      "src/domain/demoData.ts",
      "__tests__/demoData.test.ts",
      ".github/workflows/ci.yml",
      "docs/product/agent_company_sim_detailed_spec.md",
      "package.json",
    ]);

    expect(scan.totalFiles).toBe(7);
    expect(scan.districts.find((district) => district.regionId === "frontend")?.fileCount).toBe(2);
    expect(scan.districts.find((district) => district.regionId === "testing")?.fileCount).toBe(2);
    expect(scan.districts.find((district) => district.regionId === "hq")?.samplePaths).toContain("src/domain/demoData.ts");
    expect(scan.unmappedPaths).toEqual([]);
  });

  it("surfaces missing governance, test, and runtime signals", () => {
    const scan = createRepositoryWorldScan(demoData, ["src/components/OnlyUi.tsx"]);

    expect(scan.notes).toContain("No tests or CI workflow paths were found in the imported inventory.");
    expect(scan.notes).toContain("No product, implementation, or domain contract paths were found in the imported inventory.");
    expect(scan.notes).toContain("No runtime or configuration paths were found in the imported inventory.");
  });

  it("deduplicates paths and reports unmapped imports", () => {
    const scan = createRepositoryWorldScan(demoData, ["  scripts/audit.ts ", "scripts/audit.ts", "vitest.config.mjs"]);

    expect(scan.totalFiles).toBe(2);
    expect(scan.districts.find((district) => district.regionId === "runtime")?.samplePaths).toEqual(["vitest.config.mjs"]);
    expect(scan.unmappedPaths).toEqual(["scripts/audit.ts"]);
    expect(scan.notes).toContain("1 imported path need manual district mapping.");
  });

  it("parses null-delimited and newline-delimited git listings", () => {
    expect(parseGitListingOutput("")).toEqual([]);
    expect(parseGitListingOutput("app/page.tsx\nsrc/domain/types.ts\n")).toEqual(["app/page.tsx", "src/domain/types.ts"]);
    expect(parseGitListingOutput("app/page.tsx\0src/domain/types.ts\0")).toEqual(["app/page.tsx", "src/domain/types.ts"]);
  });

  it("records live_scan provenance with caller-supplied generatedAt", () => {
    const generatedAt = "2026-04-29T12:00:00.000Z";
    const scan = createRepositoryWorldScan(demoData, ["app/page.tsx"], { source: "live_scan", generatedAt });

    expect(scan.source).toBe("live_scan");
    expect(scan.generatedAt).toBe(generatedAt);
    expect(scan.id).toBe("repo-scan-live_scan");
  });

  it("runs createRepositoryWorldScan over real git ls-files output", () => {
    const repoRoot = resolve(__dirname, "..");
    if (!existsSync(resolve(repoRoot, ".git"))) return;
    const stdout = execFileSync("git", ["-C", repoRoot, "ls-files", "-z"], { encoding: "utf8" });
    const paths = parseGitListingOutput(stdout);
    const scan = createRepositoryWorldScan(demoData, paths, { source: "live_scan", generatedAt: "2026-04-29T12:00:00.000Z" });

    expect(paths.length).toBeGreaterThan(0);
    expect(scan.totalFiles).toBe(paths.length);
    expect(scan.districts.find((district) => district.regionId === "frontend")?.fileCount).toBeGreaterThan(0);
    expect(scan.districts.find((district) => district.regionId === "hq")?.fileCount).toBeGreaterThan(0);
    expect(scan.districts.find((district) => district.regionId === "runtime")?.fileCount).toBeGreaterThan(0);
    expect(scan.districts.find((district) => district.regionId === "testing")?.fileCount).toBeGreaterThan(0);
  });

  it("ingests a backlog issue into a proposed job and marks it ingested", () => {
    const target = demoData.backlog[0];
    const next = ingestBacklogIssue(demoData, target.id);

    expect(next).not.toBe(demoData);
    expect(next.backlog.find((entry) => entry.id === target.id)?.status).toBe("ingested");
    expect(next.backlog.find((entry) => entry.id === target.id)?.ingestedJobId).toBe(`job-from-${target.id}`);
    const newJob = next.jobs.find((job) => job.id === `job-from-${target.id}`);
    expect(newJob?.state).toBe("proposed");
    expect(newJob?.affectedRegionIds).toEqual([target.suggestedRegionId]);
    expect(demoData.backlog[0].status).toBe("new");
  });

  it("is idempotent when ingesting the same issue twice", () => {
    const target = demoData.backlog[0];
    const once = ingestBacklogIssue(demoData, target.id);
    const twice = ingestBacklogIssue(once, target.id);
    expect(twice).toBe(once);
    expect(twice.jobs.filter((job) => job.id === `job-from-${target.id}`)).toHaveLength(1);
  });

  it("rejecting a backlog issue does not create a job", () => {
    const target = demoData.backlog[1];
    const next = rejectBacklogIssue(demoData, target.id);

    expect(next.backlog.find((entry) => entry.id === target.id)?.status).toBe("rejected");
    expect(next.jobs.some((job) => job.id === `job-from-${target.id}`)).toBe(false);
    expect(ingestBacklogIssue(next, target.id)).toBe(next);
  });
});
