import { motion } from "framer-motion";
import { Zap, Music, Star, Heart, Flame, Crown, Ghost, Sparkles } from "lucide-react";

const badges = [
  { icon: Zap, name: "First Drop", desc: "Attended your first rave", color: "neon-cyan", unlocked: true },
  { icon: Music, name: "Sound Chaser", desc: "Attended 5 different venues", color: "neon-pink", unlocked: true },
  { icon: Star, name: "Night Owl", desc: "Stayed until closing 3 times", color: "neon-lime", unlocked: true },
  { icon: Heart, name: "Crew Leader", desc: "Brought 10 friends to events", color: "neon-orange", unlocked: true },
  { icon: Flame, name: "On Fire", desc: "Attended 3 events in one week", color: "neon-pink", unlocked: false },
  { icon: Crown, name: "Rave Royalty", desc: "Reached Level 25", color: "neon-purple", unlocked: false },
  { icon: Ghost, name: "Afterhours", desc: "Checked in after 4AM", color: "neon-cyan", unlocked: false },
  { icon: Sparkles, name: "Legend", desc: "Earned all other badges", color: "neon-lime", unlocked: false },
];

const colorMap: Record<string, string> = {
  "neon-cyan": "text-neon-cyan border-neon-cyan/30 shadow-[0_0_15px_hsl(180_100%_55%/0.3)]",
  "neon-pink": "text-neon-pink border-neon-pink/30 shadow-[0_0_15px_hsl(320_100%_60%/0.3)]",
  "neon-lime": "text-neon-lime border-neon-lime/30 shadow-[0_0_15px_hsl(90_100%_55%/0.3)]",
  "neon-orange": "text-neon-orange border-neon-orange/30 shadow-[0_0_15px_hsl(30_100%_55%/0.3)]",
  "neon-purple": "text-neon-purple border-neon-purple/30 shadow-[0_0_15px_hsl(270_100%_65%/0.3)]",
};

const BadgeGrid = () => {
  return (
    <section className="py-24 px-4 relative">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-neon-pink font-body text-sm tracking-[0.3em] uppercase mb-3">Collect Them All</p>
          <h2 className="font-display text-4xl md:text-6xl font-black gradient-text-psychedelic">
            Badges & Achievements
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {badges.map((badge, i) => {
            const Icon = badge.icon;
            return (
              <motion.div
                key={badge.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={badge.unlocked ? { scale: 1.05, y: -5 } : undefined}
                className={`relative rounded-xl border p-6 text-center transition-all ${
                  badge.unlocked
                    ? `bg-card ${colorMap[badge.color]}`
                    : "bg-muted/30 border-border opacity-40 grayscale"
                }`}
              >
                <div className={`inline-flex p-3 rounded-full mb-3 ${badge.unlocked ? "bg-muted" : "bg-muted/50"}`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="font-display font-bold text-foreground text-sm mb-1">{badge.name}</h3>
                <p className="text-muted-foreground text-xs">{badge.desc}</p>
                {!badge.unlocked && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl">
                    <span className="text-xs font-body tracking-wider uppercase text-muted-foreground">Locked</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BadgeGrid;
