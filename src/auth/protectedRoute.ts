export type SessionLike = {
  user?: { id?: string; email?: string | null } | null;
  session?: { activeOrganizationId?: string | null } | null;
} | null;

export type ProtectedRouteResult =
  | { ok: true; userId: string; organizationId: string }
  | { ok: false; status: 401 | 403; error: string };

export function requireProtectedRouteSession(session: SessionLike): ProtectedRouteResult {
  const userId = session?.user?.id;
  if (!userId) {
    return { ok: false, status: 401, error: "Authentication required" };
  }

  const organizationId = session?.session?.activeOrganizationId;
  if (!organizationId) {
    return { ok: false, status: 403, error: "Active organization required" };
  }

  return { ok: true, userId, organizationId };
}
