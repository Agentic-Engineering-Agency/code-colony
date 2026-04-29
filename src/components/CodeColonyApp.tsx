"use client";

import Image from "next/image";
import { useState } from "react";
import type { CSSProperties } from "react";
import { applyRefreshedBacklog, applyRefreshedRepoScan, approveArtifactLearning, demoData, ingestBacklogIssue, moveJob, rejectBacklogIssue, voteOnApproval } from "@/domain/demoData";
import { DEFAULT_RUNTIME_PREVIEW_REQUEST, SIMULATED_RUNTIME_DESCRIPTION, appendRuntimeWorkerResult, runSimulatedRuntimePreview, type RuntimeWorkerRequest, type RuntimeWorkerResult } from "@/domain/runtime";
import type { AgentEmployee, BacklogIssue, DemoData, GovernanceState, Region, RepositoryWorldScan, Room } from "@/domain/types";

type Screen = "world" | "operations" | "governance" | "agents" | "runtime" | "artifact" | "marketplace" | "memory";
const screens: { id: Screen; label: string }[] = [
  { id: "world", label: "World Map" }, { id: "operations", label: "Operation Board" }, { id: "governance", label: "Spec Governance" }, { id: "agents", label: "Agent Employees" }, { id: "runtime", label: "Runtime Preview" }, { id: "artifact", label: "Artifact Review" }, { id: "memory", label: "Memory Ledger" }, { id: "marketplace", label: "Marketplace" },
];

export function CodeColonyApp() {
  const [screen, setScreen] = useState<Screen>("world");
  const [data, setData] = useState<DemoData>(demoData);
  const [selectedRegionId, setSelectedRegionId] = useState("hq");
  const selectedRegion = data.regions.find((region) => region.id === selectedRegionId) ?? data.regions[0];
  const stats = data.company;
  return (
    <div className="colony-shell">
      <header className="topbar">
        <Image className="logo-mark" src="/assets/code-colony-logo.png" alt="Code Colony logo" width={44} height={44} priority /><div><div className="brand-title">CODE COLONY</div><div className="brand-sub">Where your repo becomes a living company.</div></div>
        <div className="status-strip"><Status label="Trust" value={`${stats.trustLevel}%`} tone="trust" /><Status label="Risk" value="Med" tone="risk" /><Status label="Budget" value={`$${Math.round(stats.budget / 1000)}k`} tone="budget" /><Status label="Compute" value="184s" tone="compute" /><Status label="Week" value="01" tone="system" /><Status label="Turn" value="03" tone="ultrawork" /></div>
      </header>
      <div className="app-grid">
        <nav className="nav-rail">{screens.map((item) => <button key={item.id} className={`btn nav-btn ${screen === item.id ? "active" : ""}`} onClick={() => setScreen(item.id)}>{item.label}</button>)}</nav>
        <main className="content">
          <Hero data={data} />
          {screen === "world" && <WorldScreen data={data} selectedRegion={selectedRegion} onSelectRegion={setSelectedRegionId} onRefreshScan={async () => {
            const response = await fetch("/api/repo/scan");
            if (!response.ok) throw new Error(`scan failed: ${response.status}`);
            const payload = await response.json() as { cwd: string | null; scan: RepositoryWorldScan };
            setData((current) => applyRefreshedRepoScan(current, payload.scan));
          }} />}
          {screen === "operations" && <OperationsScreen data={data} onMove={(jobId, state) => setData((current) => moveJob(current, jobId, state))} onIngestBacklog={(issueId) => setData((current) => ingestBacklogIssue(current, issueId))} onRejectBacklog={(issueId) => setData((current) => rejectBacklogIssue(current, issueId))} onRefreshBacklog={async (source) => {
            const url = source ? `/api/backlog/refresh?source=${source}` : "/api/backlog/refresh";
            const response = await fetch(url);
            if (!response.ok) throw new Error(`refresh failed: ${response.status}`);
            const payload = await response.json() as { backlog: import("@/domain/types").BacklogIssue[]; report: { githubAdded: number; linearAdded: number; errors: string[] } };
            setData((current) => applyRefreshedBacklog(current, payload.backlog));
            return payload.report;
          }} />}
          {screen === "governance" && <GovernanceScreen data={data} onVote={(decision) => setData((current) => voteOnApproval(current, "approval-spec-preview", decision))} />}
          {screen === "agents" && <AgentsScreen data={data} />}
          {screen === "runtime" && <RuntimeScreen data={data} onRerun={async () => {
            const params = new URLSearchParams(DEFAULT_RUNTIME_PREVIEW_REQUEST as unknown as Record<string, string>);
            const response = await fetch(`/api/runtime/preview?${params.toString()}`);
            if (!response.ok) throw new Error(`runtime preview failed: ${response.status}`);
            const payload = await response.json() as { request: RuntimeWorkerRequest; result: RuntimeWorkerResult };
            setData((current) => appendRuntimeWorkerResult(current, "run-preview", payload.result));
          }} />}
          {screen === "artifact" && <ArtifactScreen data={data} onApproveLearning={() => setData(approveArtifactLearning)} />}
          {screen === "memory" && <MemoryScreen data={data} />}
          {screen === "marketplace" && <MarketplaceScreen data={data} />}
        </main>
      </div>
    </div>
  );
}

