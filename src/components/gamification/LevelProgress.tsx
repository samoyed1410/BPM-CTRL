import { motion } from "framer-motion";
import { Zap, Shield, Radio, Crown, Lock } from "lucide-react";

export const LEVELS = [
  { name: "Signal Receiver", icon: Radio, xpNeeded: 0, color: "text-orange-amber" },
  { name: "Frequency Walker", icon: Zap, xpNeeded: 100, color: "text-orange-rave" },
  { name: "Pulse Rider", icon: Shield, xpNeeded: 300, color: "text-orange-neon" },
  { name: "Rhythm Controller", icon: Crown, xpNeeded: 600, color: "text-primary" },
  { name: "Bass Architect", icon: Zap, xpNeeded: 1000, color: "text-orange-neon" },
];

interface LevelProgressProps {
  currentLevel: number;
  xp: number;
}

const LevelProgress = ({ currentLevel, xp }: LevelProgressProps) => {
  const nextLevel = LEVELS[currentLevel + 1];
  const currentLevelData = LEVELS[currentLevel];
  const progressToNext = nextLevel
    ? ((xp - currentLevelData.xpNeeded) / (nextLevel.xpNeeded - currentLevelData.xpNeeded)) * 100
    : 100;

  return (
    <div className="glow-border-orange rounded-2xl bg-card p-6 md:p-8 relative overflow-hidden">
      <div className="scanline absolute inset-0 pointer-events-none opacity-10 rounded-2xl" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-display text-sm tracking-[0.3em] text-primary uppercase">Signal Level</h4>
          <span className="font-display text-xs text-muted-foreground">{xp} XP</span>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="h-4 rounded-full bg-muted overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progressToNext, 100)}%` }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
              className="h-full rounded-full gradient-bg-orange relative"
              style={{ boxShadow: "0 0 15px hsl(22 100% 55% / 0.5)" }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse-glow" />
            </motion.div>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[10px] font-display text-muted-foreground tracking-wider">
              {currentLevelData.name}
            </span>
            {nextLevel && (
              <span className="text-[10px] font-display text-muted-foreground tracking-wider">
                {nextLevel.name} → {nextLevel.xpNeeded} XP
              </span>
            )}
          </div>
        </div>

        {/* Level tiles */}
        <div className="grid grid-cols-5 gap-2">
          {LEVELS.map((lvl, i) => {
            const Icon = i <= currentLevel ? lvl.icon : Lock;
            const unlocked = i <= currentLevel;
            return (
              <motion.div
                key={lvl.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * i }}
                className={`rounded-lg border p-2.5 text-center transition-all ${
                  unlocked
                    ? "bg-primary/10 border-primary/30"
                    : "bg-muted/20 border-border opacity-40"
                } ${i === currentLevel ? "glow-border-orange" : ""}`}
              >
                <Icon className={`w-4 h-4 mx-auto mb-1 ${unlocked ? lvl.color : "text-muted-foreground"}`} />
                <p className="text-[9px] font-display tracking-wider text-foreground leading-tight hidden sm:block">
                  {lvl.name}
                </p>
                <p className="text-[9px] font-display text-muted-foreground sm:hidden">Lv.{i + 1}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LevelProgress;
