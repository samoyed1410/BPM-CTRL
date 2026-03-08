import { motion } from "framer-motion";
import { MapPin, Signal, Fingerprint } from "lucide-react";

interface ProfileCardProps {
  alias: string;
  level: { name: string; icon: React.ElementType; color: string };
  levelIndex: number;
  location: string;
}

const ProfileCard = ({ alias, level, levelIndex, location }: ProfileCardProps) => {
  const LevelIcon = level.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, rotateX: 15 }}
      animate={{ opacity: 1, scale: 1, rotateX: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="glow-border-orange rounded-2xl bg-card p-6 md:p-8 relative overflow-hidden"
    >
      <div className="scanline absolute inset-0 pointer-events-none opacity-10 rounded-2xl" />
      
      {/* Header bar */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
          <span className="text-[10px] font-display tracking-[0.4em] text-primary uppercase">Signal Active</span>
        </div>
        <Fingerprint className="w-4 h-4 text-muted-foreground" />
      </div>

      {/* Identity */}
      <div className="relative z-10 text-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="w-20 h-20 rounded-full glow-border-orange bg-muted flex items-center justify-center mx-auto mb-4"
        >
          <LevelIcon className={`w-8 h-8 ${level.color}`} />
        </motion.div>
        <h3 className="font-display text-2xl md:text-3xl font-black text-foreground text-glow-orange mb-1">
          {alias.toUpperCase()}
        </h3>
        <p className={`font-display text-xs tracking-[0.3em] uppercase ${level.color}`}>
          {level.name}
        </p>
      </div>

      {/* Stats grid */}
      <div className="relative z-10 grid grid-cols-3 gap-3">
        {[
          { label: "Status", value: level.name, icon: Signal },
          { label: "Location", value: location, icon: MapPin },
          { label: "Signal Level", value: `${levelIndex + 1}`, icon: LevelIcon },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg bg-muted/50 border border-border p-3 text-center">
            <stat.icon className="w-3.5 h-3.5 text-primary mx-auto mb-1.5" />
            <p className="text-[10px] font-display tracking-wider text-muted-foreground uppercase">{stat.label}</p>
            <p className="text-xs font-body text-foreground mt-0.5 truncate">{stat.value}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default ProfileCard;
