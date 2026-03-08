import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Shield, Radio, Crown, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

const LEVELS = [
  { name: "Signal Receiver", icon: Radio, xpNeeded: 0, color: "text-orange-amber" },
  { name: "Frequency Walker", icon: Zap, xpNeeded: 100, color: "text-orange-rave" },
  { name: "Pulse Rider", icon: Shield, xpNeeded: 300, color: "text-orange-neon" },
  { name: "Rhythm Controller", icon: Crown, xpNeeded: 600, color: "text-primary" },
];

// Next rave countdown target
const NEXT_RAVE = new Date("2026-06-01T22:00:00");

const useCountdown = (target: Date) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, target.getTime() - Date.now());
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
        secs: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  return timeLeft;
};

const GamificationSection = () => {
  const [alias, setAlias] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [showSecret, setShowSecret] = useState(false);
  const [badgeUnlocked, setBadgeUnlocked] = useState(false);
  const countdown = useCountdown(NEXT_RAVE);

  const handleSubmit = () => {
    if (!alias.trim()) return;
    setSubmitted(true);

    // Simulate badge unlock
    setTimeout(() => {
      setBadgeUnlocked(true);
      setCurrentLevel(1);
    }, 1500);

    // Show secret after interaction
    setTimeout(() => {
      setShowSecret(true);
    }, 3000);
  };

  const level = LEVELS[currentLevel];
  const LevelIcon = level.icon;
  const progress = submitted ? ((currentLevel + 1) / LEVELS.length) * 100 : 0;

  return (
    <section id="signal" className="py-24 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-orange-deep/5 to-background" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />

      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-4"
        >
          <span className="text-xs font-display tracking-[0.4em] text-primary uppercase">Interactive Protocol</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-center font-display text-4xl md:text-6xl font-black gradient-text-orange mb-16"
        >
          JOIN THE BPM SIGNAL
        </motion.h2>

        {/* Alias Input */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="glow-border-orange rounded-2xl bg-card p-8 md:p-12 mb-8"
        >
          <div className="scanline absolute inset-0 pointer-events-none opacity-20 rounded-2xl" />

          {!submitted ? (
            <div className="relative z-10 text-center">
              <p className="text-muted-foreground font-body mb-6">Enter your rave alias to activate your signal identity.</p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="text"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder="Your rave alias..."
                  className="flex-1 bg-muted border border-border rounded-lg px-4 py-3 text-foreground font-body placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:glow-border-orange transition-all"
                />
                <Button variant="neon" size="lg" onClick={handleSubmit}>
                  Activate
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative z-10">
              {/* Identity card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center mb-8"
              >
                <p className="text-xs font-display tracking-[0.3em] text-muted-foreground uppercase mb-2">Signal Identity</p>
                <h3 className="font-display text-3xl font-black text-foreground text-glow-orange mb-1">{alias.toUpperCase()}</h3>
                <p className={`font-display text-sm tracking-[0.2em] uppercase ${level.color}`}>
                  <LevelIcon className="w-4 h-4 inline mr-2" />
                  {level.name}
                </p>
              </motion.div>

              {/* Progress bar */}
              <div className="mb-8">
                <div className="flex justify-between text-xs font-display text-muted-foreground mb-2 tracking-wider">
                  <span>Level {currentLevel + 1}</span>
                  <span>{LEVELS.length} Levels</span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                    className="h-full rounded-full gradient-bg-orange"
                    style={{ boxShadow: "0 0 15px hsl(22 100% 55% / 0.5)" }}
                  />
                </div>
              </div>

              {/* Badge unlock animation */}
              <AnimatePresence>
                {badgeUnlocked && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="flex items-center justify-center gap-3 py-4 px-6 rounded-lg bg-primary/10 border border-primary/30 glow-box mb-8"
                  >
                    <Zap className="w-5 h-5 text-primary" />
                    <span className="font-display text-sm tracking-wider text-primary uppercase">
                      Badge Unlocked: Signal Receiver
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Levels grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                {LEVELS.map((lvl, i) => {
                  const Icon = lvl.icon;
                  const unlocked = i <= currentLevel;
                  return (
                    <div
                      key={lvl.name}
                      className={`rounded-lg border p-4 text-center transition-all ${
                        unlocked
                          ? "bg-muted/50 border-primary/20 glow-border-orange"
                          : "bg-muted/20 border-border opacity-40"
                      }`}
                    >
                      {unlocked ? (
                        <Icon className={`w-5 h-5 mx-auto mb-2 ${lvl.color}`} />
                      ) : (
                        <Lock className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                      )}
                      <p className="text-xs font-display tracking-wider text-foreground">{lvl.name}</p>
                    </div>
                  );
                })}
              </div>

              {/* Leaderboard teaser */}
              <div className="rounded-lg border border-border bg-muted/30 p-5">
                <h4 className="font-display text-sm tracking-[0.2em] text-primary uppercase mb-4">Community Leaderboard</h4>
                {[
                  { name: "SPECTR4L", level: "Rhythm Controller", xp: 620 },
                  { name: "N1GHT.WAV", level: "Pulse Rider", xp: 445 },
                  { name: alias.toUpperCase() || "YOU", level: level.name, xp: 50, isUser: true },
                ].map((user, i) => (
                  <div
                    key={user.name}
                    className={`flex items-center justify-between py-2.5 ${i > 0 ? "border-t border-border" : ""} ${
                      user.isUser ? "text-primary" : "text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-display text-muted-foreground w-5">#{i + 1}</span>
                      <span className="text-sm font-body">{user.name}</span>
                    </div>
                    <span className="text-xs font-display tracking-wider text-muted-foreground">{user.xp} XP</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glow-border-orange rounded-xl bg-card p-6 md:p-8 text-center"
        >
          <p className="text-xs font-display tracking-[0.3em] text-muted-foreground uppercase mb-4">Next Signal Transmission</p>
          <div className="flex justify-center gap-4 md:gap-8">
            {[
              { value: countdown.days, label: "Days" },
              { value: countdown.hours, label: "Hrs" },
              { value: countdown.mins, label: "Min" },
              { value: countdown.secs, label: "Sec" },
            ].map((unit) => (
              <div key={unit.label}>
                <p className="font-display text-3xl md:text-5xl font-black text-foreground text-glow-orange">
                  {String(unit.value).padStart(2, "0")}
                </p>
                <p className="text-xs font-display tracking-wider text-muted-foreground uppercase mt-1">{unit.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Secret access */}
        <AnimatePresence>
          {showSecret && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="mt-8"
            >
              <div className="glow-border-orange rounded-xl bg-card p-8 md:p-10 text-center relative overflow-hidden">
                <div className="scanline absolute inset-0 pointer-events-none opacity-30" />
                <div className="relative z-10">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Lock className="w-6 h-6 text-primary mx-auto mb-4 animate-pulse-glow" />
                    <h3 className="font-display text-xl font-black text-foreground text-glow-orange mb-2">
                      SECRET ACCESS UNLOCKED
                    </h3>
                    <p className="text-muted-foreground text-sm font-body mb-6">
                      You've been granted access to the hidden signal. Early ticket drops,
                      secret event announcements, and encrypted community messages await.
                    </p>
                    <Button variant="neon" size="lg">
                      Enter the Hidden Channel
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default GamificationSection;
