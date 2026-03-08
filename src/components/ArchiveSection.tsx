import { motion } from "framer-motion";
import { Play, Image, ExternalLink } from "lucide-react";
import { useSectionContent, getContentValue, getContentJSON } from "@/hooks/useSiteContent";

const iconMap: Record<string, React.ElementType> = { Play, Image, ExternalLink };

const defaultItems = [
  { type: "video", title: "FREQUENCY 000 — Recap", description: "The genesis transmission. Relive the origin.", icon: "Play", link: "#" },
  { type: "gallery", title: "Photo Transmission", description: "Visual signals from the underground.", icon: "Image", link: "#" },
  { type: "external", title: "Community Signals", description: "Social transmissions from the collective.", icon: "ExternalLink", link: "#" },
];

const ArchiveSection = () => {
  const { data: content } = useSectionContent("archive");

  const tagline = getContentValue(content, "archive_tagline", "Decoded Memories");
  const title = getContentValue(content, "archive_title", "TRANSMISSION ARCHIVE");
  const description = getContentValue(content, "archive_description", "Open past rave memories. Every signal leaves a trace.");
  const items = getContentJSON(content, "archive_items", defaultItems);

  return (
    <section id="archive" className="py-24 px-4 relative">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-4"
        >
          <span className="text-xs font-display tracking-[0.4em] text-primary uppercase">{tagline}</span>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item: any, i: number) => {
            const Icon = iconMap[item.icon] || Play;
            return (
              <motion.a
                key={item.title}
                href={item.link || "#"}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ y: -5, scale: 1.01 }}
                className="group block glow-border-orange rounded-xl overflow-hidden cursor-pointer"
              >
                <div className="relative bg-card p-8 h-full">
                  <div className="absolute inset-0 scanline pointer-events-none opacity-30" />
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 group-hover:glow-box transition-all duration-500">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-display text-lg font-bold text-foreground mb-2 tracking-wide">{item.title}</h3>
                    <p className="text-muted-foreground text-sm font-body">{item.description}</p>
                    <div className="mt-6 flex items-center gap-2 text-primary text-xs font-display tracking-[0.2em] uppercase group-hover:gap-3 transition-all">
                      <span>Access</span>
                      <span className="transition-transform group-hover:translate-x-1">→</span>
                    </div>
                  </div>
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ArchiveSection;
