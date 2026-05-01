// Sections: Problems, Pillars, How, World, Roster, Market, Stack, Roadmap, Team, FAQ, Footer

import { useState, type CSSProperties, type FormEvent } from "react";
import { Vignette } from "./hero";

export function ProblemsSection() {
  const items = [
    {
      n: "01",
      title: "Agent dashboards are chat logs in disguise",
      body:
        "Threads stack up, work falls through cracks, no one knows who's touching what. You scroll instead of govern.",
      stamp: "CHAOS",
    },
    {
      n: "02",
      title: "No specs means no shared truth",
      body:
        "Agents start coding from a vibe. Reviews catch defects too late. The same lessons get re-learned every Tuesday.",
      stamp: "DEBT",
    },
    {
      n: "03",
      title: "Memory dies with the session",
      body:
        "Every run is a new hire. Trust never compounds. The skills your agents earn evaporate the moment they exit.",
      stamp: "AMNESIA",
    },
  ];
  return (
    <section className="section" id="problem">
      <div className="container">
        <div className="section-head">
          <div className="left">
            <div className="section-num">01 · The problem</div>
            <h2 className="section-title">
              Coordinating agents{" "}
              <span style={{ color: "var(--risk)" }}>shouldn't</span> feel like
              herding ghosts.
            </h2>
            <p className="section-sub">
              Today's tools are chat-centric, single-player, and stateless.
              Real teams need visibility, governance, memory — and a way to
              make agent work feel like a company, not a tab.
            </p>
          </div>
        </div>
        <div className="problems">
          {items.map((it) => (
            <div className="scroll-card" key={it.n}>
              <div className="num">PROBLEM · {it.n}</div>
              <h3>{it.title}</h3>
              <p>{it.body}</p>
              <div className="stamp">{it.stamp}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PillarsSection() {
  const pillars = [
    {
      c: "",
      i: "⌂",
      t: "Project as playable world",
      b: "Your repo becomes a navigable map. Districts for auth, frontend, data. Rooms for planning, engineering, review. You see the work, literally.",
    },
    {
      c: "cy",
      i: "✎",
      t: "Specs before execution",
      b: "Meaningful work begins as a spec card. Drawn, debated, voted, and placed on the board before agents move a finger.",
    },
    {
      c: "gd",
      i: "✓",
      t: "Every artifact is reviewable",
      b: "Diffs, ADRs, memory edits, skill updates — all surface as bundles a human can approve, reject, or send back. Nothing ships unsupervised.",
    },
    {
      c: "pr",
      i: "M",
      t: "Memory that compounds",
      b: "Lessons from reviews and failures persist. Agents earn trust. Skills level up with ceremony. The company gets smarter every job.",
    },
    {
      c: "rd",
      i: "!",
      t: "Risk and trust are visible",
      b: "Two persistent tracks on every screen. You always know which districts are fragile and which agents have earned the rope.",
    },
    {
      c: "or",
      i: "▶",
      t: "Multiplayer, by default",
      b: "Founders, leads, reviewers — real humans approve specs together, vote on artifacts, and resolve incidents in shared rooms.",
    },
  ];
  return (
    <section className="section felt" id="pillars">
      <div className="container">
        <div className="section-head">
          <div className="left">
            <div className="section-num">02 · The model</div>
            <h2 className="section-title">
              Six things we believe about running an AI company.
            </h2>
            <p className="section-sub">
              These aren't features. They're the operating doctrine. Every
              screen, token, and animation reinforces them.
            </p>
          </div>
        </div>
        <div className="pillars">
          {pillars.map((p, i) => (
            <div key={i} className={`pillar ${p.c}`}>
              <div className="ico">{p.i}</div>
              <h4>{p.t}</h4>
              <p>{p.b}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowItWorksSection() {
  const steps = [
    {
      n: "01",
      t: "Connect your repo",
      b: "Code Colony scans your project and proposes districts, rooms, and risk hints. You edit, approve, and the world goes live.",
      ascii: "$ cc connect\n→ scanning…\n→ 5 districts found",
    },
    {
      n: "02",
      t: "Draw a spec",
      b: "Sisyphus drafts the spec from your intent. Founders, leads, and reviewers approve together. Architecture-impacting work routes through ADR.",
      ascii: "spec S-042\n  scope:  M\n  risk:   high\n  ✓ approved",
    },
    {
      n: "03",
      t: "Send an agent",
      b: "Pick a persistent agent-employee and dispatch through Oh My Pi. The runtime is sandboxed, the trace is auditable, the cost is metered.",
      ascii: "run #142\n  agent:  Ada\n  status: working\n  cost:   $2.40",
    },
    {
      n: "04",
      t: "Review the artifact",
      b: "Diff, tests, risk delta, memory proposal, skill update — all in one bundle. Approve, reject, or request changes. Lessons compound.",
      ascii: "PR #142\n  +8 tests\n  Δ risk: −18%\n  ✓ merge",
    },
  ];
  return (
    <section className="section" id="how">
      <div className="container">
        <div className="section-head">
          <div className="left">
            <div className="section-num">03 · How it works</div>
            <h2 className="section-title">
              Repo in. Reviewed PR out. Lessons compound.
            </h2>
            <p className="section-sub">
              Four moves. The whole game runs on this loop — and every loop
              leaves the company smarter than it found it.
            </p>
          </div>
        </div>
        <div className="how-grid">
          {steps.map((s) => (
            <div className="step" key={s.n}>
              <span className="step-num">{s.n}</span>
              <h5>{s.t}</h5>
              <p>{s.b}</p>
              <div className="ascii">{s.ascii}</div>
            </div>
          ))}
        </div>
        <Vignette />
      </div>
    </section>
  );
}

export function WorldSection() {
  return (
    <section className="section felt" id="world">
      <div className="container">
        <div className="section-head">
          <div className="left">
            <div className="section-num">04 · The map</div>
            <h2 className="section-title">
              Your repo, but you can finally{" "}
              <span style={{ color: "var(--primary)" }}>see</span> it.
            </h2>
            <p className="section-sub">
              Districts are major regions. Rooms are workspaces. The HQ is
              Sisyphus, narrating. Click anything to drill in.
            </p>
          </div>
        </div>
        <div className="world-wrap">
          <div className="world-map">
            <div
              className="road"
              style={{
                top: "38%",
                left: "18%",
                width: "28%",
                transform: "rotate(8deg)",
              }}
            ></div>
            <div
              className="road"
              style={{ top: "52%", left: "40%", width: "22%" }}
            ></div>
            <div
              className="road"
              style={{
                top: "32%",
                left: "52%",
                width: "26%",
                transform: "rotate(-12deg)",
              }}
            ></div>

            <div className="district auth">
              <span className="pin"></span>
              <div className="nm">Auth</div>
              <div className="rk">Risk · High</div>
            </div>
            <div className="district frontend">
              <span className="pin"></span>
              <div className="nm">Frontend</div>
              <div className="rk">Risk · Low</div>
            </div>
            <div className="district data">
              <span className="pin"></span>
              <div className="nm">Data</div>
              <div className="rk">Risk · Med</div>
            </div>
            <div className="district test">
              <span className="pin"></span>
              <div className="nm">Testing</div>
              <div className="rk">Conf · 64%</div>
            </div>
            <div className="district infra">
              <span className="pin"></span>
              <div className="nm">Infra</div>
              <div className="rk">Risk · Med</div>
            </div>
            <div className="district hq">
              <span className="pin"></span>
              <div className="nm">HQ · Sisyphus</div>
              <div className="rk">Online</div>
            </div>

            <div
              className="agent-dot"
              style={{ top: "24%", left: "20%" }}
            ></div>
            <div
              className="agent-dot"
              style={{ top: "60%", left: "32%" }}
            ></div>
            <div
              className="agent-dot"
              style={{ top: "28%", right: "12%" }}
            ></div>
          </div>
          <div className="world-side">
            <h6>LEGEND</h6>
            <div className="legend">
              <div
                className="legend-item"
                style={{ color: "var(--d-auth)" }}
              >
                <span className="sw"></span>
                <span>Auth</span>
                <span className="meta">3 jobs</span>
              </div>
              <div
                className="legend-item"
                style={{ color: "var(--d-frontend)" }}
              >
                <span className="sw"></span>
                <span>Frontend</span>
                <span className="meta">5 jobs</span>
              </div>
              <div
                className="legend-item"
                style={{ color: "var(--d-data)" }}
              >
                <span className="sw"></span>
                <span>Data</span>
                <span className="meta">2 jobs</span>
              </div>
              <div
                className="legend-item"
                style={{ color: "var(--d-test)" }}
              >
                <span className="sw"></span>
                <span>Testing</span>
                <span className="meta">1 job</span>
              </div>
              <div
                className="legend-item"
                style={{ color: "var(--d-infra)" }}
              >
                <span className="sw"></span>
                <span>Infra</span>
                <span className="meta">1 job</span>
              </div>
              <div className="legend-item" style={{ color: "var(--d-hq)" }}>
                <span className="sw"></span>
                <span>HQ</span>
                <span className="meta">narrating</span>
              </div>
            </div>
            <h6 style={{ marginTop: 22 }}>WHY IT MATTERS</h6>
            <p
              style={{
                color: "var(--text-md)",
                fontSize: 13,
                margin: 0,
              }}
            >
              The map is not a metaphor — it's the source of truth. Risk
              colors, agent positions, job counts, incident pings: all driven
              by Convex, all multiplayer-live.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function RosterSection() {
  const agents = [
    { nm: "Ada", role: "Frontend Eng", clr: "var(--d-frontend)", trust: 82 },
    { nm: "Boole", role: "Backend Eng", clr: "var(--d-infra)", trust: 71 },
    { nm: "Curie", role: "Reviewer", clr: "var(--memory)", trust: 88 },
    { nm: "Dijkstra", role: "Architect", clr: "var(--d-hq)", trust: 91 },
    { nm: "Euler", role: "Test Eng", clr: "var(--d-test)", trust: 64 },
    { nm: "Fermi", role: "Researcher", clr: "var(--memory)", trust: 58 },
  ];
  return (
    <section className="section" id="agents">
      <div className="container">
        <div className="section-head">
          <div className="left">
            <div className="section-num">05 · The roster</div>
            <h2 className="section-title">
              Persistent agent-employees. Not disposable sessions.
            </h2>
            <p className="section-sub">
              Every agent has a name, loadout, memory, trust, and history.
              They get better at your codebase. They earn the rope. They take
              the L when it's deserved.
            </p>
          </div>
        </div>
        <div className="roster">
          {agents.map((a, i) => (
            <div className="agent-card" key={i}>
              <div
                className="standee"
                style={{ ["--clr" as any]: a.clr } as CSSProperties}
              >
                <div className="head"></div>
                <div className="torso"></div>
                <div className="legs"></div>
                <span className="pin"></span>
              </div>
              <div className="name">{a.nm}</div>
              <div className="role">{a.role}</div>
              <div className="trust">
                <div
                  className="bar"
                  style={{ width: `${a.trust}%`, background: a.clr }}
                ></div>
              </div>
              <div
                style={{
                  fontFamily: "var(--f-pixel)",
                  fontSize: 8,
                  color: "var(--text-lo)",
                  marginTop: 6,
                  letterSpacing: ".16em",
                }}
              >
                TRUST · {a.trust}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function MarketSection() {
  const pkgs = [
    {
      kind: "PI SKILL",
      name: "Spec-First Pack",
      pub: "@code-colony/core",
      stars: "★ 4.8",
    },
    {
      kind: "PI SKILL",
      name: "Test Confidence Skill",
      pub: "@code-colony/qa",
      stars: "★ 4.6",
    },
    {
      kind: "PI HOOK",
      name: "Architecture Guard Hook",
      pub: "@code-colony/core",
      stars: "★ 4.7",
    },
    {
      kind: "AGENT TPL",
      name: "Repo Cartographer",
      pub: "@code-colony/core",
      stars: "★ 4.9",
    },
    {
      kind: "MCP PACK",
      name: "GitHub Tools",
      pub: "@code-colony/mcp",
      stars: "★ 4.5",
    },
    {
      kind: "RUBRIC",
      name: "High-Risk Auth Review",
      pub: "@stoneworks",
      stars: "★ 4.4",
    },
    {
      kind: "WORKFLOW",
      name: "Spec → Diff Loop",
      pub: "@code-colony/core",
      stars: "★ 4.8",
    },
    {
      kind: "DOMAIN",
      name: "Frontend Pack",
      pub: "@code-colony/core",
      stars: "★ 4.6",
    },
  ];
  return (
    <section className="section felt" id="market">
      <div className="container">
        <div className="section-head">
          <div className="left">
            <div className="section-num">06 · The marketplace</div>
            <h2 className="section-title">
              Skills, hooks, MCPs, agent templates — all installable.
            </h2>
            <p className="section-sub">
              Equip your agents with first-party packs or community-built
              ones. Every package declares its permissions. Every install is
              approval-gated.
            </p>
          </div>
        </div>
        <div className="market-grid">
          {pkgs.map((p, i) => (
            <div className="pkg" key={i}>
              <div className="kind">{p.kind}</div>
              <div className="pkg-name">{p.name}</div>
              <div className="pub">{p.pub}</div>
              <div className="meta">
                <span className="stars">{p.stars}</span>
                <span className="install">+ INSTALL</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function StackSection() {
  const stack = [
    { glyph: "◆", nm: "Convex", role: "multiplayer state" },
    { glyph: "⊕", nm: "Honcho", role: "contextual memory" },
    { glyph: "π", nm: "Oh My Pi", role: "agent runtime" },
    { glyph: "☁", nm: "Cloudflare", role: "sandbox + edge" },
    { glyph: "◐", nm: "Mastra", role: "workflow planning" },
    { glyph: "⬣", nm: "PixiJS", role: "world rendering" },
    { glyph: "◇", nm: "React + TS", role: "app shell" },
    { glyph: "⏚", nm: "MCP", role: "tool surface" },
  ];
  return (
    <section className="section" id="stack">
      <div className="container">
        <div className="section-head">
          <div className="left">
            <div className="section-num">07 · Built with</div>
            <h2 className="section-title">
              A stack that takes governance and persistence seriously.
            </h2>
            <p className="section-sub">
              Multiplayer state in Convex, contextual memory in Honcho, real
              execution through Oh My Pi, sandboxed on Cloudflare.
              Adapter-based — bring your own runtime.
            </p>
          </div>
        </div>
        <div className="stack-grid">
          {stack.map((s, i) => (
            <div className="stack-item" key={i}>
              <div className="glyph">{s.glyph}</div>
              <div className="nm">{s.nm}</div>
              <div className="role">{s.role}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function RoadmapSection() {
  const m = [
    {
      st: "done",
      label: "M1 · Q1 2026",
      t: "Project World Genesis",
      b: "Repo scan, AI interview, district generation, multiplayer map approval. Sisyphus narrator goes live.",
    },
    {
      st: "cur",
      label: "M2 · Q2 2026",
      t: "Spec Governance",
      b: "Spec drafting, approval flows, ADR routing, risk-aware policies. Closed alpha with the Agentic Engineering team.",
    },
    {
      st: "",
      label: "M3 · Q3 2026",
      t: "Spec → Diff Preview",
      b: "Approved spec produces a real patch through Oh My Pi. Artifact bundle review and Convex memory ledger.",
    },
    {
      st: "",
      label: "M4 · Q4 2026",
      t: "Memory + Skill Learning",
      b: "Honcho integration. Skill update proposals from reviews. Approval tiers. The company starts compounding.",
    },
    {
      st: "",
      label: "M5 · 2027",
      t: "Hosted Runtime + Marketplace",
      b: "Cloudflare sandboxes for hosted execution. Public marketplace for skills, MCPs, and agent templates.",
    },
  ];
  return (
    <section className="section felt" id="roadmap">
      <div className="container">
        <div className="section-head">
          <div className="left">
            <div className="section-num">08 · Roadmap</div>
            <h2 className="section-title">
              Where we are. Where we're going.
            </h2>
            <p className="section-sub">
              No vapor. We're shipping in milestones, in the open, on GitHub.
            </p>
          </div>
        </div>
        <div className="roadmap">
          {m.map((it, i) => (
            <div className={`milestone ${it.st}`} key={i}>
              <div className="label">
                {it.label}
                {it.st === "done"
                  ? " · SHIPPED"
                  : it.st === "cur"
                    ? " · IN FLIGHT"
                    : " · PLANNED"}
              </div>
              <h5>{it.t}</h5>
              <p>{it.b}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TeamSection() {
  const team = [
    { i: "AE", nm: "Agentic Engineering", rl: "Founding studio" },
    { i: "OM", nm: "Oh My Pi crew", rl: "Runtime partners" },
    { i: "CN", nm: "Convex + Honcho", rl: "Memory & state" },
    { i: "+", nm: "You?", rl: "Founder seat open" },
  ];
  return (
    <section className="section" id="team">
      <div className="container">
        <div className="section-head">
          <div className="left">
            <div className="section-num">09 · Who's building it</div>
            <h2 className="section-title">
              A small crew dogfooding on real projects.
            </h2>
            <p className="section-sub">
              We're using Code Colony to build Code Colony. Every screen has
              been through our own spec-and-review loop.
            </p>
          </div>
        </div>
        <div className="team-strip">
          {team.map((t, i) => (
            <div className="team-card" key={i}>
              <div className="avatar">{t.i}</div>
              <div>
                <div className="nm">{t.nm}</div>
                <div className="rl">{t.rl}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FAQSection() {
  const qs = [
    {
      q: "Is this a game or a real tool?",
      a: "Both. The pixel-and-tabletop interface is real UX — it makes agent work legible. But every spec, agent, and diff is a real artifact in your real repo.",
    },
    {
      q: "Do my agents actually write code?",
      a: "Yes. Through Oh My Pi runtime sessions, agents check out a worktree, run tools, write tests, and produce a patch. You review the artifact bundle before anything merges.",
    },
    {
      q: "Self-hostable?",
      a: "On the roadmap. MVP is hosted (Cloudflare + Convex). Enterprise self-hosting comes after the public launch.",
    },
    {
      q: 'What does "persistent agent" actually mean?',
      a: "Agents have memory, trust, reputation, and equipped skills that persist across sessions. Sessions are disposable; the agent is not.",
    },
    {
      q: "How does it handle multiplayer?",
      a: "Real-time through Convex. Founders, leads, and reviewers see the same world, vote on the same specs, and review the same artifacts — like a tabletop game with everyone at the same table.",
    },
    {
      q: "Open source?",
      a: "The core is open: github.com/Agentic-Engineering-Agency/code-colony. The hosted product layers governance, memory, and the marketplace on top.",
    },
    {
      q: "When can I try it?",
      a: "Closed alpha begins Q2 2026. Join the waitlist — repos with strong specs go to the front of the line.",
    },
  ];
  return (
    <section className="section" id="faq">
      <div className="container">
        <div className="section-head">
          <div className="left">
            <div className="section-num">10 · FAQ</div>
            <h2 className="section-title">Questions, answered.</h2>
            <p className="section-sub">
              If yours isn't here, drop it in the waitlist note field.
            </p>
          </div>
        </div>
        <div className="faq">
          {qs.map((it, i) => (
            <details className="faq-item" key={i}>
              <summary>{it.q}</summary>
              <p>{it.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCTASection() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (email.includes("@")) setDone(true);
  };
  return (
    <section className="section" id="waitlist">
      <div className="container">
        <div className="final-cta">
          <div className="inner">
            <div className="hero-eyebrow" style={{ marginInline: "auto" }}>
              <span className="pulse"></span> Closed alpha · Q2 2026
            </div>
            <h2>
              Build your first <span className="gr">colony</span>.<br />
              Watch the demo. Then take a seat.
            </h2>
            <p>
              We're admitting teams in waves. Founder seats are limited. Specs
              and repos with strong context go first.
            </p>
            <form className="waitlist" onSubmit={submit}>
              {!done && (
                <>
                  <input
                    type="email"
                    placeholder="founder@yourcompany.dev"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <button className="btn primary" type="submit">
                    Request invite
                  </button>
                </>
              )}
              {done && (
                <div className="ok">
                  ✓ You're on the list. We'll be in touch.
                </div>
              )}
            </form>
            <div
              style={{
                marginTop: 22,
                fontFamily: "var(--f-pixel)",
                fontSize: 9,
                letterSpacing: ".18em",
                color: "var(--text-lo)",
              }}
            >
              OR ·{" "}
              <a
                href="https://github.com/Agentic-Engineering-Agency/code-colony"
                target="_blank"
                rel="noopener"
              >
                ★ STAR ON GITHUB
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="nav-brand" style={{ marginBottom: 12 }}>
              <div className="logo">C</div>
              <span>
                CODE <span className="accent">COLONY</span>
              </span>
            </div>
            <p
              style={{
                color: "var(--text-md)",
                fontSize: 13,
                maxWidth: "36ch",
                margin: 0,
              }}
            >
              A multiplayer AI company sim where your repo becomes a playable
              world. Build · Orchestrate · Ship.
            </p>
          </div>
          <div>
            <h6>Product</h6>
            <ul>
              <li>
                <a href="#how">How it works</a>
              </li>
              <li>
                <a href="#world">World map</a>
              </li>
              <li>
                <a href="#market">Marketplace</a>
              </li>
              <li>
                <a href="#roadmap">Roadmap</a>
              </li>
            </ul>
          </div>
          <div>
            <h6>Resources</h6>
            <ul>
              <li>
                <a
                  href="https://github.com/Agentic-Engineering-Agency/code-colony"
                  target="_blank"
                  rel="noopener"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a href="docs/design/design-system.html">Design system</a>
              </li>
              <li>
                <a href="#faq">FAQ</a>
              </li>
            </ul>
          </div>
          <div>
            <h6>Company</h6>
            <ul>
              <li>
                <a href="#team">Team</a>
              </li>
              <li>
                <a href="#waitlist">Waitlist</a>
              </li>
              <li>
                <a href="mailto:hello@code-colony.dev">Contact</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="colophon">
          <span>© 2026 Agentic Engineering Agency · Built with Code Colony</span>
          <span>v0.1 · Pre-launch</span>
        </div>
      </div>
    </footer>
  );
}
