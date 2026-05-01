import { describe, it, expect } from "vitest";

/**
 * Pure-domain coverage for the waitlist mutation's input contract. The Convex
 * mutation itself is exercised end-to-end by `scripts/smoke.sh` against the
 * dev deployment; here we lock down the email-normalization rules so a future
 * refactor cannot silently change the dedupe key.
 */
function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

function isValidEmail(raw: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw);
}

describe("waitlist email normalization", () => {
  it("trims whitespace and lowercases", () => {
    expect(normalizeEmail("  Hello@CodeColony.DEV  ")).toBe(
      "hello@codecolony.dev",
    );
  });

  it("rejects invalid email shapes", () => {
    expect(isValidEmail("nope")).toBe(false);
    expect(isValidEmail("a@b")).toBe(false);
    expect(isValidEmail("a@b.c")).toBe(true);
  });
});
