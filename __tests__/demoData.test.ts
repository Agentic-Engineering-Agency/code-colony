import { describe, expect, it } from "vitest";
import { approveArtifactLearning, createRepositoryWorldScan, demoData, moveJob, voteOnApproval } from "../src/domain/demoData";

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
});
