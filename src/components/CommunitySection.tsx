import { motion } from "framer-motion";
import { Radio } from "lucide-react";
import iconSpeaker from "@/assets/icon-speaker.png";
import iconDancer from "@/assets/icon-dancer.png";
import iconFashion from "@/assets/icon-fashion.png";
import iconCommunity from "@/assets/icon-community.png";

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
              <span className="gradient-text-orange">We build culture.</span>
            </h2>

            <div className="space-y-6 text-orange-amber/60 font-body text-base md:text-lg leading-relaxed">
              <p>
                BPM CTRL is a Nigerian-born movement rooted in Afro house, underground 
                dance energy, and fashion expression. We transmit a signal that connects 
                those who move to the same frequency.
              </p>
              <p>
                Dance is spiritual release. Fashion is personal expression. 
                Together they form the language of our community — a space where 
                every body belongs and the bass hits different.
              </p>
              <p>
                No hierarchy. No ego. Just pulse.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { img: iconSpeaker, text: "Afro House Culture" },
                { img: iconDancer, text: "Dance as Language" },
                { img: iconFashion, text: "Fashion Expression" },
                { img: iconCommunity, text: "Inclusive Community" },
              ].map((item) => (
                <div key={item.text} className="text-center py-4 px-2 rounded-lg bg-muted/30 border border-border">
                  <img src={item.img} alt={item.text} className="w-10 h-10 mx-auto mb-2 object-contain" />
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
