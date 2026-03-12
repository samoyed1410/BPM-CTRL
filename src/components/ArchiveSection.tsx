import { motion } from "framer-motion";
import { Play, Image, ExternalLink, Music, Video } from "lucide-react";
import { useSectionContent, getContentValue, getContentJSON } from "@/hooks/useSiteContent";
import { useSiteAssets } from "@/hooks/useSiteAssets";

const iconMap: Record<string, React.ElementType> = { Play, Image, ExternalLink, Music, Video };

const defaultItems = [
  { type: "video", title: "FREQUENCY 000 — Recap", description: "The genesis transmission. Relive the origin.", icon: "Play", link: "#" },
  { type: "gallery", title: "Photo Transmission", description: "Visual signals from the underground.", icon: "Image", link: "#" },
  { type: "external", title: "Community Signals", description: "Social transmissions from the collective.", icon: "ExternalLink", link: "#" },
];

const isEmbeddable = (url: string) => {
  return url.includes("youtube.com") || url.includes("youtu.be") || url.includes("vimeo.com") || url.includes("soundcloud.com");
};

const getEmbedUrl = (url: string) => {
  if (url.includes("youtube.com/watch")) {
    const id = new URL(url).searchParams.get("v");
    return `https://www.youtube.com/embed/${id}`;
  }
  if (url.includes("youtu.be/")) {
    const id = url.split("youtu.be/")[1]?.split("?")[0];
    return `https://www.youtube.com/embed/${id}`;
  }
  if (url.includes("vimeo.com/")) {
    const id = url.split("vimeo.com/")[1]?.split("?")[0];
    return `https://player.vimeo.com/video/${id}`;
  }
  return url;
};

const ArchiveSection = () => {
  const { data: content } = useSectionContent("archive");
  const { data: assets } = useSiteAssets("archive");

  const tagline = getContentValue(content, "archive_tagline", "Decoded Memories");
  const title = getContentValue(content, "archive_title", "TRANSMISSION ARCHIVE");
  const description = getContentValue(content, "archive_description", "Open past rave memories. Every signal leaves a trace.");
  const fallbackItems = getContentJSON(content, "archive_items", defaultItems);

  const hasAssets = assets && assets.length > 0;

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

        {hasAssets ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assets.map((asset, i) => (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group glow-border-orange rounded-xl overflow-hidden"
              >
                <div className="relative bg-card h-full">
                  {asset.asset_type === "audio" ? (
                    <div className="p-6">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                        <Music className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-display text-lg font-bold text-foreground mb-2 tracking-wide">{asset.name}</h3>
                      {asset.description && <p className="text-muted-foreground text-sm font-body mb-4">{asset.description}</p>}
                      <audio controls className="w-full" preload="none">
                        <source src={asset.public_url} />
                      </audio>
                    </div>
                  ) : asset.asset_type === "video" ? (
                    <div>
                      {isEmbeddable(asset.public_url) ? (
                        <div className="aspect-video">
                          <iframe
                            src={getEmbedUrl(asset.public_url)}
                            className="w-full h-full"
                            allowFullScreen
                            allow="autoplay; encrypted-media"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <video controls className="w-full aspect-video object-cover" preload="none">
                          <source src={asset.public_url} />
                        </video>
                      )}
                      <div className="p-5">
                        <h3 className="font-display text-lg font-bold text-foreground mb-1 tracking-wide">{asset.name}</h3>
                        {asset.description && <p className="text-muted-foreground text-sm font-body">{asset.description}</p>}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="aspect-[4/3] overflow-hidden">
                        <img src={asset.public_url} alt={asset.name} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                      <div className="p-5">
                        <h3 className="font-display text-lg font-bold text-foreground mb-1 tracking-wide">{asset.name}</h3>
                        {asset.description && <p className="text-muted-foreground text-sm font-body">{asset.description}</p>}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {fallbackItems.map((item: any, i: number) => {
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
        )}
      </div>
    </section>
  );
};

export default ArchiveSection;
