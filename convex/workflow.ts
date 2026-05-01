import { WorkflowManager } from "@convex-dev/workflow";
import { components } from "./_generated/api";

/**
 * Durable workflow manager backed by `@convex-dev/workflow`. Used for the
 * triage pipeline (`convex/triage.ts`) and any other multi-step process that
 * needs replay safety, retries, and crash recovery.
 */
export const workflow = new WorkflowManager(components.workflow);
