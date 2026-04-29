export type HealthProbeResult = { available: boolean; detail?: string };
export type HealthSummary = {
  generatedAt: string;
  probes: { gh: HealthProbeResult; git: HealthProbeResult; runtime: HealthProbeResult };
  ok: boolean;
};

export type HealthProbe = () => Promise<HealthProbeResult>;
export type HealthRouteOptions = {
  now?: () => string;
  probeGh?: HealthProbe;
  probeGit?: HealthProbe;
  probeRuntime?: HealthProbe;
};

export type CommandRunner = (file: string, args: readonly string[]) => Promise<{ stdout: string }>;

export function buildVersionProbe(file: string, args: readonly string[], run: CommandRunner): HealthProbe {
  return async () => {
    try {
      const { stdout } = await run(file, args);
      return { available: true, detail: stdout.split("\n", 1)[0]?.trim() || undefined };
    } catch (error) {
      return { available: false, detail: error instanceof Error ? error.message : String(error) };
    }
  };
}

export async function runHealthCheckRequest(options: HealthRouteOptions = {}): Promise<{ status: 200; body: HealthSummary }> {
  const generatedAt = (options.now ?? (() => new Date().toISOString()))();
  const ghProbe = options.probeGh ?? (async () => ({ available: false, detail: "no probe configured" }));
  const gitProbe = options.probeGit ?? (async () => ({ available: false, detail: "no probe configured" }));
  const runtimeProbe = options.probeRuntime ?? (async () => ({ available: true, detail: "simulated worker" }));

  const [gh, git, runtime] = await Promise.all([ghProbe(), gitProbe(), runtimeProbe()]);
  const ok = gh.available && git.available && runtime.available;
  return { status: 200, body: { generatedAt, probes: { gh, git, runtime }, ok } };
}
