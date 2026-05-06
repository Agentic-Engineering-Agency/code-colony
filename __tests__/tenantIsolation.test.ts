import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { verifyOrganizationMembership } from "../convex/auth";


const REPO = path.resolve(__dirname, "..");

async function readRepo(rel: string): Promise<string> {
  return readFile(path.join(REPO, rel), "utf8");
}
describe("tenant organization membership", () => {
  it("accepts a requested organization from the user's Better Auth organization list", () => {
    expect(
      verifyOrganizationMembership(
        [
          { id: "org_a", role: "owner" },
          { id: "org_b", members: [{ userId: "user_1", role: "member" }] },
        ],
        "org_b",
        "user_1",
      ),
    ).toEqual({ organizationId: "org_b", role: "member" });
  });

  it("rejects cross-tenant access when the requested organization is absent", () => {
    expect(() =>
      verifyOrganizationMembership([{ id: "org_a", role: "owner" }], "org_b", "user_1"),
    ).toThrow(/not a member/);
  });

  it("records R2 asset ownership and checks it before signed URL access", async () => {
    const r2 = await readRepo("convex/r2.ts");
    const schema = await readRepo("convex/schema.ts");

    expect(schema).toContain("organizationId: v.optional(v.string())");
    expect(schema).toContain('.index("by_org", ["organizationId"])');
    expect(r2).toContain("const { organizationId } = await requireActiveOrganization(ctx)");
    expect(r2).toContain("asset.organizationId !== organizationId");
  });
});
