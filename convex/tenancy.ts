/**
 * Pure tenant-membership checks. Kept free of `./_generated` imports so the
 * root typecheck and Vitest suite can exercise them without Convex codegen.
 */
export type BetterAuthOrganization = {
  id?: unknown;
  role?: unknown;
  members?: Array<{ userId?: unknown; role?: unknown }>;
};

export function verifyOrganizationMembership(
  organizations: BetterAuthOrganization[],
  organizationId: string,
  userId: string,
): { organizationId: string; role?: string } {
  const organization = organizations.find((candidate) => candidate.id === organizationId);
  if (!organization) {
    throw new Error("Authenticated user is not a member of the requested organization");
  }

  const directRole = typeof organization.role === "string" ? organization.role : undefined;
  const memberRole = organization.members?.find((member) => member.userId === userId)?.role;
  return {
    organizationId,
    role: directRole ?? (typeof memberRole === "string" ? memberRole : undefined),
  };
}
