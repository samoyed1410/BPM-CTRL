import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useSectionContent, getContentValue, getContentJSON } from "@/hooks/useSiteContent";
import { useSiteAssets } from "@/hooks/useSiteAssets";

const defaultItems = [
  { title: "NEON ARMOUR", category: "Streetwear", description: "Reflective layers meet underground attitude." },
  { title: "PULSE DRIP", category: "Rave Fashion", description: "When the outfit speaks louder than the bass." },
  { title: "FREQUENCY FIT", category: "Creative", description: "Art meets movement. Fashion as signal." },
  { title: "SIGNAL WEAR", category: "Best Dressed", description: "Community pick — the look that stopped the floor." },
  { title: "GLOW PROTOCOL", category: "Accessories", description: "Details that light up the dark." },
  { title: "BASS COUTURE", category: "Editorial", description: "Where high fashion meets low frequencies." },
];

const StyleIndexSection = () => {
  const { data: content } = useSectionContent("style");
  const { data: assets } = useSiteAssets("style");

  const tagline = getContentValue(content, "style_tagline", "Fashion × Frequency");
  const title = getContentValue(content, "style_title", "BPM CTRL STYLE INDEX");
  const description = getContentValue(content, "style_description", "Rave culture is fashion culture. Explore the looks that define the movement.");

  // Use uploaded assets if available, otherwise fall back to content JSON items
  const hasAssets = assets && assets.length > 0;
  const contentItems = getContentJSON(content, "style_items", defaultItems);

  return (
    <section id="style" className="py-24 px-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-orange-neon/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] bg-orange-amber/5 rounded-full blur-[100px]" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse-glow" />
            <span className="text-xs font-display tracking-[0.3em] text-primary uppercase">{tagline}</span>
          </div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-center font-display text-4xl md:text-6xl font-black gradient-text-orange mb-6"
        >
          {title}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-center text-muted-foreground font-body max-w-xl mx-auto mb-16"
        >
          {description}
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {hasAssets
            ? assets.map((asset, i) => (
                <motion.div
                  key={asset.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -6 }}
                  className="group relative"
                >
                  <div className="aspect-[3/4] rounded-xl overflow-hidden glow-border-orange bg-card relative">
                    <img
                      src={asset.public_url}
                      alt={asset.name}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-10" />
                    <div className="absolute inset-0 scanline pointer-events-none opacity-10" />
                    <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
                      <span className="text-[10px] font-display tracking-[0.3em] text-primary uppercase">
                        {asset.description || asset.asset_type}
                      </span>
                      <h3 className="font-display text-lg font-bold text-foreground mt-1 tracking-wide">{asset.name}</h3>
                    </div>
                  </div>
                </motion.div>
              ))
            : contentItems.map((item: any, i: number) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -6 }}
                  className="group relative"
                >
                  <div className="aspect-[3/4] rounded-xl overflow-hidden glow-border-orange bg-card relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10" />
                    <div className="absolute inset-0 scanline pointer-events-none opacity-10" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full border border-primary/20 animate-signal-pulse" />
                      <div className="absolute w-32 h-32 rounded-full border border-primary/10 animate-pulse-glow" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
                      <span className="text-[10px] font-display tracking-[0.3em] text-primary uppercase">{item.category}</span>
                      <h3 className="font-display text-lg font-bold text-foreground mt-1 tracking-wide">{item.title}</h3>
                      <p className="text-muted-foreground text-xs font-body mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
        </div>
      </div>
    </section>
  );
};

export default StyleIndexSection;
