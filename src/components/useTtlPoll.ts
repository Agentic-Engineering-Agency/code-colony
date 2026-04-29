"use client";

import { useEffect, useState } from "react";

export type TtlPollState<T> = {
  data: T | null;
  error: string | null;
  loading: boolean;
};

export type UseTtlPollOptions = {
  intervalMs: number;
  enabled?: boolean;
};

export function useTtlPoll<T>(load: () => Promise<T>, options: UseTtlPollOptions): TtlPollState<T> {
  const [state, setState] = useState<TtlPollState<T>>({ data: null, error: null, loading: false });
  useEffect(() => {
    if (options.enabled === false) return;
    let cancelled = false;
    const run = async () => {
      setState((current) => ({ ...current, loading: true }));
      try {
        const next = await load();
        if (!cancelled) setState({ data: next, error: null, loading: false });
      } catch (err) {
        if (!cancelled) setState((current) => ({ data: current.data, error: err instanceof Error ? err.message : String(err), loading: false }));
      }
    };
    void run();
    const interval = setInterval(() => { void run(); }, options.intervalMs);
    return () => { cancelled = true; clearInterval(interval); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.intervalMs, options.enabled]);
  return state;
}