function Hero({ data }: { data: DemoData }) {
  return <section className="hero compact bracket" style={{ marginBottom: 16 }}><div><div className="hero-tag">{data.company.name} · {data.projectWorld.repoUrl}</div><h1 className="hero-title code-colony">{data.projectWorld.name}<span className="sep">|</span>AI COMPANY COLONY</h1><p className="hero-blurb">A working local vertical slice: inspect the colony, approve a spec, assign an agent, preview a simulated Oh My Pi run, review artifacts, and crystallize memory/skill learning.</p></div><div className="hero-stats"><div className="hero-stat"><div className="v">6</div><div className="l">Regions</div></div><div className="hero-stat"><div className="v">6</div><div className="l">Agents</div></div><div className="hero-stat"><div className="v">1</div><div className="l">Run</div></div></div><span className="bl" /><span className="br" /></section>;
}

function WorldScreen({ data, selectedRegion, onSelectRegion, onRefreshScan }: { data: DemoData; selectedRegion: Region; onSelectRegion: (id: string) => void; onRefreshScan: () => Promise<void> }) {
  const repoScan = data.repoScans[0];
  return (
    <section className="screen">
      <div className="board-layout">
        <div className="world-board">
          {data.regions.slice(1).map((region) => <Path key={`path-${region.id}`} from={data.regions[0]} to={region} />)}
          {data.regions.map((region) => <button key={region.id} className={`region-node ${selectedRegion.id === region.id ? "selected" : ""}`} style={{ left: `${region.position.x}%`, top: `${region.position.y}%`, "--district": `var(${region.colorVar})` } as CSSProperties} onClick={() => onSelectRegion(region.id)}><div className="nameplate">{region.name}</div><div className="tag-row"><span className={`badge dot ${region.riskLevel > 3 ? "risk" : region.riskLevel > 2 ? "warn" : "trust"}`}>Risk {region.riskLevel}</span><span className="badge dot trust">Trust {region.trust}%</span></div><div className="room-row" style={{ marginTop: 10 }}>{region.rooms.map((roomId) => <RoomMini key={roomId} room={data.rooms.find((room) => room.id === roomId)!} />)}</div></button>)}
          {data.agents.map((agent, index) => <AgentPin key={agent.id} agent={agent} x={18 + index * 12} y={30 + (index % 3) * 18} />)}
        </div>
        <aside className="panel bracket">
          <div className="panel-head"><span className="ttl">Region Detail</span><span className="sub">Selected</span></div>
          <div className="panel-body">
            <h2 className="pix" style={{ color: `var(${selectedRegion.colorVar})`, fontSize: 14 }}>{selectedRegion.name}</h2>
            <p className="muted">Health {selectedRegion.health}% · Trust {selectedRegion.trust}% · Risk level {selectedRegion.riskLevel}</p>
            <BoardMeters trust={selectedRegion.trust} risk={selectedRegion.riskLevel} />
            <h3 className="eyebrow">Active Jobs</h3>
            <ul className="list">{selectedRegion.activeJobIds.map((jobId) => { const job = data.jobs.find((item) => item.id === jobId)!; return <li key={job.id}><div><b>{job.title}</b><span>{job.state} · {job.risk} risk · {job.estimate}</span></div></li>; })}</ul>
            <div className="notice">Sisyphus/Ultrawork are runtime concepts here; Code Colony is the product surface.</div>
            {repoScan && <RepoScanPanel scan={repoScan} selectedRegionId={selectedRegion.id} onRefresh={onRefreshScan} />}
          </div>
          <span className="bl" /><span className="br" />
        </aside>
      </div>
    </section>
  );
}

