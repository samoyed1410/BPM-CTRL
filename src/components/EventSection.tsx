import { motion } from "framer-motion";
import { Calendar, MapPin, Users, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSectionContent, getContentValue } from "@/hooks/useSiteContent";

const EventSection = () => {
  const { data: content } = useSectionContent("event");

  const eventName = getContentValue(content, "event_name", "FREQUENCY 001");
  const tagline = getContentValue(content, "event_tagline", "Incoming Transmission");
  const description = getContentValue(content, "event_description", "The first transmission. An underground convergence of sound, movement, and collective energy. This is not just an event — it's a signal activation.");
  const date = getContentValue(content, "event_date", "TBA 2026");
  const location = getContentValue(content, "event_location", "Classified");
  const capacity = getContentValue(content, "event_capacity", "Limited");
  const lineup = getContentValue(content, "event_lineup", "Incoming...");
  const ctaPrimary = getContentValue(content, "event_cta_primary", "Enter the Frequency");
  const ctaSecondary = getContentValue(content, "event_cta_secondary", "Get Notified");

  return (
    <section id="event" className="py-24 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-orange-deep/5 to-background" />

      <div className="max-w-4xl mx-auto relative z-10">
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
          className="text-center font-display text-4xl md:text-6xl font-black gradient-text-orange mb-16"
        >
          NEXT EVENT
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="relative glow-border-orange rounded-2xl overflow-hidden"
        >
          <div className="absolute inset-0 scanline pointer-events-none opacity-50" />
          <div className="bg-card p-8 md:p-12 relative">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
              <span className="text-xs font-display tracking-[0.3em] text-primary uppercase">Live Signal</span>
            </div>

            <h3 className="font-display text-3xl md:text-5xl font-black text-foreground mb-4 text-glow-orange">
              {eventName}
            </h3>

            <p className="text-orange-amber/60 font-body text-base md:text-lg max-w-2xl mb-8">
              {description}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {[
                { icon: Calendar, label: "Date", value: date },
                { icon: MapPin, label: "Location", value: location },
                { icon: Users, label: "Capacity", value: capacity },
                { icon: Music, label: "Lineup", value: lineup },
              ].map((item) => (
                <div key={item.label} className="bg-muted/50 rounded-lg p-4 border border-border">
                  <item.icon className="w-4 h-4 text-primary mb-2" />
                  <p className="text-xs font-display tracking-wider text-muted-foreground uppercase">{item.label}</p>
                  <p className="text-sm font-body text-foreground mt-1">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="neon" size="lg">
                {ctaPrimary}
              </Button>
              <Button variant="portal" size="lg">
                {ctaSecondary}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default EventSection;
