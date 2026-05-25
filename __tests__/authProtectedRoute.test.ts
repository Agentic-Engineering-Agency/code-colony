import { describe, expect, it } from "vitest";
import { requireProtectedRouteSession } from "../src/auth/protectedRoute";

describe("auth-protected route contract", () => {
  it("rejects anonymous requests", () => {
    expect(requireProtectedRouteSession(null)).toEqual({
      ok: false,
      status: 401,
      error: "Authentication required",
    });
  });

  it("requires an active organization for tenant-owned data", () => {
    expect(requireProtectedRouteSession({ user: { id: "user_1" }, session: {} })).toEqual({
      ok: false,
      status: 403,
      error: "Active organization required",
    });
  });

  it("returns the tenant context for authenticated workspace requests", () => {
    expect(
      requireProtectedRouteSession({
        user: { id: "user_1", email: "founder@example.com" },
        session: { activeOrganizationId: "org_1" },
      }),
    ).toEqual({ ok: true, userId: "user_1", organizationId: "org_1" });
  });
});