function RepoScanPanel({ scan, selectedRegionId, onRefresh }: { scan: RepositoryWorldScan; selectedRegionId: string; onRefresh: () => Promise<void> }) {
  const district = scan.districts.find((item) => item.regionId === selectedRegionId);
  const sourceLabel = scan.source.replaceAll("_", " ");
  const sourceDescription = scan.source === "seeded_inventory" ? "Seeded repository inventory" : "Live repository scan";
  if (!district) return null;

  return (
    <div className="repo-scan-panel">
      <div className="panel-head inline"><span className="ttl">Repo Import Scan</span><span className="sub">{sourceLabel}</span></div>
      <RepoScanRefreshButton onRefresh={onRefresh} />
      <p className="muted">{sourceDescription} mapped {scan.totalFiles} files into the project world. This is inspection data, not runtime mutation.</p>
      <div className="repo-scan-count"><span>{district.fileCount}</span><b>{district.fileCount === 1 ? "file" : "files"} mapped to this district</b></div>
      <div className="tag-row">{district.generatedRoomNames.map((room) => <span className="badge system" key={room}>{room}</span>)}</div>
      <ul className="list compact">{district.samplePaths.map((path) => <li key={path}><div><b>{path}</b><span>Repository path sample</span></div></li>)}</ul>
      {district.coverageSignals.concat(scan.notes).slice(0, 3).map((note) => <div className="notice mini" key={note}>{note}</div>)}
    </div>
  );
}

function RepoScanRefreshButton({ onRefresh }: { onRefresh: () => Promise<void> }) {
  const [phase, setPhase] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<string | null>(null);
  const handle = async () => {
    setPhase("loading");
    setError(null);
    try { await onRefresh(); } catch (err) { setError(err instanceof Error ? err.message : String(err)); } finally { setPhase("idle"); }
  };
  return <div className="action-row" style={{ marginTop: 8 }}>
    <button className="btn primary" disabled={phase === "loading"} onClick={() => { void handle(); }}>{phase === "loading" ? "Scanning…" : "Refresh repo scan"}</button>
    {error && <span className="badge dot risk">{error}</span>}
  </div>;
}

function OperationsScreen({ data, onMove, onIngestBacklog, onRejectBacklog, onRefreshBacklog }: { data: DemoData; onMove: (jobId: string, state: GovernanceState) => void; onIngestBacklog: (issueId: string) => void; onRejectBacklog: (issueId: string) => void; onRefreshBacklog: (source?: "github" | "linear" | "all") => Promise<{ githubAdded: number; linearAdded: number; errors: string[] }> }) {
  const lanes: GovernanceState[] = ["proposed", "approved", "running", "review", "learned"];
  return <section className="screen">
    <div className="queue-grid">{lanes.map((lane) => <div className="queue" key={lane}><div className="queue-title"><span>{lane}</span><span>{data.jobs.filter((job) => job.state === lane).length}</span></div>{data.jobs.filter((job) => job.state === lane).map((job) => <div className="mini-card" key={job.id}><h4>{job.title}</h4><p>{agentName(data, job.agentEmployeeId)} · {job.risk} risk · {job.estimate}</p><div className="action-row" style={{ marginTop: 8 }}><button className="btn primary" onClick={() => onMove(job.id, nextLane(lane))}>Move</button></div></div>)}</div>)}</div>
    <BacklogPanel data={data} onIngest={onIngestBacklog} onReject={onRejectBacklog} onRefresh={onRefreshBacklog} />
  </section>;
}

