import { motion } from "framer-motion";
import { Zap, Share2, Shirt, Music, Flame, Lock } from "lucide-react";

const BADGES = [
  { name: "First Transmission", desc: "Joined the signal", icon: Zap, unlocked: true },
  { name: "Frequency Carrier", desc: "Shared the event", icon: Share2, unlocked: false },
  { name: "Style Signal", desc: "Uploaded a rave outfit", icon: Shirt, unlocked: false },
  { name: "Dance Pulse", desc: "Submitted a dance clip", icon: Music, unlocked: false },
  { name: "Bass Survivor", desc: "Attended a BPM CTRL rave", icon: Flame, unlocked: false },
];

interface BadgeGridProps {
  unlockedCount?: number;
}

const BadgeGrid = ({ unlockedCount = 1 }: BadgeGridProps) => {
  return (
    <div className="glow-border-orange rounded-2xl bg-card p-6 md:p-8 relative overflow-hidden">
      <div className="scanline absolute inset-0 pointer-events-none opacity-10 rounded-2xl" />
      <div className="relative z-10">
        <h4 className="font-display text-sm tracking-[0.3em] text-primary uppercase mb-6">
          Badge Collection
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {BADGES.map((badge, i) => {
            const isUnlocked = i < unlockedCount;
            const Icon = isUnlocked ? badge.icon : Lock;
            return (
              <motion.div
                key={badge.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className={`rounded-xl border p-4 text-center transition-all ${
                  isUnlocked
                    ? "bg-primary/10 border-primary/30 glow-border-orange"
                    : "bg-muted/20 border-border opacity-50"
                }`}
              >
                <div className={`w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center ${
                  isUnlocked ? "bg-primary/20" : "bg-muted"
                }`}>
                  <Icon className={`w-5 h-5 ${isUnlocked ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <p className="text-xs font-display tracking-wider text-foreground leading-tight">{badge.name}</p>
                <p className="text-[10px] font-body text-muted-foreground mt-1">{badge.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BadgeGrid;
