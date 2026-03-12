import { motion } from "framer-motion";
import { Play, Mic, Users, Radio, Music, Video } from "lucide-react";
import { useSectionContent, getContentValue, getContentJSON } from "@/hooks/useSiteContent";
import { useSiteAssets } from "@/hooks/useSiteAssets";

const iconMap: Record<string, React.ElementType> = { Play, Mic, Users, Radio, Music, Video };

const defaultItems = [
  { type: "DJ Set", title: "AFRO FREQUENCY — Live Set", description: "Full DJ set from the last underground transmission.", icon: "Play", tag: "VIDEO" },
  { type: "Crowd Moment", title: "THE FLOOR SPEAKS", description: "Raw crowd energy captured in motion.", icon: "Users", tag: "MOMENT" },
  { type: "Dance Clip", title: "BODY SIGNAL 003", description: "Movement is the message. Watch the language.", icon: "Radio", tag: "DANCE" },
  { type: "Interview", title: "SIGNAL CARRIER — DJ ÌFÉ", description: "In conversation with the sound architect.", icon: "Mic", tag: "INTERVIEW" },
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

const BroadcastSection = () => {
  const { data: content } = useSectionContent("broadcast");
  const { data: assets } = useSiteAssets("broadcast");

  const tagline = getContentValue(content, "broadcast_tagline", "Live Transmissions");
  const title = getContentValue(content, "broadcast_title", "BPM CTRL BROADCAST");
  const description = getContentValue(content, "broadcast_description", "DJ sets, crowd moments, dance clips, and artist interviews — the signal never stops.");
  const fallbackItems = getContentJSON(content, "broadcast_items", defaultItems);

  const hasAssets = assets && assets.length > 0;

  return (
    <section id="broadcast" className="py-24 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-orange-deep/5 to-background" />

      <div className="max-w-5xl mx-auto relative z-10">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                    <div className="p-6 md:p-8">
                      <div className="flex items-start justify-between mb-5">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                          <Music className="w-5 h-5 text-primary" />
                        </div>
                        <span className="px-2.5 py-1 rounded-full border border-primary/30 text-[10px] font-display tracking-[0.2em] text-primary uppercase">
                          AUDIO
                        </span>
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
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-display text-lg font-bold text-foreground tracking-wide">{asset.name}</h3>
                          <span className="px-2.5 py-1 rounded-full border border-primary/30 text-[10px] font-display tracking-[0.2em] text-primary uppercase">
                            VIDEO
                          </span>
                        </div>
                        {asset.description && <p className="text-muted-foreground text-sm font-body">{asset.description}</p>}
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 md:p-8">
                      <div className="flex items-start justify-between mb-5">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:glow-box transition-all duration-500">
                          <Play className="w-5 h-5 text-primary" />
                        </div>
                        <span className="px-2.5 py-1 rounded-full border border-primary/30 text-[10px] font-display tracking-[0.2em] text-primary uppercase">
                          {asset.asset_type.toUpperCase()}
                        </span>
                      </div>
                      {asset.public_url && (
                        <div className="aspect-[4/3] rounded-lg overflow-hidden mb-4">
                          <img src={asset.public_url} alt={asset.name} className="w-full h-full object-cover" loading="lazy" />
                        </div>
                      )}
                      <h3 className="font-display text-lg font-bold text-foreground mb-2 tracking-wide">{asset.name}</h3>
                      {asset.description && <p className="text-muted-foreground text-sm font-body">{asset.description}</p>}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {fallbackItems.map((item: any, i: number) => {
              const Icon = iconMap[item.icon] || Play;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="group glow-border-orange rounded-xl overflow-hidden cursor-pointer"
                >
                  <div className="relative bg-card p-6 md:p-8 h-full">
                    <div className="absolute inset-0 scanline pointer-events-none opacity-20 rounded-xl" />
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-5">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:glow-box transition-all duration-500">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <span className="px-2.5 py-1 rounded-full border border-primary/30 text-[10px] font-display tracking-[0.2em] text-primary uppercase">
                          {item.tag}
                        </span>
                      </div>
                      <h3 className="font-display text-lg font-bold text-foreground mb-2 tracking-wide">{item.title}</h3>
                      <p className="text-muted-foreground text-sm font-body">{item.description}</p>
                      <div className="mt-5 flex items-center gap-2 text-primary text-xs font-display tracking-[0.2em] uppercase group-hover:gap-3 transition-all">
                        <Play className="w-3 h-3" />
                        <span>Watch</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default BroadcastSection;
