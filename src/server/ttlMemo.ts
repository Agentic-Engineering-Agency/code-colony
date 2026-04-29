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


export type KeyedTtlMemo<K extends string, T> = {
  get(key: K): Promise<T>;
  invalidate(key?: K): void;
};

export function createKeyedTtlMemo<K extends string, T>(produce: (key: K) => Promise<T>, options: TtlMemoOptions): KeyedTtlMemo<K, T> {
  const memos = new Map<K, TtlMemo<T>>();
  return {
    get(key) {
      let memo = memos.get(key);
      if (!memo) {
        memo = createTtlMemo(() => produce(key), options);
        memos.set(key, memo);
      }
      return memo.get();
    },
    invalidate(key) {
      if (key === undefined) {
        memos.clear();
        return;
      }
      memos.get(key)?.invalidate();
    },
  };
}