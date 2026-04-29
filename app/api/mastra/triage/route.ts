import { backlogTriageAgent } from "../../../../mastra";
import { runTriageRequest } from "@/server/triageRouteCore";
import { jsonRouteResponse } from "@/server/routeResponse";
import type { BacklogIssue } from "@/domain/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonRouteResponse({ error: "invalid JSON body" }, { status: 400, cacheSeconds: -1 });
  }

  const result = await runTriageRequest({
    payload,
    runAgent: async (issue: BacklogIssue) => {
      const generated = await backlogTriageAgent.generate(
        `Issue: ${issue.title}\nSummary: ${issue.summary}\nSource: ${issue.source} ${issue.externalRef}`,
      );
      return { text: (generated as { text?: string }).text };
    },
  });

  return jsonRouteResponse(result.body, { status: result.status, cacheSeconds: -1 });
}
