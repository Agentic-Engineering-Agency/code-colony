/**
 * TanStack Start server function for `/api/mastra/triage`.
 *
 * AGE-47 ships the actual triage core (`src/server/mastraTriageRouteCore.ts`)
 * via PR #62. That branch has not merged yet, so this file is a *stub* that
 * preserves the intended call shape without pulling AGE-47 code into AGE-44.
 *
 * When PR #62 lands, replace `runMastraTriageServerHandler` with:
 *
 * ```ts
 * import { runMastraTriageRequest } from "../../src/server/mastraTriageRouteCore";
 * export async function runMastraTriageServerHandler(input: MastraTriageInput) {
 *   return runMastraTriageRequest({ ...input, data: demoData });
 * }
 * ```
 *
 * Until then the function returns a typed-but-unimplemented response so the
 * UI can wire against the real signature now.
 */
import { createServerFn } from "@tanstack/react-start";

export type MastraTriageInput = {
  issueId?: string;
  prompt?: string;
};

export type MastraTriageResponse = {
  status: 503;
  body: {
    error: "mastra-triage-stub";
    message: string;
    pendingPullRequest: number;
    expectedModulePath: string;
  };
};

const PENDING_PR = 62;
const EXPECTED_MODULE = "../../src/server/mastraTriageRouteCore";

export async function runMastraTriageServerHandler(
  input: MastraTriageInput = {},
): Promise<MastraTriageResponse> {
  return {
    status: 503,
    body: {
      error: "mastra-triage-stub",
      message:
        `mastraTriageServerFn is a stub until AGE-47 (PR #${PENDING_PR}) lands; ` +
        `received input keys: ${Object.keys(input).join(", ") || "(none)"}`,
      pendingPullRequest: PENDING_PR,
      expectedModulePath: EXPECTED_MODULE,
    },
  };
}

export const mastraTriageServerFn = createServerFn({ method: "POST" })
  .inputValidator(
    (input: MastraTriageInput | undefined): MastraTriageInput => input ?? {},
  )
  .handler(async ({ data }) => runMastraTriageServerHandler(data));
