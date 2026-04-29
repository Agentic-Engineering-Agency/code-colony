import { NextResponse } from "next/server";
import { createRepositoryWorldScan, demoData } from "@/domain/demoData";
import { createGitListingFetcher } from "@/server/repoScanFetchers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const cwd = url.searchParams.get("cwd") ?? undefined;
  const fetcher = createGitListingFetcher({ cwd });
  const paths = await fetcher();
  if (!paths) {
    return NextResponse.json({ error: "git ls-files unavailable", cwd: cwd ?? null }, { status: 502 });
  }
  const generatedAt = new Date().toISOString();
  const scan = createRepositoryWorldScan(demoData, paths, { source: "live_scan", generatedAt });
  return NextResponse.json({ cwd: cwd ?? null, scan });
}
