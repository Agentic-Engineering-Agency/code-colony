import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { DemoData } from "../domain/types";
import { runSimulatedRuntimePreview, type RuntimeWorkerRequest, type RuntimeWorkerResult } from "../domain/runtime";

const execFileAsync = promisify(execFile);

export type CommandRunner = (file: string, args: readonly string[]) => Promise<{ stdout: string }>;
export type RuntimePreviewFetcher = (request: RuntimeWorkerRequest) => Promise<RuntimeWorkerResult | null>;

const defaultRunner: CommandRunner = async (file, args) => execFileAsync(file, [...args]);

export function createSimulatedRuntimePreviewFetcher(data: DemoData): RuntimePreviewFetcher {
  return async (request) => runSimulatedRuntimePreview(data, request);
}

export function createSubprocessRuntimePreviewFetcher(commandFile: string, baseArgs: readonly string[] = [], run: CommandRunner = defaultRunner): RuntimePreviewFetcher {
  return async (request) => {
    try {
      const { stdout } = await run(commandFile, [...baseArgs, request.jobId, request.agentEmployeeId, request.specId]);
      const parsed = JSON.parse(stdout) as RuntimeWorkerResult;
      if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.events)) return null;
      return parsed;
    } catch {
      return null;
    }
  };
}
