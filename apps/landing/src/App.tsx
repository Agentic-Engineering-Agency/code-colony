// Code Colony landing page — root app

import { useEffect, useState } from "react";
import { TopNav, StatusTicker, WaitlistModal } from "./nav";
import { HeroVariantA, HeroVariantB, HeroVariantC } from "./hero";
import {
  ProblemsSection,
  PillarsSection,
  HowItWorksSection,
  WorldSection,
  RosterSection,
  MarketSection,
  StackSection,
  RoadmapSection,
  TeamSection,
  FAQSection,
  FinalCTASection,
  Footer,
} from "./sections";
import {
  TweaksPanel,
  TweakSection,
  TweakRadio,
  TweakText,
  TweakToggle,
  useTweaks,
} from "./tweaks-panel";

const DEFAULTS = /*EDITMODE-BEGIN*/ {
  heroVariant: "A",
  headline: "Run an AI company<br/>like a <em>real</em> team.",
  subhead:
    "Code Colony turns your repo into a playable world. Specs get drawn. Agents get dispatched. Diffs come back as artifact bundles your humans actually review. Lessons compound.",
  theme: "dark",
  accent: "green",
  showMarketplace: true,
  tickerOn: true,
} /*EDITMODE-END*/;

export function App() {
  const [tw, setTw] = useTweaks(DEFAULTS);
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  // Apply theme + accent to root via data attrs so CSS reacts
  useEffect(() => {
    document.documentElement.dataset.theme = tw.theme || "dark";
    document.documentElement.dataset.accent = tw.accent || "green";
  }, [tw.theme, tw.accent]);

  const Hero =
    tw.heroVariant === "B"
      ? HeroVariantB
      : tw.heroVariant === "C"
        ? HeroVariantC
        : HeroVariantA;

  return (
    <>
      <TopNav onWaitlist={() => setWaitlistOpen(true)} />
      {tw.tickerOn && <StatusTicker />}
      <div id="top" aria-hidden="true" />
      <section className="hero" id="hero">
        <div className="container">
          <Hero
            headline={tw.headline}
            subhead={tw.subhead}
            onWaitlist={() => setWaitlistOpen(true)}
          />
        </div>
      </section>

      <ProblemsSection />
      <PillarsSection />
      <HowItWorksSection />
      <WorldSection />
      <RosterSection />
      {tw.showMarketplace && <MarketSection />}
      <StackSection />
      <RoadmapSection />
      <TeamSection />
      <FAQSection />
      <FinalCTASection />
      <Footer />

      <WaitlistModal
        open={waitlistOpen}
        onClose={() => setWaitlistOpen(false)}
      />

      <TweaksPanel title="Tweaks · Landing">
        <TweakSection title="Hero">
          <TweakRadio
            label="Variant"
            value={tw.heroVariant}
            options={[
              { value: "A", label: "Split" },
              { value: "B", label: "Centered" },
              { value: "C", label: "Reverse" },
            ]}
            onChange={(v) => setTw("heroVariant", v)}
          />
          <TweakText
            label="Headline (HTML)"
            value={tw.headline}
            onChange={(v) => setTw("headline", v)}
            multiline
          />
          <TweakText
            label="Subhead"
            value={tw.subhead}
            onChange={(v) => setTw("subhead", v)}
            multiline
          />
        </TweakSection>
        <TweakSection title="Theme">
          <TweakRadio
            label="Mode"
            value={tw.theme}
            options={[
              { value: "dark", label: "Night" },
              { value: "dusk", label: "Dusk" },
              { value: "parchment", label: "Parchment" },
            ]}
            onChange={(v) => setTw("theme", v)}
          />
          <TweakRadio
            label="Accent"
            value={tw.accent}
            options={[
              { value: "green", label: "Colony" },
              { value: "cyan", label: "Signal" },
              { value: "amber", label: "Hearth" },
            ]}
            onChange={(v) => setTw("accent", v)}
          />
        </TweakSection>
        <TweakSection title="Sections">
          <TweakToggle
            label="Show marketplace"
            value={tw.showMarketplace}
            onChange={(v) => setTw("showMarketplace", v)}
          />
          <TweakToggle
            label="Status ticker"
            value={tw.tickerOn}
            onChange={(v) => setTw("tickerOn", v)}
          />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}
