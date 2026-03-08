import { motion } from "framer-motion";
import { Zap } from "lucide-react";

const Navbar = () => {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-xl border-b border-border/50"
    >
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-neon-pink" />
          <span className="font-display font-bold text-lg text-foreground">RAVE<span className="text-neon-pink">COL</span></span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-body text-muted-foreground">
          <a href="#badges" className="hover:text-foreground transition-colors">Badges</a>
          <a href="#progress" className="hover:text-foreground transition-colors">Progress</a>
          <a href="#events" className="hover:text-foreground transition-colors">Events</a>
        </div>
        <button className="px-4 py-2 rounded-lg text-sm font-display font-semibold bg-primary text-primary-foreground hover:scale-105 transition-transform">
          Sign In
        </button>
      </div>
    </motion.nav>
  );
};

export default Navbar;
