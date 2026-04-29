#!/usr/bin/env bash
# AGE-62 smoke tests: exercise each Convex Component end-to-end against the
# dev deployment. Run after `npx convex dev --once` succeeds.
set -e
cd "$(dirname "$0")/.."

run() { printf '\n== %s ==\n' "$1"; npx convex run "$@" 2>&1 | tail -5; }

run waitlist:count
run waitlist:join '{"email":"smoke@codecolony.dev","role":"engineer"}'
run waitlist:count
run triage:recordSandboxSpawn '{"regionSeedId":"hq"}'
run triage:sandboxSpawnsForRegion '{"regionSeedId":"hq"}'
run system:ping
