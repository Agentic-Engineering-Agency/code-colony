export type TtlMemoOptions = {
  ttlMs: number;
  now?: () => number;
};

export type TtlMemo<T> = {
  get(): Promise<T>;
  invalidate(): void;
};

export function createTtlMemo<T>(produce: () => Promise<T>, options: TtlMemoOptions): TtlMemo<T> {
  const now = options.now ?? (() => Date.now());
  let cached: { value: Promise<T>; expiresAt: number } | null = null;

  return {
    async get() {
      const t = now();
      if (cached && cached.expiresAt > t) {
        return cached.value;
      }
      const pending: Promise<T> = produce().catch((error) => {
        if (cached?.value === pending) cached = null;
        throw error;
      });
      cached = { value: pending, expiresAt: t + options.ttlMs };
      return pending;
    },
    invalidate() {
      cached = null;
    },
  };
}