function BacklogPanel({ data, onIngest, onReject, onRefresh }: { data: DemoData; onIngest: (issueId: string) => void; onReject: (issueId: string) => void; onRefresh: (source?: "github" | "linear" | "all") => Promise<{ githubAdded: number; linearAdded: number; errors: string[] }> }) {
  const newIssues = data.backlog.filter((issue) => issue.status === "new");
  const handled = data.backlog.filter((issue) => issue.status !== "new");
  const [phase, setPhase] = useState<"idle" | "loading">("idle");
  const [report, setReport] = useState<{ githubAdded: number; linearAdded: number; errors: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const handleRefresh = async (source?: "github" | "linear" | "all") => {
    setPhase("loading");
    setError(null);
    try {
      const result = await onRefresh(source);
      setReport(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setPhase("idle");
    }
  };
  return <aside className="panel" style={{ marginTop: 16 }}>
    <div className="panel-head"><span className="ttl">Backlog Ingest</span><span className="sub">{newIssues.length} pending</span></div>
    <div className="panel-body">
      <div className="action-row" style={{ marginBottom: 12, flexWrap: "wrap" }}>
        <button className="btn primary" disabled={phase === "loading"} onClick={() => { void handleRefresh("all"); }}>{phase === "loading" ? "Refreshing…" : "Refresh all"}</button>
        <button className="btn" disabled={phase === "loading"} onClick={() => { void handleRefresh("github"); }}>GitHub only</button>
        <button className="btn" disabled={phase === "loading"} onClick={() => { void handleRefresh("linear"); }}>Linear only</button>
        {report && <span className="badge system">+{report.githubAdded + report.linearAdded} new (gh {report.githubAdded}, linear {report.linearAdded})</span>}
      </div>
      {error && <div className="notice mini">{error}</div>}
      {report && report.errors.length > 0 && report.errors.map((message) => <div className="notice mini" key={message}>{message}</div>)}
      <p className="muted">Imported issues from Linear, GitHub, and manual entries. Ingesting promotes the issue to a proposed Job in its suggested district.</p>
      {newIssues.length === 0 && <p className="muted">No new backlog issues to ingest.</p>}
      <ul className="list">{newIssues.map((issue) => <BacklogRow key={issue.id} issue={issue} onIngest={onIngest} onReject={onReject} />)}</ul>
      {handled.length > 0 && <>
        <h4 className="eyebrow" style={{ marginTop: 12 }}>Handled</h4>
        <ul className="list">{handled.map((issue) => <li key={issue.id}><div><b>{issue.source}/{issue.externalRef}: {issue.title}</b><span>{issue.status}{issue.ingestedJobId ? ` → ${issue.ingestedJobId}` : ""}</span></div></li>)}</ul>
      </>}
    </div>
  </aside>;
}

function BacklogRow({ issue, onIngest, onReject }: { issue: BacklogIssue; onIngest: (issueId: string) => void; onReject: (issueId: string) => void }) {
  return <li><div><b>{issue.source}/{issue.externalRef}: {issue.title}</b><span>{issue.summary}</span><div className="action-row" style={{ marginTop: 8 }}><button className="btn primary" onClick={() => onIngest(issue.id)}>Ingest as Job</button><button className="btn warn" onClick={() => onReject(issue.id)}>Reject</button></div></div></li>;
}

function GovernanceScreen({ data, onVote }: { data: DemoData; onVote: (decision: "approve" | "reject" | "request_changes") => void }) {
  const spec = data.specs[0], approval = data.approvals[0], adr = data.architectureDecisions[0];
  return <section className="detail-grid"><div className="card spec" style={{ width: "100%" }}><div className="cap"><span>SPEC CARD</span><span>{approval.status}</span></div><div className="body"><div className="ttl">{spec.title}</div><p className="desc">{spec.problem}</p><h4>Desired outcome</h4><p>{spec.desiredOutcome}</p><h4>Acceptance</h4><ul>{spec.acceptanceCriteria.map((item) => <li key={item}>{item}</li>)}</ul><div className="action-row"><button className="btn primary" onClick={() => onVote("approve")}>Approve</button><button className="btn warn" onClick={() => onVote("request_changes")}>Request Changes</button><button className="btn danger" onClick={() => onVote("reject")}>Reject</button></div></div><div className="stats"><span>RISK · {spec.riskLevel}</span><span>SKILLS · {spec.requiredSkills.length}</span></div></div><aside className="panel"><div className="panel-head"><span className="ttl">ADR + Votes</span></div><div className="panel-body"><h3 className="pix" style={{ fontSize: 12 }}>{adr.title}</h3><p className="muted">{adr.decision}</p><ul className="list">{approval.votes.map((vote, index) => <li key={`${vote.player}-${index}`}><div><b>{vote.player}: {vote.decision}</b><span>{vote.comment}</span></div></li>)}</ul></div></aside></section>;
}

function AgentsScreen({ data }: { data: DemoData }) { return <section className="agent-grid">{data.agents.map((agent) => <div className="panel" key={agent.id}><div className="panel-head"><span className="ttl">{agent.name}</span><span className="sub">{agent.status}</span></div><div className="panel-body"><div className="row" style={{ alignItems: "flex-start" }}><Standee agent={agent} /><div><div className="pix" style={{ fontSize: 12 }}>{agent.role}</div><p className="muted">{agent.specialty}</p><Meter value={agent.trust} tone="trust" /><div className="tag-row" style={{ marginTop: 10 }}>{agent.skills.map((skill) => <span className="badge system" key={skill}>{skill}</span>)}</div><p className="muted">Loadout: {agent.loadout.join(" · ")}</p></div></div></div></div>)}</section>; }
function RuntimeScreen({ data, onRerun }: { data: DemoData; onRerun: () => void | Promise<void> }) { const preview = runSimulatedRuntimePreview(data, DEFAULT_RUNTIME_PREVIEW_REQUEST); return <section className="detail-grid"><div className="panel"><div className="panel-head"><span className="ttl">Simulated Oh My Pi Run</span><span className="sub">{preview.adapter} · {preview.status}</span></div><div className="panel-body"><div className="notice">{SIMULATED_RUNTIME_DESCRIPTION}</div><div className="action-row" style={{ marginTop: 12 }}><button className="btn primary" onClick={() => { void onRerun(); }}>Re-run Simulation</button><span className="badge system">{preview.events.length} events</span></div><div className="timeline" style={{ marginTop: 12 }}>{preview.events.map((event, index) => <div className="event" key={`${event.timestamp}-${index}-${event.content.slice(0, 8)}`}><span className="mono muted">{event.timestamp}</span><span>{event.content}</span></div>)}</div></div></div><div className="panel"><div className="panel-head"><span className="ttl">Diff Preview + Checks</span></div><div className="panel-body">{preview.artifact ? <><pre className="code diff-code">{preview.artifact.diff}</pre><p className="badge trust">{preview.artifact.testResult}</p></> : <p className="muted">No artifact bundle returned by the simulated worker yet.</p>}</div></div></section>; }
function ArtifactScreen({ data, onApproveLearning }: { data: DemoData; onApproveLearning: () => void }) { const artifact = data.artifacts[0]; return <section className="detail-grid"><div className="panel"><div className="panel-head"><span className="ttl">Artifact Bundle</span><span className="sub">{artifact.status}</span></div><div className="panel-body"><h3 className="pix" style={{ fontSize: 13 }}>{artifact.title}</h3><ul className="list">{artifact.changedFiles.map((file) => <li key={file}><div><b>{file}</b><span>Changed in simulated patch preview</span></div></li>)}</ul><div className="action-row"><button className="btn primary" onClick={onApproveLearning}>Approve Learning Objects</button><button className="btn warn">Request Changes</button><button className="btn danger">Reject</button></div></div></div><div className="panel"><div className="panel-head"><span className="ttl">Reviewer Verdicts</span></div><div className="panel-body"><ul className="list">{artifact.reviewerVerdicts.map((verdict) => <li key={verdict.reviewer}><div><b>{verdict.reviewer}: {verdict.verdict}</b><span>{verdict.note}</span></div></li>)}</ul></div></div></section>; }
function MemoryScreen({ data }: { data: DemoData }) { return <section className="memory-grid">{data.memories.map((memory) => <div className="panel" key={memory.id}><div className="panel-head"><span className="ttl">{memory.scope} · {memory.kind}</span><span className="sub">{memory.status}</span></div><div className="panel-body"><p>{memory.content}</p><Meter value={Math.round(memory.confidence * 100)} tone="memory" /><p className="muted">Provenance: {memory.provenanceMode}</p></div></div>)}{data.skillProposals.map((skill) => <div className="card skill" key={skill.id}><div className="cap"><span>SKILL UPDATE</span><span>{skill.approvalStatus}</span></div><div className="body"><div className="ttl">{skill.skillId}</div><p className="desc">{skill.diffSummary}</p></div><div className="stats"><span>Tier {skill.approvalTier}</span><span>{skill.kind}</span></div></div>)}</section>; }
function MarketplaceScreen({ data }: { data: DemoData }) { return <section className="market-grid">{data.marketplace.map((pkg) => <div className="card reference" style={{ width: "100%" }} key={pkg.id}><div className="cap"><span>{pkg.kind}</span><span>{pkg.version}</span></div><div className="body"><div className="ttl">{pkg.name}</div><p className="desc">{pkg.description}</p><div className="tag-row"><span className="badge trust">{pkg.trustTier}</span><span className="badge system">{pkg.installScope}</span></div><button className="btn primary" style={{ marginTop: 10 }}>Install / Equip</button></div></div>)}</section>; }

function Status({ label, value, tone }: { label: string; value: string; tone: string }) { return <span className="status-chip"><span className={`token sm ${tone === "budget" ? "coin" : tone}`}>{label[0]}</span>{label} <b>{value}</b></span>; }
function RoomMini({ room }: { room: Room }) { return <div className="room-mini" title={room.purpose}>{room.name.split(" ")[0]}</div>; }
function AgentPin({ agent, x, y }: { agent: AgentEmployee; x: number; y: number }) { return <div className="agent-pin" style={{ left: `${x}%`, top: `${y}%` }} title={agent.name}><Standee agent={agent} /></div>; }
function Standee({ agent }: { agent: AgentEmployee }) { const klass = agent.department === "review" ? "reviewer" : agent.department === "planning" ? "planner" : agent.department === "ops" ? "operator" : "frontend"; return <div className={`standee ${klass}`}><div className="body"><div className="head" /><div className="torso" /><div className="legs" /></div><div className="badge-pin" /></div>; }
function Meter({ value, tone }: { value: number; tone: string }) { return <div className="meter"><span style={{ width: `${value}%`, "--accent": `var(--${tone})` } as CSSProperties} /></div>; }
function BoardMeters({ trust, risk }: { trust: number; risk: number }) { return <div style={{ display: "grid", gap: 8, margin: "12px 0" }}><div><span className="eyebrow">Trust</span><Meter value={trust} tone="trust" /></div><div><span className="eyebrow">Risk</span><Meter value={risk * 20} tone="risk" /></div></div>; }
function Path({ from, to }: { from: Region; to: Region }) { const dx = to.position.x - from.position.x; const dy = to.position.y - from.position.y; const length = Math.sqrt(dx * dx + dy * dy); const angle = Math.atan2(dy, dx) * 180 / Math.PI; return <div className="path-line" style={{ left: `${from.position.x + 10}%`, top: `${from.position.y + 10}%`, width: `${length}%`, transform: `rotate(${angle}deg)` }} />; }
function agentName(data: DemoData, id: string) { return data.agents.find((agent) => agent.id === id)?.name ?? "Unassigned"; }
function nextLane(lane: GovernanceState): GovernanceState { return lane === "proposed" ? "approved" : lane === "approved" ? "running" : lane === "running" ? "review" : "learned"; }
