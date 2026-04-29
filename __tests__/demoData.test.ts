import { describe, expect, it } from "vitest";
import { approveArtifactLearning, demoData, moveJob, voteOnApproval } from "../src/domain/demoData";

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
});
