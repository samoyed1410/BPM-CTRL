import { motion } from "framer-motion";
import { Radio } from "lucide-react";

const CommunitySection = () => {
  return (
    <section id="mission" className="py-24 px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px]" />

      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 mb-8">
            <Radio className="w-3.5 h-3.5 text-primary animate-pulse-glow" />
            <span className="text-xs font-display tracking-[0.3em] text-primary uppercase">Community Broadcast</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="glow-border-orange rounded-2xl bg-card p-8 md:p-14 relative"
        >
          <div className="absolute inset-0 scanline pointer-events-none opacity-20 rounded-2xl" />
          <div className="relative z-10">
            <h2 className="font-display text-2xl md:text-4xl font-black text-foreground mb-8 text-glow-orange leading-tight">
              We don't just throw raves.
              <br />
              <span className="gradient-text-orange">We build frequency.</span>
            </h2>

            <div className="space-y-6 text-orange-amber/60 font-body text-base md:text-lg leading-relaxed">
              <p>
                BPM CTRL is more than sound. It's a movement — an underground signal
                connecting those who seek rhythm as release, dance as expression,
                and community as home.
              </p>
              <p>
                We build spaces where every body belongs. Where the bass hits different
                because you're surrounded by people who feel it the same way you do.
              </p>
              <p>
                No hierarchy. No ego. Just pulse.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { emoji: "🔊", text: "Rhythm as Release" },
                { emoji: "🌀", text: "Dance as Expression" },
                { emoji: "🤝", text: "Inclusive Community" },
                { emoji: "⚡", text: "Connected by Pulse" },
              ].map((item) => (
                <div key={item.text} className="text-center py-4 px-2 rounded-lg bg-muted/30 border border-border">
                  <span className="text-2xl block mb-2">{item.emoji}</span>
                  <span className="text-xs font-display tracking-wider text-muted-foreground uppercase">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CommunitySection;
