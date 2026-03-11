import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import FrequencyWaves from "@/components/FrequencyWaves";
import { useSectionContent, getContentValue } from "@/hooks/useSiteContent";

const HeroSection = () => {
  const { data: content } = useSectionContent("hero");

  const tagline = getContentValue(content, "hero_tagline", "Transmitting Signal");
  const title = getContentValue(content, "hero_title", "BPM CTRL");
  const subtitle1 = getContentValue(content, "hero_subtitle_1", "Dance is the language.");
  const subtitle2 = getContentValue(content, "hero_subtitle_2", "Fashion is the expression.");
  const ctaPrimary = getContentValue(content, "hero_cta_primary", "Enter the Signal");
  const ctaSecondary = getContentValue(content, "hero_cta_secondary", "Access Tickets");
  const ctaPrimaryHref = getContentValue(content, "hero_cta_primary_href", "#signal");
  const ctaSecondaryHref = getContentValue(content, "hero_cta_secondary_href", "#event");

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-orange-deep/20 via-background to-background" />
      <FrequencyWaves />
      <div className="absolute inset-0 scanline pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[120px] animate-pulse-glow" />

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mb-4"
        >
          <span className="inline-block px-4 py-1.5 rounded-full border border-primary/30 text-primary text-xs font-display tracking-[0.4em] uppercase glow-border-orange">
            {tagline}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="font-display text-7xl sm:text-8xl md:text-9xl font-black tracking-tight mb-6 text-glow-orange gradient-text-orange animate-flicker"
        >
          {title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="text-orange-amber/70 text-lg md:text-xl font-body max-w-xl mx-auto mb-4 tracking-wide"
        >
          {subtitle1}
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="text-orange-amber/50 text-lg md:text-xl font-body max-w-xl mx-auto mb-12 tracking-wide"
        >
          {subtitle2}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <a href={ctaPrimaryHref}>
            <Button variant="neon" size="xl">
              {ctaPrimary}
            </Button>
          </a>
          <a href={ctaSecondaryHref} target={ctaSecondaryHref.startsWith("http") ? "_blank" : undefined} rel={ctaSecondaryHref.startsWith("http") ? "noopener noreferrer" : undefined}>
            <Button variant="portal" size="xl">
              {ctaSecondary}
            </Button>
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-20 flex items-center justify-center gap-3"
        >
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
          <span className="text-xs font-display tracking-[0.3em] text-muted-foreground uppercase">
            Signal Active — {new Date().toLocaleDateString("en-US", { year: "numeric", month: "short" })}
          </span>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
