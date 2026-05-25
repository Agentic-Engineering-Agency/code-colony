import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("landing smoke", () => {
  it("keeps the Vite landing app bootstrapped with the expected root and CTAs", async () => {
    const [indexHtml, appSource, packageJson] = await Promise.all([
      readFile("apps/landing/index.html", "utf8"),
      readFile("apps/landing/src/App.tsx", "utf8"),
      readFile("apps/landing/package.json", "utf8"),
    ]);

    expect(indexHtml).toContain('id="root"');
    expect(appSource).toContain("WaitlistModal");
    expect(appSource).toContain("FinalCTASection");
    expect(JSON.parse(packageJson)).toMatchObject({
      scripts: {
        build: "tsc --noEmit && vite build",
        typecheck: "tsc --noEmit",
      },
    });
  });
});
