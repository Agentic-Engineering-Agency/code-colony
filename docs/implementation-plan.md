# Code Colony MVP Implementation Plan

## Product thesis
Code Colony turns a real software project into a playable pixel-art/tabletop company colony. Persistent agent employees, specs, reviews, runtime runs, artifacts, memory, trust, risk, cost, skills, and loadouts become visible product objects rather than hidden chat logs.

## MVP scope
Ship a local, installable vertical slice that demonstrates: project world → spec card → approval → agent assignment → simulated Oh My Pi runtime preview → artifact review → memory record and skill proposal.

## Architecture choice
Use Next.js, React, and TypeScript for the first app. Use the provided CSS tokens/components directly. Implement the world map as React/CSS for speed and isolate PixiJS as a later adapter. Use typed seeded mock data shaped for Convex replacement; do not block the MVP on backend credentials.

## Data model plan
The first model includes Company, ProjectWorld, Region, Room, OperationBoard, Job, Spec, ArchitectureDecision, ApprovalRequest, AgentEmployee, AgentRun, RuntimeEvent, ArtifactBundle, MemoryRecord, SkillUpdateProposal, MarketplacePackage, TrustPolicy, RegionRiskProfile, and RuntimeCostLedger.

## UI plan
Screens: World Map, Operation Board, Spec Governance, Agent Employees, Runtime Run Preview, Artifact Review, Memory Ledger, and Marketplace/Loadouts. Visual language: dark felt board, parchment cards, pixel labels, board-game tokens, room tiles, agent standees, district colors, dense dashboard panels.

## Milestones
1. Repo/source docs and planning.
2. App foundation, CI, design tokens, shell.
3. Typed mock domain model and seeded scenario.
4. Required screens and local workflow interactions.
5. QA, README, screenshots, and follow-up sprint.

## Risks and unknowns
- PixiJS integration may be deferred until the product loop is validated.
- Convex/Honcho credentials are not required for MVP; mock data must clearly label simulated state.
- Linear milestone creation failed through the available MCP tool, so milestone names are embedded in issues for now.
