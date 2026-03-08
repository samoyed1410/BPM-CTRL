import { motion } from "framer-motion";

const UserStats = () => {
  const level = 12;
  const xp = 2340;
  const xpNeeded = 3000;
  const progress = (xp / xpNeeded) * 100;

  return (
    <section className="py-24 px-4 relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-neon-purple/5 animate-blob-morph blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-neon-pink/5 animate-blob-morph blur-3xl" style={{ animationDelay: "3s" }} />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-neon-lime font-body text-sm tracking-[0.3em] uppercase mb-3">Your Progress</p>
          <h2 className="font-display text-4xl md:text-6xl font-black gradient-text-psychedelic">
            Level Up
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-card border border-border rounded-2xl p-8 md:p-12"
        >
          {/* Level display */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-muted-foreground text-sm font-body">Current Level</p>
              <p className="font-display text-5xl font-black text-neon-cyan text-glow-cyan">{level}</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground text-sm font-body">Next Level</p>
              <p className="font-display text-5xl font-black text-muted-foreground/30">{level + 1}</p>
            </div>
          </div>

          {/* XP Bar */}
          <div className="mb-3">
            <div className="h-4 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${progress}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                className="h-full rounded-full"
                style={{ background: "var(--gradient-psychedelic)" }}
              />
            </div>
          </div>
          <p className="text-muted-foreground text-sm font-body text-center">
            <span className="text-foreground font-semibold">{xp.toLocaleString()}</span> / {xpNeeded.toLocaleString()} XP
          </p>

          {/* Recent activity */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Events Attended", value: "24", icon: "🎵" },
              { label: "Badges Earned", value: "4/8", icon: "🏆" },
              { label: "Streak", value: "3 weeks", icon: "🔥" },
            ].map((item) => (
              <div key={item.label} className="bg-muted/50 rounded-xl p-5 text-center">
                <span className="text-2xl mb-2 block">{item.icon}</span>
                <p className="font-display text-xl font-bold text-foreground">{item.value}</p>
                <p className="text-muted-foreground text-xs tracking-wider uppercase">{item.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default UserStats;
