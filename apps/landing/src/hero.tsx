// Vignette: spec-to-diff inline demo + tweaks-driven hero variants

import { useEffect, useState } from "react";

type HeroProps = {
  headline: string;
  subhead: string;
  onWaitlist: () => void;
};

// ---- Hero variants ----
export function HeroVariantA({ headline, subhead, onWaitlist }: HeroProps) {
  return (
    <div className="hero-grid">
      <div>
        <div className="hero-eyebrow">
          <span className="pulse"></span> Pre-launch · Building in the open
        </div>
        <h1 dangerouslySetInnerHTML={{ __html: headline }} />
        <p className="lead">{subhead}</p>
        <div className="hero-actions">
          <button
            className="btn primary lg"
            onClick={() =>
              document
                .getElementById("demo")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            ▶ Watch the demo
          </button>
          <button className="btn lg" onClick={onWaitlist}>
            Join the waitlist
          </button>
        </div>
        <div className="hero-meta">
          <div className="item">
            <span className="dot"></span>
            <span className="label">Repo → World</span>
          </div>
          <div className="item">
            <span className="dot cy"></span>
            <span className="label">Multiplayer governance</span>
          </div>
          <div className="item">
            <span className="dot gd"></span>
            <span className="label">Persistent agents</span>
          </div>
        </div>
      </div>
      <VideoFrame />
    </div>
  );
}

export function HeroVariantB({ headline, subhead, onWaitlist }: HeroProps) {
  // Centered, video-first, copy below
  return (
    <div style={{ textAlign: "center" }}>
      <div className="hero-eyebrow" style={{ marginInline: "auto" }}>
        <span className="pulse"></span> Pre-launch · Building in the open
      </div>
      <h1
        dangerouslySetInnerHTML={{ __html: headline }}
        style={{ maxWidth: "20ch", margin: "0 auto 22px" }}
      />
      <p className="lead" style={{ margin: "0 auto 28px" }}>
        {subhead}
      </p>
      <div
        className="hero-actions"
        style={{ justifyContent: "center", marginBottom: 36 }}
      >
        <button
          className="btn primary lg"
          onClick={() =>
            document
              .getElementById("demo")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        >
          ▶ Watch the demo
        </button>
        <button className="btn lg" onClick={onWaitlist}>
          Join the waitlist
        </button>
      </div>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <VideoFrame />
      </div>
    </div>
  );
}

export function HeroVariantC({ headline, subhead, onWaitlist }: HeroProps) {
  // Asymmetric: video left, copy right, with a stat strip
  return (
    <div className="hero-grid" style={{ gridTemplateColumns: "1fr 1.05fr" }}>
      <VideoFrame />
      <div>
        <div className="hero-eyebrow">
          <span className="pulse"></span> Pre-launch · v0.1 in flight
        </div>
        <h1 dangerouslySetInnerHTML={{ __html: headline }} />
        <p className="lead">{subhead}</p>
        <div className="hero-actions">
          <button className="btn primary lg" onClick={onWaitlist}>
            Join the waitlist
          </button>
          <button
            className="btn lg"
            onClick={() =>
              document
                .getElementById("how")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            How it works →
          </button>
        </div>
        <div className="hero-meta" style={{ marginTop: 32, gap: 28 }}>
          <div className="item">
            <span className="label" style={{ color: "var(--primary)" }}>
              Specs-first
            </span>
          </div>
          <div className="item">
            <span className="label" style={{ color: "var(--accent)" }}>
              Multiplayer
            </span>
          </div>
          <div className="item">
            <span className="label" style={{ color: "var(--budget)" }}>
              Persistent
            </span>
          </div>
          <div className="item">
            <span className="label" style={{ color: "var(--memory)" }}>
              Self-improving
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function VideoFrame() {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="video-frame">
      <span className="bl"></span>
      <span className="br"></span>
      <div className="video-bar">
        <span className="lights">
          <i className="r"></i>
          <i className="y"></i>
          <i className="g"></i>
        </span>
        <span className="pill">CODE COLONY · DEMO REEL</span>
        <span className="right">90s · 16:9</span>
      </div>
      <div className="video-stage">
        {playing && (
          // TODO(AGE-53): point at production-hosted demo (R2 or /demo route).
          <iframe
            src="../video/Code Colony Demo.html"
            title="Code Colony Demo"
            allow="autoplay"
          />
        )}
        <div
          className={`overlay-poster ${playing ? "hidden" : ""}`}
          onClick={() => setPlaying(true)}
        >
          <div className="poster-bg"></div>
          <div className="poster-tag">▸ PRESS START</div>
          <div className="play-btn"></div>
          <div className="poster-title">
            From repo, to world, to shipped feature
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Spec → Diff Vignette ----
export function Vignette() {
  const [step, setStep] = useState(0); // 0 spec, 1 approve, 2 run, 3 review
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    if (!autoplay) return;
    const timings = [3500, 3000, 5000, 4500];
    const t = setTimeout(() => setStep((s) => (s + 1) % 4), timings[step]);
    return () => clearTimeout(t);
  }, [step, autoplay]);

  const logs: { t: "sys" | "ok" | "warn"; text: string }[] = [
    { t: "sys", text: "▸ Run started · agent: Ada" },
    { t: "ok", text: "▸ Pulled context: 3 specs, 2 ADRs" },
    { t: "sys", text: "▸ Tool: createMagicLinkService()" },
    { t: "ok", text: "▸ Tests added: 8 passing" },
    { t: "warn", text: "▸ Risk delta: −18% on Auth District" },
    { t: "ok", text: "▸ Artifact bundle ready · PR #142" },
  ];

  return (
    <div className="vignette" id="vignette">
      <div className="vignette-bar">
        <span className="ttl">SPEC → DIFF · WORKED EXAMPLE</span>
        <div className="right">
          <span className="badge live">
            <span></span> Auto-playing
          </span>
          <button
            className="btn ghost"
            style={{ padding: "6px 10px", fontSize: 9 }}
            onClick={() => {
              setStep(0);
              setAutoplay(true);
            }}
          >
            ↺ Replay
          </button>
        </div>
      </div>
      <div className="vignette-body">
        {/* SPEC COLUMN */}
        <div className="v-col">
          <h6>① SPEC CARD · DRAWN</h6>
          <div className="v-spec-card">
            <div className="cap">
              <span>SPEC · S-042</span>
              <span>FOUNDER · ADA</span>
            </div>
            <div className="ttl">MAGIC LINK LOGIN</div>
            <div className="desc">
              Add passwordless login using magic-link emails with 10-min TTL.
              Backwards compatible with current sessions.
            </div>
            <div className="stats">
              <span>SCOPE · M</span>
              <span>RISK · HIGH</span>
              <span>EST · 3D</span>
            </div>
          </div>
          <div className="approval-row">
            <span className={`token-pill ${step >= 1 ? "ok" : ""}`}>
              <span className="dot"></span>
              {step >= 1 ? "Approved · 3/3" : "Awaiting votes · 1/3"}
            </span>
          </div>
          <h6 style={{ marginTop: 22 }}>② GOVERNANCE</h6>
          <div className="approval-row">
            <span className={`token-pill ${step >= 1 ? "on" : ""}`}>
              ★ Founder
            </span>
            <span className={`token-pill ${step >= 1 ? "on" : ""}`}>
              ✓ Lead
            </span>
            <span className={`token-pill ${step >= 1 ? "on" : ""}`}>
              ✓ Reviewer
            </span>
          </div>
        </div>

        {/* RUN + DIFF COLUMN */}
        <div className="v-col">
          <h6>③ RUNTIME · OH MY PI</h6>
          <div className="run-log">
            {logs.slice(0, step >= 2 ? 6 : 0).map((l, i) => (
              <span
                key={i}
                className={`l ${l.t} show`}
                style={{ animationDelay: `${i * 0.4}s` }}
              >
                {l.text}
              </span>
            ))}
            {step < 2 && (
              <span
                className="l show"
                style={{ color: "var(--text-faint)" }}
              >
                {"// runtime idle — awaiting approval"}
              </span>
            )}
          </div>

          <h6 style={{ marginTop: 18 }}>④ DIFF · 12 FILES · 8 TESTS</h6>
          <div
            className="diff-block"
            style={{
              opacity: step >= 2 ? 1 : 0.35,
              transition: "opacity .4s",
            }}
          >
            <div className="diff-line">
              <span className="ln">112</span>
              <span className="gut"> </span>
              <span>{"function sendMagicLink(email) {"}</span>
            </div>
            <div className="diff-line rem">
              <span className="ln">113</span>
              <span className="gut">-</span>
              <span>{'  const url = baseUrl + "/login";'}</span>
            </div>
            <div className="diff-line add">
              <span className="ln">114</span>
              <span className="gut">+</span>
              <span>{'  const url = baseUrl + "/magic-link";'}</span>
            </div>
            <div className="diff-line add">
              <span className="ln">115</span>
              <span className="gut">+</span>
              <span>{"  const ttl = 10 * 60 * 1000;"}</span>
            </div>
            <div className="diff-line">
              <span className="ln">116</span>
              <span className="gut"> </span>
              <span>{"  const token = createToken(email);"}</span>
            </div>
            <div className="diff-line">
              <span className="ln">117</span>
              <span className="gut"> </span>
              <span>{"  return mailer.send(email, url, token);"}</span>
            </div>
          </div>
        </div>

        {/* REVIEW COLUMN */}
        <div className="v-col">
          <h6>⑤ ARTIFACT REVIEW</h6>
          <div style={{ display: "grid", gap: 8 }}>
            <div
              className="token-pill on"
              style={{ justifyContent: "space-between" }}
            >
              <span>RISK Δ</span>
              <span style={{ color: "var(--primary)" }}>−18%</span>
            </div>
            <div
              className="token-pill on"
              style={{ justifyContent: "space-between" }}
            >
              <span>TESTS</span>
              <span style={{ color: "var(--primary)" }}>+8 passing</span>
            </div>
            <div
              className="token-pill"
              style={{ justifyContent: "space-between" }}
            >
              <span>CONFIDENCE</span>
              <span style={{ color: "var(--accent)" }}>64%</span>
            </div>
            <div
              className="token-pill"
              style={{ justifyContent: "space-between" }}
            >
              <span>BUDGET</span>
              <span style={{ color: "var(--budget)" }}>$2.40</span>
            </div>
          </div>
          <h6 style={{ marginTop: 18 }}>⑥ DECISIONS</h6>
          <div className="review-row">
            <div
              className="token-circ"
              style={{ opacity: step >= 3 ? 1 : 0.35 }}
            >
              ✓
            </div>
            <div
              className="token-circ w"
              style={{ opacity: step >= 3 ? 1 : 0.35 }}
            >
              ~
            </div>
            <div
              className="token-circ r"
              style={{ opacity: step >= 3 ? 1 : 0.35 }}
            >
              ✗
            </div>
            <span
              style={{
                fontFamily: "var(--f-pixel)",
                fontSize: 9,
                color: "var(--text-lo)",
                letterSpacing: ".12em",
                marginLeft: "auto",
              }}
            >
              3 / 4 VOTED
            </span>
          </div>
          <h6 style={{ marginTop: 18 }}>⑦ MEMORY + SKILL</h6>
          <div style={{ fontSize: 12.5, color: "var(--text-md)" }}>
            <div>
              ↳ Memory:{" "}
              <span style={{ color: "var(--memory)" }}>
                Magic-link flow added
              </span>
            </div>
            <div>
              ↳ Skill:{" "}
              <span style={{ color: "var(--accent)" }}>
                magic-link@v1.3 proposed
              </span>
            </div>
            <div>
              ↳ Trust: Ada{" "}
              <span style={{ color: "var(--primary)" }}>+2</span>
            </div>
          </div>
        </div>
      </div>
      <div className="vignette-controls">
        <span
          style={{
            fontFamily: "var(--f-pixel)",
            fontSize: 9,
            color: "var(--text-lo)",
            letterSpacing: ".16em",
          }}
        >
          STAGE
        </span>
        <div className="step-track">
          {["SPEC", "APPROVE", "RUN", "REVIEW"].map((label, i) => (
            <div
              key={i}
              className={`step-cell ${
                step === i ? "cur" : i < step ? "on" : ""
              }`}
              onClick={() => {
                setAutoplay(false);
                setStep(i);
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
