import { motion } from "framer-motion";
import { Lock, Headphones, Ticket, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";

const SecretAccess = () => {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      transition={{ duration: 1, ease: "easeOut" }}
    >
      <div className="glow-border-orange rounded-2xl bg-card p-8 md:p-10 relative overflow-hidden">
        <div className="scanline absolute inset-0 pointer-events-none opacity-20 rounded-2xl" />
        <div className="relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            <Lock className="w-8 h-8 text-primary mx-auto mb-4 animate-pulse-glow" />
          </motion.div>
          <h3 className="font-display text-xl md:text-2xl font-black text-foreground text-glow-orange mb-2">
            SECRET SIGNAL UNLOCKED
          </h3>
          <p className="text-muted-foreground text-sm font-body mb-8 max-w-md mx-auto">
            You've reached Level 2. Welcome to the inner frequency. Early drops, hidden sets, and encrypted transmissions await.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
            {[
              { icon: Ticket, title: "Early Tickets", desc: "Priority access to next rave" },
              { icon: Headphones, title: "Secret Sets", desc: "Unreleased DJ recordings" },
              { icon: Megaphone, title: "Announcements", desc: "Hidden event drops" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.15 }}
                className="rounded-xl bg-primary/5 border border-primary/20 p-4"
              >
                <item.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="text-xs font-display tracking-wider text-foreground">{item.title}</p>
                <p className="text-[10px] font-body text-muted-foreground mt-1">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <Button variant="neon" size="lg">
            Enter the Hidden Channel
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default SecretAccess;
