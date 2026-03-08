import { motion } from "framer-motion";
import { Calendar, MapPin, Users } from "lucide-react";

const events = [
  {
    title: "NEON DECAY",
    date: "Mar 22, 2026",
    venue: "Warehouse 9",
    attending: 342,
    badgeReward: "Night Owl",
    color: "neon-pink" as const,
  },
  {
    title: "BASS CATHEDRAL",
    date: "Apr 05, 2026",
    venue: "The Bunker",
    attending: 567,
    badgeReward: "Sound Chaser",
    color: "neon-cyan" as const,
  },
  {
    title: "ACID COMMUNION",
    date: "Apr 19, 2026",
    venue: "Club Void",
    attending: 214,
    badgeReward: "On Fire",
    color: "neon-lime" as const,
  },
];

const borderColorMap: Record<string, string> = {
  "neon-pink": "border-neon-pink/20 hover:border-neon-pink/50",
  "neon-cyan": "border-neon-cyan/20 hover:border-neon-cyan/50",
  "neon-lime": "border-neon-lime/20 hover:border-neon-lime/50",
};

const tagColorMap: Record<string, string> = {
  "neon-pink": "bg-neon-pink/10 text-neon-pink",
  "neon-cyan": "bg-neon-cyan/10 text-neon-cyan",
  "neon-lime": "bg-neon-lime/10 text-neon-lime",
};

const UpcomingEvents = () => {
  return (
    <section className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-neon-orange font-body text-sm tracking-[0.3em] uppercase mb-3">Don't Miss Out</p>
          <h2 className="font-display text-4xl md:text-6xl font-black gradient-text-psychedelic">
            Upcoming Events
          </h2>
        </motion.div>

        <div className="space-y-4">
          {events.map((event, i) => (
            <motion.div
              key={event.title}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ x: 8 }}
              className={`bg-card border rounded-xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors cursor-pointer ${borderColorMap[event.color]}`}
            >
              <div className="flex-1">
                <h3 className="font-display text-xl md:text-2xl font-bold text-foreground mb-2">{event.title}</h3>
                <div className="flex flex-wrap gap-4 text-muted-foreground text-sm">
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {event.date}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {event.venue}</span>
                  <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {event.attending} going</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-body px-3 py-1.5 rounded-full ${tagColorMap[event.color]}`}>
                  🏆 {event.badgeReward}
                </span>
                <button className="px-5 py-2.5 rounded-lg font-display font-semibold text-sm bg-primary text-primary-foreground hover:scale-105 transition-transform">
                  RSVP
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UpcomingEvents;
