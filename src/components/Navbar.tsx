import { motion } from "framer-motion";
import { Zap } from "lucide-react";

const Navbar = () => {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/40"
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
          <span className="font-display font-bold text-sm tracking-[0.15em] text-foreground">
            BPM<span className="text-primary"> CTRL</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-xs font-display tracking-[0.15em] text-muted-foreground uppercase">
          <a href="#event" className="hover:text-primary transition-colors">Event</a>
          <a href="#broadcast" className="hover:text-primary transition-colors">Broadcast</a>
          <a href="#style" className="hover:text-primary transition-colors">Style</a>
          <a href="#archive" className="hover:text-primary transition-colors">Archive</a>
          <a href="#mission" className="hover:text-primary transition-colors">Mission</a>
          <a href="#signal" className="hover:text-primary transition-colors">Signal</a>
        </div>
        <a href="#signal" className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-primary/30 text-primary text-xs font-display tracking-wider hover:bg-primary/10 transition-colors">
          <Zap className="w-3 h-3" />
          Join
        </a>
      </div>
    </motion.nav>
  );
};

export default Navbar;
