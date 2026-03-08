import { useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import EventSection from "@/components/EventSection";
import BroadcastSection from "@/components/BroadcastSection";
import StyleIndexSection from "@/components/StyleIndexSection";
import ArchiveSection from "@/components/ArchiveSection";
import CommunitySection from "@/components/CommunitySection";
import GamificationSection from "@/components/GamificationSection";
import EmailSignup from "@/components/EmailSignup";
import BackToTop from "@/components/BackToTop";
import SplashScreen from "@/components/SplashScreen";

const Index = () => {
  const [splashDone, setSplashDone] = useState(false);
  const handleSplashComplete = useCallback(() => setSplashDone(true), []);

  return (
    <>
      {!splashDone && <SplashScreen onComplete={handleSplashComplete} />}
      <div className="min-h-screen bg-background">
        <Navbar />
        <HeroSection />
        <EventSection />
        <BroadcastSection />
        <StyleIndexSection />
        <ArchiveSection />
        <CommunitySection />
        <EmailSignup />
        <GamificationSection />

        <footer className="py-10 px-4 border-t border-border">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
              <span className="font-display text-xs tracking-[0.15em] text-muted-foreground">
                BPM CTRL © 2026
              </span>
            </div>
            <p className="text-xs font-body text-muted-foreground">
              Dance is the language. Fashion is the expression.
            </p>
          </div>
        </footer>

        <BackToTop />
      </div>
    </>
  );
};

export default Index;
