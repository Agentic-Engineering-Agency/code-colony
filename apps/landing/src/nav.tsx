// Top nav + ticker + waitlist modal + Tweaks integration

import { useEffect, useState } from "react";

export function TopNav({ onWaitlist }: { onWaitlist: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header className={`nav ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-inner">
        <a className="nav-brand" href="#top">
          <div className="logo">C</div>
          <span>
            CODE <span className="accent">COLONY</span>
          </span>
          <span className="nav-pill">v0.1 · Pre-launch</span>
        </a>
        <nav className="nav-links">
          <a href="#how">How</a>
          <a href="#world">World</a>
          <a href="#agents">Agents</a>
          <a href="#market">Market</a>
          <a href="#roadmap">Roadmap</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div className="nav-actions">
          <a
            className="btn ghost"
            href="https://github.com/Agentic-Engineering-Agency/code-colony"
            target="_blank"
            rel="noopener"
          >
            ★ GitHub
          </a>
          <button className="btn primary" onClick={onWaitlist}>
            Join waitlist
          </button>
        </div>
      </div>
    </header>
  );
}

export function StatusTicker() {
  const items = [
    "◆ M2 Spec Governance · in flight",
    "✓ 142 PRs merged through artifact review (dogfood repo)",
    "★ Repo → World scan: avg 38s on a 12k-file mono",
    "◐ Closed alpha invites: rolling waves · Q2 2026",
    "⏚ MCP packs · 14 in marketplace",
    "⊕ Memory ledger · multiplayer-live on Convex",
  ];
  const all = [...items, ...items];
  return (
    <div className="ticker">
      <div className="track">
        {all.map((t, i) => (
          <span key={i} className="item">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

export function WaitlistModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("founder");
  const [repo, setRepo] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) {
      setDone(false);
      setEmail("");
      setRepo("");
    }
  }, [open]);

  if (!open) return null;
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="x" onClick={onClose}>
          ✕
        </button>
        {!done ? (
          <>
            <div className="hero-eyebrow">
              <span className="pulse"></span> Founder seat · Closed alpha
            </div>
            <h3>Take a seat at the table.</h3>
            <p>
              We're onboarding a small wave of teams to build colonies on real
              repos. Tell us a bit and we'll send a code.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (email.includes("@")) setDone(true);
              }}
            >
              <label>Email</label>
              <input
                type="email"
                required
                placeholder="founder@yourcompany.dev"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label>Your role</label>
              <div className="role-row">
                {(
                  [
                    ["founder", "Founder"],
                    ["lead", "Eng Lead"],
                    ["ic", "IC dev"],
                    ["eng-mgr", "Eng Mgr"],
                  ] as const
                ).map(([k, l]) => (
                  <button
                    type="button"
                    key={k}
                    className={`role-chip ${role === k ? "on" : ""}`}
                    onClick={() => setRole(k)}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <label>Repo (optional — repos with strong specs go first)</label>
              <input
                type="text"
                placeholder="github.com/your-org/your-repo"
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
              />
              <div className="modal-actions">
                <button type="button" className="btn" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn primary">
                  Request invite
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="ok-state">
            <div className="big">✓</div>
            <h3>You're on the list.</h3>
            <p>
              We'll be in touch when the next wave opens. In the meantime, the
              demo, the GitHub, and the docs are open.
            </p>
            <div
              className="modal-actions"
              style={{ justifyContent: "center" }}
            >
              <button className="btn" onClick={onClose}>
                Close
              </button>
              <a
                className="btn primary"
                href="https://github.com/Agentic-Engineering-Agency/code-colony"
                target="_blank"
                rel="noopener"
              >
                ★ Star on GitHub
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
