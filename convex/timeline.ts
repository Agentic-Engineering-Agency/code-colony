import { Timeline } from "convex-timeline";
import { components } from "./_generated/api";

/**
 * Undo/redo state management with named checkpoints. Useful for agent
 * draft revisions, sandbox session snapshots, etc.
 */
export const timeline = new Timeline(components.timeline);
