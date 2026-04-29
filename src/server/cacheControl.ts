export function buildCacheControl(maxAgeSeconds: number, scope: "private" | "public" = "private"): string {
  if (!Number.isFinite(maxAgeSeconds) || maxAgeSeconds < 0) {
    return "no-store";
  }
  if (maxAgeSeconds === 0) {
    return `${scope}, max-age=0, must-revalidate`;
  }
  const sMaxAge = scope === "public" ? `, s-maxage=${maxAgeSeconds}` : "";
  return `${scope}, max-age=${maxAgeSeconds}${sMaxAge}`;
}
